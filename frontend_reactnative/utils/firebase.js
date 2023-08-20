import * as firebase from 'firebase/app'

const config = {
  // apiKey: 'AIzaSyDexCUtYa9u4aayzP5hVu2LDsr2lKADfzI',
  // authDomain: 'washandfold-79f57.firebaseapp.com',
  // databaseURL: 'https://washandfold-79f57-default-rtdb.firebaseio.com',
  // projectId: 'washandfold-79f57',
  // storageBucket: 'washandfold-79f57.appspot.com',
  // messagingSenderId: '585381866834',
  // appId: '1:585381866834:web:fd0aa6ef07d32e69555e8b',
  // measurementId: 'G-9BHF8MR5R6'

  apiKey: "AIzaSyDukWtntzXHvofJhmcc14Driyi2XTIhUmU",
  authDomain: "wmart123-d76d2.firebaseapp.com",
  databaseURL: "https://wmart123-d76d2-default-rtdb.firebaseio.com",
  projectId: "wmart123-d76d2",
  storageBucket: "wmart123-d76d2.appspot.com",
  messagingSenderId: "569247468314",
  appId: "1:569247468314:web:6b0c4d21bdd4ecad237aa3",
  measurementId: "G-L630CXSJY6"
}

firebase.initializeApp(config)
export const fireBase = firebase
export default firebase
