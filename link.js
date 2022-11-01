function getLink(link) {
    const website = link.includes('https://opensea.io/assets/');
    if (website) {
        const semiLink = link.slice(26);
        const chain = semiLink.slice(0, semiLink.indexOf("/"));
        const nftLink = link.slice(link.indexOf('0x'));
        const contract = nftLink.slice(0, nftLink.indexOf('/'));
        const nftId = nftLink.slice(nftLink.indexOf('/') + 1);
        return { chain, contract, nftId }
    } else {
        console.log("Not an OpenSea link");
        return "Please provide an OpenSea link"
    }
}

module.exports = getLink;