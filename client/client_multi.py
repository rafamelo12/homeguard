import socket
from os import listdir
CONN_HOST = '138.51.223.241'
#CONN_HOST = 'localhost'
CONN_PORT = 5050
FILE_EXT  = '.jpg'
LIST_DIR  = './'

files = []
for file in listdir(LIST_DIR):
    if file.endswith(FILE_EXT):
        files.append(file)

for x in range(len(files)):
	client_socket = socket.socket()
	client_socket.connect((CONN_HOST, CONN_PORT))
	current_file = open(files[x],'rb')
	print("File '" + files[x] + "' loaded!")
	to_send = current_file.read()
	print("Sending file",str(x + 1) + "...")
	client_socket.send(to_send)
	print("File Sent!")
	current_file.close()
	client_socket.close()
