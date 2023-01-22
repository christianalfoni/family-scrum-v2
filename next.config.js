module.exports = {
  env: {
    SANDBOX: process.env.SANDBOX,
    VERSION: require("./package.json").version,
  },
  i18n: {
    locales: ["en", "no"],
    defaultLocale: "en",
  },
  async rewrites() {
    return [
      {
        source: "/__/auth/:path*",
        destination: "https://family-scrum-v2.firebaseapp.com/__/auth/:path*",
      },
    ];
  },
};
