require("dotenv").config()
const db = require('quick.db');

const express = require("express")
const app = express()

const { snapshot, getCurrentBlock, store, BN } = require("./snapshot/index.js")

let cache = {
  last: 0,
  data: {
    week: "0",
    day: "0"
  }
}

app.get("/", async (req, res) => {
  if (new Date().getTime() - cache.last > 60 * 60 * 1000){ //1 hour
    cache.last = new Date().getTime()

    let data = await getAlreadyStored(db)
    let sum = await sumData(data)

    cache.data.day = sum.day
    cache.data.week = sum.week

    res.json({
      week: sum.week,
      day: sum.day
    })
  } else {
    res.json({
      week: cache.data.week,
      day: cache.data.day
    })
  }
})

async function sumData(data){
  let week = 0
  let day = 0;

  let currentBlock = await getCurrentBlock()
  let oneWeekBlock = currentBlock - (43200 * 7) //43200 blocks per day
  let oneDayBlock = currentBlock - 43200

  for (const key in data) {
    if (data[key]["block"] > oneWeekBlock){
      week = new BN(week).add(new BN(data[key]["penalty"])).toString()
    }

    if (data[key]["block"] > oneDayBlock){
      day = new BN(day).add(new BN(data[key]["penalty"])).toString()
    }
  }

  return {
    week: week,
    day: day
  }
}

async function getAlreadyStored(db){
  return new Promise(async (resolve, reject) => {
    let txs = await db.get('transactions.txs')
    resolve(txs)
  })
}

setInterval(() => {
  snapshot(db)
}, 1000 * 5000) //every 5000 seconds

app.listen(8080)
