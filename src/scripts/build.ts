import * as build from '../build/index'
import services from '../services/all'

//======================================================================================================================

(async () => {
	await build.generateSwagger(services)
})()
