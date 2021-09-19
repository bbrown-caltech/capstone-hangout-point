import yaml
import sys
import os

field=sys.argv[1]
file_name=sys.argv[2]

value=''

try:
    with open(file_name) as fh:
        data = yaml.load(fh, Loader=yaml.FullLoader)
    value = data[field]
except Exception as err:
    value = "ERROR: %s" % (str(err))

sys.stdout.write(value)
sys.stdout.flush()
sys.exit(0)