<<<<<<< Updated upstream
# EFarmerConnect - Agriculture Marketplace Platform
=======
# UbuhinziLink - Agriculture Marketplace Platform
>>>>>>> Stashed changes

**EFarmerConnect** is a comprehensive platform designed to connect farmers in Rwanda with buyers, ensuring fair pricing, market access, and efficient supply chain management. By integrating technology, this platform addresses critical issues such as limited market access, unpredictable pricing, and supply chain inefficiencies.

## 🚀 Tech Stack

### Frontend
- **Framework**: React (Vite)
- **Styling**: Material UI (MUI), Emotion, Ant Design
- **State Management**: React Context / Hooks
- **HTTP Client**: Axios

### Backend
- **Framework**: Django 5.1
- **API**: Django REST Framework (DRF)
- **Authentication**: JWT (SimpleJWT)
- **Documentation**: Swagger/OpenAPI (drf_yasg)
- **Database**: SQLite (Development) / PostgreSQL (Production ready)

## 📂 Project Structure

The project is organized into two main directories:

- **`Django/`**: Contains the backend API code, settings, and database configurations.
    - `EFarmerConnect/`: Main Django project directory.
    - `EFarmerConnectApp/`: The core application containing models, views, and business logic.
- **`frontend/`**: Contains the React frontend application.
    - `src/`: Source code for components, pages, and contexts.
    - `public/`: Static assets.

## 🛠️ Installation & Setup

### Prerequisites
- Python 3.10+
- Node.js & npm (Latest LTS recommended)
- Git

### 1. Backend Setup (Django)

1.  Navigate to the Django directory:
    ```bash
    cd Django
    ```

2.  Create and activate a virtual environment (optional but recommended):
    ```bash
    # Windows
    python -m venv .venv
    .venv\Scripts\activate

    # macOS/Linux
    python3 -m venv .venv
    source .venv/bin/activate
    ```

3.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```

4.  Run database migrations:
    ```bash
    cd EFarmerConnect
    python manage.py migrate
    ```

5.  Start the development server:
    ```bash
    python manage.py runserver
    ```
    The backend API will be available at `http://127.0.0.1:8000/`.

### 2. Frontend Setup (React)

1.  Open a new terminal and navigate to the frontend directory:
    ```bash
    cd frontend
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Start the development server:
    ```bash
    npm run dev
    ```
    The application will be accessible at `http://localhost:5173/` (or the port shown in your terminal).

## ✨ Key Features

- **User Roles**: Specialized accounts for **Farmers**, **Buyers**, and **Administrators**.
- **Marketplace**: Farmers can list products with images, prices, and quantities.
- **Order Management**: Buyers can request orders; Farmers can approve or reject them.
- **Cart System**: Buyers can manage a shopping cart and select items for checkout.
- **Admin Dashboard**: Comprehensive management of users, farmers, products, and system monitoring.
- **Secure Authentication**: JWT-based login and registration system.
- **Responsive Design**: Optimized for both desktop and mobile devices.

## 📝 Usage

1.  **Register** an account as a Farmer or Buyer.
2.  **Farmers**: Go to your dashboard to add products and view incoming orders.
3.  **Buyers**: Browse the marketplace, add items to your cart, and place orders.
4.  **Admin Login**: Access Django Admin at `http://127.0.0.1:8000/admin/` (superuser required).

## 🤝 Contributing

Contributions are welcome! Please fork functionality features and submit a Pull Request.
