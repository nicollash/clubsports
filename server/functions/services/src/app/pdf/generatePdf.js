import request from 'sync-request';
import chromium from 'chrome-aws-lambda';
import puppeteer from 'puppeteer-core';
//import puppeteer from 'puppeteer';

const generateAndReturnBody = async (html) => {
  return new Promise(async (resolve, reject) => {
    try {
      const browser = await puppeteer.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath,
        headless: true,
        ignoreHTTPSErrors: true,
      });
      const page = await browser.newPage();
      await page.setContent(html);
      const buffer = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: {
          left: "20px",
          top: "20px",
          right: "20px",
          bottom: "20px"
        },
        scale: 0.66,
        headless: true
      });
      await browser.close();
      resolve({
        headers: {
          'Content-type': 'application/pdf',
          'content-disposition': `attachment; filename=Waiver-${new Date().getTime()}.pdf`
        },
        statusCode: 200,
        success: true,
        body: buffer.toString('base64'),
        isBase64Encoded: true
      });
    } catch (e) {
      reject(e)
    }
  });
}

export const generatePdf = async ({ html, styles }) => {
  const extraStyle = "<style>@import url('https://fonts.googleapis.com/css?family=Open+Sans&display=swap');body{font-family: 'Open Sans', sans-serif;color:black;}ul, ul li {list-style: none;}</style>";
  let content = extraStyle + html;
  if (styles) {
    const req = request('GET', styles);
    if (!req.isError() && req.statusCode === 200) {
      const body = req.getBody('utf8');
      content = `<style>${body}</style>${content}`;
    } else {
      throw new Error('Styles is not loaded');
    }
  }
  return generateAndReturnBody(content);
};
