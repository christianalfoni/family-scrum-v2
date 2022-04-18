import firebase from "firebase/app";
import { Emit } from "react-states";
import {
  Authentication,
  AuthenticationEvent,
} from "../../environment-interface/authentication";

const USER_DATA_COLLECTION = "userData";

export const createAuthentication = (
  emit: Emit<AuthenticationEvent>,
  app: firebase.app.App
): Authentication => {
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

          emit(
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
          emit({
            type: "AUTHENTICATION:ERROR",
            error: error.message,
          });
        });
    } else {
      emit({
        type: "AUTHENTICATION:UNAUTHENTICATED",
      });
    }
  });

  return {
    signIn() {
      const provider = new firebase.auth.GoogleAuthProvider();

      app
        .auth()
        .signInWithRedirect(provider)
        .catch((error) => {
          emit({
            type: "AUTHENTICATION:SIGN_IN_ERROR",
            error: error.message,
          });
        });
    },
  };
};
