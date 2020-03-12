#!/bin/bash
# sudo chmod 755 /var/www/server.js # optional
# this will restart app/server on instance reboot
# actually start the server
ls -al
forever stopall
forever start /home/ubuntu/webapp_node/server.js