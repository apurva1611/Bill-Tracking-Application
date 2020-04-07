Prerequisites for building Application locally:
1. Install Node.js in your application.
2. Install MySQl in your application.
3. Create databases db1 and in db folder mention your host and user.
4. Create two tabless users and bill.
5. Schema of Table bill is as given below:
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

7. Schema of table file is:
CREATE TABLE file (
    file_name varchar(255) NOT NULL,
    id varchar(255) NOT NULL UNIQUE,
    url varchar(255) NOT NULL,
    upload_date varchar(255) NOT NULL
);

8.Schema of table metaFile is:
CREATE TABLE metaFile (
    field_name varchar(255) NOT NULL,
    original_name varchar(255) NOT NULL,
    encoding varchar(255) NOT NULL,
    mimetype varchar(255) NOT NULL,
    destination varchar(255) NOT NULL,
    file_name varchar(255) NOT NULL,
    path varchar(255) NOT NULL,
	size varchar(255) NOT NULL,
    id varchar(255) NOT NULL,
    FOREIGN KEY (id) REFERENCES file(id)
);

9. Schema of table bill is changed and a cloumn attachment of type json was added:
ALTER table bill
ADD column attachement json

10. Install dependencies mentioned in package.json. These should be installed by going in webapp folder.Those include:
{   "basic-auth": "^2.0.1",
    "bcrypt": "^3.0.7",
    "body-parser": "^1.19.0",
    "chai": "^4.2.0",
    "chai-http": "^4.3.0",
    "cors": "^2.8.5",
    "email-validator": "^2.0.4",
    "express": "^4.17.1",
    "mocha": "^7.0.1",
    "multer": "^1.4.2",
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
3. Run npm run test command to run test cases..
4. Demo purpose.
 aws cloudformation --profile prod create-stack   --stack-name stack   --parameters file://vars.json  --template-body file://autoScaling.json --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM
