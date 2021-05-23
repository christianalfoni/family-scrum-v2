import * as functions from "firebase-functions";

export const barcode = functions.https.onRequest((request, response) => {
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

  response.send({ ok: true });
});
