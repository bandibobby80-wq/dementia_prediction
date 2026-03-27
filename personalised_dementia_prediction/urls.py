from django.contrib import admin
from django.urls import path
from admins import views as admins
from users  import views as usr
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

    # ── User views ──
    path('UserHome/',           usr.UserHome,             name='UserHome'),
    path('DatasetView/',        usr.DatasetView,          name='DatasetView'),
    path('Training',            usr.Training,             name='Training'),
    path('prediction/',         usr.Prediction,           name='prediction'),

] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)