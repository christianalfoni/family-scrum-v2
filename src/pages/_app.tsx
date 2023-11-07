import { AppProps } from "next/app";
import { NextIntlProvider } from "next-intl";
import "tailwindcss/tailwind.css";
import "swiper/swiper.scss";
import "../global.css";
import Head from "next/head";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <NextIntlProvider messages={pageProps.messages}>
      <Head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
        <link rel="apple-touch-icon" href="/family_128.jpeg" />
        <link rel="apple-touch-icon" sizes="152x152" href="family_152.jpeg" />
        <link rel="apple-touch-icon" sizes="180x180" href="family_180.jpeg" />
        <link rel="apple-touch-icon" sizes="167x167" href="family_167.jpeg" />
      </Head>
      <Component {...pageProps} />
    </NextIntlProvider>
  );
}

export default MyApp;
