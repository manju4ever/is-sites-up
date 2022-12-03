/**
  Please see README.md once before diving :)
*/

const fs = require("fs");
const readline = require("readline");

/** 
  Some Resuable Utilities 
*/

function isValidURL(someString) {
  try {
    return !!new URL(someString);
  } catch (err) {
    return false;
  }
}

async function isUp(url) {
  try {
    return (await fetch(url, { method: "HEAD" })).status === 200
      ? "Online"
      : "Offline";
  } catch (err) {
    return `Not Reachable`
  }
}

async function sleep(timeInSec) { return new Promise(res => setTimeout(res, timeInSec * 1000)) }

/** Advanced concurrency pattern **/
async function* asyncMap(iterable, mapFn, numWorkers = 3, ...otherArgs) {
  try {
    const workerCount =
      numWorkers > iterable.length ? iterable.length : numWorkers;
    const iter = Array.from(iterable).values();
    const workers = new Array(workerCount)
      .fill(iter)
      .map((iter, idx) => mapFn.call(null, iter, idx + 1, ...otherArgs));

    // dispatch multiple workers at the same time 
    const results = (await Promise.all(workers)).flat();

    // return results as iterable
    for (let result of results) {
      yield result;
    }
    return true;
  } catch (err) {
    throw err;
  }
}

/** 
  Actual Heavylifting Parts
*/
const readUrlsFromFile = (filePath) => {
  return new Promise((resolve, reject) => {
    try {
      const lineReader = readline.createInterface({
        input: fs.createReadStream(filePath),
      });

      const links = [];

      lineReader.on("line", (link) => {
        isValidURL(link) ? links.push(link) : () => { };
      });

      lineReader.on("close", async () => {
        resolve(links);
      });
    } catch (err) {
      reject(err);
    }
  });
};

const prettyPrint = ({ url, status, at }) => `${url} | ${status} | ${at}`

const checkIfOnline = async (urls, workerId, oFile) => {
  const results = [];
  for (const url of urls) {
    try {
      await sleep(0.2);
      const res = {
        url,
        status: await isUp(url),
        at: new Date().toLocaleString(),
        workerId,
      };
      str = (prettyPrint(res) + ` | ${workerId} \n`);
      process.stdout.write(str);
      oFile.write(str);
      results.push(res);
    } catch (err) {
      const res = {
        url,
        status: false,
        at: new Date().toLocaleString(),
        error: true,
        errorMsg: err.message || err,
        workerId,
      };
      str = (prettyPrint(res) + ` | ${workerId}`);
      process.stdout.write(str);
      oFile.write(str);
      results.push(res);
    }
  }
  return results;
};


/** The entrypoint */
const main = async () => {

  console.time("time");

  const links = await readUrlsFromFile("./links.txt");
  const oFile = fs.createWriteStream("./links.status.txt")
  const checkAllLinks = asyncMap(links, checkIfOnline, (numWorkers = Math.floor(links.length / 4)), oFile);

  for await (let res of checkAllLinks) {
    // Do Nothing - Just Consume - Wish there were a better way !
  }
  oFile.end();
  console.log(`Total Links Scanned: ${links.length}`);

  console.timeEnd("time");
  return process.exit(0);
};

main()

// On force kill - remove all scheduled promises as well
process.on('SIGINT', () => process.exit(10))


