import _ from 'lodash';
import expireArray from 'expire-array';
const store = {};
//------------------------------------------------------------------------------
export const deleteKey = (key) => {
    delete store[key];
    return;
};
export const getSum = (key) => {
    if (!store[key]) {
        return 0;
    }
    let items = store[key].all();
    if (items.length === 0) {
        return 0;
    }
    return _.sum(items);
};
export const postCount = (key, value) => {
    var _a;
    if (!_.isInteger(value)) {
        throw Error('metrics.postCount: value must be an integer');
    }
    // array whose items expire after 1 hour
    (_a = store[key]) !== null && _a !== void 0 ? _a : (store[key] = expireArray(1000 * 60 * 60));
    store[key].push(value);
    return;
};
