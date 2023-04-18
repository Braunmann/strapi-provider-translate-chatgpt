'use strict';
import { expect } from 'chai';
import { rest } from 'msw';

import * as provider from '../../src';
import { getServer } from '../../__mocks__/server';
import { translateHandler, usageHandler } from '../../__mocks__/openai';

const apiKey = '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';
const model = 'text-davinci-003';
const basePath = 'https://api.openai.com/v1';

describe('ChatGPT provider', () => {
  let chatGptProvider, server;

  before(() => {
    chatGptProvider = provider.init({
      apiKey,
      model,
      basePath,
    });
  });

  before(() => {
    server = getServer();

    Object.defineProperty(global, 'strapi', {
      value: require('../../__mocks__/initStrapi')({}),
      writable: true,
    });
  });

  beforeEach(() => {
    server.use(rest.post(`${basePath}/completions`, translateHandler));
  });

  afterEach(async () => {
    server.resetHandlers();
  });

  after(async () => {
    server.close();
  });

  describe('translate()', () => {
    describe('succeeds', () => {
      it('with single text', async () => {
        // given
        const params = {
          sourceLocale: 'en',
          targetLocale: 'de',
          text: 'Some text',
        };
        // when
        const result = await chatGptProvider.translate(params);

        // then
        expect(result).to.eql([params.text]);
      });

      it('with multiple texts', async () => {
        // given
        const params = {
          sourceLocale: 'en',
          targetLocale: 'de',
          text: ['Some text', 'Some more text', 'Even more text'],
        };
        // when
        const result = await chatGptProvider.translate(params);

        // then
        expect(result).to.eql(params.text);
      });

      it('with missing text', async () => {
        // given
        const params = {
          sourceLocale: 'en',
          targetLocale: 'de',
        };
        // when
        const result = await chatGptProvider.translate(params);

        // then
        expect(result).to.be.an('array').that.is.empty;
      });

      it('with markdown texts', async () => {
        // given
        const params = {
          sourceLocale: 'en',
          targetLocale: 'de',
          text: ['# Heading\n\nSome text', '## Subheading\n\nSome more text'],
          format: 'markdown',
        };
        // when
        const result = await chatGptProvider.translate(params);

        // then
        expect(result).to.eql(params.text);
      });
    });

    // TODO rate limiter
    // it('with more than 50 texts', async () => {
    //   // given
    //   const textsQty = 120;
    //   const params = {
    //     sourceLocale: 'en',
    //     targetLocale: 'de',
    //     text: Array.from({ length: textsQty }, (_v, i) => `text ${i}`),
    //   };
    //   // when
    //   const result = await chatGptProvider.translate(params);
    //
    //   // then
    //   expect(result).to.eql(params.text);
    // });

    // TODO text size limiter
    // it('with all fields together more than request size limit', async () => {
    //   // given
    //   const textLength = 40;
    //   const params = {
    //     sourceLocale: 'en',
    //     targetLocale: 'de',
    //     text: faker.helpers.uniqueArray(() => faker.lorem.paragraphs(20), textLength),
    //   };
    //   // when
    //   const result = await deeplProvider.translate(params);
    //
    //   // then
    //   expect(result).toEqual(params.text);
    // });
    //
    // it('with a field larger than request size limit', async () => {
    //   // given
    //   const params = {
    //     sourceLocale: 'en',
    //     targetLocale: 'de',
    //     text: [faker.lorem.paragraphs(DEEPL_API_MAX_REQUEST_SIZE / 200)],
    //   };
    //   // when
    //   const result = await deeplProvider.translate(params);
    //
    //   // then
    //   expect(result).toEqual(params.text);
    // });
    //
    // it('with some fields larger than request size limit', async () => {
    //   // given
    //   const textLength = 20;
    //   const params = {
    //     sourceLocale: 'en',
    //     targetLocale: 'de',
    //     text: faker.helpers.uniqueArray(
    //       () =>
    //         faker.lorem.paragraphs(
    //           faker.datatype.number({
    //             min: DEEPL_API_MAX_REQUEST_SIZE / 2000,
    //             max: DEEPL_API_MAX_REQUEST_SIZE / 200,
    //           }),
    //         ),
    //       textLength,
    //     ),
    //   };
    //   // when
    //   const result = await deeplProvider.translate(params);
    //
    //   // then
    //   expect(result).toEqual(params.text);
    // });

    describe('fails', () => {
      // it('with invalid key', async () => {
      //   // given
      //   const params = {
      //     sourceLocale: 'en',
      //     targetLocale: 'de',
      //     text: 'Some text',
      //   };
      //
      //   // when, then
      //   await expect(chatGptProvider.translate(params)).to.be.rejectedWith(`Authorization failure`);
      // });

      it('with missing target language', async () => {
        // given
        const params = {
          text: 'Some text',
          sourceLocale: 'en',
        };

        // when, then
        await expect(chatGptProvider.translate(params)).to.be.rejectedWith(`target locale must be defined`);
      });

      it('with missing source language', async () => {
        // given
        const params = {
          text: 'Some text',
          targetLocale: 'de',
        };

        // when, then
        await expect(chatGptProvider.translate(params)).to.be.rejectedWith(`source locale must be defined`);
      });

      it('too many requests', async () => {
        // given
        const params = {
          text: 'too many requests',
          targetLocale: 'de',
          sourceLocale: 'en',
        };

        // when, then
        await expect(chatGptProvider.translate(params)).to.be.rejectedWith(`Too many requests`);
      });
    });
  });

  describe('usage()', () => {
    beforeEach(() => {
      server.use(rest.post(`${basePath}/usage`, usageHandler));
    });

    describe('succeeds', () => {
      it('with valid key', async () => {
        // when
        const result = await chatGptProvider.usage();

        // then
        expect(result).to.eql({
          count: 1,
          limit: 10,
        });
      });
    });

    // describe('fails', () => {
    //   it('with invalid key', async () => {
    //     // when, then
    //     await expect(chatGptProvider.usage()).to.be.rejectedWith(`Authorization failure`);
    //   });
    // });
  });
  //
  // describe('setup', () => {
  //   beforeEach(() => {
  //     server.use(
  //       rest.post(`${DEEPL_FREE_API}/usage`, usageHandler),
  //       rest.post(`${DEEPL_PAID_API}/usage`, usageHandler),
  //       rest.post(`${deeplTestApi}/v2/usage`, usageHandler),
  //     );
  //   });
  //   describe('provider options', () => {
  //     it('key used', async () => {
  //       const deeplProvider = provider.init({
  //         apiKey: authKey,
  //       });
  //
  //       await expect(deeplProvider.usage()).resolves.toBeTruthy();
  //     });
  //
  //     it('URL used', async () => {
  //       const deeplProvider = provider.init({
  //         apiKey: `${authKey}:test`,
  //         apiUrl: deeplTestApi,
  //       });
  //
  //       await expect(deeplProvider.usage()).resolves.toBeTruthy();
  //     });
  //
  //     describe('api options used', () => {
  //       const registerHandlerEnforceParams = (requiredParams, forbiddenParams = []) => {
  //         const handler = async (req, res, ctx) => {
  //           const body = await req.text();
  //           const params = new URLSearchParams(body);
  //
  //           for (const key of forbiddenParams) {
  //             if (params.has(key)) {
  //               res.networkError(`Server should not have received param ${key}`);
  //             }
  //           }
  //           for (const key of Object.keys(requiredParams)) {
  //             if (!params.has(key)) {
  //               res.networkError(`Server did not receive required param ${key}`);
  //             } else if (params.get(key) !== requiredParams[key]) {
  //               res.networkError(
  //                 `Required param ${key}=${requiredParams[key]} did not match received ${key}=${params.get(key)}`,
  //               );
  //             }
  //           }
  //
  //           // skip authentication and validation
  //           let text = params.getAll('text');
  //           return res(
  //             ctx.json({
  //               translations: text.map((t) => ({
  //                 detected_source_language: 'EN',
  //                 text: t,
  //               })),
  //             }),
  //           );
  //         };
  //         server.use(rest.post(`${DEEPL_PAID_API}/translate`, handler));
  //       };
  //
  //       it('uses formality when provided', async () => {
  //         registerHandlerEnforceParams({ formality: 'prefer_less' });
  //
  //         const deeplProvider = provider.init({
  //           apiKey: authKey,
  //           apiOptions: { formality: 'prefer_less' },
  //         });
  //
  //         // given
  //         const params = {
  //           sourceLocale: 'en',
  //           targetLocale: 'de',
  //           text: 'Some text',
  //         };
  //         // when
  //         const result = await deeplProvider.translate(params);
  //
  //         // then
  //         expect(result).toEqual([params.text]);
  //       });
  //
  //       it('does not use tagHandling even if provided', async () => {
  //         registerHandlerEnforceParams({}, ['tagHandling']);
  //
  //         const deeplProvider = provider.init({
  //           apiKey: authKey,
  //           apiOptions: { tagHandling: 'html' },
  //         });
  //
  //         // given
  //         const params = {
  //           sourceLocale: 'en',
  //           targetLocale: 'de',
  //           text: 'Some text',
  //         };
  //         // when
  //         const result = await deeplProvider.translate(params);
  //
  //         // then
  //         expect(result).toEqual([params.text]);
  //       });
  //     });
  //   });
  //
  //   describe('environment variables', () => {
  //     afterEach(() => {
  //       delete process.env.DEEPL_API_KEY;
  //       delete process.env.DEEPL_API_URL;
  //     });
  //
  //     it('env var key used', async () => {
  //       process.env.DEEPL_API_KEY = authKey;
  //       const deeplProvider = provider.init({});
  //
  //       await expect(deeplProvider.usage()).resolves.toBeTruthy();
  //     });
  //
  //     it('env var URL used', async () => {
  //       process.env.DEEPL_API_URL = deeplTestApi;
  //       const deeplProvider = provider.init({
  //         apiKey: `${authKey}:test`,
  //       });
  //
  //       await expect(deeplProvider.usage()).resolves.toBeTruthy();
  //     });
  //   });
  // });
});
