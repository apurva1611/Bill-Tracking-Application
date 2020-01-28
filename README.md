Prerequisites for building Application:
1. Install Node.js in your application.
2. Install MySQl in your application.
3. Create database db1 and in db folder mention your host and user.
4. Create two tables users and bill.
5. Schema of Table bill is:
CREATE TABLE bill (
    id varchar(255) NOT NULL,
    created_ts varchar(255) NOT NULL,
    updated_ts varchar(255) NOT NULL,
    owner_id varchar(255) NOT NULL,
    vendor varchar(255) NOT NULL,
    bill_date varchar(255) NOT NULL,
    due_date varchar(255) NOT NULL,
    amount_due varchar(255) NOT NULL,
    categories varchar(255) NOT NULL,
    payment_status ENUM('paid', 'due', 'past_due', 'no_payment_required') NOT NULL,
    FOREIGN KEY (owner_id) REFERENCES users(id)
);
6. Schema of table user is:
CREATE TABLE bill (
    id varchar(255) NOT NULL,
    firstName varchar(255) NOT NULL,
    lastName varchar(255) NOT NULL,
    email varchar(255) NOT NULL UNIQUE,
    password varchar(255) NOT NULL,
    accountCreated varchar(255) NOT NULL,
    accountUpdated varchar(255) NOT NULL,
);
7. Install dependencies mentioned in package.json. These should be installed by going in webapp folder.Those include:
{   "basic-auth": "^2.0.1",
    "bcrypt": "^3.0.7",
    "body-parser": "^1.19.0",
    "chai": "^4.2.0",
    "chai-http": "^4.3.0",
    "email-validator": "^2.0.4",
    "express": "^4.17.1",
    "mocha": "^7.0.1",
    "mysql": "^2.17.1",
    "password-validator": "^5.0.3",
    "uuidv4": "^6.0.2"
}

Steps for building Application:
1. Do git clone of the repository.
2. go to webapp folder.
3. Do npm install or npm run build: This will install all dependecies required for your application.
4. Run node server.js and application will run.

Steps to run unit test:
1. go to webapp folder.
2. Just check in package.json in script object there is a property "test:mocha".
3. Run npm run test command to run test cases.
