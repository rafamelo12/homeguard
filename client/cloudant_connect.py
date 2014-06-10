import cloudant
import io
import picamera
import time
from base64 import *
from mimetypes import *
from http import client
from datetime import datetime
from uuid import *

def new_id():
    '''() -> str
    Return a UUID formated as string without dashes.
    '''
    return str(uuid4()).replace('-','')

def string64(buff):
    '''(Buffer) -> str
    Return a base64 encoded string correctly formated for JSON.
    '''
    return str(b64encode(buff.read()))[2:-1]

# Cloudant account information
ACCOUNT = 'neryuuk'
USER = 'cenditheroddemingiviceds'
PASS = 'JHHEEBQm17EU3RaGo6mbY6JY'
DB = 'homeguard'

account = cloudant.Account(ACCOUNT)

login = account.login(USER, PASS)
assert login.status_code == client.OK
print('HTTP status:',login.status_code,client.responses[login.status_code])

# file_name = 'image.jpg'
# file_mime = guess_type(file_name)[0]
# pict = open(file_name,'rb')
stream = io.BytesIO()
with picamera.PiCamera() as camera:
    camera.exposure_mode = 'auto'
    camera.resolution = (1366, 768)
    # camera.vflip = True
    time.sleep(5)
    camera.capture('file.jpg')
    camera.capture(stream, 'jpeg')
img_file = open('file.jpg','rb')
print('\'file.jpg\' captured!')
stream.seek(0)
print('\'stream.jpg\' captured!')

db = account.database(DB)
doc = db.document(new_id())

response = doc.put(params = {
    'utc_timestamp': str(datetime.utcnow()),
    'local_timestamp': str(datetime.now()),
    '_attachments': {
        'stream.jpg': {
            'content_type': 'image/jpeg',
            'data': string64(stream)
        },
        'file.jpg': {
            'content_type': 'image/jpeg',
            'data': string64(img_file)
        }
    }
})

print(response.status_code,response.json())
