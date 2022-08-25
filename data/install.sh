#!/bin/bash
python -m venv .pythonenv
./activate.sh
python -m pip install --requirement requirements.txt
