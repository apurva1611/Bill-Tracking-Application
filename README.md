## Problem Statement 
Designed a bill Tracking Application where users can keep track of their all kinds of bills like their grocery bills,their rent payment details ,their wifi bills, their food expenses.

## Technologies USed:
1. Node.js
2. Express
3. MySQL
4. React
5. AWS
6. CircleCI

## Devops Practices Used:
1. Continous Integration
2. Continous Deployment
3. Microservices
4. Infrastructure as Code
5. Monitoring and Logging

## Prerequisites for building Application locally:
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
Code
10. Install dependencies mentioned in package.json. These should be installed by going in webapp folder.Those include:
{   "aws-sdk": "^2.627.0",
    "basic-auth": "^2.0.1",
    "bcrypt": "^3.0.7",
    "body-parser": "^1.19.0",
    "chai": "^4.2.0",
    "chai-http": "^4.3.0",
    "cors": "^2.8.5",
    "dotenv": "^8.2.0",
    "email-validator": "^2.0.4",
    "express": "^4.17.1",
    "mocha": "^7.0.1",
    "multer": "^1.4.2",
    "multer-s3": "^2.9.0",
    "mysql": "^2.17.1",
    "node-statsd": "^0.1.1",
    "password-validator": "^5.0.3",
    "sqs-consumer": "^5.4.0",
    "uuidv4": "^6.0.2",
    "winston": "^3.2.1"
}

## Steps for building Application:
1. Do git clone of the repository.
2. go to webapp_node folder.
3. Do npm install or npm run build: This will install all dependecies required for your application.
4. Run node server.js and application will run.

## Steps to run unit test:
1. go to webapp_node folder.
2. Just check in package.json in script object there is a property "test:mocha".
3. Run npm run test command to run test cases.
4. Demo purpose.

## Setps to create Build:
1. Build ami.Run ami repository and circleCi will generate ami in dev and prod account.AMI will be generated in dev account and will be shared in prod account. This happens because in CicrcleCI we have environment variables of dev account.
2. Run cloudformation stack then of infrastructure repository: 
Command is: aws cloudformation --profile prod create-stack   --stack-name stack   --parameters file://vars.json  --template-body file://autoScaling.json --capabilities CAPABILITY_IAM
3. After that build this webapp folder. 
  Continous Integration is done using CircleCI. 
In circleCI enter environment variable of prod account: enter secret_key(AWS_SECRET_ACCESS_KEY), access_key(AWS_ACCESS_KEY_ID), region(AWS_REGION) and s3 bucket name(BUCKET_NAME).Tis bucket is created manually using AWS concole. This bucket creation is not present in cloudformation.
Creating a pull request will only run test cases in CircleCI
merging a pull request will deploy the app.
## Folders Structure:
1. webapp_node folder contains all code of APIS
2. Scripts folder contains all scripts needed to execute codeDeploy.
3. appspec.yml species how CodeDeploy will deploy app.
4. jmeter folder has jmeter test to run post api of bill 500 times.
5. .cicrlceci folder has the yml file that circleCi will execute.

## Feature Scope
1. Content Delivery Network: CDN georaphically distributed web servers for high availability of content.It can be your images,videos, assets of application and javascript files etc. AWS cloudfront service allows implementing CDN. It has different edge locations which are geographically distributed web servers and all users close to that edge location gets content from that edge location. It increases performance and helps in delievering the content faster. 
2. Implementing Email correct functionality of Gmail users.
3. DB cache: 
