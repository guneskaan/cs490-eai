import os.path
import json

class EAIDatabase:

  @classmethod
  def initialize(cls,
                 registered_services_file='registered_services.txt',
                 data_providers_file='data_providers.txt',
                 request_log_file='request_log.txt'):
    cls.registered_services_file = registered_services_file
    cls.data_providers_file = data_providers_file
    cls.request_log_file = request_log_file
    cls.registered_services = cls.load_file(registered_services_file)
    cls.data_providers = cls.load_file(data_providers_file)
    cls.request_log = cls.load_file(request_log_file)

  @staticmethod
  def load_file(filename):
    with open(filename, 'r+') as f:
      data = f.read()
      return json.loads(data) if data else []

  @classmethod
  def update_database(cls):
    with open(cls.registered_services_file, 'w') as f:
      f.write(json.dumps(cls.registered_services))

  @classmethod
  def register_service(cls, service_information):
    import pdb; pdb.set_trace()

    service_exists = False
    for registered_service in cls.registered_services:
      if service_information['service'] == registered_service['service']:
        registered_service.update(service_information)
        service_exists = True
        break

    if not service_exists:
      cls.registered_services.append(service_information)

    cls.update_database()
