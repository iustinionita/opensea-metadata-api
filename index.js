const getLink = require('./link');
const axios = require('axios');
const Web3 = require('web3');
const abi = require('./abi.json');
const rpc = require('./rpc.json');
const messages = require('./messages.json');

// Express setup
const express = require('express');
const app = express();
const bodyParser = require('body-parser');

app.listen(process.env.PORT || 3000, () => console.log("Server is online on port 3000"));

app.use((req, res, next) => {
    bodyParser.json()(req, res, (err) => {
        if(req.body.link === undefined) return res.status(500).send(messages.no_link)
        if(err) {
            console.log("Error in body-parser. Check the link");
            return res.status(500).send(messages.broken_link)
        }
        next();
    })
})

let web3;

app.post('/', (req, res) => {
    // const link = req.query.link || req.body.link;
    const link = req.body.link;
    console.log(`Fetching data from: ${link}`)
    getData(link)
    
    function getData(userLink) {
        if(getLink(userLink) === "wrong_link") return res.status(500).send(messages.wrong_link);
        const { chain, contract, nftId } = getLink(userLink);
        const rpcURL = rpc[chain]
        if (rpcURL !== undefined) {
            web3 = new Web3(rpcURL);
            getURI(contract, nftId);
        } else {
            console.log(chain.toUpperCase() + messages.wrong_chain);
            res.status(500).send(chain.toUpperCase() + messages.wrong_chain)
        }
    }
    
    async function getURI(contract, tokenId) {
        try {
            const nftContract = new web3.eth.Contract(abi, contract);
            const result = await nftContract.methods.tokenURI(tokenId).call();
            console.log("Calling TokenUri function on the Smart Contract")
            getMetadata(result);
        } catch (err) {
            if (err.message === "Returned error: execution reverted") {
                const nftContract = new web3.eth.Contract(abi, contract);
                const result = await nftContract.methods.uri(tokenId).call();
                console.log("Calling URI function on the Smart Contract")
                getMetadata(result);
            } else {
                console.log(err.message);
                res.status(500).send({
                    ERROR: messages.broken_link,
                    SMART_CONTRACT_MESSAGE: err.message
                })
            }
        }
    }
    
    async function getMetadata(uri) {
        if(uri.includes("ipfs://")) {
            const rebuildLink = 'https://gateway.pinata.cloud/ipfs/' + uri.slice(6);
            const fetch = await axios.get(rebuildLink);
            const metadata = fetch.data;
            res.send(metadata)
            return metadata;
        } else {
            const fetch = await axios.get(uri);
            const metadata = fetch.data;
            res.send(metadata)
            return metadata;
        }
    }

})