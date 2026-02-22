# Pharmacy System Backend API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication

### Register User
**Endpoint:** `POST /auth/register`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "password": "user123",
  "role": "USER"  // or "ADMIN"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully"
}
```

### Login User
**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "user123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "67b3d1f2a4c8e90012345678",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "role": "USER"
  }
}
```

### Get User Profile
**Endpoint:** `GET /auth/profile`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "67b3d1f2a4c8e90012345678",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "role": "USER",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

## AI Agent Chat

### Chat with Agent
**Endpoint:** `POST /agent/chat`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
  "userMessage": "I want to buy 2 packs of Dolo 650"
}
```

**Response:**
```json
{
  "agentResponse": {
    "intent": "ORDER_MEDICINE",
    "answer": "I can help you order Dolo 650. I found it in stock.",
    "medicine_name": "Dolo 650",
    "dosage": null,
    "quantity": 2,
    "symptom": null,
    "confidence": 0.95,
    "missing_fields": []
  },
  "workflowStatus": "ORDER_SUCCESS",
  "orderId": "67b3d1f2a4c8e90012345681",
  "refillAlerts": []
}
```

**Possible workflowStatus values:**
- `ORDER_SUCCESS` - Order was successfully placed
- `REJECTED_BY_SAFETY` - Order rejected due to safety checks
- `COMPLETED_CONVERSATION` - Non-order conversation completed

### Get Agent Logs (Admin Only)
**Endpoint:** `GET /agent/logs`

**Headers:**
```
Authorization: Bearer ADMIN_JWT_TOKEN
```

**Response:**
```json
[
  {
    "id": "67b3d1f2a4c8e90012345685",
    "agentName": "ConversationalAgent",
    "action": "interpret_intent",
    "decision": "{\"intent\":\"ORDER_MEDICINE\",\"medicine_name\":\"Dolo 650\"}",
    "relatedOrderId": "67b3d1f2a4c8e90012345681",
    "timestamp": "2024-01-15T10:35:00.000Z"
  }
]
```

## Medicine Management

### Get All Medicines
**Endpoint:** `GET /medicine`

**Response:**
```json
[
  {
    "id": "67b3d1f2a4c8e90012345679",
    "name": "Dolo 650",
    "dosage": "650mg",
    "unitType": "tablets",
    "stock": 100,
    "price": 25.50,
    "prescriptionRequired": false,
    "createdAt": "2024-01-15T10:30:00.000Z"
  },
  {
    "id": "67b3d1f2a4c8e90012345680",
    "name": "Metformin",
    "dosage": "500mg",
    "unitType": "tablets",
    "stock": 50,
    "price": 150.00,
    "prescriptionRequired": true,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
]
```

### Add Medicine (Admin Only)
**Endpoint:** `POST /medicine/add`

**Headers:**
```
Authorization: Bearer ADMIN_JWT_TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Paracetamol 500mg",
  "dosage": "500mg",
  "unitType": "tablets",
  "stock": 100,
  "price": 15.50,
  "prescriptionRequired": false
}
```

### Update Medicine (Admin Only)
**Endpoint:** `PUT /medicine/update/:id`

**Headers:**
```
Authorization: Bearer ADMIN_JWT_TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Updated Medicine Name",
  "stock": 150,
  "price": 25.99
}
```

## Cart Management

### Create Cart
**Endpoint:** `POST /cart/create`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
  "userId": "67b3d1f2a4c8e90012345678"
}
```

**Response:**
```json
{
  "success": true,
  "cartId": "67b3d1f2a4c8e90012345686",
  "message": "Cart created successfully"
}
```

### Add Item to Cart
**Endpoint:** `POST /cart/add`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
  "userId": "67b3d1f2a4c8e90012345678",
  "medicineId": "67b3d1f2a4c8e90012345679",
  "quantity": 2
}
```

**Response:**
```json
{
  "success": true,
  "message": "Item added to cart"
}
```

### Update Cart Item
**Endpoint:** `PUT /cart/update`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
  "userId": "67b3d1f2a4c8e90012345678",
  "medicineId": "67b3d1f2a4c8e90012345679",
  "quantity": 5
}
```

**Response:**
```json
{
  "success": true,
  "message": "Cart updated successfully"
}
```

### Remove Item from Cart
**Endpoint:** `DELETE /cart/remove`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
  "userId": "67b3d1f2a4c8e90012345678",
  "medicineId": "67b3d1f2a4c8e90012345679"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Item removed from cart"
}
```

## Order Management

### Place Order
**Endpoint:** `POST /order/place`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
  "userId": "67b3d1f2a4c8e90012345678",
  "items": [
    {
      "medicineId": "67b3d1f2a4c8e90012345679",
      "quantity": 2,
      "dosage": "1 tablet twice daily"
    }
  ],
  "totalAmount": 51.00
}
```

**Response:**
```json
{
  "success": true,
  "orderId": "67b3d1f2a4c8e90012345681",
  "message": "Order placed successfully."
}
```

### Get User Order History
**Endpoint:** `GET /order/history/:userId`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**
```json
[
  {
    "id": "67b3d1f2a4c8e90012345681",
    "userId": "67b3d1f2a4c8e90012345678",
    "items": [
      {
        "medicineId": {
          "id": "67b3d1f2a4c8e90012345679",
          "name": "Dolo 650"
        },
        "quantity": 2,
        "dosagePerDay": "1 tablet twice daily"
      }
    ],
    "totalAmount": 51.00,
    "status": "CONFIRMED",
    "orderDate": "2024-01-15T10:30:00.000Z",
    "estimatedEndDate": "2024-02-15T10:30:00.000Z"
  }
]
```

## Prescription Management

### Upload Prescription
**Endpoint:** `POST /prescription/upload`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: multipart/form-data
```

**Form Data:**
```
prescription: [file upload]
```

**Response:**
```json
{
  "success": true,
  "message": "Prescription uploaded successfully",
  "prescriptionId": "67b3d1f2a4c8e90012345682"
}
```

### Validate Prescription
**Endpoint:** `GET /prescription/validate`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Query Parameters:**
```
medicineId=67b3d1f2a4c8e90012345680
userId=67b3d1f2a4c8e90012345678
```

**Response:**
```json
{
  "success": true,
  "hasValidPrescription": true,
  "validTill": "2024-12-31T23:59:59.000Z"
}
```

## Payment Processing

### Process Payment
**Endpoint:** `POST /payment/process`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
  "orderId": "67b3d1f2a4c8e90012345681",
  "paymentMethod": "CARD",
  "cardDetails": {
    "number": "4111111111111111",
    "expiry": "12/25",
    "cvv": "123"
  }
}
```

**Response:**
```json
{
  "success": true,
  "paymentId": "pay_67b3d1f2a4c8e90012345687",
  "status": "COMPLETED",
  "message": "Payment processed successfully"
}
```

## Admin Dashboard

### Get Admin Dashboard Stats
**Endpoint:** `GET /admin/dashboard`

**Headers:**
```
Authorization: Bearer ADMIN_JWT_TOKEN
```

**Response:**
```json
{
  "totalOrders": 150,
  "totalUsers": 45,
  "totalMedicines": 75,
  "lowStockItems": 5,
  "pendingOrders": 12
}
```

### Get All Orders (Admin)
**Endpoint:** `GET /admin/orders`

**Headers:**
```
Authorization: Bearer ADMIN_JWT_TOKEN
```

**Response:**
```json
[
  {
    "id": "67b3d1f2a4c8e90012345681",
    "userId": "67b3d1f2a4c8e90012345678",
    "items": [
      {
        "medicineId": {
          "id": "67b3d1f2a4c8e90012345679",
          "name": "Dolo 650"
        },
        "quantity": 2,
        "dosagePerDay": "1 tablet twice daily"
      }
    ],
    "totalAmount": 51.00,
    "status": "CONFIRMED",
    "orderDate": "2024-01-15T10:30:00.000Z"
  }
]
```

### Update Order Status (Admin)
**Endpoint:** `PUT /admin/orders/:id`

**Headers:**
```
Authorization: Bearer ADMIN_JWT_TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
  "status": "IN_WAREHOUSE"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order status updated successfully"
}
```

## Webhook Endpoints

### Order Fulfillment Webhook
**Endpoint:** `POST /webhook/order`

**Request Body:**
```json
{
  "orderId": "67b3d1f2a4c8e90012345681",
  "status": "IN_WAREHOUSE",
  "userId": "67b3d1f2a4c8e90012345678"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Status updated and Admin Alert created."
}
```

### Refill Alert Webhook
**Endpoint:** `POST /webhook/refill-alert`

**Request Body:**
```json
{
  "type": "STOCK_ALERT",
  "medicineName": "Dolo 650",
  "stockLeft": 5,
  "userId": "67b3d1f2a4c8e90012345678",
  "daysLeft": 3
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Admin Dashboard alerted."
}
```

### Get User Notifications
**Endpoint:** `GET /notify/:userId`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**
```json
[
  {
    "id": "67b3d1f2a4c8e90012345683",
    "userId": "67b3d1f2a4c8e90012345678",
    "type": "order",
    "message": "Your order for Dolo 650 has been confirmed! Order ID: 67b3d1f2a4c8e90012345681",
    "sentAt": "2024-01-15T10:35:00.000Z"
  },
  {
    "id": "67b3d1f2a4c8e90012345684",
    "userId": "67b3d1f2a4c8e90012345678",
    "type": "refill",
    "message": "Reminder: You will run out of Metformin in about 3 days. Don't forget to refill!",
    "sentAt": "2024-01-14T09:15:00.000Z"
  }
]
```

## Database Schemas

### User Schema
```javascript
{
  _id: ObjectId,
  name: String (required),
  email: String (required, unique),
  phone: String,
  password: String (required),
  role: String (enum: ['USER', 'ADMIN'], default: 'USER'),
  createdAt: Date,
  updatedAt: Date
}
```

### Medicine Schema
```javascript
{
  _id: ObjectId,
  name: String (required),
  dosage: String (required),
  unitType: String (required), // e.g., 'tablets', 'ml'
  stock: Number (required, default: 0),
  price: Number (required, default: 0),
  prescriptionRequired: Boolean (default: false),
  createdAt: Date,
  updatedAt: Date
}
```

### Order Schema
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: 'User', required),
  items: [{
    medicineId: ObjectId (ref: 'Medicine', required),
    quantity: Number (required),
    dosagePerDay: String (required)
  }],
  totalAmount: Number (required),
  status: String (enum: ['CONFIRMED', 'REJECTED', 'IN_WAREHOUSE', 'SHIPPED', 'FULFILLED'], default: 'CONFIRMED'),
  orderDate: Date (default: Date.now),
  estimatedEndDate: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Cart Schema
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: 'User', required),
  items: [{
    medicineId: ObjectId (ref: 'Medicine', required),
    quantity: Number (required)
  }],
  status: String (enum: ['PENDING', 'COMPLETED', 'CANCELLED'], default: 'PENDING'),
  createdAt: Date,
  updatedAt: Date
}
```

### Prescription Schema
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: 'User', required),
  medicineId: ObjectId (ref: 'Medicine', required),
  issuedBy: String (required), // Doctor name or authority
  validTill: Date (required),
  imageUrl: String, // Path or URL to the prescription image
  createdAt: Date,
  updatedAt: Date
}
```

### Notification Schema
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: 'User', optional),
  recipientRole: String (enum: ['USER', 'ADMIN'], default: 'USER'),
  type: String (enum: ['refill', 'order', 'stock_alert'], required),
  message: String (required),
  sentAt: Date (default: Date.now)
}
```

### AgentLog Schema
```javascript
{
  _id: ObjectId,
  agentName: String (required),
  action: String (required),
  decision: String (required),
  relatedOrderId: ObjectId (ref: 'Order', optional),
  timestamp: Date (default: Date.now)
}
```

### InventoryLog Schema
```javascript
{
  _id: ObjectId,
  medicineId: ObjectId (ref: 'Medicine', required),
  change: Number (required), // Positive or negative
  reason: String (enum: ['ORDER_PLACED', 'REFILL', 'MANUAL_UPDATE'], required),
  createdAt: Date,
  updatedAt: Date
}
```

### RefillAlert Schema
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: 'User', required),
  medicineId: ObjectId (ref: 'Medicine', required),
  daysLeft: Number (required),
  notified: Boolean (default: false),
  createdAt: Date,
  updatedAt: Date
}
```

## Agent Response Types

### Conversational Agent Responses
The agent can return different intents:

**ORDER_MEDICINE:**
```json
{
  "intent": "ORDER_MEDICINE",
  "answer": "I can help you order Dolo 650.",
  "medicine_name": "Dolo 650",
  "quantity": 2,
  "dosage": null,
  "confidence": 0.95
}
```

**REFILL:**
```json
{
  "intent": "REFILL",
  "answer": "I see you want a refill for Metformin. I found a valid prescription on your file.",
  "medicine_name": "Metformin",
  "quantity": null,
  "confidence": 0.90
}
```

**SYMPTOM_QUERY:**
```json
{
  "intent": "SYMPTOM_QUERY",
  "answer": "For headaches, I recommend Dolo 650 which is available in our inventory.",
  "symptom": "headache",
  "medicine_name": "Dolo 650",
  "confidence": 0.85
}
```

**GENERAL_QUERY:**
```json
{
  "intent": "GENERAL_QUERY",
  "answer": "Hello! I'm your AI Pharmacy Assistant. How can I help you today?",
  "confidence": 1.0
}
```

**FALLBACK:**
```json
{
  "intent": "FALLBACK",
  "answer": "I'm not sure I understand. Could you please rephrase your request?",
  "confidence": 0.3
}
```

### Safety Agent Responses
The Safety Agent performs validation checks and can reject orders:

**Approved Order:**
```json
{
  "isApproved": true,
  "reasons": [],
  "details": [
    {
      "medicine_name": "Dolo 650",
      "status": "APPROVED",
      "medicineId": "67b3d1f2a4c8e90012345679"
    }
  ]
}
```

**Rejected Order (Stock Issue):**
```json
{
  "isApproved": false,
  "reasons": ["Insufficient stock for Dolo 650. Available: 5"],
  "details": [
    {
      "medicine_name": "Dolo 650",
      "status": "REJECTED",
      "reason": "LOW_STOCK"
    }
  ]
}
```

**Rejected Order (Prescription Required):**
```json
{
  "isApproved": false,
  "reasons": ["Prescription required for Metformin. No valid record found."],
  "details": [
    {
      "medicine_name": "Metformin",
      "status": "REJECTED",
      "reason": "PRESCRIPTION_MISSING"
    }
  ]
}
```

**Rejected Order (Medicine Not Found):**
```json
{
  "isApproved": false,
  "reasons": ["Medicine NonExistentMedicine not found in database."],
  "details": [
    {
      "medicine_name": "NonExistentMedicine",
      "status": "REJECTED",
      "reason": "NOT_FOUND"
    }
  ]
}
```

### Order Placement Agent Responses
Handles the actual order creation process:

**Successful Order Placement:**
```json
{
  "success": true,
  "orderId": "67b3d1f2a4c8e90012345681",
  "message": "Order placed successfully."
}
```

**Failed Order Placement:**
```json
{
  "success": false,
  "error": "Database connection failed"
}
```

### Predictive Refill Agent Responses
Analyzes user history and predicts refill needs:

**Refill Predictions:**
```json
[
  {
    "medicineId": "67b3d1f2a4c8e90012345679",
    "medicineName": "Dolo 650",
    "daysLeft": 3,
    "predictionReason": "Based on 2 tablets per day consumption pattern"
  },
  {
    "medicineId": "67b3d1f2a4c8e90012345680",
    "medicineName": "Metformin",
    "daysLeft": 7,
    "predictionReason": "Standard 30-day prescription cycle"
  }
]
```

### Complete Agent Workflow Responses

**When Safety Agent Rejects Order:**
```json
{
  "agentResponse": {
    "intent": "ORDER_MEDICINE",
    "answer": "I cannot complete your order. Reasons: Prescription required for Metformin. No valid record found.",
    "medicine_name": "Metformin",
    "quantity": 1,
    "confidence": 0.95
  },
  "workflowStatus": "REJECTED_BY_SAFETY"
}
```

**When Order is Successfully Placed:**
```json
{
  "agentResponse": {
    "intent": "ORDER_MEDICINE",
    "answer": "I have processed your order for Dolo 650. Your delivery is being scheduled.",
    "medicine_name": "Dolo 650",
    "quantity": 2,
    "confidence": 0.95
  },
  "orderId": "67b3d1f2a4c8e90012345681",
  "refillAlerts": [
    {
      "medicineId": "67b3d1f2a4c8e90012345679",
      "medicineName": "Dolo 650",
      "daysLeft": 5,
      "predictionReason": "Based on consumption pattern"
    }
  ],
  "workflowStatus": "ORDER_SUCCESS"
}
```

**For Non-Order Conversations:**
```json
{
  "agentResponse": {
    "intent": "GENERAL_QUERY",
    "answer": "Hello! I'm your AI Pharmacy Assistant. How can I help you today?",
    "confidence": 1.0
  },
  "workflowStatus": "COMPLETED_CONVERSATION"
}
```

## Error Responses

| Method | Route | Description | Auth Required | Role |
|--------|-------|-------------|---------------|------|
| POST | /auth/register | Register new user | No | - |
| POST | /auth/login | User login | No | - |
| GET | /auth/profile | Get user profile | Yes | USER/ADMIN |
| POST | /agent/chat | Chat with AI agent | Yes | USER/ADMIN |
| GET | /agent/logs | Get agent logs | Yes | ADMIN |
| GET | /medicine | Get all medicines | No | - |
| POST | /medicine/add | Add new medicine | Yes | ADMIN |
| PUT | /medicine/update/:id | Update medicine | Yes | ADMIN |
| POST | /cart/create | Create cart | Yes | USER |
| POST | /cart/add | Add item to cart | Yes | USER |
| PUT | /cart/update | Update cart item | Yes | USER |
| DELETE | /cart/remove | Remove item from cart | Yes | USER |
| POST | /order/place | Place order | Yes | USER |
| GET | /order/history/:userId | Get order history | Yes | USER |
| GET | /admin/orders | Get all orders | Yes | ADMIN |
| PUT | /admin/orders/:id | Update order status | Yes | ADMIN |
| GET | /admin/dashboard | Get dashboard stats | Yes | ADMIN |
| POST | /prescription/upload | Upload prescription | Yes | USER |
| GET | /prescription/validate | Validate prescription | Yes | USER |
| POST | /payment/process | Process payment | Yes | USER |
| GET | /notify/:userId | Get notifications | Yes | USER |
| POST | /notify/refill | Send refill notification | Yes | ADMIN |
| POST | /webhook/order | Order fulfillment webhook | No | - |
| POST | /webhook/refill-alert | Refill alert webhook | No | - |

### 400 Bad Request
```json
{
  "error": "Invalid request data"
}
```

### 401 Unauthorized
```json
{
  "error": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "error": "Access denied"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

## Important Notes for Frontend Development

1. **Authentication**: Most endpoints require JWT token in Authorization header
2. **User Roles**: Different permissions for USER vs ADMIN roles
3. **Prescription Validation**: Medicines with `prescriptionRequired: true` need valid prescriptions
4. **Safety Checks**: The system automatically validates orders for safety (stock, prescriptions, etc.)
5. **Agent Workflow**: The chat endpoint handles the complete order flow including validation and placement
6. **Real-time Updates**: Use notification endpoints to show real-time status updates to users

## Development Environment

- Base URL: `http://localhost:5000/api`
- Database: MongoDB (via Mongoose)
- Authentication: JWT tokens
- File Uploads: Multer for prescriptions
- AI Integration: Groq/Gemini APIs

## Testing Credentials

For development/testing purposes:
- Register a new user or use existing test credentials
- Admin endpoints require admin role
- Prescription-required medicines will be rejected without valid prescriptions