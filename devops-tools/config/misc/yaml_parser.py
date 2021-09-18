import yaml
import sys
import os

field=sys.argv[1]
file_name=os.environ.get('YAML_FILE', '')

value=''

try:
    with open(file_name) as fh:
        data = yaml.load(fh, Loader=yaml.FullLoader)
    value = data[field]
except:
    value = 'ERROR'

sys.stdout.write(value)
sys.stdout.flush()
sys.exit(0)