module.exports = {
  i18n: {
    defaultLocale: 'ar',
    locales: ['ar', 'en'],
  },
  //arabic is default language anf english is secondary language   we can  make it dynamic later to japanese or any other language
  localePath: typeof window === 'undefined' ? require('path').resolve('./public/locales') : '/locales',
}