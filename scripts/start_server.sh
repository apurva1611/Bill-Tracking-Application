#!/bin/bash
# sudo chmod 755 /var/www/server.js # optional
# this will restart app/server on instance reboot
# actually start the server
sudo pm2 stop /home/ubuntu/webapp_node/server.js
sudo pm2 start /home/ubuntu/webapp_node/server.js
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -c file:/home/ubuntu/webapp_node/cloudwatch-config.json -s
