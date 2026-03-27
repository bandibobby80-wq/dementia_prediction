from django import forms
from .models import UserRegistrationModel


class UserRegistrationForm(forms.ModelForm):
    name = forms.CharField(
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Full Name'}),
        required=True, max_length=100
    )
    loginid = forms.CharField(
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Choose a login ID'}),
        required=True, max_length=100
    )
    password = forms.CharField(
        widget=forms.PasswordInput(attrs={
            'class': 'form-control',
            'placeholder': 'Min 8 chars, upper+lower+number',
            'pattern': r'(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}',
            'title': 'Must contain at least one number, one uppercase and one lowercase letter, min 8 characters',
        }),
        required=True, max_length=100
    )
    mobile = forms.CharField(
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': '10-digit mobile number',
                                      'pattern': '[56789][0-9]{9}'}),
        required=True, max_length=100
    )
    email = forms.EmailField(
        widget=forms.EmailInput(attrs={'class': 'form-control', 'placeholder': 'Email address'}),
        required=True, max_length=100
    )
    locality = forms.CharField(
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Locality / Area'}),
        required=True, max_length=100
    )
    address = forms.CharField(
        widget=forms.Textarea(attrs={'class': 'form-control', 'rows': 3, 'placeholder': 'Street address'}),
        required=True, max_length=250
    )
    city = forms.CharField(
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'City',
                                      'pattern': '[A-Za-z ]+', 'title': 'Letters only'}),
        required=True, max_length=100
    )
    state = forms.CharField(
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'State',
                                      'pattern': '[A-Za-z ]+', 'title': 'Letters only'}),
        required=True, max_length=100
    )
    status = forms.CharField(widget=forms.HiddenInput(), initial='waiting', max_length=100)

    class Meta:
        model = UserRegistrationModel
        fields = '__all__'


class PredictionForm(forms.Form):
    M_F = forms.ChoiceField(
        label='Gender',
        choices=[('M', 'Male'), ('F', 'Female')],
        widget=forms.Select(attrs={'class': 'form-select'})
    )
    Age = forms.FloatField(
        label='Age (years)',
        widget=forms.NumberInput(attrs={'class': 'form-control', 'placeholder': 'e.g. 72', 'step': '1'})
    )
    EDUC = forms.FloatField(
        label='Education Level (years of schooling)',
        widget=forms.NumberInput(attrs={'class': 'form-control', 'placeholder': 'e.g. 12', 'step': '1'})
    )
    SES = forms.FloatField(
        label='Socioeconomic Status (1=highest, 5=lowest)',
        widget=forms.NumberInput(attrs={'class': 'form-control', 'placeholder': '1–5', 'step': '1', 'min': '1', 'max': '5'})
    )
    MMSE = forms.FloatField(
        label='MMSE Score (Mini-Mental State Exam, 0–30)',
        widget=forms.NumberInput(attrs={'class': 'form-control', 'placeholder': '0–30', 'step': '0.1', 'min': '0', 'max': '30'})
    )
    CDR = forms.FloatField(
        label='CDR (Clinical Dementia Rating: 0, 0.5, 1, 2)',
        widget=forms.NumberInput(attrs={'class': 'form-control', 'placeholder': '0 / 0.5 / 1 / 2', 'step': '0.5'})
    )
    eTIV = forms.FloatField(
        label='eTIV (Estimated Total Intracranial Volume, mm³)',
        widget=forms.NumberInput(attrs={'class': 'form-control', 'placeholder': 'e.g. 1500', 'step': '1'})
    )
    nWBV = forms.FloatField(
        label='nWBV (Normalized Whole Brain Volume)',
        widget=forms.NumberInput(attrs={'class': 'form-control', 'placeholder': 'e.g. 0.72', 'step': '0.001'})
    )
    ASF = forms.FloatField(
        label='ASF (Atlas Scaling Factor)',
        widget=forms.NumberInput(attrs={'class': 'form-control', 'placeholder': 'e.g. 1.2', 'step': '0.001'})
    )
    Visit = forms.IntegerField(
        label='Visit Number',
        widget=forms.NumberInput(attrs={'class': 'form-control', 'placeholder': 'e.g. 1', 'min': '1'})
    )
    MR_Delay = forms.IntegerField(
        label='MR Delay (days between visits)',
        widget=forms.NumberInput(attrs={'class': 'form-control', 'placeholder': 'e.g. 0', 'min': '0'})
    )
