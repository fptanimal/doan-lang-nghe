// ============================================================
// firebase-auth.js — Firebase Authentication & Firestore Module
// Dùng Firebase v10+ CDN (ES Modules)
// ============================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore, initializeFirestore, doc, setDoc, getDoc, collection, addDoc, query, where, getDocs, onSnapshot, orderBy, updateDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBzLZGQyUWdGscrjrm2zots7ma6DPQRcXk",
  authDomain: "ban-do-lang.firebaseapp.com",
  projectId: "ban-do-lang",
  storageBucket: "ban-do-lang.firebasestorage.app",
  messagingSenderId: "577068090175",
  appId: "1:577068090175:web:de4ce9b5df2fe3f0fc898a",
  measurementId: "G-4C7QGBGCCC"
};

// Cảnh báo nếu chạy từ file://
const isFileProtocol = window.location.protocol === 'file:';
if (isFileProtocol) {
  console.warn('[Firebase] Đang chạy từ file:// — Đăng nhập Google sẽ không hoạt động. Hãy dùng Live Server hoặc npx serve.');
}

let firebaseApp, auth, db, provider;
try {
  firebaseApp = initializeApp(firebaseConfig);
  auth = getAuth(firebaseApp);
  db = initializeFirestore(firebaseApp, { experimentalForceLongPolling: true });
  provider = new GoogleAuthProvider();
} catch(e) {
  console.error('[Firebase] Lỗi khởi tạo:', e);
}

// ── Hàm tiện ích lưu thông tin user vào Firestore ──
async function saveUserToFirestore(user, additionalData = {}) {
  const userRef = doc(db, 'users', user.uid);
  const snap = await getDoc(userRef);
  
  let role = 'customer';
  // Nếu là admin email đã định sẵn
  if (user.email === 'lam.nguyendang610@gmail.com') {
    role = 'admin';
  }

  if (!snap.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || additionalData.displayName || user.email.split('@')[0],
      photoURL: user.photoURL || '',
      role: role,
      createdAt: serverTimestamp()
    });
  } else {
    // Cập nhật thông tin nếu cần
    await updateDoc(userRef, {
      lastLoginAt: serverTimestamp()
    });
  }

  const finalSnap = await getDoc(userRef);
  return finalSnap.data();
}

// ── Đăng nhập bằng Google (Popup) ──
async function signInWithGoogle() {
    let result, user;
    try {
      result = await signInWithPopup(auth, provider);
      user = result.user;
    } catch (authErr) {
      console.error('Lỗi Auth:', authErr);
      return { success: false, error: 'Lỗi Auth: ' + (authErr.code || authErr.message) };
    }

    try {
      const userData = await saveUserToFirestore(user);
      localStorage.setItem('langNghe_auth', JSON.stringify(userData));
      localStorage.setItem('accessToken', await user.getIdToken());
      return { success: true, user: userData };
    } catch (fsErr) {
      console.error('Lỗi Firestore:', fsErr);
      return { success: false, error: 'Lỗi DB (Firestore): ' + (fsErr.code || fsErr.message) };
    }
}

// ── Đăng ký bằng Email/Password ──
async function registerWithEmail(email, password, displayName) {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const user = result.user;
    const userData = await saveUserToFirestore(user, { displayName });

    localStorage.setItem('langNghe_auth', JSON.stringify(userData));
    localStorage.setItem('accessToken', await user.getIdToken());

    return { success: true, user: userData };
  } catch (error) {
    console.error('Firebase Register error:', error);
    let msg = 'Đăng ký thất bại';
    if (error.code === 'auth/email-already-in-use') msg = 'Email này đã được sử dụng';
    if (error.code === 'auth/weak-password') msg = 'Mật khẩu quá yếu, cần ít nhất 6 ký tự';
    return { success: false, error: msg };
  }
}

// ── Đăng nhập bằng Email/Password ──
async function loginWithEmail(email, password) {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    const user = result.user;
    const userRef = doc(db, 'users', user.uid);
    const snap = await getDoc(userRef);
    
    const userData = snap.exists() ? snap.data() : await saveUserToFirestore(user);

    localStorage.setItem('langNghe_auth', JSON.stringify(userData));
    localStorage.setItem('accessToken', await user.getIdToken());

    return { success: true, user: userData };
  } catch (error) {
    console.error('Firebase Login error:', error);
    return { success: false, error: 'Sai email hoặc mật khẩu' };
  }
}

// ── Đăng xuất Firebase ──
async function firebaseSignOut() {
  try {
    await signOut(auth);
    localStorage.removeItem('langNghe_auth');
    localStorage.removeItem('accessToken');
  } catch (e) {
    console.error('Lỗi đăng xuất Firebase:', e);
  }
}

// ── Lấy Role của User hiện tại ──
async function getCurrentUserRole() {
  const user = auth.currentUser;
  if (!user) return null;
  const snap = await getDoc(doc(db, 'users', user.uid));
  return snap.exists() ? snap.data().role : 'customer';
}

// Export ra global để các file script khác sử dụng
window.FirebaseAuth = {
  signInWithGoogle,
  registerWithEmail,
  loginWithEmail,
  firebaseSignOut,
  getCurrentUserRole,
  onAuthStateChanged: (cb) => onAuthStateChanged(auth, cb),
  auth,
  db,
  firestore: {
    doc, setDoc, getDoc, collection, addDoc, query, where, getDocs, onSnapshot, orderBy, updateDoc, serverTimestamp
  }
};

// Đánh dấu Firebase đã sẵn sàng để các script khác biết
window.FirebaseAuthReady = true;
window.dispatchEvent(new CustomEvent('firebase-auth-ready'));
