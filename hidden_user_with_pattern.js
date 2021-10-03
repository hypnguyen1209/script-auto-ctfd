const puppeteer = require('puppeteer')
const { URL, username, password } = require('./config.json')
try {
    (async () => {
        const browser = await puppeteer.launch()
        const page = await browser.newPage()
        await page.goto(`${URL}/login`)
        await page.type('#name', username)
        await page.type('#password', password)
        await page.click('#_submit', { waitUntil: 'domcontentloaded' })
        let resp = await page.goto(`${URL}/admin/users`, { waitUntil: 'domcontentloaded' })
        resp = await resp.text()
        const pageUser = await page.evaluate(() => {
            return document.querySelector('.page-select').innerText.split('\n').pop()
        })
        let pageStart = 1
        do {
            await page.waitForTimeout(1000)
            await page.evaluate(() => {
                (async () => {
                    const pattern = /^B(21|20)[A-Z]{2}[\d]{3}\.[A-Z][a-z]{1,8}[A-Z]{1,4}$/
                    const user = [...document.querySelector('#teamsboard').children[1].querySelectorAll('tr')]
                        .filter(e => (
                            e.innerText.includes('hidden')
                            && e.children[2].innerText.split('\n')[0].trim().match(pattern)
                        ) || (
                                !e.innerText.includes('hidden') &&
                                !e.children[2].innerText.split('\n')[0].trim().match(pattern)
                            )
                        )
                        .map(e => ({
                            id: e.dataset.href.split('/')[3],
                            hidden: e.children[2].innerText.split('\n')[0].trim().match(pattern) ? false : true
                        }))
                    console.log(user)
                    await Promise.all([
                        ...user.map(async e => {
                            return await fetch(`https://ctf.infosecptit.club/api/v1/users/${e.id}`, {
                                headers: {
                                    "accept": "application/json",
                                    "content-type": "application/json",
                                    "csrf-token": init.csrfNonce,
                                },
                                body: `{"hidden":"${e.hidden}"}`,
                                method: "PATCH",
                                mode: "cors",
                                credentials: "include"
                            });
                        })
                    ])
                })()
            })
            ++pageStart
            await page.goto(`${URL}/admin/users?page=${pageStart}`, { waitUntil: 'domcontentloaded' })
        } while (pageStart <= parseInt(pageUser))
        await console.log('[+] Done!')
        await browser.close()
    })()
} catch (err) {
    console.log(err)
}