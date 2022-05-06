const {Worker, workerData} = require("worker_threads");
const schedule = require('node-schedule')

const data = [
    {url : "https://archive.org/details/manuals?&sort=titleSorter&page=1"},
    {url : "https://archive.org/details/manuals?&sort=titleSorter&page=2"}
]

async function runWorker() {
    const result = await Promise.all(data.map((obj, index) => {
        new Promise((resolve, reject) =>  {
            const worker = new Worker('./workerThread', {
                workerData : obj
            })

            console.log(index, " ", process.memoryUsage.rss())
            worker.on("message", resolve);
            worker.on("error", reject);
            worker.on("exit", (code) => {
                if (code !== 0) reject(new Error("something go wrong"));
            })
        })
    }))

}

function resetAtMidnight() {
    let now = new Date();
    let night = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1, // the next day, ...
        0, 0, 0 // ...at 00:00:00 hours
    );

    let msToMidnight = night.getTime() - now.getTime();

    console.log(msToMidnight)
    setTimeout(function() {
        runWorker().then();              //      <-- This is the function being called at midnight.
        resetAtMidnight();    //      Then, reset again next midnight.
    }, msToMidnight);
}

resetAtMidnight();
