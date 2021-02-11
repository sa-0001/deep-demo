# Deep-Demo API

A demo api service.

## Usage

To develop and/or test the application:
 (you may edit `config.json` to override settings as desired)

```bash
	# build DEV container
	sudo docker build --file ./Dockerfile.dev --tag deep-demo-dev:1.0.0 ./
	
	# start container
	CONTAINER_ID=`sudo docker run --detach --publish=8080:8080 --rm --volume ${PWD}:/app deep-demo-dev:1.0.0`
	
	# get container id if you don't have it yet
	CONTAINER_ID=`sudo docker ps --filter ancestor="deep-demo-dev:1.0.0" --format {{.ID}}`
	
	# start a shell in container
	sudo docker exec -it ${CONTAINER_ID} bash
	
	# install node.js dependencies
	npm install --dev
	
	# build the application
	#  (not required if no changes were made)
	npm run build
	
	# start the express service
	npm run start
	
	# run test scripts
	npm run test
	
	# exit container
	exit
	
	# stop container
	sudo docker stop ${CONTAINER_ID}
```

Or to run the application:
 (you may provide `config.json` to override settings as desired)

```bash
	# build PRO container
	sudo docker build --file ./Dockerfile.pro --tag deep-demo:1.0.0 ./
	
	# start container
	CONTAINER_ID=`sudo docker run --detach --publish=8080:8080 --rm deep-demo:1.0.0`
	# start container with config overrides
	CONTAINER_ID=`sudo docker run --detach --publish=8080:8080 --rm --volume $(PWD)/config.json:/app/config.json deep-demo:1.0.0`
	
	# get container id if you don't have it yet
	CONTAINER_ID=`sudo docker ps --filter ancestor="deep-demo:1.0.0" --format {{.ID}}`
	
	# tail container logs
	sudo docker logs --follow ${CONTAINER_ID}
	
	# start a shell in container
	sudo docker exec -it ${CONTAINER_ID} bash
	
	# run tests in container
	sudo docker exec -it ${CONTAINER_ID} npm run test
	
	# stop container
	sudo docker stop ${CONTAINER_ID}
```

## Notes

1. This demo is 90% boilerplate and thus took 10x longer than it would have, if only the code in folder `services/metrics` needed to be written.

1. It's not clear whether your existing codebase(s) use Javascript, or Typescript, or even something else.
	I wrote it in Typescript because it's the most complex option I am familiar with.  It all depends who is working on it, and for how long.

1. If the customer is able to mount api methods at https://api.DOMAIN/ then they should do so.
	If they are not able to do so, then instead of route /metrics it should be /api/metrics to avoid collision with any web page routes

1. Despite not being included in the spec, I included the metrics `key` in the output, for the convenience of the API user.

1. I would consider putting method input/output in an envelope to allow adding metadata,
	i.e. `{ "locale": "nl-NL", "input": { "value": 1 } }` or `{ "output": { "value": 1 }, "ts": 1612710928468 }`

1. Normally *output* validation should only throw an error in development, whereas in production it should be reported as an error, but still return the output data as-is.
