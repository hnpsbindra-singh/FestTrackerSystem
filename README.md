# 🎟️ Fest Tracker

**Fest Tracker** is a full-stack event management and ticket booking platform that enables users to discover and book events while allowing organizers to create and manage them.

The platform is built using **Spring Boot, PostgreSQL, Redis, Spring Security, and React.js**, with a focus on secure authentication, booking workflows, payment verification, and scalable backend design.

---

## ✨ Features

### 👤 Users
- Secure registration and login
- Browse available events
- View detailed event information
- Book event tickets
- Manage bookings
- Receive booking-related emails
- Secure access to protected APIs

### 🎪 Organizers
- Create events
- Manage event information
- Configure ticket and seating details
- View event bookings
- Manage event availability

### 🎫 Booking & Ticketing
- End-to-end ticket booking workflow
- Booking status management
- Payment verification
- Ticket generation and verification
- Secure booking validation

### 📍 Event Discovery
- Discover upcoming events
- Location-based event discovery
- Distance-based event filtering
- PostgreSQL-based event queries

---

## 🛠️ Tech Stack

### Backend
- Java
- Spring Boot
- Spring Security
- Spring Data JPA
- Hibernate
- JWT Authentication
- Redis
- REST APIs
- Maven

### Database
- PostgreSQL

### Frontend
- React.js
- JavaScript
- HTML5
- CSS3

### Tools
- Git & GitHub
- Postman
- Swagger / OpenAPI
- IntelliJ IDEA

---

## 🏗️ Backend Architecture

Fest Tracker follows a layered backend architecture:

```text
React Client
     ↓
Spring Security
     ↓
JWT Authentication Filter
     ↓
Controller Layer
     ↓
Service Layer
     ↓
Repository Layer
     ↓
PostgreSQL
```

Redis is integrated alongside the primary database for caching and temporary data storage.

```text
                  Spring Boot
                       │
             ┌─────────┴─────────┐
             │                   │
        PostgreSQL             Redis
             │                   │
      Persistent Data     Cached / Temporary
                               Data
```

---

## 🔐 Authentication & Authorization

Fest Tracker uses **Spring Security and JWT** for stateless authentication.

```text
User Login
    ↓
Credentials Verified
    ↓
JWT Generated
    ↓
JWT Sent With Requests
    ↓
JWT Authentication Filter
    ↓
User Authenticated
    ↓
Protected API
```

Role-based access control separates functionality available to regular users and event organizers.

---

## 🎟️ Event Booking Lifecycle

The booking system handles the complete lifecycle of an event ticket.

```text
User selects event
        ↓
Ticket / Seating selected
        ↓
Booking created
        ↓
Payment initiated
        ↓
Payment verified
        ↓
Booking confirmed
        ↓
Ticket generated
        ↓
Ticket verified at event
```

The backend maintains booking and payment states to ensure that tickets are issued only after successful verification.

---

## 💳 Payment Verification

Payment processing is integrated with the booking workflow.

The backend is responsible for validating payment information before confirming a booking.

```text
Payment Initiated
       ↓
Payment Provider
       ↓
Payment Response
       ↓
Backend Verification
       ↓
   ┌───┴────┐
   │        │
Success   Failed
   │        │
Confirm   Reject
Booking   Booking
```

This prevents the frontend alone from determining whether a booking should be considered successful.

---

## 🎫 Ticket Verification

Confirmed bookings generate ticket information that can later be verified.

```text
Confirmed Booking
       ↓
Ticket Generated
       ↓
Ticket Presented
       ↓
Backend Verification
       ↓
Booking Validated
```

This provides a controlled ticket-validation workflow for event entry.

---

## ⚡ Redis

Redis is integrated for fast access to frequently used or temporary application data.

```text
Application Request
        ↓
      Redis
     ↙     ↘
 Cache Hit  Cache Miss
    ↓          ↓
 Response   PostgreSQL
               ↓
          Update Cache
               ↓
            Response
```

Redis helps reduce unnecessary database access for suitable application data.

---

## 🗄️ PostgreSQL & JPA

**PostgreSQL** is used as the primary relational database.

Database access is implemented using:

- Spring Data JPA
- Hibernate
- JPQL
- Entity relationships
- Repository abstractions

The relational model handles users, events, bookings, tickets, and other application data.

---

## 📦 DTO-Based API Design

Fest Tracker uses DTOs to separate API contracts from persistence entities.

```text
HTTP Request
     ↓
Request DTO
     ↓
Controller
     ↓
Service
     ↓
Entity
     ↓
Repository
     ↓
PostgreSQL
```

Response DTOs expose only the data required by the client instead of directly returning database entities.

---

## 📧 Email Integration

Email functionality is integrated into the backend for application workflows such as:

- Authentication-related communication
- Booking confirmation
- Ticket-related information
- Important event notifications

```text
Application Event
       ↓
Email Service
       ↓
Email Provider
       ↓
User
```

---

## ⚠️ Exception Handling

Centralized exception handling provides consistent API error responses across the application.

Example:

```json
{
  "message": "Booking not found",
  "status": 404
}
```

---

## 📖 API Documentation

The backend APIs are documented using **Swagger / OpenAPI**, allowing endpoints and request/response structures to be easily explored and tested.

---

## 🚀 Running the Project

### Backend

```bash
mvn clean install
mvn spring-boot:run
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Make sure **PostgreSQL and Redis** are running and the required environment variables are configured before starting the backend.

---

## 👨‍💻 Author

**Harnimarpreet Singh**

Fest Tracker was built to implement a production-oriented event booking workflow using **Spring Boot, Spring Security, PostgreSQL, Redis, payment verification, ticket management, REST APIs, and React.js**.
