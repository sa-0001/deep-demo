import * as build from '../build/index'
import * as express from '../express/index'
import services from '../services/all'

//======================================================================================================================

(async () => {
	await build.generateSwagger(services)
	express.start(services)
})()
