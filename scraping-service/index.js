const express = require('express');
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve, reject) => {
      let totalHeight = 0;
      const distance = 200; // Scroll 200px at a time
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        // Stop scrolling when we've reached the bottom
        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100); // Adjust speed if necessary
    });
  });
}

async function getPathDetailsForWebsite(WebsiteName) {
  let pathDetails = {};
  switch (WebsiteName) {
    case 'Zepto':
      pathDetails = {
        searchPath: 'search?query=',
        LoadPath: 'body > div > div > div > div.mx-auto.max-w-7xl.pb-16.lg\\:pb-0 > div > div:nth-child(2)',
        productContainerPath: 'body > div > div > div > div.mx-auto.max-w-7xl.pb-16.lg\\:pb-0 > div > div:nth-child(2) > div > a',
        productNamePath: 'div.\\!h-12.lg\\:\\!h-16 > div.mt-2 > h5',
        productQuantityPath: 'div.\\!h-12.lg\\:\\!h-16 > span > h4',
        productPricePath: 'div.relative.mt-12.px-1\\.5 > div > h4',
      };
      break;
    default:
      pathDetails = {};
  }
  return pathDetails;
}

// Function to scrape a given URL
async function scrapeGroceryWebsite(url, websiteName) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle2' });

  // Scroll the page to load all products
  await autoScroll(page);

  // Get the css selectors for the website
  const pathDetails = await getPathDetailsForWebsite(websiteName);
  
  // Wait for the container with all products to load
  // await page.waitForSelector(pathDetails.LoadPath);

  // Select all 'a' elements within the container
  const productContainers = await page.$$(pathDetails.productContainerPath);

  let products = [];

  for (const productContainer of productContainers) {
    // Extract product name
    const productName = await productContainer.$eval(pathDetails.productNamePath, el => el.textContent.trim());

    // Extract product quantiity
    const productQuantity = await productContainer.$eval(pathDetails.productQuantityPath, el => el.textContent.trim());

    // Extract product price
    const productPrice = await productContainer.$eval(pathDetails.productPricePath, el => el.textContent.trim());

    // Push the product to the array
    products.push({ name: productName, quantity: productQuantity, price: productPrice });
  }

  await browser.close();
  return products;
}

async function scrapeBlinkit(url) {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-infobars',
      '--window-size=1920,1080',
      '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36'
    ],
    ignoreDefaultArgs: ['--disable-extensions']
  });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle2' });
  
  // Scroll the page to load all products
  await autoScroll(page);

  // Adjusted selector to escape the numerical ID
  const productContainers = await page.$$('div.tw-w-full.tw-px-3 > div.tw-flex.tw-w-full.tw-flex-col');

  let products = [];

  for (const productContainer of productContainers) {
    
    const productName = await productContainer.$eval('div.tw-mb-2.tw-flex.tw-flex-col.tw-text-400 > div.tw-mb-1\\.5 > div', el => el.textContent.trim());

    // Extract product quantiity
    const productQuantity = await productContainer.$eval('div.tw-mb-2.tw-flex.tw-flex-col.tw-text-400 > div.tw-flex.tw-items-center > div', el => el.textContent.trim());

    // Extract product price
    const productPrice = await productContainer.$eval('div.tw-flex.tw-items-center.tw-justify-between > div:nth-child(1) > div', el => el.textContent.trim());

    // Push the product to the array
    products.push({ name: productName, quantity: productQuantity, price: productPrice });
  }

  await browser.close();
  return products;
}

async function scrapeBigBasket(url) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle2' });

  // Scroll the page to load all products
  // await autoScroll(page);
  // no scroll needed for bigbasket, since too many products

  // Adjusted selector to escape the numerical ID
  const productContainers = await page.$$('#siteLayout > div.col-span-12.mt-3.mb-8 > div.grid.grid-flow-col.gap-x-6.relative.mt-5.pb-5.border-t.border-dashed.border-silverSurfer-400 > section:nth-child(2) > section > ul > li');

  let products = [];

  for (const productContainer of productContainers) {
    
    const productName = await productContainer.$eval('div > div > h3 > a > div > h3', el => el.textContent.trim());

    // Extract product quantiity
    const productQuantity = await productContainer.$eval('div > div > h3 > div.py-1\\.5.xl\\:py-1', el => el.textContent.trim());

    await page.waitForSelector('div > div > div.flex.flex-col.gap-0\\.5 > div.Pricing___StyledDiv-sc-pldi2d-0.bUnUzR > span.Label-sc-15v1nk5-0.Pricing___StyledLabel-sc-pldi2d-1.gJxZPQ.AypOi');
    // Extract product price
    const productPrice = await productContainer.$eval('div > div > div.flex.flex-col.gap-0\\.5 > div.Pricing___StyledDiv-sc-pldi2d-0.bUnUzR > span.Label-sc-15v1nk5-0.Pricing___StyledLabel-sc-pldi2d-1.gJxZPQ.AypOi', el => el.textContent.trim());

    // Push the product to the array
    products.push({ name: productName, quantity: productQuantity, price: productPrice });
  }

  await browser.close();
  return products;
}


// const product = "cashews";

// // Zepto, Blinkit, BigBasket example URLs (update as needed)
// const zeptoUrl = `https://www.zeptonow.com/search?query=${product}`;
// const blinkitUrl = `https://blinkit.com/s/?q=${product}`;
// const bigbasketUrl = `https://www.bigbasket.com/ps/?q=${product}`;

// (async () => {

//   console.log('Scraping Zepto...');
//   const zeptoProducts = await scrapeGroceryWebsite(zeptoUrl, "Zepto");
//   console.log('Zepto Products:', zeptoProducts);
//   console.log('Zepto Products:', zeptoProducts.length);

//   console.log('Scraping Blinkit...');
//   const blinkitProducts = await scrapeBlinkit(blinkitUrl);
//   console.log('Blinkit Products:', blinkitProducts);
//   console.log('Blinkit Products:', blinkitProducts.length);

//   console.log('Scraping BigBasket...');
//   const bigbasketProducts = await scrapeBigBasket(bigbasketUrl);
//   console.log('BigBasket Products:', bigbasketProducts);
//   console.log('BigBasket Products:', bigbasketProducts.length);
// })();

const app = express();
const port = 3000;

app.get('/scrape', async (req, res) => {
  const product = req.query.product;

  if (!product) {
    return res.status(400).json({ error: 'Product query is required' });
  }

  // Call the appropriate scraping functions based on the product
  console.log('Scraping Zepto...');
  const zeptoProducts = await scrapeGroceryWebsite(`https://www.zeptonow.com/search?query=${product}`, "Zepto");
  console.log('Zepto Products:', zeptoProducts);
  console.log('Zepto Products:', zeptoProducts.length);

  console.log('Scraping Blinkit...');
  const blinkitProducts = await scrapeBlinkit(`https://blinkit.com/s/?q=${product}`);
  console.log('Blinkit Products:', blinkitProducts);
  console.log('Blinkit Products:', blinkitProducts.length);

  console.log('Scraping BigBasket...');
  const bigbasketProducts = await scrapeBigBasket(`https://www.bigbasket.com/ps/?q=${product}`);
  console.log('BigBasket Products:', bigbasketProducts);
  console.log('BigBasket Products:', bigbasketProducts.length);

  // Combine all the results
  const allProducts = [...zeptoProducts, ...blinkitProducts, ...bigbasketProducts];

  res.json(allProducts);
});

app.listen(port, () => {
  console.log(`Scraping service listening at http://localhost:${port}`);
});