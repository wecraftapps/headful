export default headful;

const conf = {
    debug: false,
};

const propertySetters = {
    html(obj) {
        obj && Object.keys(obj).forEach(selector => setRootElementAttributes(selector, obj[selector]));
    },
    head(obj) {
        obj && Object.keys(obj).forEach(selector => setHeadElementAttributes(selector, obj[selector]));
    },
    ogTitle(val) {
        setMetaContent('property="og:title"', val);
    },
    ogDescription(val) {
        setMetaContent('property="og:description"', val);
    },
    title(val) {
        document.title = isRemoveValue(val) ? '' : val;
        setMetaContent('itemprop="name"', val);
        setMetaContent('name="twitter:title"', val);
    },
    description(val) {
        setMetaContent('name="description"', val);
        setMetaContent('itemprop="description"', val);
        setMetaContent('name="twitter:description"', val);
    },
    keywords(val) {
        setMetaContent('name="keywords"', Array.isArray(val) ? val.join(', ') : val);
    },
    image(val) {
        setMetaContent('itemprop="image"', val);
        setMetaContent('property="og:image"', val);
        setMetaContent('name="twitter:image"', val);
    },
    lang(val, props) {
        setRootElementAttributes('html', {lang: val});
        noProp(props, this.ogLocale) && setOgLocaleIfValid(val);
    },
    ogLocale(val) {
        setMetaContent('property="og:locale"', val);
    },
    url(val) {
        setHeadElementAttributes('link[rel="canonical"]', {href: val});
        setMetaContent('property="og:url"', val);
        setMetaContent('name="twitter:url"', val);
    },
};

function headful(props, userConf) {
    Object.assign(conf, userConf);
    Object.keys(props).forEach(prop => {
        if (!propertySetters.hasOwnProperty(prop)) {
            throw new Error(`Headful: Property '${prop}' is unknown.`);
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
    const propName = typeof propNameOrFunction === 'function' ? propNameOrFunction.name : propNameOrFunction;
    return !props.hasOwnProperty(propName);
}

function setMetaContent(attr, val) {
    setHeadElementAttributes(`meta[${attr}]`, {content: val});
}

function setRootElementAttributes(selector, attributes) {
    setElementAttributes(getElement(document, selector), attributes);
}

function setHeadElementAttributes(selector, attributes) {
    setElementAttributes(getElement(document.head, selector), attributes);
}

function setElementAttributes(element, attributes) {
    if (element) {
        Object.keys(attributes).forEach(attrName => {
            if (isRemoveValue(attributes[attrName])) {
                element.removeAttribute(attrName);
            } else {
                element.setAttribute(attrName, attributes[attrName]);
            }
        });
    }
}

function getElement(parent, selector) {
    const element = parent.querySelector(selector);
    if (!element && conf.debug) {
        console.error(`Headful: Element '${selector}' was not found.`);
    }
    return element;
}

function setOgLocaleIfValid(locale) {
    if (isRemoveValue(locale)) {
        propertySetters.ogLocale(locale);
    } else if (locale.match(/^[a-z]{2}-[a-z]{2}$/i)) {
        const [language, region] = locale.split('-');
        const ogLocale = `${language}_${region.toUpperCase()}`;
        propertySetters.ogLocale(ogLocale);
    }
}

function isRemoveValue(val) {
    return val === undefined || val === null;
}
