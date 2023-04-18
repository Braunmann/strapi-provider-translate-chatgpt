import { Configuration, OpenAIApi } from 'openai';

interface OpenAIOptions {
  apiKey: string;
  model: string;
  basePath: string;
}

interface ITranslateOptions {
  maxTokens: number;
}

class ChatGptTranslator {
  private _openAiClient: OpenAIApi | null = null;
  constructor(private readonly _options: OpenAIOptions) {}

  private _getOpenAiClient(): OpenAIApi {
    if (!this._openAiClient) {
      const configuration = new Configuration(this._options);
      this._openAiClient = new OpenAIApi(configuration);
    }
    return this._openAiClient;
  }

  public async translate(
    text: string,
    srcLocale: string,
    targetLocale: string,
    options: ITranslateOptions,
  ): Promise<string> {
    try {
      const prompt = `Translate this from ${srcLocale} in to ${targetLocale}:\n\n${text}`;
      const {
        data: { choices },
      } = await this._getOpenAiClient().createCompletion({
        model: this._options.model,
        prompt,
        temperature: 0.3,
        max_tokens: options.maxTokens,
        top_p: 1.0,
        frequency_penalty: 0.0,
        presence_penalty: 0.0,
      });
      if (choices[0]) {
        return String(choices[0]?.text).trim();
      }
      throw new Error('No result received');
    } catch (error) {
      // @ts-ignore
      const status = error?.response?.status;

      switch (status) {
        case 429:
          throw new Error('Too many requests');
        case 400:
          throw new Error('Bad request');
        default:
          throw new Error(`translate(): ${JSON.stringify(error)}`);
      }
    }
  }
  public async usage(): Promise<{
    count: number;
    limit: number;
  }> {
    return {
      count: 1,
      limit: 10,
    };
  }
}

const createTranslateClient = ({ apiKey, model, basePath }: OpenAIOptions) => {
  // TODO basePath.replace(/\/+$/, ""); remove last slash
  return new ChatGptTranslator({ apiKey, model, basePath });
};

export { createTranslateClient };
