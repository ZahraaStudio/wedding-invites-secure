import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc, deleteDoc, addDoc, collection, query, where, getDocs, orderBy, serverTimestamp, increment } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-storage.js";
import { initializeAppCheck, ReCaptchaV3Provider } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app-check.js";
import config from "./firebase-config-module.js";
const app=initializeApp(config);
/*
 * App Check must be initialized before Auth requests when enforcement is
 * enabled in Firebase. It stays optional so the same flat files also work
 * on hosts where App Check has not been configured yet.
 */
export const appCheck = config.appCheckSiteKey
  ? initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(config.appCheckSiteKey),
      isTokenAutoRefreshEnabled: true
    })
  : null;
export const appCheckConfigured=Boolean(config.appCheckSiteKey);

export const auth=getAuth(app);
export const db=getFirestore(app);
export const storage=getStorage(app);
export {signInWithEmailAndPassword,signOut,onAuthStateChanged,createUserWithEmailAndPassword,doc,getDoc,setDoc,updateDoc,deleteDoc,addDoc,collection,query,where,getDocs,orderBy,serverTimestamp,increment,ref,uploadBytes,getDownloadURL};
