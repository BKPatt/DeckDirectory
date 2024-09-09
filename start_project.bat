@echo off

REM Start Django server
cd "backend"
start cmd /k python manage.py runserver

REM Start Celery worker
start cmd /k celery -A backend worker --loglevel=debug

REM Start React app
cd ".."
cd "my-pokemon-app"
start cmd /k npm start
