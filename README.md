socket.io-magellan8500
===================

EN 
This software piece was created to connect the Datalogic(r) **Magellan** 8300, 8400 and 8500 series scale/barcode reader with any piece of software that uses **socket.io**. 
Despite there's enough documentation out there to build it by yourself, there are some missing and not so obvious tips to know that otherwise  would lead you to waste days figuring out. 

ES
Este código fue creado para conectar las pesadoras Datalogic(r) **Magellan** series 8300, 8400 y 8500 con cualquier programa que use **socket.io**. 
Aunque hay suficiente documentación por ahí para que hagas esto por tí mismo, hay algunos datos faltantes y no tan obvios que de no saber podrían hacerte perder días averiguando. 

----------

How does it work? 
-------------
It deploys an HTTP service on port 3001, that also listens at socket.io event 'peso' (spanish for ´weight´). Then, if the scales is not idle and has a valid weight, socket emits a 'pesoR' event (weight response), containing something like:
> {peso: 0.01}

where 'peso' contains the measured weight. In this case, my scale is factory-set at Kilograms, but of course you can suit that to your needs. 

#### <i class="icon-cog"></i> Installing (tested on Linux only)

1. Make sure you have **g++** installed. Also, if you use a Debian-based distro, you might need **build-essentials**. And, of course, install/update **npm**.
> sudo apt-get install g++ build-essentials

2. Despite *package.json* should contain all the dependencies, instead of *npm install*, I reccomend compiling all modules needed. You will also install Python, but if you haven't it already, you can just npm it: 
> sudo npm install --save --build-from-source python serialport http

3. Punch it. Since it access a device, you might want to run it as root. 
> sudo node main.js

4. Now you have a running socket.io listening at http://::1:3001. 


#### Configuring your scale
If you don't feel like tampering with the code, you should just configure your scale with the following configuration: 
- 9600 8-N-1
- no prefix
- enabling EAN8/EAN13 first digit transmit
- enabling EAN8/EAN13 check digit transmit
And don't forget to set up the port name correctly. Currently is /dev/ttyUSB0 because the workstations I had to develop this for needed an RS232-to-USB adapter, and Ubuntu attaches the device automatically to that device name. 


#### Spicing things up
You also might want to run the software at startup. You could do something like 
> sudo npm i -g forever

and then
> sudo crontab -e

and then add at the bottom of your crontab
> @reboot forever start /path/to/your/socket.io-magellan8500/main.js

This way you will have a daemon-like interface with your scale available at device start-up. 
