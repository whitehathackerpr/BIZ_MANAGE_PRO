#!/bin/bash

# Start the integrated FastAPI server
echo "Starting BIZ_MANAGE_PRO integrated server..."

# Create required directories
mkdir -p logs uploads static

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python -m venv venv
fi

# Activate virtual environment
source venv/bin/activate
#upgrading pip
pip install --upgrade pip
# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt

# Run the server
echo "Starting server..."
python main.py

# Deactivate virtual environment on exit
deactivate 