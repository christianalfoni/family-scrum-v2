import { match } from "react-states";
import { useTranslations } from "next-intl";

/* This example requires Tailwind CSS v2.0+ */
import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  ExclamationCircleIcon,
  LockClosedIcon,
} from "@heroicons/react/outline";
import { useSession } from ".";

export const SignInModal = () => {
  const t = useTranslations("SignInModal");
  const [session, dispatch] = useSession();

  const open = match(session, {
    ERROR: () => true,
    SIGNED_OUT: () => true,
    NO_FAMILY: () => true,
    SIGNED_IN: () => false,
    VERIFYING_AUTHENTICATION: () => false,
    SIGNING_IN: () => false,
    CREATING_FAMILY: () => false,
    JOINING_FAMILY: () => false,
    UPDATING_VERSION: () => false,
  });

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        static
        className="fixed z-10 inset-0 overflow-y-auto"
        open={open}
        onClose={() => {}}
      >
        <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
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

          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div className="inline-block bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all  align-middle sm:max-w-sm sm:w-full sm:p-6">
              {match(session, {
                ERROR: ({ error }) => (
                  <div>
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                      <ExclamationCircleIcon
                        className="h-6 w-6 text-red-600"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="mt-3 text-center sm:mt-5">
                      <Dialog.Title
                        as="h3"
                        className="text-lg leading-6 font-medium text-gray-900"
                      >
                        {t("somethingWrong")}
                      </Dialog.Title>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">{error}</p>
                      </div>
                    </div>
                  </div>
                ),
                NO_FAMILY: () => (
                  <div className="mt-3 text-center sm:mt-5">
                    <Dialog.Title
                      as="h3"
                      className="text-lg leading-6 font-medium text-gray-900"
                    >
                      {t("noFamily")}
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500"></p>
                      {/* This is considered a bug workaround: https://github.com/tailwindlabs/headlessui/issues/265 */}
                      <button className="opacity-0" />
                    </div>
                  </div>
                ),
                SIGNED_OUT: ({ SIGN_IN }) => (
                  <>
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
                          {t("signInRequired")}
                        </Dialog.Title>
                        <div className="mt-2">
                          <p className="text-sm text-gray-500">
                            {t("accessExplanation")}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-5 sm:mt-6">
                      <button
                        type="button"
                        className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:text-sm"
                        onClick={() => dispatch(SIGN_IN())}
                      >
                        {t("loginWithGoogle")}
                      </button>
                    </div>
                  </>
                ),
                // Cm
                CREATING_FAMILY: () => null,
                JOINING_FAMILY: () => null,
                SIGNED_IN: () => null,
                SIGNING_IN: () => null,
                VERIFYING_AUTHENTICATION: () => null,
                UPDATING_VERSION: () => null,
              })}
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
};
