const translateHandler = async (req, res, ctx) => {
  const body = await req.json();

  // TODO mock no model
  // console.log(body);

  // OK
  const text = body.prompt.replace('Translate this from EN in to DE:\n\n', '').trim();
  return res(
    ctx.json({
      id: 'mock-1',
      object: 'text_completion',
      created: Math.floor(Date.now() / 1000),
      model: body.model,
      choices: [
        {
          text,
          index: 0,
          logprobs: null,
          finish_reason: 'stop',
        },
      ],
      usage: { prompt_tokens: 14, completion_tokens: 10, total_tokens: 24 },
    }),
  );
  //
  // // if (stringByteLength(body || '') > DEEPL_API_MAX_REQUEST_SIZE) {
  // //   console.log({ length: stringByteLength(body || '') });
  // //   return res(ctx.status(413));
  // // }
  // //if (isAuthenticated(req)) {
  // if (1) {
  //   let text = params.getAll('text');
  //   if (text.length == 0) {
  //     return res(ctx.status(400));
  //   }
  //   if (text.length > 50) {
  //     return res(ctx.status(413));
  //   }
  //   let targetLang = params.get('target_lang');
  //   if (!targetLang) {
  //     return res(ctx.status(400));
  //   }
  //   return res(
  //     ctx.json({
  //       translations: text.map((t) => ({
  //         detected_source_language: 'EN',
  //         text: t,
  //       })),
  //     }),
  //   );
  // }
  // return res(ctx.status(403));
};
const usageHandler = async (req, res, ctx) => {
  return res(
    ctx.json({
      character_count: 1,
      character_limit: 10,
    }),
  );
};
export { translateHandler, usageHandler };
