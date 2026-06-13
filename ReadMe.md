# Johnny ✈️

Johnny is an AI-powered travel planning web application that helps users create personalized travel itineraries for different countries based on their preferences, budget, duration, and travel style.

## Features

### Authentication

* User Registration
* User Login
* JWT Authentication
* Secure Protected Routes

### Country Explorer

* Browse countries
* Search countries
* Filter countries by category
* Pagination support
* Responsive country cards with images

### AI Travel Planner

* Generate personalized travel plans
* Budget-based recommendations
* Duration-based itineraries
* Travel type customization
* Interest-based suggestions
* Additional custom requirements

### Saved Plans

* Save generated travel plans
* View saved plans
* Edit existing plans
* Delete saved plans

### Technical Features

* FastAPI Backend
* PostgreSQL Database
* SQLAlchemy ORM
* Docker Support
* Responsive Frontend
* RESTful APIs

---

## Tech Stack

### Backend

* FastAPI
* PostgreSQL
* SQLAlchemy
* JWT Authentication
* Pydantic

### Frontend

* HTML
* CSS
* JavaScript

### Deployment

* Docker
* Docker Compose
* Render

---

## Database Structure

### Users

Stores user account information.

### Places

Stores country information and filtering attributes.

### User Plans

Stores AI-generated travel plans and user preferences.

---

## API Endpoints

### Authentication

```text
POST /auth/signup
POST /auth/login
POST /auth/logout
```

### Places

```text
GET /places
```

### Plans

```text
POST /plans/generate
POST /plans
GET /plans
PUT /plans/{id}
DELETE /plans/{id}
```

---

## Installation

### Clone Repository

```bash
git clone <repository-url>
cd johnny
```

### Create Environment Variables

```env
DATABASE_URL=
SECRET_KEY=
ALGORITHM=
ACCESS_TOKEN_EXPIRE_MINUTES=

OPENAI_API_KEY=
```

### Run With Docker

```bash
docker compose up --build
```

Application will be available at:

```text
http://localhost:8000
```

---

## Live Demo

**Frontend:** [Add Site URL Here]

**Backend API:** [Add API URL Here]

---

## Future Improvements

* More destination categories
* Enhanced AI recommendations
* User profile customization
* Travel history analytics
* Favorite destinations
* Multi-language support

---

## Author

Built by **Mithul** as part of the **Skeleton Summer Build Challenge**.
