import random
from datetime import datetime

services = ['HR', 'CRM', 'AIS']
datatypes = ['employee_info', 'CRM-Customers', 'CRM-Customer-Value', 'payroll']
response_size_min = 1300
response_size_max = 2200
request_ts_min = 1553472000
request_ts_max = 1554336000

def generate_random_row():
    from_service, to_service = random.sample(services, 2)
    datatype = random.choice(datatypes)
    response_size = random.uniform(response_size_min, response_size_max)
    request_ts = random.uniform(request_ts_min, request_ts_max)
    request_datetime = datetime.fromtimestamp(request_ts)
    success = random.uniform(1, 100)
    response_success = 0
    if success >= 80:
        response_success = 1

    return [request_datetime.strftime('%Y-%m-%dT%H:%M:%S'), from_service, to_service, response_success, datatype]
