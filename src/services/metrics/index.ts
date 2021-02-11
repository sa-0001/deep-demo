import _ from 'lodash'
import expireArray from 'expire-array'

//======================================================================================================================

interface DataStore {
	[key:string]: ExpireArray
}
interface ExpireArray {
	push (v : number)
	all (): Array<number>
}

const store : DataStore = {}

//------------------------------------------------------------------------------

export const deleteKey = (key : string) => {
	delete store[key]
	return
}

export const getSum = (key : string) : number => {
	if (!store[key]) {
		return 0
	}
	
	let items = store[key].all()
	if (items.length === 0) {
		return 0
	}
	
	return _.sum(items)
}

export const postCount = (key : string, value : number) => {
	if (!_.isInteger(value)) {
		throw Error('metrics.postCount: value must be an integer')
	}
	
	// array whose items expire after 1 hour
	store[key] ??= expireArray(1000 * 60 * 60)
	
	store[key].push(value)
	return
}
