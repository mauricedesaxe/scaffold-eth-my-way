#!/bin/bash

set -e  # Exit immediately if a command exits with a non-zero status.

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo "Error: jq is not installed. Please install jq to parse JSON files."
    exit 1
fi

# Source the env.json file if it exists
if [ -f env.json ]; then
    # Read variables from env.json
    NETWORK=$(jq -r '.environment // "local"' env.json)
    RPC_URL=$(jq -r ".$NETWORK.RPC_URL // \"http://127.0.0.1:8545\"" env.json)
    PRIVATE_KEY=$(jq -r ".$NETWORK.PRIVATE_KEY // empty" env.json)
    BLOCKSCANNER_API_KEY=$(jq -r ".$NETWORK.BLOCKSCANNER_API_KEY // empty" env.json)
else
    echo "Warning: env.json file not found."
    exit 1
fi

# Set variables with fallbacks to environment variables
PROTOCOL_DIR="./protocol"
APP_DIR="./app"
NETWORK="${NETWORK:-local}" 
RPC_URL="${RPC_URL:-http://127.0.0.1:8545}"
PRIVATE_KEY="${PRIVATE_KEY}"
BLOCKSCANNER_API_KEY="${BLOCKSCANNER_API_KEY}"

# Check if PRIVATE_KEY is set
if [ -z "$PRIVATE_KEY" ]; then
    echo "Error: PRIVATE_KEY is not set. Please provide it as an environment variable or in the env.json file."
    exit 1
fi

# Navigate to the protocol directory
cd $PROTOCOL_DIR || exit

# Build the project
forge build

# Initialize a temporary file for building the JSON
TEMP_FILE=$(mktemp)
echo "{}" > "$TEMP_FILE"

# Loop through all Solidity files in the src directory
for CONTRACT_FILE in src/*.sol; do
    # Extract contract name from file name
    CONTRACT_NAME=$(basename "$CONTRACT_FILE" .sol)
    
    echo "Deploying $CONTRACT_NAME..."

    # Deploy the contract
    if [ "$NETWORK" = "local" ]; then
        DEPLOY_OUTPUT=$(forge create --rpc-url "$RPC_URL" \
        --private-key "$PRIVATE_KEY" \
        "$CONTRACT_FILE:$CONTRACT_NAME")
    else
        DEPLOY_OUTPUT=$(forge create --rpc-url "$RPC_URL" \
        --private-key "$PRIVATE_KEY" \
        --etherscan-api-key "$BLOCKSCANNER_API_KEY" \
        --verify \
        "$CONTRACT_FILE:$CONTRACT_NAME")
    fi

    # Check if deployment was successful
    if [ $? -ne 0 ]; then
        echo "Failed to deploy $CONTRACT_NAME. Skipping..."
        continue
    fi

    # Extract contract address from deployment output
    CONTRACT_ADDRESS=$(echo "$DEPLOY_OUTPUT" | grep -o 'Deployed to: 0x[0-9a-fA-F]\+' | cut -d ' ' -f 3)

    # Make sure the tmp folder exists
    mkdir -p "./tmp"
    mkdir -p "./tmp/$NETWORK"

    # Add contract address to deployments.json
    if [ ! -f "./tmp/$NETWORK/deployments.json" ]; then
        echo "{}" > "./tmp/$NETWORK/deployments.json"
    fi
    
    # Use jq to update the JSON file
    jq --arg name "$CONTRACT_NAME" --arg address "$CONTRACT_ADDRESS" \
       '. + {($name): $address}' "./tmp/$NETWORK/deployments.json" > "./tmp/$NETWORK/deployments.json.tmp" && mv "./tmp/$NETWORK/deployments.json.tmp" "./tmp/$NETWORK/deployments.json"

    echo "Added $CONTRACT_NAME: $CONTRACT_ADDRESS to $NETWORK/deployments.json"

    # Generate ABI
    forge inspect "$CONTRACT_NAME" abi > "./tmp/$NETWORK/${CONTRACT_NAME}.abi.json"

    echo "$CONTRACT_NAME deployed at: $CONTRACT_ADDRESS"
done

# Cd back to root
cd ..

# Copy the tmp folder to the app folder
mkdir -p "$APP_DIR/src/contracts/$NETWORK"
cp -r "./protocol/tmp/$NETWORK/"* "$APP_DIR/src/contracts/$NETWORK/"

# Clean up the tmp folder
rm -rf "$PROTOCOL_DIR/tmp"

echo "All contracts deployed and exported to $APP_DIR/src/contracts/$NETWORK"
