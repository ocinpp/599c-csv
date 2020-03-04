# 599C CSV Generator

Convert the 599C PDF file to a csv file.

## Setup

Prepare a `.env` file as below

```properties
PDF_FILE_PATH=<Path to PDF>
```

## Usage

As the result is now printed using `console.log`, you may need to redirect the output to a file

```bash
node index.js > result.csv
```

## Sample Output

```csv
"id","districtTC","districtEN","address","date"
"1","中西區","Central & Western","ABC XYZ","27/02/2020"
"2","中西區","Central & Western","Addr1 Addr2","27/02/2020"

```
