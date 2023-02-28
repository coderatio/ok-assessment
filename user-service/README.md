# NestJS Payments API
This is a sample application that demonstrates how to build a RESTful API using NestJS, Typescript, and MongoDB. The API allows users to create and manage wallets, initiate and manage payments, and also manage refunds.

## Getting Started
To run this application, you will need to have the following installed on your machine:

- Node.js v14 or higher
- npm v7 or higher
- MongoDB

## Project Structure
```lua
├── src
│   ├── auth
│   │   ├── auth.controller.ts
│   │   ├── auth.module.ts
│   │   ├── auth.service.ts
│   │   ├── guards
│   │   │   ├── jwt-auth.guard.ts
│   │   │   └── principal.guard.ts
│   │   ├── jwt.strategy.ts
│   │   └── types
│   │       ├── auth-payload.interface.ts
│   │       └── login-credentials.interface.ts
│   ├── common
│   │   ├── constants.ts
│   │   ├── dto
│   │   │   ├── payment.dto.ts
│   │   │   ├── refund.dto.ts
│   │   │   ├── user-create.dto.ts
│   │   │   └── wallet-create.dto.ts
│   │   └── utils
│   │       ├── http-exception-filter.ts
│   │       ├── logging.interceptor.ts
│   │       ├── responsable.ts
│   │       └── transform.interceptor.ts
│   ├── payments
│   │   ├── payments.controller.ts
│   │   ├── payments.module.ts
│   │   └── payments.service.ts
│   ├── users
│   │   ├── users.controller.ts
│   │   ├── users.module.ts
│   │   └── users.service.ts
│   ├── wallets
│   │   ├── wallets.controller.ts
│   │   ├── wallets.module.ts
│   │   └── wallets.service.ts
│   ├── app.controller.ts
│   ├── app.module.ts
│   └── main.ts
├── test
│   ├── app.e2e-spec.ts
│   └── jest-e2e.json
├── package.json
├── tsconfig.build.json
├── tsconfig.json
└── README.md
```

First, clone this repository and navigate to the project directory.

```bash
git clone https://github.com/coderatio/payment-api.git
cd payment-api
```
Next, install the project dependencies:

```bash
npm install
```
Create a `.env` file and set the following environment variables. Alternately, you may copy `.env.example` to `.env`:

```makefile
PORT=3000
MONGO_URI=<your mongodb uri>
JWT_SECRET=<your jwt secret>
```
You can then start the application using the following command:

```bash
npm run start:dev
```
The application should now be running on http://localhost:3000.

## API Endpoints
The following API endpoints are available:

### `POST /users`
Creates a new user.

### Request Body
```json 
{
  "email": "johndoe@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "password": "password",
  "wallet": "<wallet id>(optional)"
}
```
Note that the `<wallet id>` will be updated for the user in next endpoint.

`### POST /wallets`
Creates a new wallet.

### Request Body
```json
{
  "owner": "<user id>",
  "amount": 0,
  "currency": "NGN",
  "dailyLimit": 1000
}
```

### `GET /users/:id`
Returns a single user.

### `GET /payments/:id`
Returns a single payment.

### `GET /wallets/:id`
Returns a single wallet.

### `POST /login`
Authenticates a user and returns a JWT token.

### Request Body
```json
{
  "email": "johndoe@example.com",
  "password": "password"
}
```
### `POST /wallets/fund`
Funds an existing wallet.

### Request Body
```json
{
  "amount": 100,
  "wallet": "<wallet id>"
}
```
### `POST /payments/initiate`
Initiates a payment from one wallet to another.

### Request Body
```json
[
  {
    "amount": 100,
    "currency": "NGN",
    "wallet_to_debit": "<wallet id>",
    "wallet_to_credit": "<wallet id>",
    "metadata": {}
  }
]
```
### `POST /payments/refund`
Initiates a refund of a previous payment.

### Request Body
```json
{
  "amount": 100,
  "payment": "<payment id>"
}
```

## Authentication
All API endpoints require authentication using a JWT token. To authenticate, make a POST request to /login with a valid email and password. The response will contain a JWT token, which should be included in the Authorization header of subsequent requests as follows:

```makefile
Authorization: Bearer <token>
```

## Dependencies
This project has the following dependencies:

```bash 
@nestjs/common
@nestjs/config
@nestjs/jwt
@nestjs/mongoose
@nestjs/passport
@nestjs/platform-express
class-validator
dotenv
jsonwebtoken
mongoose
passport
passport-jwt
uuid
```
## License
N/A