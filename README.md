# Enterprise Application Integration

## Usage

Run the EAI server:
```
python3 server.py
```

## Sample requests

### Register Test Service for HR and Accounting data
curl -XPOST -H "Content-type: application/json" -d '{"service": "Test Service", "data_provided": ["HR", "Accounting"]}' 'localhost:9000/register'

### Get HR data
curl -XGET -H "Content-type: application/json" -d '{"type": "HR", "constraints": []}' 'localhost:9000/data'

### Get Accounting data
curl -XGET -H "Content-type: application/json" -d '{"type": "Accounting", "constraints": []}' 'localhost:9000/data'
