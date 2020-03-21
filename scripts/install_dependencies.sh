#!/bin/bash
# install pm2 to restart node app
npm i -g pm2@2.4.3
ls -al
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
    -a fetch-config \
    -m ec2 \
    -c file: /cloudwatch-config.json \
    -s
cd /home/ubuntu/webapp_node
npm install
rm -rf node_modules/bcrypt
npm install