import random
from datetime import datetime
import csv

headers = ['Timestamp', 'Requester', 'Responder', 'ResponseSuccess', 'ResponseSize', 'Type']
services = ['HR', 'CRM', 'AIS', 'MIS']
datatypes = ['employee_info', 'CRM-Customers', 'CRM-Customer-Value', 'payroll', 'CRM-Sales-Satisfaction']
response_size_min = 1300
response_size_max = 2200
request_ts_min = 1553472000
request_ts_max = 1554336000

def generate_random_row():
    from_service, to_service = random.sample(services, 2)
    datatype = random.choice(datatypes)
    response_size = random.randint(response_size_min, response_size_max)
    request_ts = random.randint(request_ts_min, request_ts_max)
    request_datetime = datetime.fromtimestamp(request_ts)
    success = random.randint(1, 100)
    response_success = 0
    if success <= 20:
        response_success = 1

    return [request_datetime, from_service, to_service, response_success, response_size, datatype]

def generate_request_log(rows=100):
    with open('generated_reqlog.csv', 'w') as csvfile:
        writer = csv.writer(csvfile, lineterminator='\n')
        writer.writerow(headers)
        data = []
        for _ in range(rows):
            data.append(generate_random_row())

        data_to_write = [
            [row[0].strftime('%Y-%m-%dT%H:%M:%S')] + row[1:] for row in sorted(data)
        ]
        writer.writerows(data_to_write)

generate_request_log()
