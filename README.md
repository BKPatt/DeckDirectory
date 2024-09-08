# Deck Directory

Deck Directory is a comprehensive card collection management system designed for enthusiasts of trading card games and sports cards. It allows users to track, value, and manage their card collections across multiple platforms including Pokémon, Magic: The Gathering, Yu-Gi-Oh!, Lorcana, and various sports cards.

## Features

- Multi-platform support: Manage cards from Pokémon, Magic: The Gathering, Yu-Gi-Oh!, Lorcana, Baseball, Football, Basketball, and Hockey.
- Create and manage card lists
- Track card quantities and collection status
- Real-time market value updates
- Collection value tracking
- Advanced filtering and sorting options
- Responsive web interface

## Tech Stack

- Frontend: React with TypeScript
- Backend: Django (Python)
- Database: PostgreSQL
- Task Queue: Celery
- State Management: React Context API
- UI Framework: Material-UI (MUI)

## Project Structure

The project is divided into two main parts:

1. Frontend (`my-pokemon-app/`)
   - React components
   - TypeScript interfaces and types
   - Material-UI styled components

2. Backend (`backend/`)
   - Django project and app configurations
   - API views and serializers
   - Database models
   - Celery tasks

## Setup and Installation

### Prerequisites

- Node.js (v14 or later)
- Python (v3.8 or later)
- PostgreSQL

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Create a virtual environment:
   ```
   python -m venv venv
   ```

3. Activate the virtual environment:
   - On Windows: `venv\Scripts\activate`
   - On macOS and Linux: `source venv/bin/activate`

4. Install the required Python packages:
   ```
   pip install -r requirements.txt
   ```

5. Set up the database:
   ```
   python manage.py migrate
   ```

6. Create a superuser:
   ```
   python manage.py createsuperuser
   ```

7. Start the Django development server:
   ```
   python manage.py runserver
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd my-pokemon-app
   ```

2. Install the required npm packages:
   ```
   npm install
   ```

3. Start the React development server:
   ```
   npm start
   ```

## Running the Application

You can use the provided `start_project.bat` script to start both the backend and frontend servers simultaneously:

```
.\start_project.bat
```

This script will:
1. Start the Django server
2. Start the Celery worker
3. Start the React app

## API Endpoints

- `/api/cardlists/`: CRUD operations for card lists
- `/api/cards-by-list/<list_id>/`: Get cards for a specific list
- `/api/add-card-to-list/`: Add a card to a list
- `/api/update-card-quantity/`: Update the quantity of a card in a list
- `/api/delete-card-from-list/`: Remove a card from a list
- `/api/card-collection/`: Manage collected cards
- `/api/filter-options/`: Get filter options for cards

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.