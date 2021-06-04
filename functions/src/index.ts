import * as functions from "firebase-functions";
import * as admin from 'firebase-admin'

admin.initializeApp(functions.config().firebase);

const BARCODE_TOKENS_COLLECTION = 'barcodeTokens'
const FAMILY_DATA_COLLECTION = 'familyData'
const FAMILY_BARCODES_COLLECTION = 'barcodes'

export const barcode = functions.region('europe-west1').https.onRequest((request, response) => {
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



  admin.firestore().collection(BARCODE_TOKENS_COLLECTION).doc(request.body.token)
    .get()
    .then((doc) => {
      const data = doc.data()
      if (!data) {
        throw new Error("Token does not exist")
      }

      return data.familyId
    })
    .then((familyId) => {
      return admin.firestore().collection(FAMILY_DATA_COLLECTION).doc(familyId).collection(FAMILY_BARCODES_COLLECTION)
        .add({
          created: admin.firestore.FieldValue.serverTimestamp(),
          modified: admin.firestore.FieldValue.serverTimestamp(),
          groceryId: null
        })
    })
    .then(() => {
      response.send({ ok: true });
    })
    .catch((error) => {
      response.status(500).send({
        error: error.message
      })
    })
});
