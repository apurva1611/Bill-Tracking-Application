const winston = require("winston");
const fs = require("fs");
const logDir = "./logs/";
const file = "webapp.log";
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}
const logger = winston.createLogger({
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: './logs/webapp.log',
      handleExceptions: true
    })
  ]
});
module.exports = logger;