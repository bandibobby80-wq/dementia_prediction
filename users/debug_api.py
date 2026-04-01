from django.http import JsonResponse
def debug_ping(request):
    return JsonResponse({"status": "ok", "ver": "debug_final"})
