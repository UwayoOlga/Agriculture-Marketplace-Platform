 
* **Backend Setup:**
    * Created a new Django project using `django-admin startproject agriculture_marketplace`.
    * Created a virtual environment using `python3 -m venv venv` and activated it with `source venv/bin/activate`.
    * Installed required packages: `pip install django psycopg2-binary`  .
    * Added PostgreSQL to `settings.py` in the Django project.
* **Database Schema:**
    * Designed initial database schema with models for:
        * `User` (username, email, password, role - farmer/buyer)
        * `Product` (name, description, price, quantity, location, farmer_id)
        * `Order` (product_id, buyer_id, quantity, status)
        * `Review` (product_id, user_id, rating, comment)
    * Created Django models for each entity.
 