require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { ethers } = require('ethers');
const { HDNodeWallet } = require('ethers/wallet');

const app = express();
const port = 3000;

app.use(bodyParser.json());

console.log('Starting app...');

// Moonbeam setup with ENS disabled
const provider = new ethers.JsonRpcProvider(process.env.MOONBEAM_RPC_URL, {
    name: 'moonbeam',
    chainId: 1284,
    ensAddress: null // This disables ENS resolution attempts
});

provider.resolveName = async (name) => {
    return name;
};

const mnemonic = process.env.MNEMONIC;
const wallet = HDNodeWallet.fromPhrase(mnemonic).connect(provider);

console.log('Wallet address:', wallet.address);

// Replace this ABI with your actual contract ABI
const contractABI = [
    "function mintNFT(address recipient, string memory tokenURI) public returns (uint256)",
    "function ownerOf(uint256 tokenId) public view returns (address)"
];
const nftContract = new ethers.Contract(process.env.CONTRACT_ADDRESS, contractABI, wallet);

// Endpoint to handle POST requests for minting NFTs
app.post('/mint-nft', async (req, res) => {
    const { recipient, tokenURI } = req.body;
    console.log('Minting NFT for:', recipient, 'with URI:', tokenURI);

    try {
        const tx = await nftContract.mintNFT(recipient, tokenURI);
        const receipt = await tx.wait();
        const event = receipt.events.find(event => event.event === 'Transfer');
        const tokenId = event.args.tokenId.toString();

        res.json({
            success: true,
            message: 'NFT minted successfully',
            tokenId,
            transactionHash: receipt.transactionHash
        });
    } catch (error) {
        console.error('Error minting NFT:', error);
        res.status(500).json({ success: false, message: 'Failed to mint NFT', error: error.message });
    }
});

// Endpoint to get NFT owner
app.get('/nft-owner/:tokenId', async (req, res) => {
    const tokenId = req.params.tokenId;
    console.log('Fetching owner of token:', tokenId);

    try {
        const owner = await nftContract.ownerOf(tokenId);
        res.json({ success: true, owner });
    } catch (error) {
        console.error('Error fetching NFT owner:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch NFT owner', error: error.message });
    }
});

// Your existing endpoints
app.post('/data', (req, res) => {
    console.log('Received data:', req.body);
    res.send('Data received');
});

app.get('/data', (req, res) => {
    console.log('This is the data endpoint. Please use a POST request to send data.');
    res.send('This is the data endpoint. Please use a POST request to send data.');
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});