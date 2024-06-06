<div align="center">
<h1>KAJOLA</h1>

### **Hyperlocal Marketplace Service App**
---
**`Kajola`** is a hyperlocal marketplace service app that connects buyers with local businesses and service providers. The app is designed to be user-friendly and intuitive, with features that promote trust and transparency between buyers and sellers. Buyers can easily find what they need from local businesses and service providers, while sellers can reach a wider audience and grow their businesses. The app includes features such as secure user authentication and validation, real-time chat functionality, product listing and management, and a rating and review system. Kajola is designed to be a one-stop shop for all your hyperlocal marketplace needs.
</div>

---

## Table of Contents
- [About](#about)
- [Features](#features)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [Contributing](#contributing)
- [Authors](#authors)

## About
![Kajola](https://github.com/Fawazabdganiyu/Kajola/assets/106432903/0ac6d92d-d904-46e3-8eb6-42be18d9e2e4)

This repository currently contains the backend API for the Kajola hyperlocal marketplace service app. The backend API is built using Node.js and Express.js, with MongoDB as the database. The API provides endpoints for user authentication, product listing and management, real-time chat functionality, and rating and review system. The API is designed to be scalable, secure, and efficient, with features that promote trust and transparency between buyers and sellers.


## Features
- **Secure User Authentication and Validation:**
  - Sign up and login using email/password or social media accounts (e.g., Facebook, Google).
  - Secure password hashing and storage.
- **User-Friendly Interface:**
  - Intuitive design for easy navigation and product discovery.
  - Responsive design for optimal viewing on all devices.
- **Location Services:**
  - Real-time location tracking and mapping.
  - Location-based search and filtering.
- **Hyperlocal Marketplace:**
  - Connect buyers with local businesses and service providers using real-time location service.
  - Search and filter products by category, location, and price.
- **Efficient communication channels:**
  - Real-time chat functionality between buyers and sellers using WebSockets
  - Secure messaging system.
- **Easy product listing and management:**
  - Sellers can add, edit, and manage their product listings with ease.
  - Rich product descriptions with images and specifications.
- **Rating and Review System:**
  - Buyer can leave ratings and reviews for sellers and products, promoting trust and transparency.


## Getting Started
### Installation
1. Clone the repository
   ```sh
   git clone https://github.com/Fawazabdganiyu/Kajola.git
    ```
2. Install dependencies
    ```sh
    npm install
    ```
3. Create a `.env` file in the root directory and add the following environment variables:
    ```sh
    PORT=3000
    MONGODB_URI=<your_mongodb_uri>
    JWT_SECRET=<your_jwt_secret>
    JWT_EXPIRATION=<expiration_period>
    EMAIL_HOST=<email_service_provider>
    EMAIL_PORT=<mail_port>
    EMAIL_USERNAME=<sender_authorized_username>
    EMAIL_PASSWORD=<sender_authorized_password>
    SMTP_USER='"Kajola Team" <application_email>'
    ```
4. Start the server
    ```sh
    npm run dev
    ```
5. The server should now be running on `http://localhost:3000`


## Instructions
### Prerequisite
- NodeJS installation
- npm or yarn installation
- Mongodb server


## Usage
### API Endpoints
#### User Authentication
- **POST /api/auth/signup:** Create a new user account
- **POST /api/auth/login:** Login with email and password
- **POST /api/auth/google:** Login with Google account
- **POST /api/auth/facebook:** Login with Facebook account

#### Product Listing
- **GET /api/products:** Get all products
- **GET /api/products/:id:** Get a product by ID
- **POST /api/products:** Create a new product listing
- **PUT /api/products/:id:** Update a product listing
- **DELETE /api/products/:id:** Delete a product listing

#### Real-Time Chat
- **GET /api/chats:** Get all chat messages
- **GET /api/chats/:id:** Get chat messages by ID
- **POST /api/chats:** Send a new chat message
- **PUT /api/chats/:id:** Update a chat message
- **DELETE /api/chats/:id:** Delete a chat message

#### Rating and Review
- **GET /api/reviews:** Get all reviews
- **GET /api/reviews/:id:** Get a review by ID
- **POST /api/reviews:** Create a new review
- **PUT /api/reviews/:id:** Update a review
- **DELETE /api/reviews/:id:** Delete a review

Click [here](https://documenter.getpostman.com/view/34594399/2sA3XJjPbD) for [**full API documentation**](https://documenter.getpostman.com/view/34594399/2sA3XJjPbD)

## Deployment
The backend API can be deployed to a cloud platform such as Heroku, AWS, or Google Cloud Platform. The API can be deployed using a CI/CD pipeline for automated deployment and scaling. The API can be monitored using logging and monitoring tools such as New Relic, Datadog, or Prometheus. The API can be secured using firewalls, encryption, and access control policies.


## Overview of Project Architecture
### Backend
- **TypeScript:** Programming language
- **Node.js:** JavaScript runtime environment
- **Express.js:** Web application framework for Node.js
- **MongoDB:** NoSQL database for storing data
- **Mongoose:** ODM library for MongoDB
- **Socket.io:** Real-time communication library
- **JWT:** JSON Web Token for secure authentication
- **Bcrypt:** Password hashing library
- **Dotenv:** Environment variable loader
- **Nodemon:** Development server for auto-reloading


## Authors

### **`Adam Sanusi Babatunde`**
*Backend and DevOps Engineer*
- [Mail](<tundey520@gmail.com>) || [GitHub](https://github.com/iAdamo) || [LinkedIn](https://www.linkedin.com/in/adamsanusi) || [Upwork]() || [YouTube]()

Adam is a backend engineer with a passion for DevOps. He is a fast learner and always eager to learn new technologies. He is a team player and always ready to contribute to the success of the team.

### **`Fawaz Abdganiyu`**
*Backend and Quality Assurance Engineer*
- [Mail](<fawazabdganiyu@gmail.com>) || [GitHub](https://github.com/Fawazabdganiyu/) || [LinkedIn](https://www.linkedin.com/in/fawaz-abdganiyu/)

Fawaz aims to be a full-stack engineer, but found himself doing well and more
interested in Backend development. He embraced this
challenge to enhance his expertise in these domain and be more relevant in the field.

## Acknowledgements
- [**ALX Software Engineering Program**](https://www.alxafrica.com/)
- [**Holberton School**](https://www.holbertonschool.com/)

## Contributing
This project is an open source project, your contribution would highly be appreciated.
Please read the [contributing guidelines](CONTRIBUTING.md) first.

## License
This project is licensed under the MIT License - see the [LICENSE](https://github.com/Fawazabdganiyu/Kajola/blob/main/LICENSE) file for details.
