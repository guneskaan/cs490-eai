import os.path
import json

from data.data_provider import DataProviderTable
from data.registered_service import RegisteredServiceTable
from data.request_log import RequestLogTable


class EAIDatabase:

  @classmethod
  def initialize(cls,
                 registered_services_file='registered_services.txt',
                 data_providers_file='data_providers.txt',
                 request_log_file='request_log.txt'):
    cls.data_providers_table = DataProviderTable(data_providers_file)
    cls.registered_services_table = RegisteredServiceTable(registered_services_file)
    cls.request_log_table = RequestLogTable(request_log_file)

  @classmethod
  def register_service(cls, service_to_register):
    service = cls.registered_services_table.upsert_row({
      'service': service_to_register['service']
    })
    for data_provided in service_to_register['data_provided']:
      cls.data_providers_table.upsert_row({
        'data_provided': data_provided,
        'provider_id': service['id']
      })
