from data.table import Table


class RegisteredServiceTable(Table):

  columns = ['id', 'service']

  def find_ip_row(self, row_to_find):
    for row in self.data:
      if row['id'] == row_to_find['id']:
        return row

  def find_row_by_ip(self, ip):
    for row in self.data:
      if row['ip'] == ip:
        return row

  def find_row(self, row_to_find):
    for row in self.data:
      if row['service'] == row_to_find['service']:
        return row
