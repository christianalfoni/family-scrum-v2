import dynamic from "next/dynamic";
import { DevtoolsProvider } from "react-states/devtools";
import Head from "next/head";
import { Session } from "./Session";

const DynamicEnvironment = dynamic(() =>
  process.browser
    ? process.env.SANDBOX
      ? import("./SandboxEnvironment")
      : import("./BrowserEnvironment")
    : import("./NextEnvironment")
);

type Props = {
  children: React.ReactNode;
};

export const PageContainer = ({ children }: Props) => {
  return (
    <DynamicEnvironment>
      <div>
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
        {process.env.NODE_ENV === "production" ? (
          <Session>{children}</Session>
        ) : (
          <DevtoolsProvider>
            <Session>{children}</Session>
          </DevtoolsProvider>
        )}
      </div>
    </DynamicEnvironment>
  );
};
