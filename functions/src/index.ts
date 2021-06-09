import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp(functions.config().firebase);

const BARCODE_TOKENS_COLLECTION = "barcodeTokens";
const FAMILY_DATA_COLLECTION = "familyData";
const FAMILY_GROCERIES_COLLECTION = "groceries";
const FAMILY_BARCODES_COLLECTION = "barcodes";

export const barcode = functions
  .region("europe-west1")
  .https.onRequest((request, response) => {
    if (request.method !== "POST") {
      throw new Error("Invalid method");
    }

    if (!request.body.code) {
      throw new Error("Missing code in request");
    }

    if (!request.body.token) {
      throw new Error("Missing token in request");
    }

    functions.logger.info(
      `Got barcode ${request.body.code} for family ${request.body.token}`,
      { structuredData: true }
    );

    const barcode = request.body.code;
    const token = request.body.token;

    admin
      .firestore()
      .collection(BARCODE_TOKENS_COLLECTION)
      .doc(token)
      .get()
      .then((doc) => {
        const data = doc.data();

        if (!data) {
          throw new Error("Token does not exist");
        }

        return data.familyId;
      })
      .then((familyId) => {
        return admin
          .firestore()
          .collection(FAMILY_DATA_COLLECTION)
          .doc(familyId)
          .collection(FAMILY_BARCODES_COLLECTION)
          .doc(barcode)
          .get()
          .then((barcodeDoc) => {
            const data = barcodeDoc.data();

            // Scanned and linked to grocery
            if (data && data.groceryId) {
              const groceryRef = admin
                .firestore()
                .collection(FAMILY_DATA_COLLECTION)
                .doc(familyId)
                .collection(FAMILY_GROCERIES_COLLECTION)
                .doc(data.groceryId);

              return admin
                .firestore()
                .runTransaction((transaction) =>
                  transaction.get(groceryRef).then((groceryDoc) => {
                    const data = groceryDoc.data();

                    if (!data) {
                      throw new Error("Grocery does not exist");
                    }

                    return transaction.update(groceryRef, {
                      modified: admin.firestore.FieldValue.serverTimestamp(),
                      shopCount: data.shopCount + 1,
                    });
                  })
                )
                .then(() => {
                  return;
                });
            }

            // It has been scanned before, but not linked yet
            if (data) {
              throw new Error("Already added, but not linked");
            }

            // First scan
            return barcodeDoc.ref
              .set({
                created: admin.firestore.FieldValue.serverTimestamp(),
                modified: admin.firestore.FieldValue.serverTimestamp(),
                groceryId: null,
              })
              .then(() => {
                return;
              });
          });
      })
      .then(() => {
        response.send({ ok: true });
      })
      .catch((error) => {
        response.status(500).send({
          error: error.message,
        });
      });
  });
