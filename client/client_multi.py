import socket
from os import listdir
CONN_HOST = 'localhost'
CONN_PORT = 4040

# print("Connection established!")

# print("Attempting to send files...")
images = []
for file in listdir('./'):
    if file.endswith(".jpg"):
        images.append(file)

count = 1

for each in images:
	client_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
	client_socket.connect((CONN_HOST, CONN_PORT))
	fp = open(each,'rb')
	print("File",each,"loaded!")
	to_send = fp.read()
	# print("Your data is:", to_send)
	print("Sending file" + str(count) + "...")
	count = count + 1
	client_socket.send(to_send)
	print("File Sent!")
	fp.close()
	client_socket.close()
# print("All files sent!")
#client_socket.close()
