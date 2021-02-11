import _ from  'lodash'
import Ajv from 'ajv'
import bodyParser from 'body-parser'
import express from 'express'
import expressPromiseRouter from 'express-promise-router'

import { Config } from '../config/index'
import { HttpVerb, RouteHandler, RouteHandlers } from '../types'

//======================================================================================================================

const ajv = new Ajv({
	removeAdditional: true,
	useDefaults: true,
})

// wrap the route handler interface into an express route handler function
const makeHandler = (routeHandler : RouteHandler) => {
	return async (req, res) => {
		let params, raw_input, input, raw_output, output, response
		
		raw_input = _.assign({}, req.body, req.params)
		
		if (routeHandler.inputSchema) {
			// method has input
			input = JSON.parse(JSON.stringify(raw_input))
			try {
				let inputValidate = ajv.compile({
					type: 'object',
					properties: routeHandler.inputSchema,
					required: Object.keys(routeHandler.inputSchema),
				})
				if (!inputValidate(input)) {
					throw Error(inputValidate.errors.map((err) => {
						let path = err.dataPath.replace(/^\//,'')
						path = path ? `'${path}' ` : ''
						return `${path}${err.message}`
					}).join('\n'))
				}
			} catch (err) {
				response = { error: err.message }
				console.log(`400/input-error: ${req.method} ${req.originalUrl}`, response)
				return res.status(400).set({'content-type': 'application/json; charset=utf-8'}).send(JSON.stringify(response))
			}
			
			raw_output = await routeHandler.handler(input)
		} else {
			// method *does not* have input
			raw_output = await routeHandler.handler()
		}
		
		if (routeHandler.outputSchema) {
			// method has output
			output = JSON.parse(JSON.stringify(raw_output))
			try {
				let outputValidate = ajv.compile({
					type: 'object',
					properties: routeHandler.outputSchema,
					required: Object.keys(routeHandler.outputSchema),
				})
				if (!outputValidate(output)) {
					throw Error(outputValidate.errors.map((err) => {
						let path = err.dataPath.replace(/^\//,'')
						path = path ? `'${path}' ` : ''
						return `${path}${err.message}`
					}).join('\n'))
				}
			} catch (err) {
				response = { error: err.message }
				console.log(`500/output-error: ${req.method} ${req.originalUrl}`, response)
				return res.status(500).set({'content-type': 'application/json; charset=utf-8'}).send(JSON.stringify(response))
			}
			
			response = output
			console.log(`200: ${req.method} ${req.originalUrl}`, raw_input, response)
			return res.status(200).set({'content-type': 'application/json; charset=utf-8'}).send(JSON.stringify(response))
		} else {
			// method *does not* have output
			response = {}
			console.log(`200: ${req.method} ${req.originalUrl}`, raw_input, response)
			return res.status(200).set({'content-type': 'application/json; charset=utf-8'}).send(JSON.stringify(response))
		}
	}
}

//------------------------------------------------------------------------------

// start the express service running
export const start = (services : RouteHandlers) => {
	const app = express()
	const prefix = Config().services.express.prefix
	const router = expressPromiseRouter()
	
	app.set('port', Config().services.express.port)
	app.use(bodyParser.json({ limit: '10mb' }))
	
	// Redoc/Swagger documentation
	app.use(`${prefix}/doc`, express.static('./dist/doc/', { maxAge: '1h' }))
	
	// all api methods will be added under the prefix (if there is one)
	app.use(prefix, router)
	
	// mount all routes
	services.forEach((service) => {
		service.forEach((routeHandler) => {
			let method = routeHandler.verb.toLowerCase()
			router[method](routeHandler.route, makeHandler(routeHandler))
			console.log(`express/mounted: ${routeHandler.verb} ${prefix}${routeHandler.route}`)
		})
	})
	
	// handle 404
	app.use((req, res) => {
		console.error(`404: ${req.method} ${req.originalUrl}`)
		res.status(404).set({'content-type': 'application/json; charset=utf-8'}).send(JSON.stringify({ error: `${req.method} ${req.originalUrl} not found` }))
	})
	
	// handle 500
	app.use((err : Error, req : express.Request, res : express.Response) => {
		console.error(`500: ${req.method} ${req.originalUrl}`, err.stack)
		res.status(500).set({'content-type': 'application/json; charset=utf-8'}).send(JSON.stringify({ error: err.message }))
	})
	
	app.listen(app.get('port'), '0.0.0.0')
	console.log(`express/started: ${Config().services.express.url}`)
}
