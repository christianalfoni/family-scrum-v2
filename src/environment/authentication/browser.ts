import firebase from "firebase";
import { events } from "react-states";
import { Authentication, AuthenticationEvent } from ".";

const USER_DATA_COLLECTION = "userData";

export const createAuthentication = (app: firebase.app.App): Authentication => {
  const authenticationEvents = events<AuthenticationEvent>();

  app.auth().useDeviceLanguage();

  app.auth().onAuthStateChanged((user) => {
    if (user) {
      app
        .firestore()
        .collection(USER_DATA_COLLECTION)
        .doc(user.uid)
        .get()
        .then((userDataDoc) => {
          const userData = userDataDoc.data();

          authenticationEvents.emit(
            userData
              ? {
                  type: "AUTHENTICATION:AUTHENTICATED_WITH_FAMILY",
                  user: {
                    id: user.uid,
                    familyId: userData.familyId,
                  },
                }
              : {
                  type: "AUTHENTICATION:AUTHENTICATED",
                  user: {
                    id: user.uid,
                  },
                }
          );
        })
        .catch((error) => {
          authenticationEvents.emit({
            type: "AUTHENTICATION:ERROR",
            error: error.message,
          });
        });
    } else {
      authenticationEvents.emit({
        type: "AUTHENTICATION:UNAUTHENTICATED",
      });
    }
  });

  return {
    events: authenticationEvents,
    signIn() {
      const provider = new firebase.auth.GoogleAuthProvider();

      app
        .auth()
        .signInWithRedirect(provider)
        .catch((error) => {
          this.events.emit({
            type: "AUTHENTICATION:SIGN_IN_ERROR",
            error: error.message,
          });
        });
    },
  };
};
