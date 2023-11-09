# Aws S3-KMS library

![](https://img.shields.io/node/v/mocha)
![code size](https://img.shields.io/github/languages/code-size/zhongchengli/trendmicro-aws-s3kms-sdk)
![aws-sdk](https://img.shields.io/npm/l/aws-sdk)
![mocha](https://img.shields.io/npm/l/mocha)
![dotenv](https://img.shields.io/npm/l/dotenv)

## Description

This is a fully implemented service that uploading/downloading file to AWS S3 with KMS

# Problem to solve

## Backend Project:

AWS S3 + KMS

## Requirements:

1. [x] Create a Node.js library to download all objects in a given S3 bucket and save them locally, maintaining directory structure.
2. [x] Control concurrency to keep at most four parallel downloads in progress.
3. [x] Create a file containing the list of downloaded files then encrypt this file using KMS with a user-defined CMK and save it locally.
4. [x] Write unit tests for your code by mocking AWS S3 API.
5. [x] Produce a code coverage report for your test suite.
6. [x] Write an integration test to demonstrate full functionality of code.

## Installation

Use the package manager [npm](https://www.npmjs.com/) to install the dependencies in the project.

```bash
npm install
```

> Note: The Mocha library have to stick on version 6.x.x otherwise you will be hitting 'No test files found' error.

## Configuration

Some of the functions in this project need to talk to AWS S3 and KMS APIs. You are supposed to set up a local configuration of AWS credentials for the services in this application.

1. Create a _.env_ file at the root directory of the application and add the variables to it.
2. Variables

```
ACCESS_KEY_ID=
SECRET_ACCESS_KEY=
BUCKET=
KEY_ID=
REGION=
MAX_KEYS=2
```

> Note: No space and No punctuation

## Running the tests

Use npm scripts set in the package.json file to execute unit and function tests.

```bash
npm run coverage
```

## Code Coverage

As a result of execute unit/function tests as above, there will be two folders (_.nyc_output_ and _coverage_) automatically created at the root of the application.
Go to _coverage_ folder and open _index.html_ file with browser, you can view the report of code coverage.

## Project structure

There are 2 AWS service classes along with a base file service class in the service folder.
The 2 AWS service classes implement AWS S3 and KMS APIs to download objects in a bucket that you set up in _.env_ file and encrypt the raw data of the list of downloaded objects.
BaseFileService class is used to handle async file read/write

The TrendMicroFileAction solves the problem based on the project requirments.

## Verify the expected results

Once you get code coverage reports done, there is another _.dist_ folder generated at the root of the application.

- Encrypt/Decrypt<br/>
  Please go to _dist/test/src/actions/function-tests/tmp_ folder to find a file named _\_ObjectList.txt_ prefixed with timestamp. This is expected file against the 3rd requirement.
- Control concurrency to keep at most four parallel downloads in progress<br/>
  Under same path in the _.dist_ folder as above, you will find 4 text files named like _-batchEncryptionTest_ which are functional test results of batch encryptions for multi buckets.

# Author

- Jason Li - [LinkedIn](https://www.linkedin.com/in/jason-li-5a943a135/)<br>
  Senior Front-end Engineer<br>
  _Node.js | JavaScript | TypeScript | React | Apollo Graphql| Next.js_
