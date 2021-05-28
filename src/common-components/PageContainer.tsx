import { match } from "react-states";
import dynamic from "next/dynamic";
import { DevtoolsProvider } from "react-states/devtools";
import Head from "next/head";

/* This example requires Tailwind CSS v2.0+ */
import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { LockClosedIcon } from "@heroicons/react/outline";
import { useSession, SessionFeature } from "../features/SessionFeature";

const DynamicEnvironment = dynamic(() =>
  process.browser ? import("./SandboxEnvironment") : import("./NextEnvironment")
);

const SignInModal = ({
  open,
  onClick,
}: {
  open: boolean;
  onClick: () => void;
}) => (
  <Transition.Root show={open} as={Fragment}>
    <Dialog
      as="div"
      static
      className="fixed z-10 inset-0 overflow-y-auto"
      open={open}
      onClose={() => {}}
    >
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        {/* This element is to trick the browser into centering the modal contents. */}
        <span
          className="hidden sm:inline-block sm:align-middle sm:h-screen"
          aria-hidden="true"
        >
          &#8203;
        </span>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          enterTo="opacity-100 translate-y-0 sm:scale-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100 translate-y-0 sm:scale-100"
          leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
        >
          <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-sm sm:w-full sm:p-6">
            <div>
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <LockClosedIcon
                  className="h-6 w-6 text-red-600"
                  aria-hidden="true"
                />
              </div>
              <div className="mt-3 text-center sm:mt-5">
                <Dialog.Title
                  as="h3"
                  className="text-lg leading-6 font-medium text-gray-900"
                >
                  Sign in required
                </Dialog.Title>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    To access your family data you have to sign in with Google
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-5 sm:mt-6">
              <button
                type="button"
                className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:text-sm"
                onClick={() => onClick()}
              >
                Sign in with Google
              </button>
            </div>
          </div>
        </Transition.Child>
      </div>
    </Dialog>
  </Transition.Root>
);

type Props = {
  children: React.ReactNode;
};

const Auth = () => {
  const [session, send] = useSession();

  const signInModal = (
    <SignInModal
      onClick={() => {
        send({ type: "SIGN_IN" });
      }}
      open={match(session, {
        ERROR: () => true,
        SIGNED_OUT: () => true,
        SIGNED_IN: () => false,
        VERIFYING_AUTHENTICATION: () => false,
        SIGNING_IN: () => false,
      })}
    />
  );

  return signInModal;
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
        </Head>
        {process.env.NODE_ENV === "production" ? (
          <SessionFeature>
            {children}
            <Auth />
          </SessionFeature>
        ) : (
          <DevtoolsProvider>
            <SessionFeature>
              {children}
              <Auth />
            </SessionFeature>
          </DevtoolsProvider>
        )}
      </div>
    </DynamicEnvironment>
  );
};
