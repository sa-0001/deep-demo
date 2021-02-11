import _ from 'lodash'
import { existsSync, readFileSync, realpathSync } from 'fs-extra'

import defaultConfig from './default-config.json'

//======================================================================================================================

export const Config = _.once(() => {
	if (existsSync(`${Root()}config.json`)) {
		// if a config.json file has been provided,
		//  then merge its values into the defaults
		const overrideConfig = JSON.parse(readFileSync(`${Root()}config.json`, 'utf8'))
		_.merge(defaultConfig, overrideConfig)
	}
	
	const config = defaultConfig
	
	// update config.services.express.url in case changes were made to host/port/prefix
	const express = config.services.express
	express.url = `http://${express.host}:${express.port}${express.prefix}`
	
	return config
})

export const Root = _.once(() => {
	return realpathSync(__dirname+'/../../')+'/'
})
