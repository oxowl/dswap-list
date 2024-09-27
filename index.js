import fs from 'fs/promises';
import axios from 'axios';
import { ethers } from 'ethers';
import FormData from 'form-data';
import dotenv from 'dotenv';

dotenv.config();

const QUICKNODE_API_KEY = process.env.QUICKNODE_API_KEY;
const IPFS_GATEWAY = process.env.IPFS_GATEWAY || 'https://yourid.quicknode-ipfs.com/ipfs';
const QUICKNODE_RPC_URL = `https://api.quicknode.com/v1/eth/mainnet/${QUICKNODE_API_KEY}`;
const QUICKNODE_IPFS_URL = 'https://api.quicknode.com/ipfs/rest/v1/s3/put-object';

async function loadJsonFile(path) {
  const data = await fs.readFile(path, 'utf8');
  return JSON.parse(data);
}

async function validateToken(token, provider, abi) {
  if (!token || !token.addressToken) {
    console.warn('Invalid token data');
    return false;
  }

  const contract = new ethers.Contract(token.addressToken, abi, provider);

  try {
    const [name, symbol, decimals] = await Promise.all([
      contract.name(),
      contract.symbol(),
      contract.decimals()
    ]);

    return (
      name === token.name &&
      symbol === token.symbol &&
      decimals === token.decimals
    );
  } catch (error) {
    console.error(`Error validating token ${token.symbol}:`, error);
    return false;
  }
}

async function buildTokenList(tokenList, abi) {
  const provider = new ethers.providers.JsonRpcProvider(QUICKNODE_RPC_URL);
  
  const validatedGroups = await Promise.all(tokenList.map(async (group) => {
    const validatedTokens = await Promise.all(
      group.tokens.map(token => validateToken(token, provider, abi))
    );

    return {
      ...group,
      tokens: group.tokens.filter((_, index) => validatedTokens[index])
    };
  }));

  return validatedGroups.filter(group => group.tokens.length > 0);
}

async function uploadToIPFS(tokenList) {
  const formData = new FormData();
  const randomPrefix = Math.random().toString(36).substring(2, 15);
  const fileName = `${randomPrefix}_tokenList.json`;
  
  formData.append('Body', Buffer.from(JSON.stringify(tokenList)));
  formData.append('Key', fileName);
  formData.append('ContentType', 'application/json');

  try {
    const response = await axios.post(QUICKNODE_IPFS_URL, formData, {
      headers: {
        ...formData.getHeaders(),
        'x-api-key': QUICKNODE_API_KEY,
      },
    });

    return response.data.pin.cid;
  } catch (error) {
    console.error("Error uploading to IPFS:", error.response?.data || error.message);
    throw new Error('Failed to upload to IPFS');
  }
}

async function main() {
  try {
    const abi = (await loadJsonFile('./abi/Dswap.json')).abi;
    const tokenList = await loadJsonFile('./dswap-list.json');

    console.log('Building and validating token list...');
    const validatedTokenList = await buildTokenList(tokenList, abi);
    
    console.log('Uploading validated token list to IPFS...');
    const cid = await uploadToIPFS(validatedTokenList);
    
    console.log('Token list is available at:', `${IPFS_GATEWAY}/${cid}`);
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

main();