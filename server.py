import json
from http.server import BaseHTTPRequestHandler, HTTPServer

from data.database import EAIDatabase
from exceptions import (DatabaseException,
                        RequestException)


HOST_NAME = 'localhost'
PORT_NUMBER = 9000


class EAIRequestHandler(BaseHTTPRequestHandler):

  def do_GET(self):
    content_length = int(self.headers['Content-Length'])
    body_string = self.rfile.read(content_length)
    body = json.loads(body_string)

    if self.path == '/data':
      self.get_data(body)

  def do_POST(self):
    content_length = int(self.headers['Content-Length'])
    body_string = self.rfile.read(content_length)
    body = json.loads(body_string)

    if self.path == '/register':
      self.register(body)

  def register(self, body):
    if not all(attr in body for attr in ('service', 'data_provided')):
      raise RequestException('Registration request is missing fields.')

    EAIDatabase.register_service(body)

  def get_data(self, body):
    import pdb; pdb.set_trace()
    pass


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
