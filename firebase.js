const firebaseConfig = {
  apiKey: "AIzaSyD25RzgNNsyFwcwrMdnzarJhkg8k_FdLvA",
  authDomain: "to-do-app-c00a4.firebaseapp.com",
  projectId: "to-do-app-c00a4",
  storageBucket: "to-do-app-c00a4.appspot.com",
  messagingSenderId: "1009619335493",
  appId: "1:1009619335493:web:38dd5ec01e5aab7498262c",
  measurementId: "G-5P165JJ4BS",
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const analytics = firebase.getAnalytics;
var db = firebase.firestore();
