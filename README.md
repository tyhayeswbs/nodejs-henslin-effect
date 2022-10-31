usage
=====

initial setup for WSL open port: netsh interface portproxy add v4tov4 listenport=1234 listenaddress=0.0.0.0 connectport=1234 connectaddress=$($(wsl hostname -I).Trim())
netsh interface portproxy delete v4tov4 listenport=1234 listenaddress=0.0.0.0

to build:  run `npm run-script build`

to run: run `npm run-script serve`

To access, connect a mobile to the same network
and access via the IP of the windows host followed by the port number
e.g. https://192.168.1.117:1234

Due to restrictions on device sensors, the page MUST be accessed
over https. 
