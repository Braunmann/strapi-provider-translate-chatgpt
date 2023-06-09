'use strict';

import { setupServer } from 'msw/node';
import { rest } from 'msw';

function createJsonEndpoint(path, response) {
  return rest.get(path, (request, restResponse, context) =>
    restResponse(context.status(200), context.json(response(request))),
  );
}

function createQueryJsonEndpoint(path, queryResponseMap) {
  return rest.get(path, (request, restResponse, context) => {
    const response = queryResponseMap[request.url.search];
    if (!response) {
      // @ts-ignore
      console.warn(`API call ${request.url.toString()} doesn't have a query handler.`);
      return restResponse(context.status(404));
    }

    return restResponse(context.status(200), context.json(response));
  });
}

function createTextEndpoint(path, response) {
  return rest.get(path, (_request, restResponse, context) => restResponse(context.status(200), context.text(response)));
}

const notFoundByDefault = rest.get(/.*/, (request, response, context) => {
  console.warn(`API call ${request.url.toString()} doesn't have a query handler.`);
  response(context.status(404));
});

function getServer(...handlers) {
  const server = setupServer(...handlers, notFoundByDefault);
  server.listen();
  return server;
}

export { createJsonEndpoint, createQueryJsonEndpoint, createTextEndpoint, getServer };
