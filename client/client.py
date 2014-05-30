import socket

client_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
client_socket.connect(('localhost', 4040))

print "connection estabilished..."
print "attempting to send file..."

fp = open('profile2.jpg','rb')
print "file loaded"
to_send = fp.read()	
print "your data is: " + to_send
print
print "sending..."
client_socket.sendall(to_send)
fp.close()
client_socket.close()
