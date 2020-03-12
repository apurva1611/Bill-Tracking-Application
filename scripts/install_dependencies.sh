#!/bin/bash
# install pm2 to restart node app
npm i -g pm2@2.4.3
npm install
rm -rf node_modules/bcrypt
npm install