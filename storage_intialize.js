const {initializeApp} = require("firebase/app")

const firebaseConfig = {
  apiKey: "AIzaSyCTcZH1ecF5z_6BvVowqXjnQCpJq7L6800",
  authDomain: "notebook-6b6ee.firebaseapp.com",
  projectId: "notebook-6b6ee",
  storageBucket: "notebook-6b6ee.appspot.com",
  messagingSenderId: "136330406573",
  appId: "1:136330406573:web:6961323c9e2d8d0062f424"
};

const app = initializeApp(firebaseConfig);

module.exports = {app}