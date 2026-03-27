import os
import joblib
import pandas as pd
import numpy as np
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.conf import settings

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
        
        return Response({
            'prediction': prediction,
            'confidence': confidence,
            'risk_level': risk_level
        })
    except Exception as e:
        return Response({'error': str(e)}, status=400)
