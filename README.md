# Carpool Ride-Sharing Application

A modern, full-stack carpooling platform that connects drivers with passengers heading in the same direction, promoting cost-sharing and reducing carbon footprint through efficient ride-sharing.

## 📋 Table of Contents
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Contributing](#-contributing)
- [Team](#-team)

## ✨ Features

### For Passengers
- 🚗 Find and book rides to your destination
- 💰 Transparent fare calculation and cost-splitting
- ⏰ Schedule rides in advance
- 🔒 Secure payment processing
- 🌟 Rate and review drivers

### For Drivers
- 🚘 Offer rides and share travel costs
- 🛣️ Set custom routes and pickup points
- 📱 Easy ride management
- 💵 Earn money while commuting
- 🏆 Build reputation through ratings

## 🛠 Tech Stack

### Frontend
- **Framework**: React 18
- **State Management**: Redux Toolkit
- **UI Components**: Material-UI
- **Routing**: React Router v6

### Backend
- **Framework**: Spring Boot 3.x
- **Language**: Java 17+
- **Build Tool**: Maven
- **Security**: Spring Security with JWT

### Database
- **RDBMS**: MySQL 8.0+
- **ORM**: Hibernate/JPA

### DevOps
- **Version Control**: Git
- **CI/CD**: GitHub Actions
- **Containerization**: Docker

## 📋 Prerequisites

### Development Environment
- Java Development Kit (JDK) 17 or later
- Node.js 16.x or later
- MySQL Server 8.0 or later
- Maven 3.6.3 or later
- Git

### Recommended IDEs
- IntelliJ IDEA (Backend)
- VS Code (Frontend)

## 🚀 Installation

### Backend Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/carpool-ride-sharing-app.git
   cd carpool-ride-sharing-app/backend
   ```
2. Configure the database:
   - Create a new MySQL database
   - Update `application.properties` with your database credentials

3. Build and run the application:
   ```bash
   mvn clean install
   mvn spring-boot:run
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```

## ⚙️ Configuration

### Database Configuration
Update the following in `backend/src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/your_database_name
spring.datasource.username=your_username
spring.datasource.password=your_password
```

## 🤝 Contributing

1. Fork the repository
2. Create a new branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Submit a pull request

## 👥 Team

| Name            | Role           | Responsibilities                     |
|-----------------|----------------|--------------------------------------|
| Nap Adriel      | Backend Lead   | System Architecture, API Development |
| Mark Andrew     | Frontend Lead  | UI/UX, Frontend Development         |
| Adrian Pateres  | QA Engineer    | Testing, Quality Assurance          |
