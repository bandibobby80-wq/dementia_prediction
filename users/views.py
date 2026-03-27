import os
import joblib
import pandas as pd
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns

from django.shortcuts import render, redirect
from django.contrib import messages
from django.core.files.storage import FileSystemStorage
from django.conf import settings

from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score, confusion_matrix,
    f1_score, precision_score, recall_score
)
from sklearn.impute import SimpleImputer

from .forms import UserRegistrationForm, PredictionForm
from .models import UserRegistrationModel, PredictionRecord, ActivityLog

BASE_DIR = settings.BASE_DIR


def _log(request, action, description=''):
    """Helper — log a user action to ActivityLog."""
    uid = request.session.get('id')
    loginid = request.session.get('loginid', '')
    user_obj = None
    if uid:
        try:
            user_obj = UserRegistrationModel.objects.get(id=uid)
        except UserRegistrationModel.DoesNotExist:
            pass
    ip = request.META.get('REMOTE_ADDR')
    ActivityLog.objects.create(
        user=user_obj,
        username=loginid or 'unknown',
        action=action,
        description=description,
        ip_address=ip,
    )


# ─────────────────────────────────────────────
#  AUTH VIEWS
# ─────────────────────────────────────────────

def UserRegisterActions(request):
    if request.method == 'POST':
        form = UserRegistrationForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, 'Registration successful! Please wait for admin activation.')
            return redirect('Login')
        else:
            messages.error(request, 'Registration failed. Email, Login ID or Mobile may already be in use.')
    else:
        form = UserRegistrationForm()
    return render(request, 'UserRegistrations.html', {'form': form})


def UserLoginCheck(request):
    """Legacy — redirects to unified login."""
    return redirect('Login')


def UserLogout(request):
    loginid = request.session.get('loginid', '')
    name    = request.session.get('loggeduser', '')
    uid     = request.session.get('id')
    user_obj = None
    if uid:
        try:
            user_obj = UserRegistrationModel.objects.get(id=uid)
        except UserRegistrationModel.DoesNotExist:
            pass
    ip = request.META.get('REMOTE_ADDR')
    ActivityLog.objects.create(
        user=user_obj,
        username=loginid,
        action='logout',
        description=f'{name} logged out.',
        ip_address=ip,
    )
    request.session.flush()
    messages.success(request, 'You have been logged out.')
    return redirect('Login')


def UserHome(request):
    if 'loggeduser' not in request.session:
        messages.error(request, 'Please login to access this page.')
        return redirect('Login')
    return render(request, 'users/UserHomePage.html', {'user': request.session.get('loggeduser')})


# ─────────────────────────────────────────────
#  DATASET VIEW
# ─────────────────────────────────────────────

def DatasetView(request):
    if 'loggeduser' not in request.session:
        return redirect('Login')
    path = os.path.join(settings.MEDIA_ROOT, 'dementia_dataset.csv')
    try:
        df = pd.read_csv(path)
        df_html = df.head(100).to_html(
            classes='table table-striped table-hover table-sm',
            index=False,
            border=0
        )
        row_count = len(df)
        col_count = len(df.columns)
    except FileNotFoundError:
        df_html = None
        row_count = col_count = 0
        messages.error(request, 'Dataset file not found in media directory.')
    _log(request, 'view_dataset', 'Viewed the dementia dataset.')
    return render(request, 'users/viewdataset.html', {
        'data': df_html,
        'row_count': row_count,
        'col_count': col_count,
    })


# ─────────────────────────────────────────────
#  TRAINING VIEW — Dual Model (LR + RF)
# ─────────────────────────────────────────────

def Training(request):
    if 'loggeduser' not in request.session:
        return redirect('Login')

    context = {}
    if request.method == 'POST' and request.FILES.get('file'):
        file = request.FILES['file']
        fs = FileSystemStorage()
        file_path = fs.save(file.name, file)

        try:
            df = pd.read_csv(fs.path(file_path))
        except Exception as exc:
            messages.error(request, f'Could not read the uploaded file: {exc}')
            return render(request, 'users/train.html', context)

        # ── Robust column normalisation ──
        # 1. Convert every column name to string, strip leading/trailing whitespace,
        #    and collapse any internal runs of whitespace to a single space.
        import re as _re
        df.columns = [_re.sub(r'\s+', ' ', str(c).strip()) for c in df.columns]

        # 2. Case-insensitive search for the target column.
        group_col = next(
            (c for c in df.columns if c.strip().lower() == 'group'),
            None
        )
        if group_col is None:
            messages.error(
                request,
                "The uploaded dataset is missing the 'Group' column. "
                f"Columns found: {list(df.columns)}"
            )
            return render(request, 'users/train.html', context)

        # 3. Rename to the canonical form if needed.
        if group_col != 'Group':
            df = df.rename(columns={group_col: 'Group'})

        try:
            df = df.replace({'Group': {'Nondemented': 0, 'Demented': 1, 'Converted': 2}})
            # Convert Group to numeric safely
            df['Group'] = pd.to_numeric(df['Group'], errors='coerce')
            df = df[df['Group'].isin([0, 1])].copy()

            if df.empty:
                messages.error(request, "No valid Demented/Nondemented rows found after filtering.")
                return render(request, 'users/train.html', context)

            df.drop(['Subject ID', 'MRI ID', 'Hand'], axis=1, inplace=True, errors='ignore')

            # ── Step 1: One-hot encode categorical columns (before split) ──
            # Drop object columns that shouldn't be one-hot encoded (already dropped Hand above)
            cat_cols = df.select_dtypes(include=['object', 'category']).columns.tolist()
            if cat_cols:
                df = pd.get_dummies(df, columns=cat_cols)

            # Ensure Group column wasn't accidentally dummified
            if 'Group' not in df.columns:
                messages.error(request, "Internal error: 'Group' column lost after encoding.")
                return render(request, 'users/train.html', context)

        except Exception as exc:
            messages.error(request, f'Error during preprocessing: {exc}')
            return render(request, 'users/train.html', context)

        target   = 'Group'
        features = [c for c in df.columns if c != target]
        X = df[features]
        y = df[target]

        # ── Train / Test split FIRST (prevents data leakage in imputation) ──
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )

        # ── Imputation fit ONLY on training data ────────────────────────────
        # Numeric columns → median imputation
        num_feat_cols = X_train.select_dtypes(include=[np.number]).columns.tolist()
        if num_feat_cols:
            num_imputer = SimpleImputer(strategy='median')
            X_train[num_feat_cols] = num_imputer.fit_transform(X_train[num_feat_cols])
            X_test[num_feat_cols]  = num_imputer.transform(X_test[num_feat_cols])

        # ── Post-imputation NaN validation ──────────────────────────────────
        nan_cols = X_train.columns[X_train.isna().any()].tolist()
        if nan_cols:
            messages.error(
                request,
                f'Training aborted: column(s) still contain NaN after imputation: '
                f'{nan_cols}. Check for entirely empty columns in your dataset.'
            )
            return render(request, 'users/train.html', context)

        # ── Logistic Regression ──
        lr_model = LogisticRegression(solver='lbfgs', max_iter=1000, random_state=42)
        lr_model.fit(X_train, y_train)
        lr_pred  = lr_model.predict(X_test)
        lr_acc   = round(accuracy_score(y_test, lr_pred) * 100, 2)
        lr_f1    = round(f1_score(y_test, lr_pred, average='weighted') * 100, 2)
        lr_prec  = round(precision_score(y_test, lr_pred, average='weighted') * 100, 2)
        lr_rec   = round(recall_score(y_test, lr_pred, average='weighted') * 100, 2)

        # ── Random Forest ──
        rf_model = RandomForestClassifier(n_estimators=100, random_state=42)
        rf_model.fit(X_train, y_train)
        rf_pred  = rf_model.predict(X_test)
        rf_acc   = round(accuracy_score(y_test, rf_pred) * 100, 2)
        rf_f1    = round(f1_score(y_test, rf_pred, average='weighted') * 100, 2)
        rf_prec  = round(precision_score(y_test, rf_pred, average='weighted') * 100, 2)
        rf_rec   = round(recall_score(y_test, rf_pred, average='weighted') * 100, 2)

        # ── Save Models ──
        model_dir = os.path.join(BASE_DIR, 'ml_model')
        os.makedirs(model_dir, exist_ok=True)
        joblib.dump(lr_model, os.path.join(model_dir, 'logistic_model.pkl'))
        joblib.dump(rf_model, os.path.join(model_dir, 'rf_model.pkl'))
        joblib.dump(features, os.path.join(model_dir, 'feature_columns.pkl'))

        # ── Plots ──
        img_dir = os.path.join(BASE_DIR, 'media', 'images')
        os.makedirs(img_dir, exist_ok=True)

        labels = ['Nondemented', 'Demented']

        cm_lr = confusion_matrix(y_test, lr_pred)
        fig, ax = plt.subplots(figsize=(5, 4))
        sns.heatmap(cm_lr, annot=True, fmt='d', cmap='Blues',
                    xticklabels=labels, yticklabels=labels, ax=ax)
        ax.set_title('Logistic Regression — Confusion Matrix')
        ax.set_xlabel('Predicted'); ax.set_ylabel('Actual')
        fig.tight_layout()
        fig.savefig(os.path.join(img_dir, 'cm_lr.png'), dpi=100)
        plt.close(fig)

        cm_rf = confusion_matrix(y_test, rf_pred)
        fig, ax = plt.subplots(figsize=(5, 4))
        sns.heatmap(cm_rf, annot=True, fmt='d', cmap='Greens',
                    xticklabels=labels, yticklabels=labels, ax=ax)
        ax.set_title('Random Forest — Confusion Matrix')
        ax.set_xlabel('Predicted'); ax.set_ylabel('Actual')
        fig.tight_layout()
        fig.savefig(os.path.join(img_dir, 'cm_rf.png'), dpi=100)
        plt.close(fig)

        fig, ax = plt.subplots(figsize=(12, 10))
        sns.heatmap(df.corr(), annot=False, cmap='coolwarm', ax=ax)
        ax.set_title('Feature Correlation Heatmap')
        fig.tight_layout()
        fig.savefig(os.path.join(img_dir, 'heatmap.png'), dpi=100)
        plt.close(fig)

        importances = rf_model.feature_importances_
        feat_imp = pd.Series(importances, index=features).sort_values(ascending=False).head(10)
        fig, ax = plt.subplots(figsize=(8, 5))
        feat_imp.plot(kind='barh', ax=ax, color='steelblue')
        ax.invert_yaxis()
        ax.set_title('Top 10 Feature Importances (Random Forest)')
        ax.set_xlabel('Importance Score')
        fig.tight_layout()
        fig.savefig(os.path.join(img_dir, 'feature_importance.png'), dpi=100)
        plt.close(fig)

        _log(request, 'train', f'Trained Logistic Regression (acc={lr_acc}%) & Random Forest (acc={rf_acc}%).')

        context.update({
            'trained': True,
            'lr_acc': lr_acc, 'lr_f1': lr_f1, 'lr_prec': lr_prec, 'lr_rec': lr_rec,
            'rf_acc': rf_acc, 'rf_f1': rf_f1, 'rf_prec': rf_prec, 'rf_rec': rf_rec,
            'best_model': 'Random Forest' if rf_acc >= lr_acc else 'Logistic Regression',
            'best_acc': max(rf_acc, lr_acc),
            'cm_lr':  'images/cm_lr.png',
            'cm_rf':  'images/cm_rf.png',
            'heatmap': 'images/heatmap.png',
            'feat_imp': 'images/feature_importance.png',
        })

    return render(request, 'users/train.html', context)


# ─────────────────────────────────────────────
#  PREDICTION VIEW — RF model + Confidence
# ─────────────────────────────────────────────

def Prediction(request):
    if 'loggeduser' not in request.session:
        return redirect('Login')

    prediction = None
    confidence = None
    risk_level = None

    if request.method == 'POST':
        form = PredictionForm(request.POST)
        if form.is_valid():
            model_path = os.path.join(BASE_DIR, 'ml_model', 'rf_model.pkl')
            if not os.path.exists(model_path):
                model_path = os.path.join(BASE_DIR, 'ml_model', 'logistic_model.pkl')

            model           = joblib.load(model_path)
            feature_columns = joblib.load(os.path.join(BASE_DIR, 'ml_model', 'feature_columns.pkl'))

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

            # ── Save to DB ──
            uid = request.session.get('id')
            if uid:
                try:
                    user_obj = UserRegistrationModel.objects.get(id=uid)
                    PredictionRecord.objects.create(
                        user=user_obj,
                        age=form.cleaned_data['Age'],
                        gender=gender,
                        educ=form.cleaned_data['EDUC'],
                        ses=form.cleaned_data['SES'],
                        mmse=form.cleaned_data['MMSE'],
                        cdr=form.cleaned_data['CDR'],
                        etiv=form.cleaned_data['eTIV'],
                        nwbv=form.cleaned_data['nWBV'],
                        asf=form.cleaned_data['ASF'],
                        visit=form.cleaned_data['Visit'],
                        mr_delay=form.cleaned_data['MR_Delay'],
                        result=prediction,
                        confidence=confidence,
                        risk_level=risk_level,
                    )
                except UserRegistrationModel.DoesNotExist:
                    pass

            _log(request, 'predict',
                 f'Prediction: {prediction} (confidence={confidence}%, risk={risk_level}).')
    else:
        form = PredictionForm()

    return render(request, 'users/predict.html', {
        'form': form,
        'prediction': prediction,
        'confidence': confidence,
        'risk_level': risk_level,
    })
