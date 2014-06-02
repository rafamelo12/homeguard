import socket
#import picamera
#import time

#def takePicture():
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
	#print('Accepted new connection')
	#fileName = take_picture(clientsocket, address)
	picture = open(fileName)
	fp = picture.read()
	clientsocket.sendall(fp)
	clientsocket.close()