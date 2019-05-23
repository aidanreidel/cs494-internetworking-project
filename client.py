import socket
host = "localhost"
port = 2000
s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.connect((host,port))
s.send("Hello world")
print s.recv(20)
s.close
