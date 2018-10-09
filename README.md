# Blockchain Data

A simplified private blockchain.

### Installation

```
npm init
```

- Install crypto-js
```
npm install crypto-js --save
```

- Install level
```
npm install level --save
```

## Testing

Run simpleChain.js in a node environment

Instantiate blockchain with blockchain variable
```
let blockchain = new Blockchain();
```

Generate 10 blocks using a for loop
```
for (var i = 0; i <= 10; i++) {
  blockchain.addBlock(new Block("test data "+i));
}

Validate blockchain
```
blockchain.validateChain();
```

Induce errors by changing block data
```
let inducedErrorBlocks = [2,4,7];
for (var i = 0; i < inducedErrorBlocks.length; i++) {
  blockchain.chain[inducedErrorBlocks[i]].data='induced chain error';
}
```

Validate blockchain. The chain should now fail with blocks 2,4, and 7.
```
blockchain.validateChain();
```
