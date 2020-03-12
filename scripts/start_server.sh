#!/bin/bash
# sudo chmod 755 /var/www/server.js # optional
# this will restart app/server on instance reboot
# actually start the server
sudo pm2 start /var/www/webapp_node/server.js