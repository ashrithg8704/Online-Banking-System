# Online Banking System - Project Overview

## 🏦 Complete Banking Solution

This is a full-featured online banking system built with modern technologies, providing secure banking operations with a professional user interface.

## ✨ Key Features

### 🔐 Security & Authentication
- JWT-based authentication with role-based access control
- BCrypt password encryption
- Comprehensive audit logging
- Input validation and sanitization
- CORS configuration for secure cross-origin requests

### 👤 User Management
- User registration and login
- Profile management
- Admin user promotion
- Account activation/deactivation

### 💰 Account Operations
- Multiple account types (Savings, Checking, Business)
- Real-time balance tracking
- Account creation and management
- Deposit and withdrawal operations

### 💸 Transaction Management
- Secure fund transfers between accounts
- Transaction history with filtering
- Real-time transaction processing
- Transfer limits and validation
- PDF statement generation

### 📊 Admin Dashboard
- User management interface
- System audit logs
- Transaction monitoring
- User role management

## 🛠 Technology Stack

### Backend (Spring Boot)
- **Framework**: Spring Boot 3.2.0
- **Security**: Spring Security with JWT
- **Database**: MySQL with JPA/Hibernate
- **PDF Generation**: iText 8.0.2
- **Build Tool**: Maven
- **Health Monitoring**: Spring Boot Actuator

### Frontend (React)
- **Framework**: React 18 with Vite
- **UI Library**: Material-UI (MUI)
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **State Management**: React Context API
- **Notifications**: React Toastify
- **Date Handling**: Day.js with MUI Date Pickers

### Database Schema
- **Users**: Authentication and profile data
- **Accounts**: Banking account information
- **Transactions**: All financial transactions
- **Audit Logs**: System activity tracking

## 🚀 Quick Start

### Option 1: Docker (Recommended)
```bash
# Start all services with Docker
./docker-start.sh
```

### Option 2: Manual Setup
```bash
# Setup dependencies
./setup.sh

# Start backend (Terminal 1)
mvn spring-boot:run

# Start frontend (Terminal 2)
cd frontend && npm run dev
```

## 🌐 Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080/api
- **Health Check**: http://localhost:8080/api/actuator/health

## 👥 Default Accounts

### Administrator
- **Username**: `admin`
- **Password**: `admin123`
- **Capabilities**: Full system access, user management, audit logs

### Demo User
- **Username**: `demo`
- **Password**: `demo123`
- **Accounts**: Pre-created with sample balances
- **Capabilities**: Standard banking operations

## 📱 User Interface

### Dashboard
- Account overview with balances
- Recent transaction summary
- Quick action buttons
- Financial insights

### Account Management
- Create new accounts
- View account details
- Deposit/withdraw funds
- Account status management

### Transfer Money
- Secure fund transfers
- Real-time validation
- Transfer limits enforcement
- Transaction confirmation

### Transaction History
- Detailed transaction logs
- Date range filtering
- Account-specific views
- PDF statement download

### Admin Panel
- User management interface
- System audit trails
- Role-based permissions
- Security monitoring

## 🔒 Security Features

### Authentication
- JWT token-based authentication
- Secure password hashing
- Session management
- Role-based access control

### Data Protection
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CSRF protection

### Audit Trail
- Complete activity logging
- User action tracking
- System event monitoring
- Security incident detection

## 📊 API Documentation

### Authentication Endpoints
- `POST /api/auth/signin` - User login
- `POST /api/auth/signup` - User registration

### Account Endpoints
- `GET /api/accounts/my-accounts` - List user accounts
- `POST /api/accounts/create` - Create new account
- `POST /api/accounts/{id}/deposit` - Deposit funds
- `POST /api/accounts/{id}/withdraw` - Withdraw funds

### Transaction Endpoints
- `POST /api/transactions/transfer` - Transfer funds
- `GET /api/transactions/my-transactions` - Transaction history
- `GET /api/transactions/account/{id}/statement` - Generate PDF

### Admin Endpoints
- `GET /api/admin/users` - List all users
- `PUT /api/admin/users/{id}/promote` - Promote user
- `GET /api/admin/audit-logs` - System audit logs

## 🏗 Architecture

### Backend Architecture
```
Controller Layer → Service Layer → Repository Layer → Database
     ↓              ↓                ↓
Security Filter → Business Logic → Data Access → MySQL
```

### Frontend Architecture
```
Components → Services → Context → State Management
     ↓         ↓         ↓
   UI Layer → API Layer → Global State
```

## 🔧 Configuration

### Database Configuration
- Connection pooling
- Transaction management
- Automatic schema creation
- Data validation

### Security Configuration
- JWT token configuration
- CORS settings
- Authentication filters
- Authorization rules

## 📈 Performance Features

- Connection pooling for database
- Lazy loading for entities
- Pagination for large datasets
- Optimized queries
- Caching strategies

## 🧪 Testing

The system includes comprehensive testing capabilities:
- Unit tests for services
- Integration tests for APIs
- Security testing
- Performance testing

## 🚀 Deployment

### Docker Deployment
- Multi-container setup
- Database persistence
- Health checks
- Auto-restart policies

### Production Considerations
- Environment-specific configurations
- SSL/TLS encryption
- Load balancing
- Monitoring and logging

## 📝 Development Notes

### Code Quality
- Clean architecture principles
- SOLID design patterns
- Comprehensive error handling
- Detailed logging

### Scalability
- Microservice-ready architecture
- Database optimization
- Caching strategies
- Load balancing support

This banking system provides a solid foundation for a production-ready online banking application with enterprise-level security and functionality.
