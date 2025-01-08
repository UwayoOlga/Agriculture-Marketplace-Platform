# Day 4 - Backend Development (Part 2)

### 1. Implement User Authentication (JWT)

#### **Summary**

User authentication functionality was implemented using JSON Web Tokens (JWT). This enables secure user login and token-based authentication for API requests. Key steps included setting up dependencies, configuring Django settings, and testing the authentication endpoints.

#### **Detailed Steps**

1. **Dependencies Installed**:
   The following libraries were added:
   - `djangorestframework`: For building RESTful APIs.
   - `djangorestframework-simplejwt`: For implementing JWT authentication.
   
   Installation command:
   ```bash
   pip install djangorestframework djangorestframework-simplejwt
   ```

2. **Django Configuration**:
   - Added `rest_framework` to `INSTALLED_APPS` in `settings.py`.
   - Configured `REST_FRAMEWORK` to use `JWTAuthentication` as the default authentication class.

3. **Endpoints Created**:
   - Configured token retrieval and refresh endpoints in `urls.py` using the following paths:
     ```python
     path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair')
     path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh')
     ```

4. **Testing Authentication**:
   - Verified token generation and refreshing using Postman. Successful responses confirmed the proper setup of authentication mechanisms.

---

### 2. Create Product Listing Functionality

#### **Summary**

Implemented functionality for listing and adding products. This included creating a product model, setting up serializers, defining API views, and testing endpoints for managing product data.

1. **Product Model Created**:
   Defined the product schema in `models.py` with fields  `name`, `description`, `price`, and `created_at`.

2. **Database Migration**:
   - Generated migrations for the new model:
     ```bash
     python manage.py makemigrations
     ```
   - Applied migrations to update the database schema:
     ```bash
     python manage.py migrate
     ```

3. **Serializer Created**:
   - Developed a `ProductSerializer` in `serializers.py` to convert product objects into JSON and validate incoming data.

4. **API Views Implemented**:
   - Created `ProductListView` in `views.py` to handle `GET` and `POST` requests for product listing and creation, respectively.

5. **Endpoints Configured**:
   - Added the endpoint for product API in `urls.py`:
     ```python
     path('api/products/', ProductListView.as_view(), name='product_list')
     ```

6. **Testing Product Listing**:
   - Verified the functionality using Postman:
     - **GET** `/api/products/` to fetch the list of products.
     - **POST** `/api/products/` to create new products with JSON payloads.

---

 