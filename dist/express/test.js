#!/usr/bin/env node
import got from 'got';
import tap from 'tap';
import { Config } from '../config/index';
import { HttpVerb } from '../types';
//======================================================================================================================
tap.test('express', async (t) => {
    let response;
    const url = Config().services.express.url;
    await t.test('docs', async (t) => {
        response = await got(`${url}/doc/index.html`, {
            method: HttpVerb.GET,
        });
        t.equal(response.statusCode, 200);
        t.match(response.headers['content-type'], 'text/html');
        t.end();
    });
    await t.test('400', async (t) => {
        response = await got(`${url}/metrics/test-event`, {
            method: HttpVerb.POST,
            json: { dummy: true },
            responseType: 'json',
            throwHttpErrors: false,
        });
        t.equal(response.statusCode, 400);
        t.match(response.body.error, "should have required property 'value'");
        response = await got(`${url}/metrics/test-event`, {
            method: HttpVerb.POST,
            json: { value: 12.34 },
            responseType: 'json',
            throwHttpErrors: false,
        });
        t.equal(response.statusCode, 400);
        t.match(response.body.error, "'value' should be integer");
        t.end();
    });
    await t.test('404', async (t) => {
        response = await got(`${url}/dummy`, {
            method: HttpVerb.GET,
            responseType: 'json',
            throwHttpErrors: false,
        });
        t.equal(response.statusCode, 404);
        t.equal(response.body.error, 'GET /api/dummy not found');
        t.end();
    });
    // TODO: test methods which return other types of error
    t.end();
});
