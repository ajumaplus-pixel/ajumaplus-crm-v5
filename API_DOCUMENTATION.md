# AjumaPlus CRM API Documentation

## Overview

This document provides comprehensive API documentation for the AjumaPlus CRM system, including all endpoints for authentication, user management, jobs, pricing, matching, analytics, ratings, and Ghana-specific features.

**Base URL:** `http://localhost:3001/api`

**Authentication:** All endpoints (except authentication endpoints) require a valid JWT token in the `Authorization` header.

## Authentication

### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "role": "admin|staff|customer|isp"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "token": "string",
    "user": {
      "id": "string",
      "username": "string",
      "email": "string",
      "role": "string"
    }
  }
}
```

### POST /auth/login
Authenticate a user and receive a JWT token.

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "string",
    "user": {
      "id": "string",
      "username": "string",
      "email": "string",
      "role": "string"
    }
  }
}
```

## User Management

### GET /users
Get all users (staff only).

**Query Parameters:**
- `limit` (optional): Number of users to return (default: 50)
- `offset` (optional): Number of users to skip (default: 0)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "username": "string",
      "email": "string",
      "role": "string",
      "created_at": "string"
    }
  ]
}
```

### GET /users/:id
Get user by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "username": "string",
    "email": "string",
    "role": "string",
    "created_at": "string"
  }
}
```

## Jobs

### POST /jobs
Create a new job request.

**Request Body:**
```json
{
  "customer_id": "string",
  "category": "string",
  "description": "string",
  "priority": "low|normal|high|urgent",
  "address": "string",
  "gps_coords": "string",
  "scheduled_date": "string",
  "notes": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Job created successfully",
  "data": {
    "id": "string",
    "job_number": "string",
    "customer_id": "string",
    "category": "string",
    "status": "new",
    "created_at": "string"
  }
}
```

### GET /jobs
Get all jobs (staff only).

**Query Parameters:**
- `limit` (optional): Number of jobs to return (default: 50)
- `offset` (optional): Number of jobs to skip (default: 0)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "job_number": "string",
      "customer_id": "string",
      "category": "string",
      "status": "string",
      "created_at": "string"
    }
  ]
}
```

### GET /jobs/:id
Get job by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "job_number": "string",
    "customer_id": "string",
    "category": "string",
    "status": "string",
    "quotations": []
  }
}
```

### PUT /jobs/:id
Update job details.

**Request Body:**
```json
{
  "category": "string",
  "description": "string",
  "priority": "string",
  "address": "string",
  "notes": "string"
}
```

### PUT /jobs/:id/status
Update job status.

**Request Body:**
```json
{
  "status": "new|assigned|in_progress|completed|cancelled"
}
```

### PUT /jobs/:id/assign
Assign an ISP to a job (staff only).

**Request Body:**
```json
{
  "isp_id": "string"
}
```

### POST /jobs/:id/notes
Add a note to a job.

**Request Body:**
```json
{
  "note": "string"
}
```

### DELETE /jobs/:id
Delete a job (staff only).

## Pricing & Quotations

### POST /pricing/estimate
Get AI-powered price estimate for a job.

**Request Body:**
```json
{
  "job_id": "string",
  "description": "string",
  "category": "string",
  "urgency": "number (1-5)",
  "complexity": "number (1-5)"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Price estimated successfully",
  "data": {
    "labourCost": "number",
    "materialsCost": "number",
    "travelCost": "number",
    "total": "number",
    "priceRange": {
      "min": "number",
      "max": "number",
      "recommended": "number"
    },
    "aiInsights": {
      "requiredSkills": ["string"],
      "estimatedTime": "number",
      "confidence": "number"
    }
  }
}
```

### POST /pricing/quotations
Create a quotation (staff only).

**Request Body:**
```json
{
  "job_id": "string",
  "labour_cost": "number",
  "materials_cost": "number",
  "travel_cost": "number",
  "experience_factor": "number",
  "complexity_factor": "number",
  "urgency_factor": "number",
  "total": "number",
  "notes": "string",
  "created_by": "string"
}
```

### GET /pricing/quotations
Get all quotations (staff only).

**Query Parameters:**
- `limit` (optional): Number of quotations to return (default: 50)
- `offset` (optional): Number of quotations to skip (default: 0)

### GET /pricing/quotations/:id
Get quotation by ID.

### PUT /pricing/quotations/:id/approve
Approve a quotation (staff only).

### PUT /pricing/quotations/:id/reject
Reject a quotation (staff only).

### POST /pricing/quotations/job/:job_id/generate
Generate quotation from job automatically using AI (staff only).

**Response:**
```json
{
  "success": true,
  "message": "Quotation generated from job",
  "data": {
    "quotation": {
      "id": "string",
      "quotation_number": "string",
      "total": "number"
    },
    "pricing": {
      "labourCost": "number",
      "materialsCost": "number",
      "total": "number"
    },
    "aiAnalysis": {
      "complexity_level": "number",
      "required_skills": ["string"]
    }
  }
}
```

### POST /pricing/quotations/compare
Compare multiple quotations (staff only).

**Request Body:**
```json
{
  "quotation_ids": ["string"]
}
```

### GET /pricing/quotations/job/:job_id/history
Get quotation history for a job.

### POST /pricing/quotations/:id/revise
Revise a quotation (staff only).

**Request Body:**
```json
{
  "labour_cost": "number",
  "materials_cost": "number",
  "total": "number",
  "notes": "string"
}
```

### GET /pricing/quotations/:id/expiration
Check quotation expiration status.

### GET /pricing/quotations/job/:job_id/workflow
Get quotation workflow status for a job.

### POST /pricing/quotations/:id/send
Send quotation to customer (staff only).

### GET /pricing/quotations/stats
Get quotation statistics (staff only).

## ISP Matching

### POST /matching/jobs/:job_id/match
Get recommended ISPs for a job.

**Response:**
```json
{
  "success": true,
  "message": "ISP matching completed successfully",
  "data": {
    "jobData": {
      "category": "string",
      "location": "string"
    },
    "matches": [
      {
        "id": "string",
        "trade": "string",
        "location": "string",
        "rating": "number",
        "score": "number",
        "scoreBreakdown": {
          "skillMatch": "number",
          "locationProximity": "number",
          "availability": "number",
          "rating": "number",
          "experience": "number"
        }
      }
    ],
    "totalAvailable": "number",
    "confidence": "number"
  }
}
```

### POST /matching/jobs/:job_id/assign
Assign best ISP to a job (staff only).

**Response:**
```json
{
  "success": true,
  "message": "ISP assigned successfully",
  "data": {
    "job": {
      "id": "string",
      "isp_id": "string",
      "status": "assigned"
    },
    "assignedISP": {
      "id": "string",
      "trade": "string",
      "score": "number"
    },
    "alternatives": [],
    "confidence": "number"
  }
}
```

### GET /matching/isp/:isp_id/availability
Get ISP availability for a date range.

**Query Parameters:**
- `start_date` (required): Start date (YYYY-MM-DD)
- `end_date` (required): End date (YYYY-MM-DD)

**Response:**
```json
{
  "success": true,
  "data": {
    "ispId": "string",
    "ispName": "string",
    "startDate": "string",
    "endDate": "string",
    "totalSlots": "number",
    "usedSlots": "number",
    "availableSlots": "number",
    "isAvailable": "boolean"
  }
}
```

### POST /matching/bulk-match
Bulk ISP matching for multiple jobs (staff only).

**Request Body:**
```json
{
  "jobs": [
    {
      "category": "string",
      "location": "string",
      "priority": "string",
      "description": "string"
    }
  ]
}
```

## Analytics

### GET /analytics/forecast/demand
Get demand forecast for a service category.

**Query Parameters:**
- `category` (required): Service category
- `location` (required): Location
- `days` (optional): Forecast period in days (default: 30)

**Response:**
```json
{
  "success": true,
  "data": {
    "category": "string",
    "location": "string",
    "forecastPeriod": "30 days",
    "forecast": {
      "trend": "increasing|decreasing|stable",
      "growthRate": "number"
    },
    "historicalData": {
      "totalJobs": "number",
      "averageDaily": "number"
    },
    "confidence": "number"
  }
}
```

### GET /analytics/projection/revenue
Get revenue projection.

**Query Parameters:**
- `days` (optional): Projection period in days (default: 30)

**Response:**
```json
{
  "success": true,
  "data": {
    "currentRevenue": "number",
    "projectedRevenue": "number",
    "dailyRate": "number",
    "growthRate": "number",
    "completedJobs": "number"
  }
}
```

### GET /analytics/estimate/completion-time
Get job completion time estimate.

**Query Parameters:**
- `category` (required): Service category
- `complexity` (required): Complexity level (1-5)
- `location` (required): Location

**Response:**
```json
{
  "success": true,
  "data": {
    "category": "string",
    "complexity": "number",
    "location": "string",
    "estimatedHours": "number",
    "estimatedDays": "number",
    "confidence": "number"
  }
}
```

### GET /analytics/predict/churn/:customer_id
Get churn prediction for a customer.

**Response:**
```json
{
  "success": true,
  "data": {
    "customerId": "string",
    "churnRisk": "low|medium|high",
    "factors": {
      "jobFrequency": "number",
      "lastJobDays": "number"
    },
    "confidence": "number"
  }
}
```

### GET /analytics/estimate/clv/:customer_id
Get customer lifetime value estimate.

**Response:**
```json
{
  "success": true,
  "data": {
    "customerId": "string",
    "clv": "number",
    "churnRisk": "string",
    "totalRevenue": "number",
    "projectionPeriod": "number months"
  }
}
```

### GET /analytics/predict/peak-periods
Get peak period predictions.

**Query Parameters:**
- `category` (required): Service category
- `days` (optional): Analysis period in days (default: 90)

**Response:**
```json
{
  "success": true,
  "data": {
    "category": "string",
    "peakDay": "Monday",
    "dayOfWeekCounts": {
      "0": "number",
      "1": "number"
    },
    "peakJobs": "number",
    "confidence": "number"
  }
}
```

### GET /analytics/dashboard
Get dashboard analytics data (staff only).

**Response:**
```json
{
  "success": true,
  "data": {
    "totalJobs": "number",
    "statusCounts": {
      "new": "number",
      "assigned": "number",
      "in_progress": "number",
      "completed": "number",
      "cancelled": "number"
    },
    "categoryCounts": {
      "electrical": "number",
      "plumbing": "number"
    },
    "ispAvailability": {
      "total": "number",
      "available": "number",
      "busy": "number"
    },
    "revenueData": {
      "currentRevenue": "number",
      "projectedRevenue": "number",
      "growthRate": "number"
    }
  }
}
```

## Ratings

### POST /ratings
Create a rating for an ISP.

**Request Body:**
```json
{
  "isp_id": "string",
  "job_id": "string",
  "quality": "number (1-5)",
  "timeliness": "number (1-5)",
  "professionalism": "number (1-5)",
  "communication": "number (1-5)",
  "comment": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Rating created successfully",
  "data": {
    "id": "string",
    "isp_id": "string",
    "job_id": "string",
    "overall": "number",
    "created_at": "string"
  }
}
```

### GET /ratings/isp/:isp_id
Get all ratings for an ISP.

**Query Parameters:**
- `limit` (optional): Number of ratings to return (default: 20)
- `offset` (optional): Number of ratings to skip (default: 0)

**Response:**
```json
{
  "success": true,
  "data": {
    "ratings": [
      {
        "id": "string",
        "isp_id": "string",
        "overall": "number",
        "comment": "string",
        "created_at": "string"
      }
    ],
    "averageRating": {
      "average_rating": "number",
      "total_ratings": "number"
    },
    "total": "number"
  }
}
```

### GET /ratings/ranking
Get ISP ranking by rating.

**Query Parameters:**
- `limit` (optional): Number of ISPs to return (default: 10)
- `offset` (optional): Number of ISPs to skip (default: 0)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "rank": 1,
      "id": "string",
      "trade": "string",
      "averageRating": "number",
      "totalRatings": "number"
    }
  ]
}
```

### GET /ratings/:id
Get rating by ID.

### PUT /ratings/:id
Update a rating (within 24 hours of creation).

**Request Body:**
```json
{
  "quality": "number",
  "timeliness": "number",
  "professionalism": "number",
  "communication": "number",
  "comment": "string"
}
```

### DELETE /ratings/:id
Delete a rating (staff only).

### POST /ratings/:id/report
Report a rating as inappropriate.

**Request Body:**
```json
{
  "reason": "string"
}
```

### POST /ratings/:id/respond
Add ISP response to a rating (ISP only).

**Request Body:**
```json
{
  "response": "string"
}
```

## Customers

### POST /customers
Create a new customer profile.

**Request Body:**
```json
{
  "user_id": "string",
  "first_name": "string",
  "last_name": "string",
  "phone": "string",
  "address": "string",
  "ghana_card_id": "string",
  "ghana_post_gps": "string"
}
```

### GET /customers
Get all customers (staff only).

### GET /customers/:id
Get customer by ID.

### PUT /customers/:id
Update customer details.

## Webhooks

### POST /webhooks/google-forms
Handle Google Forms webhook submissions.

**Request Body:**
```json
{
  "form_type": "isp_registration|customer_registration|job_request",
  "email": "string",
  "form_data": "object"
}
```

## Error Responses

All endpoints may return error responses in the following format:

```json
{
  "success": false,
  "message": "Error message",
  "code": "ERROR_CODE",
  "errors": [],
  "requestId": "string"
}
```

### Common Error Codes

- `VALIDATION_ERROR`: Request validation failed
- `AUTHENTICATION_ERROR`: Invalid or missing authentication
- `AUTHORIZATION_ERROR`: Insufficient permissions
- `NOT_FOUND_ERROR`: Resource not found
- `CONFLICT_ERROR`: Resource already exists
- `RATE_LIMIT_ERROR`: Too many requests
- `DATABASE_ERROR`: Database operation failed
- `INTERNAL_SERVER_ERROR`: Unexpected server error

## Rate Limiting

All endpoints are rate-limited to prevent abuse:
- 100 requests per hour per IP address
- 15-minute block duration when limit exceeded

## Ghana-Specific Features

### Phone Number Format
Ghana phone numbers should be in one of these formats:
- `0241234567` (local format)
- `+233241234567` (international format)

### Ghana Card ID Format
Ghana Card IDs should follow the format: `GHA-123456789-0`

### GhanaPost GPS Format
GhanaPost GPS codes should follow the format: `AK-039-5021`

### Regional Pricing
Pricing is automatically adjusted based on the region:
- Greater Accra: +20%
- Ashanti: +10%
- Western: +5%
- Northern: -10%
- Upper East: -15%
- Upper West: -15%

## Testing

### Testing Endpoints Locally

```bash
# Get all jobs
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3001/api/jobs

# Create a job
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"customer_id":"UUID","category":"electrical","description":"Fix wiring","priority":"normal","address":"Accra"}' \
  http://localhost:3001/api/jobs

# Get demand forecast
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3001/api/analytics/forecast/demand?category=electrical&location=Accra&days=30"
```

## Support

For API support, contact the development team or refer to the GitHub repository.