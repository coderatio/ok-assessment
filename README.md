# Microservices Take Home Assessment

The project has three microservices.
- User Service
- Authentication Service
- Payment Service

# Structure
```lua
.
├── User Service (Nest.js)/
│   ├── src/
│   │   ├── common
│   │   ├── filters
│   │   ├── guards
│   │   ├── payment
│   │   ├── schemas
│   │   ├── users
│   │   └── wallets
│   ├── Dockerfile
│   ├── .env
│   └── package.json
├── Auth Service (Nest.js)/
│   ├── src/
│   │   ├── auth
│   │   ├── common
│   │   └── filters
│   ├── Dockerfile
│   ├── .env
│   └── package.json
├── Payment Service (Nest.js)/
│   ├── src/
│   │   ├── common
│   │   ├── filters
│   │   ├── guards
│   │   ├── payment
│   │   ├── schemas
│   │   └── wallets
│   ├── Dockerfile
│   ├── .env
│   └── package.json
├── .gitignore
├── docker-compose.yaml
├── package.json
└── README.md
```
All the services are using `nest.js` so all dependencies are expected to be installed.

# Technologies Used
- Node.js
- Nest.js
- Typescript
- Mongo
- Docker
- RxJs

## User Service
This service is responsible for managing users. The following endpoints are available
- ### `POST /users`
- ### `POST /wallets` - communicates with payment service
- ### `GET /users/:id`
- ### `GET /payments/:id` - communicates with payment service
- ### `GET /wallets/:id`- communicates with payment service

## Authentication Service
This service is responsible for authenticating registered users. It's used by both `user` and `payment` services. 
It has the following routes.
- ### `POST /login`
- ### `RPC ({ role: 'auth', cmd: 'check' })` - Verifies JWT token

# Payment Service
The payment service is responsible for generating wallets and processing all forms of payments. The service has the following endpoints
- ### `POST /wallets/fund`
- ### `POST /initiate`
- ### `POST /payment/refund`
- ### `GET /paymets/verify/:id`
- ### `RPC ({ role: 'wallets', cmd: 'create' })`
- ### `RPC ({ role: 'wallets', cmd: 'get' })`
- ### `RPC ({ role: 'payments', cmd: 'get' })`

