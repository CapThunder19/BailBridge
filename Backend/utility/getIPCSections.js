const fs = require('fs');
const path = require('path');
const csv = require('csvtojson');

async function getIPCSections() {
  const csvFilePath = path.join(__dirname, '../ipc_sections.csv');
  const jsonArray = await csv().fromFile(csvFilePath);
  return jsonArray;
}

module.exports = { getIPCSections };