# Online Banking System

A full-stack online banking application built with Spring Boot (backend) and React (frontend).

## Features

### User Features
- **User Registration & Authentication**: Secure JWT-based authentication
- **Account Management**: Create multiple accounts (Savings, Checking, Business)
- **Fund Transfers**: Transfer money between accounts with real-time validation
- **Transaction History**: View detailed transaction history with filtering
- **PDF Statements**: Generate and download account statements
- **Dashboard**: Overview of accounts, balances, and recent transactions
- **Deposit/Withdrawal**: Manage account balances

### Admin Features
- **User Management**: View all users, promote to admin, deactivate accounts
- **Audit Logs**: Complete system activity tracking
- **System Monitoring**: Monitor all banking operations

### Security Features
- **JWT Authentication**: Secure token-based authentication
- **Role-based Access Control**: User and Admin roles
- **Input Validation**: Comprehensive server-side validation
- **Audit Trail**: Complete logging of all system activities
- **Transfer Limits**: Configurable daily transfer limits
- **Fraud Prevention**: Basic fraud detection mechanisms

## Technology Stack

### Backend
- **Spring Boot 3.2.0**: Main framework
- **Spring Security**: Authentication and authorization
- **Spring Data JPA**: Database operations
- **MySQL**: Database
- **JWT**: Token-based authentication
- **iText PDF**: PDF generation
- **Maven**: Dependency management

### Frontend
- **React 18**: UI framework
- **Material-UI (MUI)**: Component library
- **React Router**: Navigation
- **Axios**: HTTP client
- **React Toastify**: Notifications
- **Vite**: Build tool

## Prerequisites

- Java 17 or higher
- Node.js 16 or higher
- MySQL 8.0 or higher
- Maven 3.6 or higher

## Setup Instructions

### 1. Database Setup

1. Install MySQL and create a database:
```sql
CREATE DATABASE online_banking;
```

2. Update database credentials in `src/main/resources/application.yml`:
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/online_banking?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true
    username: your_username
    password: your_password
```

### 2. Backend Setup

1. Navigate to the project root directory
2. Install dependencies and run the application:
```bash
mvn clean install
mvn spring-boot:run
```

The backend will start on `http://localhost:8080`

### 3. Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will start on `http://localhost:3000`

## Default Accounts

The system creates default accounts on startup:

### Admin Account
- **Username**: `admin`
- **Password**: `admin123`
- **Role**: Administrator

### Demo User Account
- **Username**: `demo`
- **Password**: `demo123`
- **Role**: User
- **Accounts**: Pre-created with sample balances

## API Endpoints

### Authentication
- `POST /api/auth/signin` - User login
- `POST /api/auth/signup` - User registration

### Accounts
- `GET /api/accounts/my-accounts` - Get user accounts
- `POST /api/accounts/create` - Create new account
- `GET /api/accounts/{accountNumber}/balance` - Get account balance
- `POST /api/accounts/{accountNumber}/deposit` - Deposit funds
- `POST /api/accounts/{accountNumber}/withdraw` - Withdraw funds

### Transactions
- `POST /api/transactions/transfer` - Transfer funds
- `GET /api/transactions/account/{accountNumber}` - Get account transactions
- `GET /api/transactions/my-transactions` - Get user transactions
- `GET /api/transactions/account/{accountNumber}/statement` - Generate PDF statement

### Admin (Admin role required)
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/{userId}/promote` - Promote user to admin
- `DELETE /api/admin/users/{userId}` - Deactivate user
- `GET /api/admin/audit-logs` - Get audit logs

## Project Structure

```
online-banking-system/
├── src/main/java/com/banking/
│   ├── config/          # Configuration classes
│   ├── controller/      # REST controllers
│   ├── dto/            # Data Transfer Objects
│   ├── entity/         # JPA entities
│   ├── repository/     # Data repositories
│   ├── security/       # Security configuration
│   └── service/        # Business logic
├── src/main/resources/
│   └── application.yml # Application configuration
├── frontend/
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── contexts/   # React contexts
│   │   ├── pages/      # Page components
│   │   └── services/   # API services
│   └── package.json
└── README.md
```

## Usage

1. **Registration**: Create a new account or use demo credentials
2. **Login**: Sign in with your credentials
3. **Create Accounts**: Set up savings, checking, or business accounts
4. **Manage Funds**: Deposit, withdraw, or transfer money
5. **View History**: Check transaction history and generate statements
6. **Admin Functions**: Manage users and monitor system activity (admin only)

## Security Considerations

- All API endpoints are secured with JWT authentication
- Passwords are encrypted using BCrypt
- Input validation on both client and server side
- CORS configuration for cross-origin requests
- Audit logging for all critical operations
- Transfer limits to prevent fraud

## Development

### Running Tests
```bash
mvn test
```

### Building for Production
```bash
# Backend
mvn clean package

# Frontend
cd frontend
npm run build
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please create an issue in the repository.
