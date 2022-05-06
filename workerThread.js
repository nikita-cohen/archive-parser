const pt = require("puppeteer");
const axios = require("axios");
const {Worker, parentPort, workerData} = require("worker_threads");

async function parseData(url) {
    const obj = {};
    const browser = await pt.launch();
    const page = await browser.newPage();

    const newUrl = url;

    await page.goto(newUrl, {timeout: 0});

    const newElements = await page.evaluate(() => {
        return Array.from(document.querySelectorAll(`div.C234 > div.collection-title.C.C2 > a`))
            .map(x => {
                return {"href": x.href, "text": x.textContent}
            });
    })

    for (let i = 0; i < newElements.length; i++) {
        let isResult = true;
        let count = 1;
        while (isResult) {
            await page.goto(newElements[i].href + "?&sort=titleSorter&page=" + count.toString(), {timeout: 0});

            const manualElements = await page.evaluate(() => {
                return Array.from(document.querySelectorAll(`div.C234 > div.item-ttl.C.C2 > a`))
                    .map(x => {
                        return {"href": x.href, "text": x.title}
                    });
            })

            if (manualElements.length > 0) {
                manualElements.forEach((manual, index) => {
                    obj.url = manual.href;
                    obj.title = manual.text;

                    axios.post("http://localhost:8099/manual/archive/", obj)
                        .then(data => console.log("ok ", index))
                        .catch((e) => console.log(e))
                })
                count++;
            } else {
              isResult = false;
            }
        }
    }

    await browser.close();
}

parseData(workerData.url).then();
