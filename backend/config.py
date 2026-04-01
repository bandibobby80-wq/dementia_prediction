# backend/config.py — importable API config for any Python integration layer
BASE_URL = "https://personalized-dementia-prediction.onrender.com"

ENDPOINTS = {
    "login":    f"{BASE_URL}/api/login/",
    "register": f"{BASE_URL}/api/register/",
    "logout":   f"{BASE_URL}/api/logout/",
    "profile":  f"{BASE_URL}/api/profile/",
    "predict":  f"{BASE_URL}/api/predict/",
    "history":  f"{BASE_URL}/api/history/",
    "dashboard":f"{BASE_URL}/api/dashboard/",
    "admin_dashboard":   f"{BASE_URL}/api/admin/dashboard/",
    "admin_users":       f"{BASE_URL}/api/admin/users/",
    "admin_predictions": f"{BASE_URL}/api/admin/predictions/",
    "admin_logs":        f"{BASE_URL}/api/admin/activity-logs/",
}
