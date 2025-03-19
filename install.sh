#!/bin/sh

# Navigate to the directory containing this script
cd "$(dirname "$0")"

echo "Installing Node.js dependencies..."
npm install

echo "Installing Python dependencies..."
cd focus-peaking
pip3 install -r requirements.txt

echo "Running focus peaking algorithm..."
python3 focus_peaking.py

echo "Setup successful!"