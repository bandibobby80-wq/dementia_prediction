// backend/README.md  (reference only — backend is the Django project)
# Backend — API Reference

Base URL: `https://personalized-dementia-prediction.onrender.com`

## Authentication
All protected endpoints require:
```
Authorization: Bearer <token>
```

## Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/login/ | Login, returns token + user object |
| POST | /api/register/ | Register new user |
| POST | /api/logout/ | Invalidate token |
| GET | /api/profile/ | Get authenticated user profile |

### User
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/predict/ | Run dementia prediction |
| GET | /api/history/ | Get user's prediction history |
| GET | /api/dashboard/ | Get dashboard stats |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/admin/dashboard/ | System overview stats |
| GET | /api/admin/users/ | All users |
| POST | /api/admin/users/`<uid>`/activate/ | Activate user |
| DELETE | /api/admin/users/`<uid>`/ | Delete user |
| GET | /api/admin/predictions/ | All predictions |
| GET | /api/admin/activity-logs/ | Activity logs |

## Prediction Payload
```json
{
  "M_F": "M",
  "Age": 75,
  "EDUC": 14,
  "SES": 2,
  "MMSE": 26,
  "CDR": 0.5,
  "eTIV": 1450,
  "nWBV": 0.740,
  "ASF": 1.21,
  "Visit": 2,
  "MR_Delay": 365
}
```
