from data.table import Table


class RegisteredServiceTable(Table):

  columns = ['id', 'service']

  def find_row(self, row_to_find):
    for row in self.data:
      if row['service'] == row_to_find['service']:
        return row
