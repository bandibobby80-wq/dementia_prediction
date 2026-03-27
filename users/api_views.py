import os
import joblib
import pandas as pd
import numpy as np
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.conf import settings
from .models import UserRegistrationModel, PredictionRecord

@api_view(['POST'])
@permission_classes([AllowAny])
def predict_api(request):
    data = request.data
    model_path = os.path.join(settings.BASE_DIR, 'ml_model', 'rf_model.pkl')
    if not os.path.exists(model_path):
        model_path = os.path.join(settings.BASE_DIR, 'ml_model', 'logistic_model.pkl')
        
    if not os.path.exists(model_path):
        return Response({'error': 'Machine learning model not found. Please train it first.'}, status=500)

    try:
        model = joblib.load(model_path)
        feature_columns = joblib.load(os.path.join(settings.BASE_DIR, 'ml_model', 'feature_columns.pkl'))
        
        gender = data.get('M_F', 'M')
        gender_f = 1 if gender == 'F' else 0
        gender_m = 1 if gender == 'M' else 0
        
        raw = {
            'Visit': float(data.get('Visit', 0)),
            'MR Delay': float(data.get('MR_Delay', 0)),
            'Age': float(data.get('Age', 0)),
            'EDUC': float(data.get('EDUC', 0)),
            'SES': float(data.get('SES', 0)),
            'MMSE': float(data.get('MMSE', 0)),
            'CDR': float(data.get('CDR', 0)),
            'eTIV': float(data.get('eTIV', 0)),
            'nWBV': float(data.get('nWBV', 0)),
            'ASF': float(data.get('ASF', 0)),
            'M/F_F': gender_f,
            'M/F_M': gender_m,
        }
        
        input_df = pd.DataFrame([raw])
        for col in feature_columns:
            if col not in input_df.columns:
                input_df[col] = 0
        input_df = input_df[feature_columns]
        
        result = model.predict(input_df)[0]
        pred_map = {0: 'Nondemented', 1: 'Demented'}
        prediction = pred_map.get(result, 'Unknown')
        
        confidence = 0.0
        if hasattr(model, 'predict_proba'):
            proba = model.predict_proba(input_df)[0]
            confidence = round(float(np.max(proba)) * 100, 1)
            
        risk_level = 'high' if prediction == 'Demented' else 'low'
        
        # ── Save to DB if user_id provided ──
        user_id = data.get('user_id')
        if user_id:
            try:
                user_obj = UserRegistrationModel.objects.get(id=user_id)
                PredictionRecord.objects.create(
                    user=user_obj,
                    age=float(data.get('Age', 0)),
                    gender=data.get('M_F', 'M'),
                    educ=float(data.get('EDUC', 0)),
                    ses=float(data.get('SES', 0)),
                    mmse=float(data.get('MMSE', 0)),
                    cdr=float(data.get('CDR', 0)),
                    etiv=float(data.get('eTIV', 0)),
                    nwbv=float(data.get('nWBV', 0)),
                    asf=float(data.get('ASF', 0)),
                    visit=int(data.get('Visit', 1)),
                    mr_delay=int(data.get('MR_Delay', 0)),
                    result=prediction,
                    confidence=confidence,
                    risk_level=risk_level,
                )
            except Exception as db_err:
                # Log but don't fail the prediction if DB save fails
                print(f"Failed to save prediction: {db_err}")

        return Response({
            'prediction': prediction,
            'confidence': confidence,
            'risk_level': risk_level
        })
    except Exception as e:
        return Response({'error': str(e)}, status=400)

@api_view(['POST'])
@permission_classes([AllowAny])
def login_api(request):
    loginid = request.data.get('loginid', '').strip()
    password = request.data.get('password', '').strip()
    
    if not loginid or not password:
        return Response({'error': 'Please provide both login ID and password.'}, status=400)

    # ── Hardcoded Admin Check (Matches UnifiedLoginCheck in admins/views.py) ──
    if loginid == 'admin' and password == 'admin':
        return Response({
            'id': 0,
            'name': 'System Administrator',
            'loginid': 'admin',
            'role': 'admin'
        })

    try:
        user = UserRegistrationModel.objects.get(loginid=loginid, password=password)
        if user.status != 'activated':
            return Response({'error': 'Your account is pending activation by the admin. Please try again later.'}, status=403)
            
        return Response({
            'id': user.id,
            'name': user.name,
            'loginid': user.loginid,
            'role': user.role
        })
    except UserRegistrationModel.DoesNotExist:
        return Response({'error': 'Invalid Login ID or Password. Please check your credentials.'}, status=401)

@api_view(['POST'])
@permission_classes([AllowAny])
def register_api(request):
    data = request.data
    try:
        user = UserRegistrationModel.objects.create(
            name=data.get('name'),
            loginid=data.get('loginid'),
            password=data.get('password'),
            mobile=data.get('mobile'),
            email=data.get('email'),
            locality=data.get('locality', ''),
            address=data.get('address', ''),
            city=data.get('city', ''),
            state=data.get('state', ''),
            status='waiting', # New mobile users wait for activation
            role='user'
        )
        return Response({'message': 'Registration successful! Wait for admin activation.'})
    except Exception as e:
        return Response({'error': str(e)}, status=400)

@api_view(['GET'])
@permission_classes([AllowAny])
def history_api(request, user_id):
    try:
        records = PredictionRecord.objects.filter(user_id=user_id).order_by('-timestamp')
        data = []
        for r in records:
            data.append({
                'id': r.id,
                'timestamp': r.timestamp.strftime('%Y-%M-%d %H:%M'),
                'result': r.result,
                'confidence': r.confidence,
                'risk_level': r.risk_level,
                'age': r.age,
                'mmse': r.mmse
            })
        return Response({'history': data})
    except Exception as e:
        return Response({'error': str(e)}, status=400)
