import _ from 'lodash';
import ejs from 'ejs';
import { ensureDirAsync, readFileAsync, writeFileAsync } from 'fs-extra-promise';
import { Config, Root } from '../config/index';
//======================================================================================================================
export const generateSwagger = async (services) => {
    // get redoc/swagger templates
    let htmlTemplate = await readFileAsync(`${Root()}dist/build/swagger-template.html`, 'utf8');
    let jsonTemplate = JSON.parse(await readFileAsync(`${Root()}dist/build/swagger-template.json`, 'utf8'));
    htmlTemplate = ejs.render(htmlTemplate, {
        config: Config(),
    });
    jsonTemplate.info.contact.email = Config().info.contact;
    jsonTemplate.info.description = Config().info.description;
    jsonTemplate.info.title = Config().info.name;
    jsonTemplate.info.version = Config().info.version;
    jsonTemplate.host = `${Config().services.express.host}${Config().services.express.port ? ':' + Config().services.express.port : ''}`;
    jsonTemplate.basePath = Config().services.express.prefix || '/';
    // iterate all routes
    services.forEach((service) => {
        service.forEach((routeHandler) => {
            var _a;
            var _b, _c;
            let route = JSON.parse(JSON.stringify(jsonTemplate.paths['/dummy'].post));
            route.summary = routeHandler.summary;
            route.description = routeHandler.description;
            route.tags = routeHandler.tags;
            route.tags.forEach((tag) => {
                let tagGroup = _.find(jsonTemplate['x-tagGroups'], { name: tag });
                if (!tagGroup) {
                    jsonTemplate['x-tagGroups'].push({
                        name: tag,
                        tags: [tag],
                    });
                }
            });
            if (routeHandler.inputSchema) {
                route.parameters[0].schema.properties = routeHandler.inputSchema;
            }
            if (routeHandler.outputSchema) {
                route.responses['2XX'].schema.properties = routeHandler.outputSchema;
            }
            (_a = (_b = jsonTemplate.paths)[_c = routeHandler.route]) !== null && _a !== void 0 ? _a : (_b[_c] = {});
            jsonTemplate.paths[routeHandler.route][routeHandler.verb.toLowerCase()] = route;
        });
    });
    delete jsonTemplate.paths['/dummy'];
    // write redoc/swagger files
    await ensureDirAsync(`${Root()}dist/doc/`);
    await writeFileAsync(`${Root()}dist/doc/index.json`, JSON.stringify(jsonTemplate, null, '\t'), 'utf8');
    await writeFileAsync(`${Root()}dist/doc/index.html`, htmlTemplate, 'utf8');
};
