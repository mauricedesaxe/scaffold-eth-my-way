local_deploy:
	./local_deploy.sh

deploy:
	./deploy.sh

chain:
	cd protocol && anvil --chain-id 1337

dev-app:
	cd app && yarn dev
