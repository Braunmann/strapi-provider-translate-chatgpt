import { Configuration, OpenAIApi } from 'openai';

class ChatGptTranslator {
  private _openAiClient: OpenAIApi | null;
  constructor(private readonly _options) {}

  private _getOpenAiClient() {
    if (!this._openAiClient) {
      const configuration = new Configuration(this._options);
      this._openAiClient = new OpenAIApi(configuration);
    }
    return this._openAiClient;
  }

  public async translate(text: string, srcLocale: string, targetLocale: string): Promise<string> {
    try {
      const prompt = `Translate this from ${srcLocale} in to ${targetLocale}:\n\n${text}`;
      const completion = await this._getOpenAiClient().createCompletion({
        model: this._options.model,
        prompt,
        temperature: 0.3,
        max_tokens: 100,
        top_p: 1.0,
        frequency_penalty: 0.0,
        presence_penalty: 0.0,
      });
      return completion.data.choices[0].text.trim();
    } catch (error) {
      if (error.response) {
        console.log(error.response.status);
        console.log(error.response.data);
      } else {
        console.log(error.message);
      }
    }
  }
  public async usage(): Promise<{}> {
    return {
      count: 1,
      limit: 10,
    };
  }
}

const createTranslateClient = ({ apiKey, model, basePath }) => {
  //TODO basePath.replace(/\/+$/, ""); remove last slash
  return new ChatGptTranslator({ apiKey, model, basePath });
};

export { createTranslateClient };
