#!/usr/bin/env python3.4
import sys, os
import asyncio
import cloudant
import io
import time
import configparser
from autobahn.asyncio.websocket import WebSocketServerProtocol,\
                                        WebSocketServerFactory
from datetime import datetime
from base64 import *
from uuid import *

class HGServerProtocol(WebSocketServerProtocol):
    def __init__(self):
        """() -> ()
        Initializes protocol attributes using configuration file.
        """
        if(sys.argv.count('-debug') == 0):
            self.CONFIG = configparser.ConfigParser()
            self.CONFIG.read("config.ini")
        else:
            self.CONFIG = configparser.ConfigParser()
            self.CONFIG.read("config_debug.ini")

        self.ACCOUNT = config.get("Database", "login")
        self.API_KEY = config.get("Database", "APILogin")
        self.API_PASS = config.get("Database", "APIPass")
        self.DBNAME = config.get("Database", "name")

    def onConnect(self, request):
        """(Request) -> ()
        Defines the server response when a client connects to it.
        When a connection is estabilished, the server logs the
        client id and executes the camera and database routines.
        """
        print("WebSocket connection opening...")
        print("Loging into database server...")
        self.homeguard_db = HGCloudantDB(self.ACCOUNT,\
                                         self.API_KEY,\
                                         self.API_PASS)
        response = self.homeguard_db.getDB(self.DBNAME)
        print("Database status: {0}".format(response.status_code))
        print("Client connecting: {0}".format(request.peer))

    def onOpen(self):
        """() -> ()
        Defines the server response to its connection opening.
        When the socket opens, a log entry is written
        stating its status and the database connection is created.
        """
        print("Starting camera capture routine...")
        if(sys.argv.count('-debug') == 0):
            stream = take_picture(self.CONFIG, picamera, raspberry = True)
        else:
            stream = take_picture(self.CONFIG, picamera, raspberry = False)
        (doc_id, doc_json) = create_json(stream)

        response = self.homeguard_db.createDoc(doc_id, doc_json)

        if(response.status_code == 201):
            print ("Response JSON: " + str(response.json()))
            print ("Document JSON: " + str(self.homeguard_db.getDoc(response.json()["id"])))
            payload = ("201: " + str(response.json()["id"])).encode("utf8")
            #print(payload)
            #print(type(payload))
            self.sendMessage(payload, False)
        elif(response.status_code == 409):
            print ("Response JSON: " + str(response.json()))
            payload = ("409: " + str(response.json()["error"])).encode("utf8")
            #print(payload)
            self.sendMessage(payload, False)

    def onMessage(self, payload, isBinary):
        """(Stream, Boolean) -> ()
        Defines the server behavior when it receives a message.
        TO-DO: Implement reaction to server to a message from the client.
        Right now, only checks if the data is binary or not,
        and shows its length if the data is binary or its content otherwise.
        Only for debug purposes.
        """
        if isBinary:
            print("Binary message received: {0} bytes.".format(len(payload)))
            print("Binary messages cannot be decoded. Can't do nothing... :)")
        else:
            print("Text message received: {0}.".format(payload.decode("utf8")))
            clientMsg = payload.decode("utf8")

            if(clientMsg == 'take_pic'):
                print("Starting camera capture routine...")
                if(sys.argv.count('-debug') == 0):
                    stream = take_picture(self.CONFIG, picamera, raspberry = True)
                else:
                    stream = take_picture(self.CONFIG, picamera, raspberry = False)
                (doc_id, doc_json) = create_json(stream)

                response = self.homeguard_db.createDoc(doc_id, doc_json)

                if(response.status_code == 201):
                    print ("Response JSON: " + str(response.json()))
                    print ("Document JSON: " + str(self.homeguard_db.getDoc(response.json()["id"])))
                    payload = ("201: " + str(response.json()["id"])).encode("utf8")
                    #print(payload)
                    #print(type(payload))
                    self.sendMessage(payload, False)
                elif(response.status_code == 409):
                    print ("Response JSON: " + str(response.json()))
                    payload = ("409: " + str(response.json()["error"])).encode("utf8")
                    #print(payload)
                    self.sendMessage(payload, False)

            elif(clientMsg == 'stream'):
                print("Starting camera stream...")
                live_feed(self.CONFIG, picamera, self.homeguard_db, False, True)
                                

        #self.sendMessage(payload, isBinary)

    def onClose(self, wasClean, code, reason):
        """(Boolean, Int, String) -> ()
        Defines server behavior on socket closing.
        Upon closing, prints a log entry stating that
        it is closed and the closing reason.
        The extra parameters are for future status checking.
        """
        print("WebSocket connection closed: {0}".format(reason))

class HGCloudantDB:
    def __init__(self, acc_user, api_key, api_pass):
        """
        Initializes the DB client and logs into the database,
        returning the login status code.

        :param acc_user: account user string
        :param api_key: api key string
        :param api_pass: api password string
        """
        self.account = cloudant.Account(acc_user)
        self.login = self.account.login(api_key, api_pass)
        print("Login status: {0}".format(self.login.status_code))

    def getDB(self, db_name):
        """(String) -> (Response Object)
        Instantiate the database and returns the reponse object.

        :param db_name: A string containing the database name.
        :returns: Response object
        """
        self.db = self.account.database(db_name)
        return self.db.get()

    def getDoc(self, doc_id):
        """(String) -> (Response Object)
        Opens a document and returns the reponse object.

        :param doc_id: string containing the document id.
        :returns: Response object
        """
        self.document = self.db.document(doc_id)
        return self.document.get()

    def createDoc(self, doc_id, doc_json):
        """(Dictionary) -> (Response Object)
        Checks if there is a document currently opened and
        tries to make a put request on it. Returns
        a reponse object with the operation status.

        :param doc_id: A string containing the document ID.
        :param doc_json: A dictionary object formated as a JSON.
        :returns: Response object
        """
        self.document = self.db.document(doc_id)
        return self.document.put(params = doc_json)

    def updateDoc(self, doc_id, doc_json):
        rev = self.document(doc_id).json()['_rev']
        doc_json.update({'_rev':rev})
        return self.document.put(params = doc_json)


def new_id():
    """() -> str
    Return a UUID formated as string without dashes.

    :returns: uuid formated as string without dashes
    """
    return str(uuid4()).replace("-","")

def string64(buff):
    """(Buffer) -> str
    Return a base64 encoded string correctly formated for JSON.

    :param buff: image as buffer
    :returns: base64 as string
    """
    if(type(buff) == bytes):
        return str(b64encode(buff))[2:-1]
    else: 
        return str(b64encode(buff.read()))[2:-1]

def take_picture(config, picamera, to_file = False, raspberry = True):
    """(PiCamera, Boolean) -> (Stream)
    Takes a picture with PiCamera, if to_file is True, saves it to a file and then opens 
    the file to a stream, otherwise keeps it on the memory as a stream object.
    Opens the stored file and loads its content into a second stream and returns both.

    To test the code without a Raspberry Pi device call take_picture(config, False, False, False)

    :param config : Configuration file for PiCamera settings
    :param picamera: PiCamera object from picamera module
    :param to_file: capture image to file or not option
    :param raspberry: test script without a raspberry pi device
    :returns: image as buffer
    """
    if not raspberry: 
        with open(config.get("Path", "image") + "sample.jpg","rb") as f:
            stream = f.read()
        return (stream)

    with picamera.PiCamera() as camera:
        camera.exposure_mode = "auto"
        camera.resolution = (1920, 1080)
        time.sleep(2)
        if to_file:
            file_name = config.get("Path", "image") + new_id() + ".jpg"
            camera.capture(file_name)
        else:
            stream = io.BytesIO()
            camera.capture(stream, "jpeg")

    print("Image captured!")

    if to_file:
        with open(file_name,"rb") as f:
            stream = f.read()
    else:
        stream.seek(0)

    return (stream)

def live_feed(config, picamera, HGCloudantDB, to_file = False, raspberry = True):
    """(PiCamera, Boolean, Database) -> (Boolean)
    Creates a livestream by uploading a stream of pictures into CloudantDB. Returns True
    if the stream was successful or False otherwise.
    """
    if not raspberry:
        print('Warning: Debug mode will overwrite stream data on Cloudant by default.')
        print('Change configs if you wish to keep your last stream data.')

        with open(config.get("Path", "image") + "sample.jpg","rb") as f:
            start_time = time.time()
            finish_time = time.time()
            
            stream = f.read()
            stream_json = create_fixID_json(stream, 'streamDoc')

            req = HGCloudantDB.updateDoc('streamDoc', stream_json)

        return False

    with picamera.PiCamera() as camera:
        camera.exposure_mode = config.get("LiveStream", "exposureMode")
        camera.resolution = (config.getint("LiveStream", "resWidth"), config.getint("LiveStream", "resHeight"))

        start_time = time.time()
        finish_time = time.time()
        data_stream = io.BytesIO()

        while(finish_time - start_time < 60):
            camera.capture(data_stream, 'jpeg')
            data_stream.seek(0)
            stream_json = create_fixID_json(data_stream, 'streamDoc')

            req = HGCloudantDB.updateDoc('streamDoc', stream_json)
            print('Stream status:' + req.status_code)

            time.sleep(0.2)
            finish_time = time.time()

    if(req.status_code == 200):
        return True
    else:
        return False

def create_fixID_json(stream_data, fix_id):
    """(Stream, String) -> (Dictionary)
    Creates a dictionary using stream data. The cloudant library
    interprets the dictionary as if it were a JSON.

    :param stream_data: Stream data to be written on JSON object
    :param fix_id: Predefined stream ID
    :returns: JSON as Dictionary
    """
    local_time = datetime.now()
    utc_time = datetime.utcfromtimestamp(local_time.timestamp())
    file_JSON = {
        "_id": fix_id
        "local_timestamp": str(local_time),
        "utc_timestamp": str(utc_time),
        "_attachments": {
            "file.jpg": {
                "content_type": "image/jpeg",
                "data": string64(stream_data)
            }
        }
    }
    return file_JSON

def create_json(stream_data):
    """(Stream) -> (String, Dictionary)
    Creates a dictionary using stream data. The cloudant library
    interprets the dictionary as if it were a JSON.

    :param stream_data: Stream data to be written on JSON object
    :returns: id as string, JSON as Dictionary
    """
    local_time = datetime.now()
    utc_time = datetime.utcfromtimestamp(local_time.timestamp())
    file_JSON = {
        "local_timestamp": str(local_time),
        "utc_timestamp": str(utc_time),
        "_attachments": {
            "file.jpg": {
                "content_type": "image/jpeg",
                "data": string64(stream_data)
            }
        }
    }
    return new_id(), file_JSON

if __name__ == "__main__":

    # Reads the config file and checks for debug flag
    config = configparser.ConfigParser()
    if(sys.argv.count('-debug') == 0):
        import picamera
        config.read("config.ini")
    else:
        config.read("config_debug.ini")

    # Initilializes port and host settings using config data
    fac_host = config.get("Raspberry", "host")
    fac_port = config.getint("Raspberry", "port")
    ws_host = config.get("Websocket", "host") + ":" + str(fac_port)

    # Instantiates webserver factory and attributes it our protocol
    factory = WebSocketServerFactory(ws_host, debug = False)
    factory.protocol = HGServerProtocol

    # Generates a loop, create a server and sets it to run until complete
    loop = asyncio.get_event_loop()
    coro = loop.create_server(factory, fac_host, fac_port)
    server = loop.run_until_complete(coro)

    # Runs the server until an exception is caught
    try:
        print("Server running on {0}.".format(ws_host))
        loop.run_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.close()
        loop.close()
