#!/bin/bash

set -e  # Exit immediately if a command exits with a non-zero status.

# Source the .env file if it exists
if [ -f .env ]; then
    source .env
else
    echo "Warning: .env file not found. Make sure PRIVATE_KEY is set in your environment."
fi

# Set variables
PROTOCOL_DIR="./protocol"
APP_DIR="./app"
NETWORK="http://localhost:8545" 
PRIVATE_KEY="${PRIVATE_KEY}"

# Create the output directory if it doesn't exist
mkdir -p "$APP_DIR/src/contracts"

# Check if PRIVATE_KEY is set
if [ -z "$PRIVATE_KEY" ]; then
    echo "Error: PRIVATE_KEY is not set. Please provide it as an environment variable or as the first argument to the script."
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
    DEPLOY_OUTPUT=$(forge create "$CONTRACT_FILE:$CONTRACT_NAME" --rpc-url "$NETWORK" --json --private-key "$PRIVATE_KEY")

    # Check if deployment was successful
    if [ $? -ne 0 ]; then
        echo "Failed to deploy $CONTRACT_NAME. Skipping..."
        continue
    fi

    # Extract contract address from deployment output
    CONTRACT_ADDRESS=$(echo "$DEPLOY_OUTPUT" | jq -r '.deployedTo')

    # Make sure the tmp folder exists
    mkdir -p "./tmp"

    # Add contract address to deployments.json
    if [ ! -f "./tmp/deployments.json" ]; then
        echo "{}" > "./tmp/deployments.json"
    fi
    
    # Use jq to update the JSON file
    jq --arg name "$CONTRACT_NAME" --arg address "$CONTRACT_ADDRESS" \
       '. + {($name): $address}' "./tmp/deployments.json" > "./tmp/deployments.json.tmp" && mv "./tmp/deployments.json.tmp" "./tmp/deployments.json"

    echo "Added $CONTRACT_NAME: $CONTRACT_ADDRESS to deployments.json"

    # Generate ABI
    forge inspect "$CONTRACT_NAME" abi > "./tmp/${CONTRACT_NAME}.abi.json"

    echo "$CONTRACT_NAME deployed at: $CONTRACT_ADDRESS"
done

# Cd back to root
cd ..

# Copy the tmp folder to the app folder
cp -r ./protocol/tmp/* ./app/src/contracts/

# Clean up the tmp folder
rm -rf ./protocol/tmp

echo "All contracts deployed and exported to $APP_DIR/src/contracts"