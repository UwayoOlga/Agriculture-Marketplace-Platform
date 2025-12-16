import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'EFarmerConnect.settings')
django.setup()

from EFarmerConnectApp.models import User

def create_admin_user():
    username = 'ADMIN'
    password = '12345'
    email = 'admin@agrimarket.rw'
    
    try:
        user, created = User.objects.get_or_create(username=username)
        user.set_password(password)
        user.email = email
        user.user_type = 'ADMIN'
        user.first_name = 'System'
        user.last_name = 'Administrator'
        user.is_staff = True # Allows access to Django admin too if needed
        user.is_superuser = True
        user.save()
        
        if created:
            print(f"Successfully created user '{username}'")
        else:
            print(f"Successfully updated user '{username}'")
            
    except Exception as e:
        print(f"Error creating admin user: {str(e)}")

if __name__ == '__main__':
    create_admin_user()
