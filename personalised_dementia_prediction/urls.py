from django.contrib import admin
from django.urls import path
from admins import views as admins
from users  import views as usr
from users  import api_views
from django.conf.urls.static import static
from django.conf import settings

urlpatterns = [
    path('admin/', admin.site.urls),

    # ── Root / Authentication ──
    path('',                    admins.Login,             name='Login'),
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

    # ── API endpoints ──
    path('api/predict/',        api_views.predict_api,    name='api_predict'),
    path('api/login/',          api_views.login_api,      name='api_login'),
    path('api/register/',       api_views.register_api,   name='api_register'),
    path('api/history/<int:user_id>/', api_views.history_api, name='api_history'),

    # ── User views ──
    path('UserHome/',           usr.UserHome,             name='UserHome'),
    path('DatasetView/',        usr.DatasetView,          name='DatasetView'),
    path('Training',            usr.Training,             name='Training'),
    path('prediction/',         usr.Prediction,           name='prediction'),

] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)