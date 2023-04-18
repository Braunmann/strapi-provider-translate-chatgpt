import { createTranslateClient } from './openai';
import { getService } from './getService';
import { parseLocale } from './parseLocale';

export const index = 'chatgpt';
export const name = 'ChatGPT';

interface IProviderOptions {
  apiKey?: string;
  model?: string;
  basePath?: string;
  localeMap?: object;
}

interface ITranslate {
  text: string;
  priority?: number;
  sourceLocale: string;
  targetLocale: string;
  format: 'markdown' | 'plain' | 'html';
}

export const init = (providerOptions: IProviderOptions = {}) => {
  const apiKey = providerOptions?.apiKey || process.env.OPENAI_API_KEY;
  const model = providerOptions?.model || process.env.OPENAI_MODEL;
  const basePath = providerOptions?.basePath || process.env.OPENAI_BASE_PATH;

  // const apiKey = process.env.DEEPL_API_KEY || providerOptions.apiKey;
  // const apiUrl = process.env.DEEPL_API_URL || providerOptions.apiUrl;
  const localeMap = typeof providerOptions?.localeMap === 'object' ? providerOptions.localeMap : {};
  // const apiOptions = typeof providerOptions.apiOptions === 'object' ? providerOptions.apiOptions : {};

  const client = createTranslateClient({ apiKey, model, basePath });

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

      const sLocale = parseLocale(sourceLocale, localeMap, 'source');
      const tLocale = parseLocale(targetLocale, localeMap, 'target');

      const result = await Promise.all(textArray.map((t) => client.translate(t, sLocale, tLocale)));

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
