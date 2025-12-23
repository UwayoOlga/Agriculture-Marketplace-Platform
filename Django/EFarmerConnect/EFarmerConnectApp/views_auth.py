from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.response import Response

User = get_user_model()

class CustomTokenRefreshSerializer(TokenRefreshSerializer):
    def validate(self, attrs):
        try:
            return super().validate(attrs)
        except (User.DoesNotExist, TokenError, InvalidToken) as e:
            # Catch User.DoesNotExist which might bubble up if not handled within SimpleJWT
            raise InvalidToken('Token is invalid or user no longer exists')
        except Exception as e:
            # Catch generic errors (like the 500 User.DoesNotExist deep in manager)
            # The stack trace showed: EFarmerConnectApp.models.User.DoesNotExist: User matching query does not exist.
            if 'DoesNotExist' in str(type(e)):
                 raise InvalidToken('User no longer exists')
            raise e

class CustomTokenRefreshView(TokenRefreshView):
    """
    Custom view to handle token refresh that might fail if user is deleted
    but client still has a valid refresh token.
    """
    serializer_class = CustomTokenRefreshSerializer

    def post(self, request, *args, **kwargs):
        try:
            return super().post(request, *args, **kwargs)
        except (InvalidToken, TokenError) as e:
            return Response({'detail': str(e)}, status=status.HTTP_401_UNAUTHORIZED)
        except Exception as e:
            # explicit catch for the specific error seen in logs if serializer didn't catch it
            if 'DoesNotExist' in str(type(e)) or 'User matching query does not exist' in str(e):
                 return Response({'detail': 'User session invalid.'}, status=status.HTTP_401_UNAUTHORIZED)
            raise e
