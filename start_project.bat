@echo off

REM Start Django server
cd "backend"
start cmd /k C:/Users/BrantleysPC/AppData/Local/Programs/Python/Python311/python.exe c:/Users/BrantleysPC/Desktop/Pokemon/backend/manage.py runserver

REM Start Celery worker
start cmd /k celery -A backend worker --loglevel=debug

REM Start React app
cd ".."
cd "my-pokemon-app"
start cmd /k npm start
