export enum HttpVerb {
	GET = 'GET',
	POST = 'POST',
}

export interface RouteHandler {
	summary: string
	description: string
	tags: Array<string>
	verb: HttpVerb
	route: string
	inputSchema?: Object
	outputSchema?: Object
	handler: Function
}

export type RouteHandlers = Array<Array<RouteHandler>>
