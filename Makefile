local_deploy_and_export:
	./local_deploy_and_export.sh

chain:
	cd protocol && anvil --chain-id 1337

dev-app:
	cd app && yarn dev
