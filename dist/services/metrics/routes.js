import { HttpVerb } from '../../types';
import * as metrics from './index';
export default new Array({
    summary: 'get sum of a metric',
    description: 'get the sum of all values of a metrics key (including only values from the last hour)',
    tags: ['Metrics'],
    verb: HttpVerb.GET,
    route: '/metrics/:key/sum',
    inputSchema: {
        key: { type: 'string' },
    },
    outputSchema: {
        key: { type: 'string' },
        value: { type: 'integer', minimum: 0 },
    },
    handler: (input) => {
        let value = metrics.getSum(input.key);
        return { key: input.key, value };
    },
}, {
    summary: 'increment a metric',
    description: 'add a value to a metrics key',
    tags: ['Metrics'],
    verb: HttpVerb.POST,
    route: '/metrics/:key',
    inputSchema: {
        key: { type: 'string' },
        value: { type: 'integer', minimum: 1 },
    },
    handler: (input) => {
        metrics.postCount(input.key, input.value);
        return;
    },
});
