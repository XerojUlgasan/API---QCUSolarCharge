var admin = require("firebase-admin");

var serviceAccount = require("../../serviceAccount.json");
const { getFirestore } = require("firebase-admin/firestore");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const admin_db = getFirestore();

module.exports = {admin_db}