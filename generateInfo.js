const fs = require('fs');
const ExcelJS = require('exceljs');
const axios = require('axios');
require('dotenv').config();

async function fetchDataFromAPI(symbol, exchange) {
  try {
    const response = await axios.get(
      `https://api.twelvedata.com/logo?apikey=${process.env.TWELVEDATA_API_KEY}`,
      {
        params: {
          symbol,
          exchange,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error to fetch API:', error);
    return [];
  }
}

async function createExcelFile() {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Data');

    const assetData = await fs.promises.readFile('asx-stocks.json', 'utf8');
    const dataParse = JSON.parse(assetData);
    worksheet.columns = [
      { header: 'name', key: 'name' },
      { header: 'symbol', key: 'symbol' },
      { header: 'exchange', key: 'exchange' },
      { header: 'logo', key: 'logo' },
    ];
    for (let item of dataParse.data) {
      const response = await fetchDataFromAPI(item.symbol, item.exchange);
      console.log(response);
      worksheet.addRow({
        name: item.name,
        symbol: item.symbol,
        exchange: item.exchange,
        logo: response.url,
      });
    }

    const excelFilePath = 'asset-logo.xlsx';
    await workbook.xlsx.writeFile(excelFilePath);
    console.log(`File Excel created: ${excelFilePath}`);
  } catch (error) {
    console.log('ERROR', error);
  }
}

createExcelFile();
