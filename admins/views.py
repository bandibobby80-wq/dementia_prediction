from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from users.models import UserRegistrationModel, PredictionRecord, ActivityLog
from users.forms import UserRegistrationForm


# ─────────────────────────────────────────────
#  UNIFIED LOGIN
# ─────────────────────────────────────────────

def Login(request):
    """Root landing page — unified login."""
    return render(request, 'Login.html')


def UnifiedLoginCheck(request):
    """Handles both admin and user login from a single form."""
    if request.method == 'POST':
        loginid = request.POST.get('loginid', '').strip()
        pswd    = request.POST.get('pswd', '').strip()

        # ── Admin credentials ──
        if loginid == 'admin' and pswd == 'admin':
            request.session.flush()
            request.session['admin'] = True
            request.session['admin_user'] = 'admin'
            return redirect('AdminHome')

        # ── Regular user credentials ──
        try:
            user = UserRegistrationModel.objects.get(loginid=loginid, password=pswd)
            if user.status == 'activated':
                request.session.flush()
                if user.role == 'admin':
                    request.session['admin'] = True
                    request.session['admin_user'] = user.loginid

                request.session['id']         = user.id
                request.session['loggeduser'] = user.name
                request.session['loginid']    = user.loginid
                request.session['email']      = user.email
                # Log the login activity
                ip = request.META.get('REMOTE_ADDR')
                ActivityLog.objects.create(
                    user=user,
                    username=user.loginid,
                    action='login',
                    description=f'{user.name} logged in successfully.',
                    ip_address=ip,
                )
                
                if user.role == 'admin':
                    return redirect('AdminHome')
                return redirect('UserHome')
            else:
                messages.error(request, 'Your account is pending activation by the admin.')
        except UserRegistrationModel.DoesNotExist:
            messages.error(request, 'Invalid Login ID or Password.')

    return render(request, 'Login.html')


# ─────────────────────────────────────────────
#  ADMIN — DASHBOARD
# ─────────────────────────────────────────────

def AdminHome(request):
    if not request.session.get('admin'):
        messages.error(request, 'Please login as admin to continue.')
        return redirect('Login')
    total        = UserRegistrationModel.objects.count()
    activated    = UserRegistrationModel.objects.filter(status='activated').count()
    pending      = total - activated
    total_preds  = PredictionRecord.objects.count()
    total_logs   = ActivityLog.objects.count()
    recent_logs  = ActivityLog.objects.select_related('user').order_by('-timestamp')[:5]
    return render(request, 'admins/AdminHome.html', {
        'total': total,
        'activated': activated,
        'pending': pending,
        'total_preds': total_preds,
        'total_logs': total_logs,
        'recent_logs': recent_logs,
    })


def AdminLogout(request):
    request.session.flush()
    messages.success(request, 'You have been logged out successfully.')
    return redirect('Login')


# ─────────────────────────────────────────────
#  ADMIN — USER MANAGEMENT
# ─────────────────────────────────────────────

def RegisterUsersView(request):
    if not request.session.get('admin'):
        return redirect('Login')
    data = UserRegistrationModel.objects.all()
    return render(request, 'admins/viewregisterusers.html', {'data': data})


def ActivaUsers(request):
    if not request.session.get('admin'):
        return redirect('Login')
    if request.method == 'GET':
        uid = request.GET.get('uid')
        UserRegistrationModel.objects.filter(id=uid).update(status='activated')
        messages.success(request, 'User activated successfully.')
    return redirect('RegisterUsersView')


def EditUser(request, uid):
    if not request.session.get('admin'):
        return redirect('Login')
    user = get_object_or_404(UserRegistrationModel, id=uid)
    if request.method == 'POST':
        user.name     = request.POST.get('name', user.name)
        user.email    = request.POST.get('email', user.email)
        user.mobile   = request.POST.get('mobile', user.mobile)
        user.locality = request.POST.get('locality', user.locality)
        user.address  = request.POST.get('address', user.address)
        user.city     = request.POST.get('city', user.city)
        user.state    = request.POST.get('state', user.state)
        user.status   = request.POST.get('status', user.status)
        user.save()
        messages.success(request, f'User "{user.name}" updated successfully.')
        return redirect('RegisterUsersView')
    return render(request, 'admins/edituser.html', {'u': user})


def DeleteUser(request, uid):
    if not request.session.get('admin'):
        return redirect('Login')
    user = get_object_or_404(UserRegistrationModel, id=uid)
    name = user.name
    user.delete()
    messages.success(request, f'User "{name}" deleted successfully.')
    return redirect('RegisterUsersView')


def ChangeUserRole(request, uid):
    """Toggle a user's role between 'user' and 'admin'."""
    if not request.session.get('admin'):
        return redirect('Login')
    user = get_object_or_404(UserRegistrationModel, id=uid)
    if user.role == 'admin':
        user.role = 'user'
        messages.success(request, f'"{user.name}" has been demoted to User.')
    else:
        user.role = 'admin'
        messages.success(request, f'"{user.name}" has been promoted to Admin.')
    user.save()
    return redirect('RegisterUsersView')


# ─────────────────────────────────────────────
#  ADMIN — RESULTS / PREDICTIONS
# ─────────────────────────────────────────────

def ViewPredictions(request):
    if not request.session.get('admin'):
        return redirect('Login')
    predictions = PredictionRecord.objects.select_related('user').order_by('-timestamp')
    return render(request, 'admins/viewpredictions.html', {'predictions': predictions})


# ─────────────────────────────────────────────
#  ADMIN — ACTIVITY LOG
# ─────────────────────────────────────────────

def ViewActivityLog(request):
    if not request.session.get('admin'):
        return redirect('Login')
    logs = ActivityLog.objects.select_related('user').order_by('-timestamp')
    return render(request, 'admins/viewactivitylog.html', {'logs': logs})


# ─────────────────────────────────────────────
#  ADMIN — PREDICTION TOOL
# ─────────────────────────────────────────────

def AdminPrediction(request):
    """Admin can run a dementia prediction without it being tied to a user account."""
    if not request.session.get('admin'):
        return redirect('Login')

    import os, joblib, numpy as np, pandas as pd
    from users.forms import PredictionForm
    from django.conf import settings

    BASE_DIR   = settings.BASE_DIR
    prediction = None
    confidence = None
    risk_level = None

    if request.method == 'POST':
        form = PredictionForm(request.POST)
        if form.is_valid():
            model_path = os.path.join(BASE_DIR, 'ml_model', 'rf_model.pkl')
            if not os.path.exists(model_path):
                model_path = os.path.join(BASE_DIR, 'ml_model', 'logistic_model.pkl')

            feat_col_path = os.path.join(BASE_DIR, 'ml_model', 'feature_columns.pkl')
            if not os.path.exists(model_path) or not os.path.exists(feat_col_path):
                messages.error(request, 'Model not found. Please ask a user to train the model first.')
                return render(request, 'admins/adminpredict.html', {'form': form})

            model           = joblib.load(model_path)
            feature_columns = joblib.load(feat_col_path)

            gender   = form.cleaned_data['M_F']
            gender_f = 1 if gender == 'F' else 0
            gender_m = 1 if gender == 'M' else 0

            raw = {
                'Visit':    form.cleaned_data['Visit'],
                'MR Delay': form.cleaned_data['MR_Delay'],
                'Age':      form.cleaned_data['Age'],
                'EDUC':     form.cleaned_data['EDUC'],
                'SES':      form.cleaned_data['SES'],
                'MMSE':     form.cleaned_data['MMSE'],
                'CDR':      form.cleaned_data['CDR'],
                'eTIV':     form.cleaned_data['eTIV'],
                'nWBV':     form.cleaned_data['nWBV'],
                'ASF':      form.cleaned_data['ASF'],
                'M/F_F':    gender_f,
                'M/F_M':    gender_m,
            }

            input_df = pd.DataFrame([raw])
            for col in feature_columns:
                if col not in input_df.columns:
                    input_df[col] = 0
            input_df = input_df[feature_columns]

            result     = model.predict(input_df)[0]
            pred_map   = {0: 'Nondemented', 1: 'Demented'}
            prediction = pred_map.get(result, 'Unknown')

            if hasattr(model, 'predict_proba'):
                proba      = model.predict_proba(input_df)[0]
                confidence = round(float(np.max(proba)) * 100, 1)

            risk_level = 'high' if prediction == 'Demented' else 'low'

            # Log to activity log (admin action)
            ip = request.META.get('REMOTE_ADDR')
            ActivityLog.objects.create(
                user=None,
                username='admin',
                action='predict',
                description=f'Admin prediction: {prediction} (confidence={confidence}%, risk={risk_level}).',
                ip_address=ip,
            )
    else:
        form = PredictionForm()

    return render(request, 'admins/adminpredict.html', {
        'form': form,
        'prediction': prediction,
        'confidence': confidence,
        'risk_level': risk_level,
    })



def AdminLogin(request):
    return redirect('Login')


def UserLogin(request):
    return redirect('Login')


def UserRegister(request):
    from users.forms import UserRegistrationForm
    form = UserRegistrationForm()
    return render(request, 'UserRegistrations.html', {'form': form})


def index(request):
    return redirect('Login')
