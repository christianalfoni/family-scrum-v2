module.exports = {
  env: {
    SANDBOX: process.env.SANDBOX,
    VERSION: require("./package.json").version,
  },
  i18n: {
    locales: ["en", "no"],
    defaultLocale: "en",
  },
};
