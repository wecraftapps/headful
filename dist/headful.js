'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.default = headful;


var conf = {
    debug: false
};

var propertySetters = {
    html: function html(obj) {
        obj && Object.keys(obj).forEach(function (selector) {
            return setRootElementAttributes(selector, obj[selector]);
        });
    },
    head: function head(obj) {
        obj && Object.keys(obj).forEach(function (selector) {
            return setHeadElementAttributes(selector, obj[selector]);
        });
    },
    ogTitle: function ogTitle(val) {
        setMetaContent('property="og:title"', val);
    },
    ogDescription: function ogDescription(val) {
        setMetaContent('property="og:description"', val);
    },
    title: function title(val) {
        document.title = isRemoveValue(val) ? '' : val;
        setMetaContent('itemprop="name"', val);
        setMetaContent('name="twitter:title"', val);
    },
    description: function description(val) {
        setMetaContent('name="description"', val);
        setMetaContent('itemprop="description"', val);
        setMetaContent('name="twitter:description"', val);
    },
    keywords: function keywords(val) {
        setMetaContent('name="keywords"', Array.isArray(val) ? val.join(', ') : val);
    },
    image: function image(val) {
        setMetaContent('itemprop="image"', val);
        setMetaContent('property="og:image"', val);
        setMetaContent('name="twitter:image"', val);
    },
    lang: function lang(val, props) {
        setRootElementAttributes('html', { lang: val });
        noProp(props, this.ogLocale) && setOgLocaleIfValid(val);
    },
    ogLocale: function ogLocale(val) {
        setMetaContent('property="og:locale"', val);
    },
    url: function url(val) {
        setHeadElementAttributes('link[rel="canonical"]', { href: val });
        setMetaContent('property="og:url"', val);
        setMetaContent('name="twitter:url"', val);
    }
};

function headful(props, userConf) {
    Object.assign(conf, userConf);
    Object.keys(props).forEach(function (prop) {
        if (!propertySetters.hasOwnProperty(prop)) {
            throw new Error('Headful: Property \'' + prop + '\' is unknown.');
        }
        propertySetters[prop](props[prop], props);
    });
}

headful.props = propertySetters;

/**
 * Tests whether the given `props` object contains a property with the name of `propNameOrFunction`.
 */
function noProp(props, propNameOrFunction) {
    if (!props) {
        throw new Error('Headful: You must pass all declared props when you use headful.props.x() calls.');
    }
    var propName = typeof propNameOrFunction === 'function' ? propNameOrFunction.name : propNameOrFunction;
    return !props.hasOwnProperty(propName);
}

function setMetaContent(attr, val) {
    setHeadElementAttributes('meta[' + attr + ']', { content: val });
}

function setRootElementAttributes(selector, attributes) {
    setElementAttributes(getElement(document, selector), attributes);
}

function setHeadElementAttributes(selector, attributes) {
    setElementAttributes(getElement(document.head, selector), attributes);
}

function setElementAttributes(element, attributes) {
    if (element) {
        Object.keys(attributes).forEach(function (attrName) {
            if (isRemoveValue(attributes[attrName])) {
                element.removeAttribute(attrName);
            } else {
                element.setAttribute(attrName, attributes[attrName]);
            }
        });
    }
}

function getElement(parent, selector) {
    var element = parent.querySelector(selector);
    if (!element && conf.debug) {
        console.error('Headful: Element \'' + selector + '\' was not found.');
    }
    return element;
}

function setOgLocaleIfValid(locale) {
    if (isRemoveValue(locale)) {
        propertySetters.ogLocale(locale);
    } else if (locale.match(/^[a-z]{2}-[a-z]{2}$/i)) {
        var _locale$split = locale.split('-'),
            _locale$split2 = _slicedToArray(_locale$split, 2),
            language = _locale$split2[0],
            region = _locale$split2[1];

        var ogLocale = language + '_' + region.toUpperCase();
        propertySetters.ogLocale(ogLocale);
    }
}

function isRemoveValue(val) {
    return val === undefined || val === null;
}