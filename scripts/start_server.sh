#!/bin/bash
# sudo chmod 755 /var/www/server.js # optional
# this will restart app/server on instance reboot
# actually start the server
ls -al
sudo pm2 stop /home/ubuntu/webapp_node/server.js
sudo pm2 start /home/ubuntu/webapp_node/server.js