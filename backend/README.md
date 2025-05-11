# Bank Statement Classifier Backend

This is the FastAPI backend for the Bank Statement Classifier application. It provides API endpoints for managing transactions and categories, as well as CSV file upload and processing functionality.

## Features

- RESTful API endpoints for transactions and categories
- CSV file upload and processing
- Auto-categorization of transactions
- PostgreSQL database integration
- Docker support for easy deployment

## Project Structure

```
backend/
├── app/
│   ├── models/         # Database models
│   ├── routers/        # API endpoints
│   ├── schemas/        # Pydantic schemas for validation
│   ├── services/       # Business logic services
│   ├── database.py     # Database connection
│   └── db_init.py      # Database initialization
├── .env                # Environment variables
├── Dockerfile          # Docker configuration
├── main.py             # Application entry point
└── requirements.txt    # Python dependencies
```

## Setup and Installation

### Prerequisites

- Python 3.9+
- PostgreSQL 13+

### Local Development

1. Create a virtual environment:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

3. Set up PostgreSQL:
   - Create a database named `transaction_classifier`
   - Update the `.env` file with your database credentials if necessary

4. Run the application:
   ```
   uvicorn main:app --reload
   ```

5. Access the API documentation at http://localhost:8000/docs

### Docker Deployment

1. Build and start the containers:
   ```
   docker-compose up -d
   ```

2. Access the API at http://localhost:8000
   - API documentation: http://localhost:8000/docs

## API Endpoints

### Transactions

- `GET /api/transactions` - List all transactions
- `POST /api/transactions` - Create a new transaction
- `GET /api/transactions/{id}` - Get transaction details
- `PUT /api/transactions/{id}` - Update a transaction
- `DELETE /api/transactions/{id}` - Delete a transaction
- `POST /api/transactions/upload-csv` - Upload and process a CSV file
- `GET /api/transactions/summary/by-category` - Get spending summary by category

### Categories

- `GET /api/categories` - List all categories
- `POST /api/categories` - Create a new category
- `GET /api/categories/{id}` - Get category details
- `PUT /api/categories/{id}` - Update a category
- `DELETE /api/categories/{id}` - Delete a category

### Categorization

- `POST /api/categorization/auto-categorize` - Auto-categorize all uncategorized transactions
