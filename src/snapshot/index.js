require("dotenv").config()
const Web3 = require("web3")
const web3 = new Web3(process.env.RPC)

const ABI = require("./ABI.json")

async function snapshot(db){
  let logs = await getLogs()
  let alreadyStored = await getAlreadyStored(db, )
  for (i in logs){
    if (!alreadyStored.txs[logs[i].transactionHash]){
      await store(db, logs[i].transactionHash, logs[i].returnValues.user, logs[i].returnValues.penalty)
    }
  }
}

async function getLogs(){
  let toBlock = await web3.eth.getBlockNumber();
  let fromBlock = toBlock - 3000
  let contract = new web3.eth.Contract(ABI, process.env.MASTER_CHEF);
  let pastEvents = await contract.getPastEvents("Claim", {}, { fromBlock: fromBlock, toBlock: toBlock })
  return pastEvents;
}

async function getAlreadyStored(db){
  return new Promise(async (resolve, reject) => {
    let txs = await db.get('transactions.txs')
    resolve(txs)
  })
}

async function store(db, transactionHash, user, penalty){
  return new Promise(async (resolve, reject) => {
    let txs = await db.set('transactions.txs.'+transactionHash, { "user": user, "penalty": penalty })
    resolve(txs)
  })
}

async function getCurrentBlock(){
  return new Promise(async (resolve, reject) => {
    let block = await web3.eth.getBlockNumber();
    resolve(block)
  })
}

module.exports.snapshot = snapshot
module.exports.store = store
module.exports.getAlreadyStored = getAlreadyStored
module.exports.getCurrentBlock = getCurrentBlock
module.exports.BN = web3.utils.BN;

// {
//   txs: {
//     "0x1234transactionHash": {
//       user: "0x123",
//       penalty: "12345",
//       block: 1203445
//     }...
//   }
// }
