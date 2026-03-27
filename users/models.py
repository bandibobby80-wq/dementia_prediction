from django.db import models


class UserRegistrationModel(models.Model):
    ROLE_CHOICES = [
        ('user', 'User'),
        ('admin', 'Admin'),
    ]

    name = models.CharField(max_length=100)
    loginid = models.CharField(unique=True, max_length=100)
    password = models.CharField(max_length=100)
    mobile = models.CharField(unique=True, max_length=100)
    email = models.CharField(unique=True, max_length=100)
    locality = models.CharField(max_length=100)
    address = models.CharField(max_length=1000)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    status = models.CharField(max_length=100, default="activated")
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='user')

    def __str__(self):
        return self.loginid

    class Meta:
        db_table = 'UserRegistrations'


class PredictionRecord(models.Model):
    user = models.ForeignKey(
        UserRegistrationModel,
        on_delete=models.CASCADE,
        related_name='predictions'
    )
    timestamp = models.DateTimeField(auto_now_add=True)
    # Input features
    age = models.FloatField()
    gender = models.CharField(max_length=1)
    educ = models.FloatField()
    ses = models.FloatField()
    mmse = models.FloatField()
    cdr = models.FloatField()
    etiv = models.FloatField()
    nwbv = models.FloatField()
    asf = models.FloatField()
    visit = models.IntegerField()
    mr_delay = models.IntegerField()
    # Output
    result = models.CharField(max_length=50)
    confidence = models.FloatField(null=True, blank=True)
    risk_level = models.CharField(max_length=10)

    def __str__(self):
        return f"{self.user.loginid} — {self.result} ({self.timestamp:%Y-%m-%d %H:%M})"

    class Meta:
        db_table = 'PredictionRecords'
        ordering = ['-timestamp']


class ActivityLog(models.Model):
    ACTION_CHOICES = [
        ('login', 'Login'),
        ('logout', 'Logout'),
        ('predict', 'Prediction'),
        ('train', 'Model Training'),
        ('register', 'Registration'),
        ('view_dataset', 'Viewed Dataset'),
    ]
    user = models.ForeignKey(
        UserRegistrationModel,
        on_delete=models.CASCADE,
        related_name='activity_logs',
        null=True, blank=True
    )
    username = models.CharField(max_length=100, default='')
    action = models.CharField(max_length=50, choices=ACTION_CHOICES)
    description = models.TextField(blank=True, default='')
    timestamp = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)

    def __str__(self):
        return f"{self.username} — {self.action} ({self.timestamp:%Y-%m-%d %H:%M})"

    class Meta:
        db_table = 'ActivityLogs'
        ordering = ['-timestamp']
