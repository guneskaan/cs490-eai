#!/usr/bin/env bash
python3 server.py &
cd frontend && python3 -m http.server &
