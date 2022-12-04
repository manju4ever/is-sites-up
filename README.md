# IsSitesUp

> Crafted for [On-Running](https://on-running.com) Team 
### 02 Dec 2022

  This script reads a bunch of links through a text file supplied, validates each of them and checks whether it's online or not and writes it back to a output file

## Fetaures:
   1. No external libraries used
   2. asyncMap - Advanced concurrency usage - parallel exec with limit
   3. Minimalistic and Performant

## To Do
  * Add tests
  * Read input and outfiles as args

## How to run ?
* Should use command in the Shell like:

  `> node --experimental-fetch index.js`

* Use `links.txt` to add more links if you need
* Output file at `links.status.txt`


### How *asyncMap* Looks Like ?
```javacript
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
```

-- -- 

 *Note:  Specially crafted for On-Running to showcase various intermediate to adnvaced concepts with NodeJS*

-- --

## References:
 1. [Top 1000 links was found here](https://gist.github.com/jgamblin/62fadd8aa321f7f6a482912a6a317ea3)
  
