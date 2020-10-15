# Trend Micro Aws S3-KMS library
![](https://img.shields.io/node/v/mocha)
![code size](https://img.shields.io/github/languages/code-size/zhongchengli/trendmicro-aws-s3kms-sdk)
![aws-sdk](https://img.shields.io/npm/l/aws-sdk)
![mocha](https://img.shields.io/npm/l/mocha)
![dotenv](https://img.shields.io/npm/l/dotenv)


## Description

In this round of Trend Micro’s hiring process. Trend Micro would like to assess candidates' technical skills with an exercise that should take a few hours. Trend Micro wants to be respectful to your time and an exercise can save multiple interviews.

# Problem to solve

## Backend Project:
AWS S3 + KMS

## Requirements:

1. [X] Create a Node.js library to download all objects in a given S3 bucket and save them locally, maintaining directory structure.
2. [X] Control concurrency to keep at most four parallel downloads in progress.
*Hint: You can use Bluebird promise library.*
>Note: I'm not using Bluebird to promisify the functions. Bluebird is a promise implementation of JavaScript, especially for call-back function in old JavaScript.
Now a days, modern JS (ES6 and later versions) has improved a lot of syntax and features. Every new release of ES intruduces new powerful features of Promise, Async and so on. I dont think it's a good practise to use the third party lib on top of new JavaScript. It makes project hard to debug and handover to those junior developers, unless we have to use promise features in old IE browser.
3. [X] Create a file containing the list of downloaded files then encrypt this file using KMS with a user-defined CMK and save it locally.
4. [X] Write unit tests for your code by mocking AWS S3 API.
*Hint: You can use the aws-sdk-mock npm module*
>Note: At my company, we are using Mocha to unit test AWS API and it works as we expected. I read tech doc of *aws-sdk-mock* which is quite similar to what Mocha does.
I did not deep dive *aws-sdk-mock* in this interview stage but I will be exploring further if this aws module is powerful over Mocha.
5. [X] Produce a code coverage report for your test suite.
6. [X] Write an integration test to demonstrate full functionality of code.

## Installation
Use the package manager [npm](https://www.npmjs.com/) to install the dependencies in the project.

```bash
npm install
```
> Note: The Mocha library have to stick on version 6.x.x otherwise you will be hitting 'No test files found' error. I have no time to figure it out against the latest version of Mocha.

## Configuration
Some of the functions in this project need to talk to AWS S3 and KMS APIs. You are supposed to set up a local configuration of AWS credentials for the services in this application.

1. Create a *.env* file at the root directory of the application and add the variables to it.
2. Variables
```
ACCESS_KEY_ID=
SECRET_ACCESS_KEY=
BUCKET=
KEY_ID=
REGION=
MAX_KEYS=2
```
>Note: No space and No punctuation

## Running the tests
Use npm scripts set in the package.json file to execute unit and function tests.
```bash
npm run coverage
```

## Code Coverage
As a result of execute unit/function tests as above, there will be two folders (*.nyc_output* and *coverage*) automatically created at the root of the application.
Go to *coverage* folder and open *index.html* file with browser, you can view the report of code coverage.

## Project structure
There are 2 AWS service classes along with a base file service class in the service folder.
The 2 AWS service classes implement AWS S3 and KMS APIs to download objects in a bucket that you set up in *.env* file and encrypt the raw data of the list of downloaded objects.
BaseFileService class is used to handle async file read/write

The TrendMicroFileAction solves the problem based on the project requirments.

## Verify the expected results
Once you get code coverage reports done, there is another *.dist* folder generated at the root of the application.
* Encrypt/Decrypt<br/>
Please go to *dist/test/src/actions/function-tests/tmp* folder to find a file named *_ObjectList.txt* prefixed with timestamp. This is expected file against the 3rd requirement.
* Control concurrency to keep at most four parallel downloads in progress<br/>
Under same path in the *.dist* folder as above, you will find 4 text files named like *-batchEncryptionTest* which are functional test results of batch encryptions for multi buckets.

# Author
* Jason Li - [LinkedIn](https://www.linkedin.com/in/jason-li-5a943a135/)<br>
*Java & Full stack JavaScript Developer*
<br>
<br>
Thanks for your time to review my code. I expect you are able to understand the design of the project and functions that I have implemented in this application.
There is only one line of the code that has not been covered in unit test. You can find it in coverage report. I would like to discuss further about the solution if it's possible. <br>
<br>
As an candidate doing this code challenge, I have been enjoying hands-on coding, issue investigation, knowledge deep diving and problem solving in this project.
<br>
<br>
I expect this project has exposed my tech stack and skill set to your development and recruitment teams in terms of my job application at Trend Micro.



