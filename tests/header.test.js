const puppeteer = require('puppeteer');
jest.setTimeout(20000);

let browser , page;

beforeEach(async () => {
  browser = await puppeteer.launch({
    headless:false
  });
  page = await browser.newPage();
  await page.goto('localhost:3000');
});

afterEach(async () => {
  // await browser.close();
})

test('we can lauch the browser' , async() => {

  const text = await page.$eval('a.brand-logo' , el => el.innerHTML);

  expect(text).toEqual('Blogster');

})

test('Login on google starts oauth flow', async() => {
  await page.click('.right a');

  const url = await page.url();

  expect(url).toMatch(/accounts\.google\.com/);
})

test.only('when signed in, shows logout button' , async() => {
  const id = '5ef6059dba216a2210f2392e';

  const Buffer = require('safe-buffer').Buffer;

  const sessionObject = {
    passport:{
      user:id
    }
  };

  const sessionString = Buffer.from(JSON.stringify(sessionObject)).toString('base64');

  const Keygrip = require('keygrip');
  const keys = require('../config/keys');
  const keygrip = new Keygrip([keys.cookieKey]);
  const sig = keygrip.sign('session=' + sessionString);

  console.log(sessionString , sig);

  await page.setCookie( {name:'session', value:sessionString} );
  await page.setCookie( {name:'session.sig' , value:sig} );
  await page.goto('localhost:3000');

})