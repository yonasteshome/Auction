import os, django
os.environ['DJANGO_SETTINGS_MODULE'] = 'core_api.settings'
django.setup()
from django.db import connection
cursor = connection.cursor()
cursor.execute(
    "INSERT OR IGNORE INTO django_migrations (app, name, applied) VALUES (?, ?, datetime('now'))",
    ['users', '0008_user_avatar']
)
print(f'Inserted: {cursor.rowcount}')
