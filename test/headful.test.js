import test from 'ava';
import headful from '../dist/headful';

const fs = require('fs');
const {JSDOM} = require('jsdom');


const html = fs.readFileSync(`${__dirname}/../demo/index.html`);
const dom = new JSDOM(html);

// make dom document available to Headful
// TODO Find another way as JSDOM advises against this approach: https://github.com/tmpvar/jsdom#executing-scripts
global.document = dom.window.document;


function getDocument() {
    return dom.window.document;
}

function getElementAttr(selector, attr) {
    try {
        return getDocument().querySelector(selector).attributes[attr].value;
    } catch (e) {
        return undefined; // no attribute with that name
    }
}

function getMetaContent(selector) {
    return getElementAttr(`meta[${selector}]`, 'content');
}


test('html', t => {
    headful({
        html: {
            body: {id: 'headful', class: 'headful'},
        },
    });
    t.is(getElementAttr('body', 'id'), 'headful');
    t.is(getElementAttr('body', 'class'), 'headful');
    headful({
        html: {
            body: {id: null, class: undefined},
        },
    });
    t.is(getElementAttr('body', 'id'), undefined);
    t.is(getElementAttr('body', 'class'), undefined);
});

test('head', t => {
    headful({
        head: {
            'meta[charset]': {charset: 'utf-8', 'data-test': 'headful'},
        },
    });
    t.is(getElementAttr('meta[charset]', 'charset'), 'utf-8');
    t.is(getElementAttr('meta[charset]', 'data-test'), 'headful');
    headful({
        head: {
            'meta[charset]': {charset: null, 'data-test': undefined},
        },
    });
    t.is(getElementAttr('meta[charset]', 'charset'), undefined);
    t.is(getElementAttr('meta[charset]', 'data-test'), undefined);
});

test('title', t => {
    headful({title: 'headful'});
    t.is(getDocument().title, 'headful');
    t.is(getMetaContent('itemprop="name"'), 'headful');
    t.is(getMetaContent('property="og:title"'), 'headful');
    t.is(getMetaContent('name="twitter:title"'), 'headful');
    headful({title: undefined});
    t.is(getDocument().title, '');
    t.is(getMetaContent('itemprop="name"'), undefined);
    t.is(getMetaContent('property="og:title"'), undefined);
    t.is(getMetaContent('name="twitter:title"'), undefined);
    headful({title: 'headful'});
    t.is(getDocument().title, 'headful');
    headful({title: null});
    t.is(getDocument().title, '');
    t.is(getMetaContent('itemprop="name"'), undefined);
    t.is(getMetaContent('property="og:title"'), undefined);
    t.is(getMetaContent('name="twitter:title"'), undefined);
});

test('description', t => {
    headful({description: 'headful'});
    t.is(getMetaContent('name="description"'), 'headful');
    t.is(getMetaContent('itemprop="description"'), 'headful');
    t.is(getMetaContent('property="og:description"'), 'headful');
    t.is(getMetaContent('name="twitter:description"'), 'headful');
});

test('keywords', t => {
    headful({keywords: 'head, ful'});
    t.is(getMetaContent('name="keywords"'), 'head, ful');
    headful({keywords: ['head', 'ful']});
    t.is(getMetaContent('name="keywords"'), 'head, ful');
});

test('image', t => {
    const imageUrl = 'http://example.com/preview.png';
    headful({image: imageUrl});
    t.is(getMetaContent('itemprop="image"'), imageUrl);
    t.is(getMetaContent('property="og:image"'), imageUrl);
    t.is(getMetaContent('name="twitter:image"'), imageUrl);
});

test('lang', t => {
    headful({lang: 'de-CH'});
    t.is(getElementAttr('html[lang]', 'lang'), 'de-CH');
    t.is(getMetaContent('property="og:locale"'), 'de_CH');
    headful({lang: 'de'});
    t.is(getElementAttr('html[lang]', 'lang'), 'de');
    t.is(getMetaContent('property="og:locale"'), 'de_CH');
    headful({lang: 'en-AU', ogLocale: 'en-GB'});
    t.is(getElementAttr('html[lang]', 'lang'), 'en-AU');
    t.is(getMetaContent('property="og:locale"'), 'en-GB');
    headful({lang: null});
    t.is(getElementAttr('html[lang]', 'lang'), undefined);
    t.is(getMetaContent('property="og:locale"'), undefined);
});

test('url', t => {
    const url = 'http://example.com/';
    headful({url: url});
    t.is(getElementAttr('link[rel="canonical"]', 'href'), url);
    t.is(getMetaContent('property="og:url"'), url);
    t.is(getMetaContent('name="twitter:url"'), url);
});
