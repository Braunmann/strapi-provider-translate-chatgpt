'use strict';

export const getService = (name: string) => {
  return strapi.plugin('translate').service(name);
};
