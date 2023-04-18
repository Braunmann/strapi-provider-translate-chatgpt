'use strict';

export const getService = (name: string) => {
  // @ts-ignore
  return strapi.plugin('translate').service(name);
};
