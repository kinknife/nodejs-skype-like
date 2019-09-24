const path = require("path");
const fs = require("fs-extra");

function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
}


async function ensurePath(dir) {
  try {
    await fs.stat(dir);
  } catch (err) {
    await ensurePath(path.dirname(dir));
    await fs.mkdir(dir);
    console.log(dir, 'dir');
  }
}

module.exports = {getKeyByValue, ensurePath}