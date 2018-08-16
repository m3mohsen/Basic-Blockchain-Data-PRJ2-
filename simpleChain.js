/* ===== SHA256 with Crypto-js ===============================
|  Learn more: Crypto-js: https://github.com/brix/crypto-js  |
|  =========================================================*/

const SHA256 = require('crypto-js/sha256');
const level = require('level');
const chainDB = './chaindata';
const db = level(chainDB);

/* ===== LevelDB Functions ==============================
|  Functions to store and retrieve data persistently|
|  ===============================================*/

// Add data to levelDB with key/value pair
function addLevelDBData(key,value){
  db.put(key, value, function(err) {
    if (err) return console.log('Block ' + key + ' submission failed', err);
  });
}

// Get data from levelDB with key
function getLevelDBData(key){
  return new Promise(function(resolve, reject) {
    db.get(key, function(err, value) {
        if (err){
            return console.log('Not found!', err);
        }
        //console.log('Value = ' + value);
        resolve(value);
      })
  });
}

// Add data to levelDB with value
function addDataToLevelDB(value) {
    let i = 0;
    db.createReadStream().on('data', function(data) {
          i++;
        }).on('error', function(err) {
            return console.log('Unable to read data stream!', err);
        }).on('close', function() {
          console.log('Block #' + i);
          addLevelDBData(i, value);
        });
}

/* ===== Block Class ==============================
|  Class with a constructor for block 			   |
|  ===============================================*/

class Block{
	constructor(data){
     this.hash = "",
     this.height = 0,
     this.body = data,
     this.time = 0,
     this.previousBlockHash = ""
    }
}

/* ===== Blockchain Class ==========================
|  Class with a constructor for new blockchain 		|
|  ================================================*/

class Blockchain{
  constructor(){
    console.log('Creating The Blockchain...');
    //if DB is empty add Genesis block
    this.getChainLenght()
    .then(chainLen => {
        //Genesis block if chain length is 0
        if(chainLen == 0)
            this.addBlock(new Block("First block in the chain - Genesis block"));
    })
    .catch(error =>{
        console.log("Error - Can't create the blockchain ", error);
    });
  }

  // Add new block
  async addBlock(newBlock){
    let chainLen = await this.getChainLenght();
    // Block height
    newBlock.height = chainLen;
    // UTC timestamp
    newBlock.time = new Date().getTime().toString().slice(0,-3);
    // previous block hash
    if(chainLen>0){
        let prevBlockHeight = chainLen - 1;
        getLevelDBData(prevBlockHeight)
        .then(prevBlock => {
            newBlock.previousBlockHash = JSON.parse(prevBlock).hash;

            // Block hash with SHA256 using newBlock and converting to a string
            newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();

            // Adding block object to chain
            addDataToLevelDB(JSON.stringify(newBlock));
            console.log("Finish adding the new block");
        })
        .catch(error =>{
            console.log("Error - Retrieving prev block ", error);
        });
    }
    else{
        // Block hash with SHA256 using newBlock and converting to a string
         newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();

         // Adding block object to chain
         addDataToLevelDB(JSON.stringify(newBlock));
         console.log("Finish adding the Genesis block");
    }
  }

  // Get a promise for block height
  async getChainLenght(){
    return new Promise(function(resolve, reject) {
        let i = 0;
        db.createReadStream()
            .on('data', function() {
                i++;
            })
            .on('error', function() {
                reject("Could not retrieve chain length");
            })
            .on('close', function() {
                resolve(i);
            });
    });
  }

  // Get block height
  async getBlockHeight() {
    let chainLen = await this.getChainLenght();
    console.log(chainLen-1);
    return chainLen-1;
  }

  // Get block
  async getBlock(blockHeight){
    let block = await getLevelDBData(blockHeight);
    console.log(JSON.parse(block));
    return JSON.parse(block);
  }

  // Validate block
  async validateBlock(blockHeight){
    let block = await this.getBlock(blockHeight);
    // get block hash
    let blockHash = block.hash;
    // remove block hash to test block integrity
    block.hash = '';
    // generate block hash
    let validBlockHash = SHA256(JSON.stringify(block)).toString();
    // Compare
    if (blockHash===validBlockHash) {
        console.log("Valid");
        return true;
    }
    else {
        console.log('Block #'+blockHeight+' invalid hash:\n'+blockHash+'<>'+validBlockHash);
        console.log("Invalid");
        return false;
    }
  }

  // Validate blockchain
  async validateChain(){
    let errorLog = []
    let chainLen = await this.getChainLenght();
    for(let i=0; i<chainLen-1; i++){
        // Validate block i
        let blockValid = await this.validateBlock(i);
        if(!blockValid)
            errorLog.push(i);

        //validate i,i+1 chain
        let blockI = await getLevelDBData(i);
        let blockJ = await getLevelDBData(i+1);
        let blockHash = JSON.parse(blockI).hash;
        let previousHash = JSON.parse(blockJ).previousBlockHash;
        if (blockHash!==previousHash) {
            errorLog.push(i);
        }
    }

    // Validate last block
    let blockValid = await this.validateBlock(chainLen - 1);
    if(!blockValid)
        errorLog.push(i);

    // Log the errors
    if (errorLog.length>0) {
        console.log('Block errors = ' + errorLog.length);
        console.log('Blocks: '+errorLog);
    }
    else {
        console.log('No errors detected');
    }
 }

}

