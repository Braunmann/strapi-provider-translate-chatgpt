import { createTranslateClient } from './openai';
import { getService } from './getService';
import { parseLocale } from './parseLocale';
import Bottleneck from 'bottleneck';

export const index = 'chatgpt';
export const name = 'ChatGPT';

interface IProviderOptions {
  apiKey?: string;
  model?: string;
  basePath?: string;
  localeMap?: object;
  maxTokens?: number;
}

interface ITranslate {
  text: string;
  priority?: number;
  sourceLocale: string;
  targetLocale: string;
  format: 'markdown' | 'plain' | 'html';
}

export interface IProvider {
  translate(options: ITranslate): Promise<string[]>;
  usage(): Promise<{
    count: number;
    limit: number;
  }>;
}

class ProviderOptions {
  readonly apiKey: string;
  readonly model: string;
  readonly basePath: string;
  readonly localeMap: object;
  readonly maxTokens: number;

  constructor({ apiKey, model, basePath, localeMap, maxTokens }: IProviderOptions) {
    if (!apiKey) throw new Error(`apiKey is not defined`);
    if (!model) throw new Error(`model is not defined`);
    if (!basePath) throw new Error(`basePath is not defined`);
    this.localeMap = localeMap || {};
    this.maxTokens = maxTokens || 1000;

    this.apiKey = apiKey;
    this.model = model;
    this.basePath = basePath;
  }
}

export const init = ({ apiKey, model, basePath, localeMap, maxTokens }: IProviderOptions = {}): IProvider => {
  const options = new ProviderOptions({
    apiKey: apiKey || process.env.OPENAI_API_KEY,
    model: model || process.env.OPENAI_MODEL || 'text-davinci-003',
    basePath: basePath || process.env.OPENAI_BASE_PATH || 'https://api.openai.com/v1',
    maxTokens: Number(maxTokens) || Number(process.env.OPENAI_MAX_TOKENS) || 1000,
    localeMap,
  });
  const client = createTranslateClient(options);

  const limiter = new Bottleneck({
    maxConcurrent: 1,
  });

  return {
    /**
     * @param {{
     *  text:string|string[],
     *  sourceLocale: string,
     *  targetLocale: string,
     *  priority: number,
     *  format?: 'plain'|'markdown'|'html'
     * }} options all translate options
     * @returns {string[]} the input text(s) translated
     */
    async translate({ text, priority, sourceLocale, targetLocale, format }: ITranslate): Promise<string[]> {
      if (!text) {
        return [];
      }

      if (!sourceLocale) {
        throw new Error('source locale must be defined');
      }

      if (!targetLocale) {
        throw new Error('target locale must be defined');
      }

      const formatService = getService('format');

      let textArray = Array.isArray(text) ? text : [text];

      if (format === 'markdown') {
        textArray = formatService.markdownToHtml(textArray);
      }

      const sLocale = parseLocale(sourceLocale, options.localeMap, 'source');
      const tLocale = parseLocale(targetLocale, options.localeMap, 'target');

      const result = await Promise.all(
        textArray.map((t) =>
          limiter.schedule(() => {
            return client.translate(t, sLocale, tLocale, { maxTokens: options.maxTokens });
          }),
        ),
      );

      if (format === 'markdown') {
        return formatService.htmlToMarkdown(result);
      }

      return result;
    },
    async usage(): Promise<{
      count: number;
      limit: number;
    }> {
      return client.usage();
    },
  };
};
