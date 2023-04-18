'use strict';

module.exports = ({ plugins = {} }) => {
  const mock = {
    plugin(name: string): string {
      return this.plugins[name];
    },
    getRef() {
      return this;
    },
    plugins: {
      ...plugins,
      translate: {
        service(name: string) {
          return this.services[name]({ strapi: mock.getRef() });
        },
        controller(name: string) {
          return this.controllers[name]({ strapi: mock.getRef() });
        },
        services: {
          chunks: require('strapi-plugin-translate/server/services/chunks'),
          format: require('strapi-plugin-translate/server/services/format'),
        },
      },
      'content-type-builder': {
        service(name: string) {
          return this.services[name];
        },
        services: {
          components: {
            // To make it easier here, the componentInfo is actually already in the correct format
            formatComponent(componentInfo) {
              return componentInfo;
            },
          },
          'content-types': {
            formatContentType(contentTypeInfo) {
              return contentTypeInfo;
            },
          },
        },
      },
    },
    service(uid: string) {
      const [handler, collection] = uid.split('::');
      if (handler === 'plugin') {
        const [plugin, service] = collection.split('.');
        return this.plugins[plugin].services[service]({
          strapi: mock.getRef(),
        });
      }
      return {
        findOne: (id: string | number, params: object) => this.entityService.findOne(uid, id, params),
        find: (params: object) => this.entityService.findMany(uid, params),
        create: (params: object) => this.entityService.create(uid, params),
        update: (id: string | number, params: object) => this.entityService.update(uid, id, params),
        delete: (id: string | number, params: object) => this.entityService.delete(uid, id, params),
      };
    },
    log: {
      // debug: jest.fn(),
      // info: jest.fn(),
      // warn: jest.fn(),
      // error: jest.fn(),
      //
      // debug: console.debug,
      // info: console.info,
      // warn: console.warn,
      // error: console.error,
    },
  };

  return mock;
};
