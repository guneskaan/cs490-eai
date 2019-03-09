from data.table import Table


class DataProviderTable(Table):

  columns = ['id', 'data_provided', 'provider_id']

  def find_row(self, row_to_find):
    for row in self.data:
      if (row['data_provided'] == row_to_find['data_provided'] and
          row['provider_id'] == row_to_find['provider_id']):
        return row