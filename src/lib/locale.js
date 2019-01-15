/**
 * The default language
 *
 * @type {string}
 */
var defaultLang_ = 'en';

var dictionaries_ = {
    'en': {
        '__name': 'English'
    }
};

var dictionary_ = dictionaries_[defaultLang_];

const setDictionary = (lang, dict) => {
    dictionaries_[lang] = dict;
};

/**
 * Change the active dictionary
 *
 * @param {string} lang Language code.
 */
const setLanguage = (lang) => {
    dictionary_ = dictionaries_[lang];
};


/**
 * Return translation of the given text
 *
 * Look for a translation from goog.require()'d scripts.
 * Replace the variables inside the translation.
 * Return the same text if no translation found.
 *
 * Pass in variables as integers inside curly brackets.
 * {0} will be replaced by first argument and so on.
 *
 * @param  {string}    text    Text to be translated.
 * @param  {...*}      args    Translation arguments.
 * @return {string}    Localized string.
 */
const getLocalizedString = (text, ...args) => {
    var translation = dictionary_[text] || text;

    return translation.replace(/{(\d+)}/g, (match, number) => {
        return typeof args[number] != 'undefined' ? args[number] : match;
    });
};

export default {
    /**
     * @export
     */
    setDictionary,

    /**
     * @export
     */
    setLanguage,

    /**
     * @export
     */
    getLocalizedString,

    /**
     * @export
     */
    __: getLocalizedString
};
