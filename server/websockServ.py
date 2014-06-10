import sys, os
from autobahn.asyncio.websocket import WebSocketServerProtocol, WebSocketServerFactory
import asyncio
import cloudant
import io
import picamera
import time
from base64 import *
from mimetypes import *
from datetime import datetime
from uuid import *

class HGServerProtocol(WebSocketServerProtocol):

    def onConnect(self, request):
        """(Request) -> ()
        Defines the server response when a client connects to it.
        When a connection is estabilished, the server logs the client id and executes the camera
        and database routines.
        """

        print("WebSocket connection opening...")
        print('Loging into database server...')
        HGServerProtocol.homeguard_db = HGCloudantDB('neryuuk', 'cenditheroddemingiviceds', 'JHHEEBQm17EU3RaGo6mbY6JY')
        response = HGServerProtocol.homeguard_db.getDB('homeguard')
        print("Database status: {0}".format(response.status_code))

        print("Client connecting: {0}".format(request.peer))
        
    def onOpen(self):
        """() -> ()
        Defines the server response to its connection opening.
        When the socket opens, a log entry is written stating it status and the database
        connection is created.
        """
        print("Starting camera capture routine...")

        (stream1, stream2) = take_picture(picamera)
        (doc_id, doc_json) = create_json(stream1, stream2)

        response = HGServerProtocol.homeguard_db.db.createDoc(doc_id, doc_json)

        #response = HGServerProtocol.homeguard_db.createDoc(doc_id, doc_json)

        if(response.status_code == 201):
            print ('Response JSON: ' + str(response.json()))
            print ('Document JSON: ' + str(HGServerProtocol.homeguard_db.getDoc(response.json()['id'])))
            payload = ("201: " + str(response.json()['id'])).encode('utf8')
            #print(payload)
            #print(type(payload))
            self.sendMessage(payload, False)

        elif(response.status_code == 409):
            print ('Response JSON: ' + str(response.json()))
            payload = ('409: ' + str(response.json()['error'])).encode('utf8')
            #print(payload)
            self.sendMessage(payload, False)

    def onMessage(self, payload, isBinary):
        """(Stream, Boolean) -> ()
        Defines the server behavior when it receives a message.
        TODO: Implement reaction to server to a message from the client.
        Right now, only checks if the data is binary or not, and shows its length
        if the data is binary or its content otherwise.

        Only for debug purposes.
        """
        if isBinary:
            print("Binary message received: {0} bytes.".format(len(payload)))
        else:
            print("Text message received: {0}.".format(payload.decode('utf8')))

        #self.sendMessage(payload, isBinary)

    def onClose(self, wasClean, code, reason):
        """(Boolean, Int, String) -> ()
        Defines server behavior on socket closing.
        Upon closing, prints a log entry stating that it is closed and the
        closing reason. The extra parameters are for future status checking.
        """
        print("WebSocket connection closed: {0}".format(reason))

class HGCloudantDB:
    def __init__(self, acc, user, passwd):
        """Initializes the DB client and logs into the database, returning the
        login status code.
        """
        #self._ACCOUNT_NAME = "fesoliveira"
        #self._USERNAME = 'heedierstreallstatingstr'
        #self._PASSWORD = 'mEkBwWGApngDVESBmP8Yosoj'
        #self._DBNAME = 'homeguard'
        self.account = cloudant.Account(acc)
        self.login = self.account.login(user, passwd)
        print("Login status: {0}".format(self.login.status_code))

    def getDB(self, db_name):
        """(String) -> (Response Object)
        Instatiate the database and returns the reponse object.

        Params:
        db_name: A string containing the database name.
        """
        self.db = self.account.database(db_name)
        return self.db.get()

    def getDoc(self, doc_id):
        """(String) -> (Response Object)
        Opens a document and returns the reponse object.

        Params:
        doc_name: A string containing the document name.
        """
        self.document = self.db.document(doc_id)
        return self.document.get()

    def createDoc(self, doc_id, doc_json):
        """(Dictionary) -> (Response Object)
        Checks if there is a document currently opened and tries to make a
        put request on it. Returns a reponse object with the operation status.

        @params:
        doc_id: A string containing the document ID.
        doc_json: A dictionary object formated as a JSON.
        """
        self.document = self.db.document(doc_id)
        return self.document.put(params = doc_json)

def new_id():
    '''() -> str
    Return a UUID formated as string without dashes.
    '''
    return str(uuid4()).replace('-','')

def string64(buff):
    '''(Buffer) -> str
    Return a base64 encoded string correctly formated for JSON.
    '''

    if(type(buff) == 'string'):
        return str(b64encode(buff))

    else: 
        return str(b64encode(buff.read()))[2:-1]

def take_picture(picamera):
    '''(PiCamera) -> (Stream, Stream)
    Takes a couple of pictures with PiCamera, storing one on the hard-drive and
    the other on a stream object. Opens the stored file and loads its content into
    a second stream and returns both.

    @params:
    picamera: PiCamera object from picamera module
    '''

    stream = io.BytesIO()

    with picamera.PiCamera() as camera:
        camera.exposure_mode = 'auto'
        camera.resolution = (1366, 768)
        #camera.vflip = True
        time.sleep(5)
        camera.capture('file.jpg')
        camera.capture(stream, 'jpeg')

    with open('file.jpg','rb') as f:
        img_file = f.read()

    assert(f.closed)

    print('\'file.jpg\' captured!')
    stream.seek(0)
    print('\'stream.jpg\' captured!')

    #img_file = open('profile2.jpg', 'rb')
    #stream = open('test.jpg', 'rb')



    return (img_file, stream)

def create_json(_file_data_, _stream_data_):
    '''(Stream, Stream) -> (Dictionary)
    Creates a JSON object using stream data.

    @params:
    _file_data_, _stream_data_: Stream data to be written on JSON object
    '''
    _file_JSON_ = {
    'utc_timestamp': str(datetime.utcnow()),
    'local_timestamp': str(datetime.now()),
    '_attachments': {
        'stream.jpg': {
            'content_type': 'image/jpeg',
            'data': string64(_stream_data_)
            },
        'file.jpg': {
            'content_type': 'image/jpeg',
            'data': string64(_file_data_)
            }
        }
    }
    return new_id() ,_file_JSON_

if __name__ == '__main__':

    fac_host = '192.168.2.200'
    fac_port = 5050
    ws_host = 'ws://pi.neryuuk.com:' + str(fac_port)

    factory = WebSocketServerFactory(ws_host, debug = False)
    factory.protocol = HGServerProtocol

    #print('Starting loop...')
    loop = asyncio.get_event_loop()
    #print('Starting coro...')
    coro = loop.create_server(factory, fac_host, fac_port)
    #print('Starting server...')
    server = loop.run_until_complete(coro)

    try:
        print('Server running on '+ ws_host + '...')
        loop.run_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.close()
        loop.close()