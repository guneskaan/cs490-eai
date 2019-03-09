import os.path
import json
from pprint import pformat


class Table:

  def __init__(self, filename):
    self.filename = filename
    self.data = self.load_data()

  def load_data(self):
    with open(self.filename, 'r+') as f:
      data = f.read()
      return json.loads(data) if data else []

  def write(self):
    with open(self.filename, 'w') as f:
      f.write(json.dumps(self.data, indent=4, separators=(',', ': ')))

  def find_row(self, row_to_find):
    raise NotImplementedError('Table is a virtual class')

  def update_row(self, row_id, row):
    self.data[row_id].update(row)

  def upsert_row(self, row):
    matching_row = self.find_row(row)
    if matching_row:
      row['id'] = matching_row['id']
      self.update_row(matching_row['id'], row)
    else:
      row['id'] = len(self.data)
      self.data.append(row)

    self.write()
    return row

  def __str__(self):
    return pformat(self.data)
