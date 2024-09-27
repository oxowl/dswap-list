# DSwap Token List Manager

This project is a tool for managing the DSwap token list. It includes functionality for validating tokens, building a token list, and uploading it to IPFS using QuickNode's IPFS service.

## Features

- Token validation based on smart contract data
- Building a list of valid tokens
- Uploading the token list to IPFS via QuickNode

## Requirements

- Node.js
- npm or yarn

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/your-username/dswap-token-list-manager.git
   ```

2. Navigate to the project directory:
   ```
   cd dswap-token-list-manager
   ```

3. Install dependencies:
   ```
   npm install
   ```
   or
   ```
   yarn install
   ```

## Configuration

1. Create a `.env` file in the root directory of the project and add the following environment variables:
   ```
   QUICKNODE_API_KEY=your_quicknode_api_key
   IPFS_GATEWAY=https://yourid.quicknode-ipfs.com/ipfs
   ```

2. Replace `your_quicknode_api_key` with your actual QuickNode API key.
3. Optionally, update the IPFS_GATEWAY if you're using a different gateway.

## Usage

Run the script with the command:

```
node index.js
```

The script will perform the following actions:
1. Load the ABI from `./abi/Dswap.json`
2. Load the token list from `./dswap-list.json`
3. Validate tokens using the Ethereum mainnet via QuickNode
4. Build a list of valid tokens
5. Upload the validated token list to IPFS via QuickNode
6. Output the CID and URL for accessing the token list via IPFS

## Project Structure

- `index.js`: Main script
- `dswap-list.json`: Source token list
- `abi/Dswap.json`: ABI of the Dswap smart contract
- `.env`: Environment variables (not tracked in git)

## Contributing

Please read `CONTRIBUTING.md` for details on how to contribute to this project.

## License

This project is licensed under the [MIT License](LICENSE).