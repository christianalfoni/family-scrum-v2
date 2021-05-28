import React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { GetStaticPropsContext } from "next";

const Button = ({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) => (
  <Link href={href}>
    <a className="bg-gray-200 p-8 m-4 rounded-md shadow-md text-2xl font-bold text-gray-800 w-80 text-center">
      {children}
    </a>
  </Link>
);

function HomePage() {
  const t = useTranslations("HomePage");

  return (
    <div className="bg-gray-100 h-screen w-screen flex items-center justify-center">
      <Button href="/overview">{t("overview")}</Button>
      <Button href="/app">{t("app")}</Button>
    </div>
  );
}

export function getStaticProps({ locale }: GetStaticPropsContext) {
  return {
    props: {
      // You can get the messages from anywhere you like, but the recommended
      // pattern is to put them in JSON files separated by language and read
      // the desired one based on the `locale` received from Next.js.
      messages: require(`../../messages/index/${locale}.json`),
    },
  };
}

export default HomePage;
