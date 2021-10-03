const puppeteer = require('puppeteer')
const { URL, username, password } = require('./config.json')
    ;
(async () => {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.goto(`${URL}/login`)
    await page.type('#name', username)
    await page.type('#password', password)
    await page.click('#_submit')
    await page.waitForTimeout(1000)
    await page.goto(`${URL}/admin/challenges`)
    const ids = await page.evaluate(() => {
        return [...document.querySelector('#challenges').children[1].querySelectorAll('tr')].map(item => item.dataset.href)
    })
    for (let i = 0; i < ids.length; i++) {
        await page.goto(`${URL}${ids[i]}`)
        await page.click('[class="btn btn-success btn-outlined float-right"]')
        let chall = await page.evaluate(() => {
            return {
                name: document.querySelector('h1').innerText,
                point: document.querySelector('[name="initial"]').value
            }
        })
        await console.log(`[+] ${chall.name} ${chall.point} points`)
        await page.waitForTimeout(500)
    }
    await browser.close()
})()