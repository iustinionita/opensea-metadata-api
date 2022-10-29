const getLink = require('./link');
const axios = require('axios');
const Web3 = require('web3');
const abi = require('./abi.json');
const rpc = require('./rpc.json');

// Express setup
const express = require('express');
const app = express();

app.listen(3000, () => console.log("Server is online on port 3000"))

let web3;

app.get('/', (req, res) => {
    const link = req.query.link;
    
    function getData(userLink) {
        const { chain, contract, nftId } = getLink(userLink);
        const rpcURL = rpc[chain]
        // console.log(rpcURL)
        if (rpcURL !== undefined) {
            web3 = new Web3(rpcURL);
            getURI(contract, nftId);
        } else {
            console.log(`${chain} chain is not supported`);
            res.status(500).send(`${chain} chain is not supported`)
        }
    }
    
    async function getURI(contract, tokenId) {
        try {
            const nftContract = new web3.eth.Contract(abi, contract);
            const result = await nftContract.methods.tokenURI(tokenId).call();
            // console.log(result)
            getMetadata(result);
        } catch (err) {
            if (err.message === "Returned error: execution reverted") {
                const nftContract = new web3.eth.Contract(abi, contract);
                const result = await nftContract.methods.uri(tokenId).call();
                // console.log(result)
                console.log("This was a second attempt")
                getMetadata(result);
            } else {
                console.log(err.message)
                res.status(500).send(`Error: ${err.message}`)
            }
        }
    }
    
    async function getMetadata(uri) {
        if(uri.includes("ipfs://")) {
            const rebuildLink = 'https://gateway.pinata.cloud/ipfs/' + uri.slice(6);
            const fetch = await axios.get(rebuildLink);
            const metadata = fetch.data;
            // console.log(metadata);
            res.send(metadata)
            return metadata;
        } else {
            const fetch = await axios.get(uri);
            const metadata = fetch.data;
            // console.log(metadata);
            res.send(metadata)
            return metadata;
        }
    }

    getData(link)
})





// getData('https://opensea.io/assets/klaytn/0x4c80dd5a8c1b429a0fb222d930f1db6d2de11fe5/1138')
// getData('https://opensea.io/assets/ethereum/0x7c104b4db94494688027cced1e2ebfb89642c80f/51')
// getData('https://opensea.io/assets/optimism/0x0deaac29d8a3d4ebbaaa3ecd3cc97c9def00f720/3301')
//IPFS
// getData('https://opensea.io/assets/arbitrum/0x6325439389e0797ab35752b4f43a14c004f22a9c/7840')

// getData('https://opensea.io/assets/matic/0x4d544035500d7ac1b42329c70eb58e77f8249f0f/15372844365')