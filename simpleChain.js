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
  })
}

// Get data from levelDB with key
function getLevelDBData(key){
  db.get(key, function(err, value) {
    if (err) return console.log('Not found!', err);
    console.log('Value = ' + value);
  })
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

// Get # of blocks in the chain
function getLevelDbLength(){
    var promise = new Promise(function(resolve, reject) {
        // do a thing, possibly async, then…
        let i = 0;
        db.createReadStream().on('data', function(data) {
                i++;
            }).on('error', function(err) {
                reject(Error("Unable to read data stream!"));
            }).on('close', function(){
                resolve(i);
            });
    });
    return promise;
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
    console.log('Creating Blockchain');
    addLevelDBData(0, new Block("First block in the chain - Genesis block"));
  }
/*
  // Add new block
  addBlock(newBlock){
    let promise = getLevelDbLength();
    promise.then(function(len) {
        console.log(len); // "Stuff worked!"
        let chainLen = len;
        // Block height
        newBlock.height = chainLen;
        // UTC timestamp
        newBlock.time = new Date().getTime().toString().slice(0,-3);
        // previous block hash
        if(chainLen>0){
          newBlock.previousBlockHash = getLevelDBData(chainLen-1).hash;
        }
        // Block hash with SHA256 using newBlock and converting to a string
        newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();

        // Adding block object to chain
        addDataToLevelDB(newBlock)
      }, function(err) {
        console.log(err); // Error: "It broke"
      });
  }
*/
  // Get block height
    getBlockHeight(){
        let promise = getLevelDbLength();
        promise.then(function(len) {
            console.log(len); // "Stuff worked!"
            return len-1;
          }, function(err) {
            console.log(err); // Error: "It broke"
          });
    }
/*
    // get block
    getBlock(blockHeight){
      // return object as a single string
      return JSON.parse(JSON.stringify(getLevelDBData(blockHeight)));
    }

    // validate block
    validateBlock(blockHeight){
      // get block object
      let block = this.getBlock(blockHeight);
      // get block hash
      let blockHash = block.hash;
      // remove block hash to test block integrity
      block.hash = '';
      // generate block hash
      let validBlockHash = SHA256(JSON.stringify(block)).toString();
      // Compare
      if (blockHash===validBlockHash) {
          return true;
        } else {
          console.log('Block #'+blockHeight+' invalid hash:\n'+blockHash+'<>'+validBlockHash);
          return false;
        }
    }

   // Validate blockchain
    validateChain(){
      let errorLog = [];
      let chainLen = getLevelDbLength()
      for (var i = 0; i < chainLen-1; i++) {
        // validate block
        if (!this.validateBlock(i))
            errorLog.push(i);
        // compare blocks hash link
        let blockHash = this.getBlock(i).hash;
        let previousHash = this.getBlock(i+1).previousBlockHash;
        if (blockHash!==previousHash) {
          errorLog.push(i);
        }
      }
      if (errorLog.length>0) {
        console.log('Block errors = ' + errorLog.length);
        console.log('Blocks: '+errorLog);
      } else {
        console.log('No errors detected');
      }
    }
*/
}
