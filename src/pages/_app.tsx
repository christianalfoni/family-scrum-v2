import { AppProps } from "next/app";
import { NextIntlProvider } from "next-intl";
import "tailwindcss/tailwind.css";
import "swiper/swiper.scss";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <NextIntlProvider messages={pageProps.messages}>
      <Component {...pageProps} />
    </NextIntlProvider>
  );
}

export default MyApp;
