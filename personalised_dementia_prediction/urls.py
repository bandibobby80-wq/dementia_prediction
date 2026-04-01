from django.contrib import admin
from django.urls import path
from admins import views as admins
from users  import views as usr
from users  import api_views as api
from users  import debug_api as debug
from django.conf.urls.static import static
from django.conf import settings

urlpatterns = [
    path('admin/', admin.site.urls),

    # ── Root / Authentication ──
    path('',                    admins.index,             name='index'),
    path('login/',               admins.Login,             name='Login'),
    path('LoginCheck/',         admins.UnifiedLoginCheck, name='UnifiedLoginCheck'),
    path('AdminLogout/',        admins.AdminLogout,       name='AdminLogout'),
    path('UserLogout/',         usr.UserLogout,           name='UserLogout'),

    # ── Legacy redirect shims (keep old links working) ──
    path('AdminLogin/',         admins.AdminLogin,        name='AdminLogin'),
    path('UserLogin/',          admins.UserLogin,         name='UserLogin'),
    path('index/',              admins.index,             name='index'),

    # ── Registration ──
    path('UserRegister/',       admins.UserRegister,      name='UserRegister'),
    path('UserRegisterActions/',usr.UserRegisterActions,  name='UserRegisterActions'),
    path('UserLoginCheck/',     usr.UserLoginCheck,       name='UserLoginCheck'),

    # ── Admin views ──
    path('AdminHome/',          admins.AdminHome,         name='AdminHome'),
    path('RegisterUsersView/',  admins.RegisterUsersView, name='RegisterUsersView'),
    path('ActivaUsers/',        admins.ActivaUsers,       name='ActivaUsers'),
    path('EditUser/<int:uid>/', admins.EditUser,          name='EditUser'),
    path('DeleteUser/<int:uid>/',admins.DeleteUser,       name='DeleteUser'),
    path('ChangeUserRole/<int:uid>/', admins.ChangeUserRole, name='ChangeUserRole'),
    path('ViewPredictions/',    admins.ViewPredictions,   name='ViewPredictions'),
    path('ViewActivityLog/',    admins.ViewActivityLog,   name='ViewActivityLog'),
    path('AdminPrediction/',    admins.AdminPrediction,   name='AdminPrediction'),

    # ── User views ──
    path('UserHome/',           usr.UserHome,             name='UserHome'),
    path('DatasetView/',        usr.DatasetView,          name='DatasetView'),
    path('Training',            usr.Training,             name='Training'),
    path('prediction/',         usr.Prediction,           name='prediction'),

    path('debug/ping/',         debug.debug_ping,         name='debug_ping'),
    # ── Mobile REST API ──────────────────────────────────────────────────────
    path('api/ping/',           api.api_ping,             name='api_ping'),
    # Auth
    path('api/login/',          api.api_login,            name='api_login_compat'),
    path('mobile/api/login/',   api.api_login,            name='api_login'),
    path('api/register/',       api.api_register,         name='api_register'),
    path('api/logout/',         api.api_logout,           name='api_logout'),
    path('api/profile/',        api.api_profile,          name='api_profile'),

    # User features
    path('api/predict/',        api.api_predict,          name='api_predict'),
    path('api/history/',        api.api_history,          name='api_history'),
    path('api/dashboard/',      api.api_dashboard,        name='api_dashboard'),

    # Admin API
    path('api/admin/dashboard/',                    api.api_admin_dashboard,      name='api_admin_dashboard'),
    path('api/admin/users/',                        api.api_admin_users,          name='api_admin_users'),
    path('api/admin/users/<int:uid>/activate/',     api.api_admin_activate_user,  name='api_admin_activate_user'),
    path('api/admin/users/<int:uid>/role/',         api.api_admin_change_role,    name='api_admin_change_role'),
    path('api/admin/users/<int:uid>/',              api.api_admin_delete_user,    name='api_admin_delete_user'),
    path('api/admin/predictions/',                  api.api_admin_predictions,    name='api_admin_predictions'),
    path('api/admin/activity-logs/',                api.api_admin_activity_logs,  name='api_admin_activity_logs'),

] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)