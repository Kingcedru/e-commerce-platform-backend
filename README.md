# E-commerce Platform Backend

This repository contains the backend REST API for a comprehensive e-commerce platform. It's built with Node.js, Express, and TypeScript, and it provides services for product management, user authentication, and order processing.

## Features

- **User Authentication**: Secure user registration and login using JWT (JSON Web Tokens).
- **Role-Based Access Control**: Distinction between `Admin` and `User` roles, with protected routes for administrative actions.
- **Product Management**: CRUD (Create, Read, Update, Delete) operations for products, accessible only by administrators.
- **Image Uploads**: Product image uploads are handled using `multer` and hosted on Cloudinary.
- **Public Catalog**: Publicly accessible endpoints to browse and search for products with pagination.
- **Transactional Order System**: Users can place orders, and the system uses database transactions to ensure data integrity (e.g., updating stock levels).
- **Order History**: Authenticated users can view their past orders.
- **API Documentation**: Integrated Swagger/OpenAPI documentation available at the `/api-docs` endpoint.

---

## Technology Stack

This project leverages a modern, robust, and scalable technology stack:

- **Backend Framework**: **Express.js** - A minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications.
- **Language**: **TypeScript** - Superset of JavaScript that adds static typing, improving code quality, readability, and developer experience.
- **Database**: **PostgreSQL** (via **Sequelize ORM**) - A powerful, open-source object-relational database system. Sequelize is used as an ORM to map object models to relational database tables, simplifying database interactions.
- **Authentication**: **JWT (jsonwebtoken)** & **bcrypt** - Industry-standard for creating access tokens to secure the API. `bcrypt` is used for securely hashing user passwords.
- **Image Storage**: **Cloudinary** - A cloud-based service for image and video management, used here to store product images.
- **Validation**: **Joi** - A powerful schema description language and data validator for JavaScript, used to validate incoming request bodies.
- **API Documentation**: **Swagger (swagger-jsdoc & swagger-ui-express)** - Automatically generates interactive API documentation from code comments, making the API easy to explore and test.
- **Testing**: **Jest** & **Supertest** - A delightful JavaScript Testing Framework with a focus on simplicity, used for unit and integration testing of API endpoints.

---

## Local Setup and Installation

Follow these steps to get the project running on your local machine.

### 1. Prerequisites

- Node.js (v16 or newer recommended)
- NPM or Yarn
- A running PostgreSQL database instance.

### 2. Clone the Repository

```bash
git clone <your-repository-url>
cd e-commerce-platform-backend
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Set Up Environment Variables

Create a `.env` file in the root of the project by copying the example file:

```bash
cp .env.example .env
```

Now, open the `.env` file and fill in the required values. See the section below for a detailed explanation of each variable.

### 5. Run the Application

The application uses `sequelize.sync()` to automatically create or alter database tables based on your models, so no manual migration is needed for initial setup.

**For development (with hot-reloading):**

```bash
npm run dev
```

**For production:**

```bash
# First, build the TypeScript code into JavaScript
npm run build

# Then, start the server
npm start
```

The server will start, and you can access it at `http://localhost:3000` (or your specified `PORT`). The API documentation will be available at `http://localhost:3000/api-docs`.

---

## Environment Variables

The application requires the following environment variables to be set in a `.env` file. An `.env.example` file is provided as a template.

```dotenv
# Server Configuration
PORT=3000
NODE_ENV=development # 'development' or 'production'

# Database
# Example for PostgreSQL: postgres://<user>:<password>@<host>:<port>/<database>
DATABASE_URL="postgres://postgres:password@localhost:5432/ecommerceplatform"

# JWT Authentication
# Use a long, complex, and random string for security
JWT_SECRET="your_super_secret_jwt_string"

# Cloudinary Credentials (for image uploads)
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"

# Initial Admin User (for seeding script)
ADMIN_USERNAME="admin"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="your_secure_admin_password"
```

- `PORT`: The port on which the Express server will run.
- `NODE_ENV`: The application environment. Set to `production` to enable certain optimizations (like SSL for the database connection).
- `DATABASE_URL`: The connection string for your PostgreSQL database.
- `JWT_SECRET`: A secret key used to sign and verify JSON Web Tokens.
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: Credentials for your Cloudinary account, necessary for handling image uploads.

---
