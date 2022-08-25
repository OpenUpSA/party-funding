#!/bin/bash

if [[ "$VIRTUAL_ENV" != "" ]]; then
  echo "First deactivate currently active virtual environment"
else
  if [ -f ".pythonenv/bin/activate" ]; then
    . .pythonenv/bin/activate
  else
    . .pythonenv/Scripts/activate
  fi
fi
