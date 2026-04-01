"""
REST-style API views for the React Native mobile app.
All responses are JSON. Authentication uses a simple token stored in the DB.
No Django REST Framework required — pure Django + json.
"""
import os
import json
import secrets
import joblib
import numpy as np
import pandas as pd

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.conf import settings

from .models import UserRegistrationModel, PredictionRecord, ActivityLog, MobileAuthToken

# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────

BASE_DIR = settings.BASE_DIR


def _json_body(request):
    """Safely parse the JSON body of a request."""
    try:
        return json.loads(request.body)
    except (json.JSONDecodeError, ValueError):
        return {}


def _get_user_from_token(request):
    """Return the user associated with the Bearer token, or None."""
    auth_header = request.META.get("HTTP_AUTHORIZATION", "")
    if not auth_header.startswith("Bearer "):
        return None
    token_key = auth_header.split(" ", 1)[1].strip()
    # Admin static token check — return a synthetic sentinel
    if token_key == "admin-static-token":
        return "__admin__"
    try:
        token = MobileAuthToken.objects.select_related("user").get(key=token_key)
        return token.user
    except MobileAuthToken.DoesNotExist:
        return None


def _require_auth(request):
    """Return (user, None) on success or (None, JsonResponse) on failure.
    
    For the admin static token, returns the string '__admin__' as a sentinel.
    Callers that need a real DB user (e.g. predict, history) must handle
    this sentinel and decide whether to allow or reject admin access.
    """
    user = _get_user_from_token(request)
    if user is None:
        return None, JsonResponse(
            {"success": False, "message": "Authentication required."},
            status=401,
        )
    return user, None


def api_ping(request):
    return JsonResponse({"success": True, "ping": "pong from v2.0"})

# ─────────────────────────────────────────────────────────────────────────────
# AUTH ENDPOINTS
# ─────────────────────────────────────────────────────────────────────────────

@csrf_exempt
@require_http_methods(["POST"])
def api_login(request):
    """
    POST /api/login/
    Body: { "loginid": "...", "password": "..." }
    Returns: { "success": true, "token": "...", "user": {...} }
    """
    data = _json_body(request)
    loginid = data.get("loginid", "").strip()
    password = data.get("password", "").strip()

    # Admin shortcut
    if loginid == "admin" and password == "admin":
        # Synthetic admin user
        return JsonResponse({
            "success": True,
            "token": "admin-static-token",
            "user": {
                "id": 0,
                "name": "Administrator",
                "loginid": "admin",
                "email": "admin@system.local",
                "role": "admin",
            },
        })

    if not loginid or not password:
        return JsonResponse({"success": False, "message": "Login ID and password are required."}, status=400)

    try:
        user = UserRegistrationModel.objects.get(loginid=loginid, password=password)
    except UserRegistrationModel.DoesNotExist:
        return JsonResponse({"success": False, "message": "Invalid Login ID or Password."}, status=401)

    if user.status != "activated":
        return JsonResponse(
            {"success": False, "message": "Your account is pending activation by the admin."},
            status=403,
        )

    # Create or refresh token
    token, _ = MobileAuthToken.objects.get_or_create(user=user)
    if not token.key:
        token.key = secrets.token_hex(32)
        token.save()

    ip = request.META.get("REMOTE_ADDR")
    ActivityLog.objects.create(
        user=user,
        username=user.loginid,
        action="login",
        description=f"{user.name} logged in via mobile app.",
        ip_address=ip,
    )

    return JsonResponse({
        "success": True,
        "DEBUG_VER": "v2.0",
        "token": token.key,
        "user": {
            "id": user.id,
            "name": user.name,
            "loginid": user.loginid,
            "email": user.email,
            "mobile": user.mobile,
            "city": user.city,
            "state": user.state,
            "role": user.role,
        },
    })


@csrf_exempt
@require_http_methods(["POST"])
def api_register(request):
    """
    POST /api/register/
    Body: { "name": "...", "loginid": "...", "password": "...", "mobile": "...",
            "email": "...", "locality": "...", "address": "...", "city": "...", "state": "..." }
    """
    data = _json_body(request)
    required = ["name", "loginid", "password", "mobile", "email", "locality", "address", "city", "state"]
    for f in required:
        if not data.get(f, "").strip():
            return JsonResponse({"success": False, "message": f"Field '{f}' is required."}, status=400)

    # Uniqueness checks
    if UserRegistrationModel.objects.filter(loginid=data["loginid"]).exists():
        return JsonResponse({"success": False, "message": "Login ID is already taken."}, status=409)
    if UserRegistrationModel.objects.filter(email=data["email"]).exists():
        return JsonResponse({"success": False, "message": "Email is already registered."}, status=409)
    if UserRegistrationModel.objects.filter(mobile=data["mobile"]).exists():
        return JsonResponse({"success": False, "message": "Mobile number is already registered."}, status=409)

    user = UserRegistrationModel.objects.create(
        name=data["name"],
        loginid=data["loginid"],
        password=data["password"],
        mobile=data["mobile"],
        email=data["email"],
        locality=data["locality"],
        address=data["address"],
        city=data["city"],
        state=data["state"],
        status="waiting",
        role="user",
    )

    ip = request.META.get("REMOTE_ADDR")
    ActivityLog.objects.create(
        user=user,
        username=user.loginid,
        action="register",
        description=f"{user.name} registered via mobile app.",
        ip_address=ip,
    )

    return JsonResponse({"success": True, "message": "Registration successful! Please wait for admin activation."}, status=201)


@csrf_exempt
@require_http_methods(["POST"])
def api_logout(request):
    """
    POST /api/logout/
    Header: Authorization: Bearer <token>
    """
    auth_header = request.META.get("HTTP_AUTHORIZATION", "")
    if auth_header.startswith("Bearer "):
        token_key = auth_header.split(" ", 1)[1].strip()
        MobileAuthToken.objects.filter(key=token_key).delete()
    return JsonResponse({"success": True, "message": "Logged out successfully."})


# ─────────────────────────────────────────────────────────────────────────────
# PROFILE ENDPOINT
# ─────────────────────────────────────────────────────────────────────────────

@csrf_exempt
@require_http_methods(["GET"])
def api_profile(request):
    """
    GET /api/profile/
    Header: Authorization: Bearer <token>
    """
    user, err = _require_auth(request)
    if err:
        return err
    return JsonResponse({
        "success": True,
        "user": {
            "id": user.id,
            "name": user.name,
            "loginid": user.loginid,
            "email": user.email,
            "mobile": user.mobile,
            "locality": user.locality,
            "address": user.address,
            "city": user.city,
            "state": user.state,
            "role": user.role,
            "status": user.status,
        },
    })


# ─────────────────────────────────────────────────────────────────────────────
# PREDICTION ENDPOINT
# ─────────────────────────────────────────────────────────────────────────────

@csrf_exempt
@require_http_methods(["POST"])
def api_predict(request):
    """
    POST /api/predict/
    Header: Authorization: Bearer <token>
    Body: {
        "M_F": "M" | "F",
        "Age": 72, "EDUC": 14, "SES": 2, "MMSE": 26, "CDR": 0.5,
        "eTIV": 1450, "nWBV": 0.740, "ASF": 1.21, "Visit": 2, "MR_Delay": 365
    }
    """
    user, err = _require_auth(request)
    if err:
        return err
    # The admin static token cannot own DB prediction records
    if user == "__admin__":
        return JsonResponse(
            {"success": False, "message": "Admin accounts should use the web dashboard for predictions."},
            status=403,
        )

    data = _json_body(request)

    # Validate required fields
    required_fields = ["M_F", "Age", "EDUC", "SES", "MMSE", "CDR", "eTIV", "nWBV", "ASF", "Visit", "MR_Delay"]
    for f in required_fields:
        if f not in data:
            return JsonResponse({"success": False, "message": f"Field '{f}' is required."}, status=400)

    model_path = os.path.join(BASE_DIR, "ml_model", "rf_model.pkl")
    if not os.path.exists(model_path):
        model_path = os.path.join(BASE_DIR, "ml_model", "logistic_model.pkl")
    feat_col_path = os.path.join(BASE_DIR, "ml_model", "feature_columns.pkl")

    if not os.path.exists(model_path) or not os.path.exists(feat_col_path):
        return JsonResponse({"success": False, "message": "ML model not found on server."}, status=503)

    try:
        model = joblib.load(model_path)
        feature_columns = joblib.load(feat_col_path)

        gender = str(data["M_F"]).upper()
        gender_f = 1 if gender == "F" else 0
        gender_m = 1 if gender == "M" else 0

        raw = {
            "Visit":    float(data["Visit"]),
            "MR Delay": float(data["MR_Delay"]),
            "Age":      float(data["Age"]),
            "EDUC":     float(data["EDUC"]),
            "SES":      float(data["SES"]),
            "MMSE":     float(data["MMSE"]),
            "CDR":      float(data["CDR"]),
            "eTIV":     float(data["eTIV"]),
            "nWBV":     float(data["nWBV"]),
            "ASF":      float(data["ASF"]),
            "M/F_F":    gender_f,
            "M/F_M":    gender_m,
        }

        input_df = pd.DataFrame([raw])
        for col in feature_columns:
            if col not in input_df.columns:
                input_df[col] = 0
        input_df = input_df[feature_columns]

        result = model.predict(input_df)[0]
        pred_map = {0: "Nondemented", 1: "Demented"}
        prediction = pred_map.get(int(result), "Unknown")

        confidence = None
        if hasattr(model, "predict_proba"):
            proba = model.predict_proba(input_df)[0]
            confidence = round(float(np.max(proba)) * 100, 1)

        risk_level = "high" if prediction == "Demented" else "low"

        # Save record
        PredictionRecord.objects.create(
            user=user,
            age=float(data["Age"]),
            gender=gender,
            educ=float(data["EDUC"]),
            ses=float(data["SES"]),
            mmse=float(data["MMSE"]),
            cdr=float(data["CDR"]),
            etiv=float(data["eTIV"]),
            nwbv=float(data["nWBV"]),
            asf=float(data["ASF"]),
            visit=int(data["Visit"]),
            mr_delay=int(data["MR_Delay"]),
            result=prediction,
            confidence=confidence,
            risk_level=risk_level,
        )

        ip = request.META.get("REMOTE_ADDR")
        ActivityLog.objects.create(
            user=user,
            username=user.loginid,
            action="predict",
            description=f"Prediction: {prediction} (confidence={confidence}%, risk={risk_level}).",
            ip_address=ip,
        )

        return JsonResponse({
            "success": True,
            "prediction": prediction,
            "confidence": confidence,
            "risk_level": risk_level,
        })

    except Exception as exc:
        return JsonResponse({"success": False, "message": f"Prediction error: {str(exc)}"}, status=500)


# ─────────────────────────────────────────────────────────────────────────────
# HISTORY ENDPOINT
# ─────────────────────────────────────────────────────────────────────────────

@csrf_exempt
@require_http_methods(["GET"])
def api_history(request):
    """
    GET /api/history/
    Header: Authorization: Bearer <token>
    Returns the prediction history for the authenticated user.
    """
    user, err = _require_auth(request)
    if err:
        return err
    if user == "__admin__":
        return JsonResponse(
            {"success": False, "message": "Admin accounts do not have personal prediction history."},
            status=403,
        )

    records = PredictionRecord.objects.filter(user=user).order_by("-timestamp")[:50]
    history = []
    for r in records:
        history.append({
            "id": r.id,
            "timestamp": r.timestamp.isoformat(),
            "age": r.age,
            "gender": r.gender,
            "educ": r.educ,
            "ses": r.ses,
            "mmse": r.mmse,
            "cdr": r.cdr,
            "etiv": r.etiv,
            "nwbv": r.nwbv,
            "asf": r.asf,
            "visit": r.visit,
            "mr_delay": r.mr_delay,
            "result": r.result,
            "confidence": r.confidence,
            "risk_level": r.risk_level,
        })
    return JsonResponse({"success": True, "history": history})


# ─────────────────────────────────────────────────────────────────────────────
# DASHBOARD STATS (user)
# ─────────────────────────────────────────────────────────────────────────────

@csrf_exempt
@require_http_methods(["GET"])
def api_dashboard(request):
    """
    GET /api/dashboard/
    Header: Authorization: Bearer <token>
    Returns summary stats for the authenticated user's dashboard.
    """
    user, err = _require_auth(request)
    if err:
        return err
    if user == "__admin__":
        return JsonResponse(
            {"success": False, "message": "Use the admin dashboard endpoint for admin statistics."},
            status=403,
        )

    total_preds = PredictionRecord.objects.filter(user=user).count()
    high_risk = PredictionRecord.objects.filter(user=user, risk_level="high").count()
    low_risk = PredictionRecord.objects.filter(user=user, risk_level="low").count()

    last_pred = PredictionRecord.objects.filter(user=user).order_by("-timestamp").first()
    last_result = None
    if last_pred:
        last_result = {
            "result": last_pred.result,
            "confidence": last_pred.confidence,
            "risk_level": last_pred.risk_level,
            "timestamp": last_pred.timestamp.isoformat(),
        }

    return JsonResponse({
        "success": True,
        "stats": {
            "total_predictions": total_preds,
            "high_risk_count": high_risk,
            "low_risk_count": low_risk,
            "last_prediction": last_result,
        },
        "user": {
            "name": user.name,
            "loginid": user.loginid,
            "email": user.email,
            "role": user.role,
        },
    })


# ─────────────────────────────────────────────────────────────────────────────
# ADMIN ENDPOINTS
# ─────────────────────────────────────────────────────────────────────────────

def _require_admin(request):
    """Return (user_or_admin_flag, None) or (None, JsonResponse)."""
    auth_header = request.META.get("HTTP_AUTHORIZATION", "")
    if auth_header == "Bearer admin-static-token":
        return "admin", None
    user, err = _require_auth(request)
    if err:
        return None, err
    if user.role != "admin":
        return None, JsonResponse({"success": False, "message": "Admin access required."}, status=403)
    return user, None


@csrf_exempt
@require_http_methods(["GET"])
def api_admin_dashboard(request):
    """
    GET /api/admin/dashboard/
    """
    _, err = _require_admin(request)
    if err:
        return err

    total = UserRegistrationModel.objects.count()
    activated = UserRegistrationModel.objects.filter(status="activated").count()
    pending = total - activated
    total_preds = PredictionRecord.objects.count()
    total_logs = ActivityLog.objects.count()

    recent_logs = ActivityLog.objects.select_related("user").order_by("-timestamp")[:10]
    logs_data = []
    for log in recent_logs:
        logs_data.append({
            "id": log.id,
            "username": log.username,
            "action": log.action,
            "description": log.description,
            "timestamp": log.timestamp.isoformat(),
            "ip_address": log.ip_address,
        })

    return JsonResponse({
        "success": True,
        "stats": {
            "total_users": total,
            "activated_users": activated,
            "pending_users": pending,
            "total_predictions": total_preds,
            "total_activity_logs": total_logs,
        },
        "recent_logs": logs_data,
    })


@csrf_exempt
@require_http_methods(["GET"])
def api_admin_users(request):
    """GET /api/admin/users/"""
    _, err = _require_admin(request)
    if err:
        return err

    users = UserRegistrationModel.objects.all().order_by("id")
    data = []
    for u in users:
        data.append({
            "id": u.id,
            "name": u.name,
            "loginid": u.loginid,
            "email": u.email,
            "mobile": u.mobile,
            "city": u.city,
            "state": u.state,
            "status": u.status,
            "role": u.role,
        })
    return JsonResponse({"success": True, "users": data})


@csrf_exempt
@require_http_methods(["POST"])
def api_admin_activate_user(request, uid):
    """POST /api/admin/users/<uid>/activate/"""
    _, err = _require_admin(request)
    if err:
        return err

    try:
        user = UserRegistrationModel.objects.get(id=uid)
        user.status = "activated"
        user.save()
        return JsonResponse({"success": True, "message": f"User '{user.name}' activated."})
    except UserRegistrationModel.DoesNotExist:
        return JsonResponse({"success": False, "message": "User not found."}, status=404)


@csrf_exempt
@require_http_methods(["POST"])
def api_admin_change_role(request, uid):
    """POST /api/admin/users/<uid>/role/ — toggle role between 'user' and 'admin'."""
    _, err = _require_admin(request)
    if err:
        return err

    try:
        user = UserRegistrationModel.objects.get(id=uid)
        if user.role == "admin":
            user.role = "user"
            msg = f"User '{user.name}' demoted to User."
        else:
            user.role = "admin"
            msg = f"User '{user.name}' promoted to Admin."
        user.save()
        return JsonResponse({"success": True, "message": msg, "new_role": user.role})
    except UserRegistrationModel.DoesNotExist:
        return JsonResponse({"success": False, "message": "User not found."}, status=404)


@csrf_exempt
@require_http_methods(["DELETE"])
def api_admin_delete_user(request, uid):
    """DELETE /api/admin/users/<uid>/"""
    _, err = _require_admin(request)
    if err:
        return err

    try:
        user = UserRegistrationModel.objects.get(id=uid)
        name = user.name
        user.delete()
        return JsonResponse({"success": True, "message": f"User '{name}' deleted."})
    except UserRegistrationModel.DoesNotExist:
        return JsonResponse({"success": False, "message": "User not found."}, status=404)


@csrf_exempt
@require_http_methods(["GET"])
def api_admin_predictions(request):
    """GET /api/admin/predictions/"""
    _, err = _require_admin(request)
    if err:
        return err

    records = PredictionRecord.objects.select_related("user").order_by("-timestamp")[:100]
    data = []
    for r in records:
        data.append({
            "id": r.id,
            "user": r.user.loginid,
            "user_name": r.user.name,
            "timestamp": r.timestamp.isoformat(),
            "result": r.result,
            "confidence": r.confidence,
            "risk_level": r.risk_level,
            "age": r.age,
            "gender": r.gender,
            "mmse": r.mmse,
            "cdr": r.cdr,
        })
    return JsonResponse({"success": True, "predictions": data})


@csrf_exempt
@require_http_methods(["GET"])
def api_admin_activity_logs(request):
    """GET /api/admin/activity-logs/"""
    _, err = _require_admin(request)
    if err:
        return err

    logs = ActivityLog.objects.select_related("user").order_by("-timestamp")[:100]
    data = []
    for log in logs:
        data.append({
            "id": log.id,
            "username": log.username,
            "action": log.action,
            "description": log.description,
            "timestamp": log.timestamp.isoformat(),
            "ip_address": log.ip_address,
        })
    return JsonResponse({"success": True, "logs": data})
