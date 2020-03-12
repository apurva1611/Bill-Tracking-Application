const de = require('dotenv').config();
const app = require('./app');
const db=require('./db/db');
app.listen(3000, () => {
  console.log(`App running on port 3000...`);
});
db.query('CREATE DATABASE IF NOT EXISTS '+process.env.DB_NAME, function (err) {// create db if not exist
  if (err) throw err;
  db.query('USE '+process.env.DB_NAME, function (err) {
    if (err) throw err;
    db.query('create table IF NOT EXISTS users('
      + 'id varchar(255) NOT NULL,'
      + 'firstName varchar(255) NOT NULL,'
      + 'lastName varchar(255) NOT NULL,'
      + 'email varchar(255) NOT NULL UNIQUE,'
      + 'password varchar(255) NOT NULL,'
      + 'accountCreated varchar(255) NOT NULL,'
      + 'accountUpdated varchar(255) NOT NULL,'
      + 'PRIMARY KEY (id)'
      +  ')', function (err) {
          if (err) throw err;
    });
    db.query('create table IF NOT EXISTS bill('
      + 'id varchar(255) NOT NULL,'
      + 'id_auto int AUTO_INCREMENT,'
      + 'created_ts varchar(255) NOT NULL,'
      + 'updated_ts varchar(255) NOT NULL,'
      + 'owner_id varchar(255) NOT NULL,'
      + 'vendor varchar(255) NOT NULL,'
      + 'bill_date varchar(255) NOT NULL,'
      + 'due_date varchar(255) NOT NULL,'
      + 'amount_due varchar(255) NOT NULL,'
      + 'categories varchar(255) NOT NULL,'
      + 'payment_status ENUM("paid", "due", "past_due", "no_payment_required") NOT NULL,'
      + 'attachment json,'
      + 'PRIMARY KEY(id_auto),'
      + 'FOREIGN KEY (owner_id) REFERENCES users(id)'
      +  ')', function (err) {
          if (err) throw err;
    });
    db.query('create table IF NOT EXISTS file('
      + 'file_name varchar(255) NOT NULL,'
      + 'id varchar(255) NOT NULL UNIQUE,'
      + 'url varchar(255) NOT NULL,'
      + 'upload_date varchar(255) NOT NULL'
      +  ')', function (err) {
          if (err) throw err;
    });
    db.query('create table IF NOT EXISTS metaFile('
      + 'field_name varchar(255) NOT NULL,'
      + 'original_name varchar(255) NOT NULL,'
      + 'encoding varchar(255) NOT NULL,'
      + 'mimetype varchar(255) NOT NULL,'
      + 'destination varchar(255) NOT NULL,'
      + 'file_name varchar(255) NOT NULL,'
      + 'path varchar(255) NOT NULL,'
      + 'size varchar(255) NOT NULL,'
      + 'id varchar(255) NOT NULL,'
      + 'FOREIGN KEY (id) REFERENCES file(id)'
      +  ')', function (err) {
          if (err) throw err;
    });
  });
});
