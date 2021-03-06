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
  def register_service(cls, ip, service_to_register):
    service = cls.registered_services_table.upsert_row({
      'ip': ip,
      'service': service_to_register['service'],
    })
    for data_provided in service_to_register['data_provided']:
      cls.data_providers_table.upsert_row({
        'data_provided': data_provided,
        'provider_id': service['id']
      })

  @classmethod
  def get_datatypes(cls):
    return cls.data_providers_table.get_datatypes_provided()

  @classmethod
  def get_service_by_ip(cls, ip):
    return cls.registered_services_table.find_row_by_ip(ip)

  @classmethod
  def find_provider(cls, datatype):
    service = cls.data_providers_table.find_ip_row({
        'data_provided': datatype
    })
    return cls.registered_services_table.find_ip_row({
        'id': service['provider_id']
    })

  @classmethod
  def log_request(cls, request_ts, requestor, responder, response_success, response_size, datatype):
    cls.request_log_table.log(request_ts, requestor, responder, response_success, response_size, datatype)
    cls.request_log_table.write_to_frontend()
