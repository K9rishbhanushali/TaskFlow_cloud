# Gunicorn (EC2 production). Run from backend/: gunicorn --config gunicorn.conf.py run:app
bind = "127.0.0.1:8000"
workers = 3
timeout = 60
accesslog = "-"
errorlog = "-"
