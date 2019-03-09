from data.table import Table


class RequestLogTable(Table):

  columns = ['id', 'request_from_id', 'requested_data', 'request_body']

  def find_row(self, row_to_find):
    for row in self.data:
      if (row['request_from_id'] == row_to_find['request_from_id'] and
          row['requested_data'] == row_to_find['requested_data'] and
          row['request_body'] == row_to_find['request_body']):
        return row
