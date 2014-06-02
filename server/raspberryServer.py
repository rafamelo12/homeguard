import socket
import base64
# import picamera
# import time

#def take_picture():
# 	camera = picamera.PiCamera()
# 	now = time.gmtime()
# 	strNow = str(now[0])+"-"+str(now[1])+"-"+str(now[2])+"-"+str(now[3])+"-"+str(now[4])+"-"+str(now[5])
# 	fileName = strNow+".jpeg"
# 	camera.capture(fileName)
# 	return fileName

server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
server.bind((socket.gethostname(), 5000))
server.listen(5)

while(1):
	(clientsocket, address) = server.accept()
	# print('Accepted new connection')
	# file_name = take_picture(clientsocket, address)
	file_name = 'test.jpg'
	picture = open(file_name,'rb')
	with picture as image_file:
	    to_send = base64.b64encode(image_file.read())
	# to_send = picture.read()
	clientsocket.sendall(to_send)
	clientsocket.close()
