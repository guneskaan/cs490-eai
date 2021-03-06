import json
import requests
import datetime
from http.server import BaseHTTPRequestHandler, HTTPServer

from data.database import EAIDatabase
from exceptions import (DatabaseException,
                        RequestException)


HOST_NAME = 'localhost'
PORT_NUMBER = 9000


class EAIRequestHandler(BaseHTTPRequestHandler):

  def do_GET(self):
    content_length = int(self.headers['Content-Length'] or 0)
    body_string = self.rfile.read(content_length)
    body = json.loads(body_string.decode('utf-8')) if body_string else {}
    ip = self.headers["X-Real-IP"]
    print('Get request from IP {}'.format(ip))

    if self.path == '/data':
      headers = {'content-type': 'application/json'}
      r = self.get_data(body, headers, ip)
      self.send_response(200)
      self.send_header('Content-Type', 'application/json')
      self.end_headers()
      self.wfile.write(json.dumps(r.text).encode('utf-8'))

    if self.path == '/datatypes':
      datatypes = self.get_datatypes()
      self.send_response(200)
      self.send_header("Content-type", "text/html")
      self.end_headers()
      self.wfile.write(json.dumps(datatypes).encode('utf-8'))

  def do_POST(self):
    content_length = int(self.headers['Content-Length'])
    body_string = self.rfile.read(content_length)
    body = json.loads(body_string.decode('utf-8'))
    ip = self.headers["X-Real-IP"]
    print('Post request from IP {}'.format(ip))

    if self.path == '/register':
      self.send_response(200)
      self.send_header("Content-type", "text/html")
      self.end_headers()
      self.register(ip, body)

    if self.path == '/data':
      r = self.get_data(body, ip=ip)
      self.send_response(200)
      self.send_header('Content-Type', 'application/json')
      self.end_headers()
      self.wfile.write(json.dumps(r.text).encode('utf-8'))

  def register(self, ip, body):
    if not all(attr in body for attr in ('service', 'data_provided')):
      raise RequestException('Registration request is missing fields.')

    print('Registering service {} to provide {}'.format(body['service'], body['data_provided']))
    self.wfile.write(bytes
                     ('Registering service {} to provide {} datatypes at IP Address {}\n'.
                     format(body['service'], body['data_provided'], ip)+
                      'Please make sure this IP Address can respond to requests at /get_data endpoint as per our API Reference Guidelines\n'
                      +'If this is not a static ip address, please contact the EAI Communication Officer with your static ip address', "utf-8"))

    EAIDatabase.register_service(ip, body)

  def get_data(self, body, headers={}, ip=''):
    request_ts = datetime.datetime.now().strftime("%Y-%m-%dT%H:%M:%S")
    requestor = EAIDatabase.get_service_by_ip(ip or '')

    if not requestor:
        requestor = {'service': 'Sales and Marketing'}

    provider = EAIDatabase.find_provider(body['type'])
    reqip = provider['ip']
    r = requests.get(
      'http://' + reqip + '/get_data',
      data=json.dumps(body),
      headers=headers)
    response_success = 0
    response_size = len(r.text)
    datatype = body['type']
    EAIDatabase.log_request(request_ts, requestor['service'], provider['service'], response_success, response_size, datatype)
    return r

  def get_datatypes(self):
    return EAIDatabase.get_datatypes()

def run_server():
  print('Initializing database...')
  EAIDatabase.initialize()

  print('Running EAI server at {}:{}...'.format(HOST_NAME, PORT_NUMBER))
  eai_server = HTTPServer((HOST_NAME, PORT_NUMBER), EAIRequestHandler)

  try:
    eai_server.serve_forever()
  except KeyboardInterrupt:
    print('Stopping EAI server.')
    eai_server.server_close()


run_server()
