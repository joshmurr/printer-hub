#!/bin/bash

# Exit on any error
set -e

CONFIG_FILE="./config.json"
USER="josh"
SERVER=$FRONT_DOOR

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo "Error: jq is required but not installed"
    exit 1
fi

# Read config length
CONFIG_LENGTH=$(jq length $CONFIG_FILE)

echo "Building app..."
cd app
# npm install
# npm run build
cd ..

echo "Building server..."
cd server
# npm install
# npm run build
cd ..

# Deploy each site from config
for ((i=0; i<$CONFIG_LENGTH; i++)); do
    SITE_NAME=$(jq -r ".[$i].siteName" $CONFIG_FILE)
    REMOTE_PATH=$(jq -r ".[$i].remotePath" $CONFIG_FILE)
    
    echo "Deploying $SITE_NAME to $REMOTE_PATH"
    
    if [[ $SITE_NAME == *"server"* ]]; then
        SOURCE_DIR="./server/dist/"
    else
        SOURCE_DIR="./app/dist/"
    fi

    echo "rsync-ing to $USER@$SERVER:$REMOTE_PATH"
    
    # rsync -avz --delete "$SOURCE_DIR" "$USER@$SERVER:$REMOTE_PATH"
done

echo "Deployment completed successfully"
