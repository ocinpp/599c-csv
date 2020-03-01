const fs = require("fs");
const pdf = require("pdf-parse");
const { parse } = require("json2csv");

// list of strings we don't concern
const REMOVE_STRING = [
  "區",
  "District",
  "地址",
  "Address",
  "檢疫最後日期 (日/月/年)",
  "End date of quarantine order",
  "(DD/MM/YYYY)",
  "備註：",
  "基於隱私考慮，顯示的地址並不代表完整地址。",
  "資料正繼續更新中。",
  "Remarks:",
  "For privacy consideration, the addresses shown do not represent the full addresses.",
  "We are in the process of updating the information."
];

// List of 18 districts in HK for verification
const HK_DISTRICTS = [
  "Central & Western",
  "Wan Chai",
  "Eastern",
  "Southern",
  "Sham Shui Po",
  "Kowloon City",
  "Wong Tai Sin",
  "Kwun Tong",
  "Yau Tsim Mong",
  "Kwai Tsing",
  "Tsuen Wan",
  "Tuen Mun",
  "Yuen Long",
  "North",
  "Tai Po",
  "Shatin",
  "Sai Kung",
  "Islands"
];

const LAST_UPDATE_TC = "最後更新日期為";
const LAST_UPDATE_EN = "Last updated on";
const PAGE_STRING_REGEX = /^第 [0-9]* 頁，共 [0-9]* 頁$/;
const DATE_REGEX = /^[0-9]{2}\/[0-9]{2}\/[0-9]{4}$/;

let dataBuffer = fs.readFileSync("./pdf/599c_tc.pdf");

function render_page(pageData) {
  //check documents https://mozilla.github.io/pdf.js/
  let render_options = {
    //replaces all occurrences of whitespace with standard spaces (0x20). The default value is `false`.
    normalizeWhitespace: false,
    //do not attempt to combine same line TextItem's. The default value is `false`.
    disableCombineTextItems: false
  };

  return pageData.getTextContent(render_options).then(function(textContent) {
    let text = "";
    let row = [];
    try {
      for (item of textContent.items) {
        const content = filterContent(item.str);
        if (content != null) {
          row.push(content);

          // when the content is "date", it should be the last of a "row"
          if (content.match(DATE_REGEX)) {
            const obj = parseRow(row);
            text += JSON.stringify(obj) + ",\n";
            row = [];
          }
        }
      }
    } catch (e) {
      console.log(e);
    }
    return text;
  });
}

let options = {
  pagerender: render_page
};

function parseRow(arr) {
  let needCombine = false;
  //   console.log(arr);

  // split by space (multiple)
  const ele1 = arr[0].trim().split(/ +/);

  // first element is ID
  const id = ele1[0];

  // second element is district (TC)
  const districtTC = ele1[1];

  // if need combine with next line, the length is cut short
  if (arr[0].length <= getLength(id, districtTC)) {
    needCombine = true;
  }

  const districtENStart = arr[0].indexOf(districtTC) + districtTC.length;
  let districtEN = "";

  if (needCombine) {
    districtEN = arr[0].substring(districtENStart + 1, arr[0].length);
    districtEN = districtEN + " " + arr[1];
  } else {
    districtEN = arr[0].substring(districtENStart, getLength(id, districtTC));
    districtEN = fixDistrict(districtEN);
  }

  // combine all except last part
  const newArray = arr.slice();

  // remove "date"
  newArray.pop();
  const s = newArray.join(" ");
  const addressStart = s.indexOf(districtEN) + districtEN.length;
  const addr = s.substring(addressStart);

  // last element is date
  const date = arr[arr.length - 1];

  const obj = {
    id: id,
    districtTC: districtTC,
    districtEN: districtEN.trim(),
    address: addr.trim(),
    date: date
  };

  return obj;
}

function getLength(id, districtTC) {
  const idString = id + " " + districtTC;
  return Math.max(idString.length + 11, 16);
}

function fixDistrict(districtStr) {
  for (district of HK_DISTRICTS) {
    if (districtStr.indexOf(district) != -1) {
      return district;
    }
  }
  return districtStr;
}

function filterContent(content) {
  const str = content.trim();

  if (str == "") {
    return null;
  }

  // check it the content should be kept
  if (REMOVE_STRING.includes(str) == false) {
    if (
      str.indexOf(LAST_UPDATE_TC) == -1 &&
      str.indexOf(LAST_UPDATE_EN) == -1
    ) {
      if (str.match(PAGE_STRING_REGEX) == null) return str;
    }
  }
  return null;
}

/**
 * Parse content to JSON,
 * sample date line:
 * @param {*} content
 */
function content2Json(content) {}

pdf(dataBuffer, options).then(function(data) {
  // number of pages
  //   console.log(data.numpages);
  // number of rendered pages
  //   console.log(data.numrender);
  // PDF info
  //   console.log(data.info);
  // PDF metadata
  //   console.log(data.metadata);
  // PDF.js version
  // check https://mozilla.github.io/pdf.js/getting_started/
  //   console.log(data.version);
  // PDF text
  const text = data.text;
  const cleanText = text.trim().replace(/\n\n/g, "");
  const json2 = "[" + cleanText.substring(0, cleanText.length - 1) + "]";
  const csv = parse(JSON.parse(json2));
  console.log(csv);
});
