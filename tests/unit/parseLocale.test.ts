'use strict';

import locales from '@strapi/plugin-i18n/server/constants/iso-locales.json';
import { parseLocale } from '../../src/parseLocale';
import { itEach } from 'mocha-it-each';
import { expect } from 'chai';

function supportedLocale({ code, name }) {
  // Swiss German is not supported
  if (code.includes('gsw')) return false;
  return [
    'Bulgarian',
    'Czech',
    'Danish',
    'German',
    'Greek',
    'English',
    'Spanish',
    'Estonian',
    'Finnish',
    'French',
    'Hungarian',
    'Indonesian',
    'Italian',
    'Japanese',
    'Lithuanian',
    'Latvian',
    'Dutch',
    'Polish',
    'Portuguese',
    'Romanian',
    'Russian',
    'Slovak',
    'Slovenian',
    'Swedish',
    'Turkish',
    'Ukrainian',
    'Chinese',
    'Korean',
    'Norwegian Bokmål',
  ].some((l) => name.toLowerCase().includes(l.toLowerCase()));
}

const supportedLocales = locales.filter(supportedLocale);
const unSupportedLocales = locales.filter((l) => !supportedLocale(l));

describe('locale parser', () => {
  describe('succeeds', () => {
    itEach('for supported locale ${value.code}', supportedLocales, ({ code }) => {
      const result = parseLocale(code);
      expect(result).to.match(/^[A-Z]{2}(-[A-Z]{2})?$/);
    });
  });
  describe('fails', () => {
    itEach('for unsupported locale ${value.code}', unSupportedLocales, ({ code }) => {
      expect(() => parseLocale(code)).to.be.throw(`unsupported locale`);
    });
  });
  it('uses locale mapping', () => {
    const localeMap = {
      EN: 'EN-GB',
    };
    expect(parseLocale('en', localeMap)).to.equal('EN-GB');
  });
  it('does not parse en to EN as that is deprecated', () => {
    expect(parseLocale('en')).not.to.equal('EN');
  });
  it('does not parse pt to PT as that is deprecated', () => {
    expect(parseLocale('pt')).not.to.equal('PT');
  });
  it('source language is parsed without specific locale', () => {
    expect(parseLocale('en-GB', {}, 'source')).to.equal('EN');
  });
  it('source language is parsed without specific locale even with locale map', () => {
    expect(parseLocale('en-GB', {}, 'source')).to.equal('EN');
  });
});
