import socket
host = "localhost"
port = 7
s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.connect((host,port))
s.send(“some data to echo”)
print s.recv(20)
s.close
