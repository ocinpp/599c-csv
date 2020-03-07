# 599C CSV Generator

[![Known Vulnerabilities](https://snyk.io/test/github/ocinpp/599c-csv/badge.svg?targetFile=package.json)](https://snyk.io/test/github/ocinpp/599c-csv?targetFile=package.json)

Convert the 599C PDF file [at https://www.chp.gov.hk/files/pdf/599c_tc.pdf](https://www.chp.gov.hk/files/pdf/599c_tc.pdf) to a csv file.

## Setup

Clone the repository and install the dependencies.

```bash
npm install
```

Prepare a `.env` file as below.

```properties
PDF_FILE_PATH=<Path to PDF>
```

## Usage

As the result is now printed using `console.log`, you may need to redirect the output to a file.

```bash
node index.js > result.csv
```

If the output is not parsed correctly, you may switch to another parsing method by switching the below property in `.env`

```properties
PARSE_METHOD=<1 or 2>
```

## Sample Output

```csv
"id","districtTC","districtEN","address","date"
"1","中西區","Central & Western","ABC XYZ","27/02/2020"
"2","中西區","Central & Western","Addr1 Addr2","27/02/2020"

```
