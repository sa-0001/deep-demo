#!/usr/bin/env node
import _ from 'lodash'
import got from 'got'
import tap from 'tap'

import { Config } from '../../config/index'
import { HttpVerb } from '../../types'

import * as metrics from './index'

//======================================================================================================================

tap.test('metrics', async (t) => {
	let response
	
	const random_key = `test-${Math.round(Math.random() * 999999)}`
	const random_val = Math.round(Math.random() * 100)
	const url = Config().services.express.url
	
	await t.test('setup', async (t) => {
		// clear the store before beginning the test
		metrics.deleteKey(random_key)
		// current count is 0
		t.equal(metrics.getSum(random_key), 0)
		
		t.end()
	})
	
	// test invalid input (in this case non-integer value)
	await t.test('invalid', async (t) => {
		t.throws(() => {
			metrics.postCount(random_key, 12.34)
		}, 'metrics.postCount: value must be an integer')
		
		response = await got(`${url}/metrics/${random_key}`, {
			method: HttpVerb.POST,
			json: { value: 12.34 },
			responseType: 'json',
			throwHttpErrors: false,
		})
		t.equal(response.statusCode, 400)
		t.match((response.body as any).error, "'value' should be integer")
		
		t.end()
	})
	
	// call methods locally
	await t.test('local', async (t) => {
		metrics.postCount(random_key, random_val)
		
		let sum = metrics.getSum(random_key)
		
		// current count is equal to random value
		t.equal(sum, random_val)
		
		t.end()
	})
	
	// call methods via api
	await t.test('api', async (t) => {
		await got(`${url}/metrics/${random_key}`, {
			method: HttpVerb.POST,
			json: { value: random_val },
		})
		
		response = await got(`${url}/metrics/${random_key}/sum`, {
			method: HttpVerb.GET,
			responseType: 'json',
		})
		let result = response.body as any
		
		// current count is equal to random value
		t.equal(result.key, random_key)
		t.equal(result.value, random_val)
		
		t.end()
	})
	
	t.end()
})
