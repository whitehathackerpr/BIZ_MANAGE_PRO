import os
from werkzeug.utils import secure_filename
from flask import current_app

def save_image(image_file):
    filename = secure_filename(image_file.filename)
    upload_path = os.path.join(current_app.static_folder, 'uploads')
    os.makedirs(upload_path, exist_ok=True)
    image_file.save(os.path.join(upload_path, filename))
    return filename

def delete_image(filename):
    if filename:
        file_path = os.path.join(current_app.static_folder, 'uploads', filename)
        if os.path.exists(file_path):
            os.remove(file_path) 