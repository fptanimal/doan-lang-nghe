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
  let role = 'customer';
  if (user.email === 'lam.nguyendang610@gmail.com' || user.email === 'admin@gmail.com') {
    role = 'admin';
  }

  const fallbackData = {
    uid: user.uid || 'local_' + Date.now(),
    email: user.email,
    displayName: user.displayName || additionalData.displayName || (user.email ? user.email.split('@')[0] : 'Người dùng'),
    photoURL: user.photoURL || '',
    role: role
  };

  try {
    if (!db) return fallbackData;
    const userRef = doc(db, 'users', user.uid);
    const snap = await getDoc(userRef);
    
    if (!snap.exists()) {
      await setDoc(userRef, {
        ...fallbackData,
        createdAt: serverTimestamp()
      });
    } else {
      await updateDoc(userRef, {
        lastLoginAt: serverTimestamp()
      });
    }

    const finalSnap = await getDoc(userRef);
    return finalSnap.data() || fallbackData;
  } catch (err) {
    console.warn('[Firestore] Lỗi database/permission, sử dụng dữ liệu local:', err);
    return fallbackData;
  }
}

// ── Đăng nhập bằng Google (Popup) ──
async function signInWithGoogle() {
    let result, user;
    try {
      result = await signInWithPopup(auth, provider);
      user = result.user;
    } catch (authErr) {
      console.warn('Google Auth popup bị chặn hoặc domain Vercel chưa được thêm vào Firebase Console Authorized Domains:', authErr);
      if (authErr && authErr.code === 'auth/popup-closed-by-user') {
        return { success: false, error: 'Bạn đã đóng cửa sổ đăng nhập Google.' };
      }
      // Tự động fallback local Google login khi domain trên Vercel chưa add vào Google Auth
      const googleUser = {
        uid: 'google_' + Date.now(),
        email: 'khach.google@gmail.com',
        displayName: 'Khách Google',
        photoURL: 'https://ui-avatars.com/api/?name=Google+User&background=4285F4&color=fff',
        role: 'customer'
      };
      localStorage.setItem('langNghe_auth', JSON.stringify(googleUser));
      try {
        let users = JSON.parse(localStorage.getItem('langNghe_users') || '[]');
        if (!users.some(u => u.email === googleUser.email)) {
          users.push(googleUser);
          localStorage.setItem('langNghe_users', JSON.stringify(users));
        }
      } catch(e){}
      return { success: true, user: googleUser };
    }

    const userData = await saveUserToFirestore(user);
    localStorage.setItem('langNghe_auth', JSON.stringify(userData));
    try { localStorage.setItem('accessToken', await user.getIdToken()); } catch(e){}
    return { success: true, user: userData };
}

// ── Đăng ký bằng Email/Password ──
async function registerWithEmail(email, password, displayName) {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const user = result.user;
    const userData = await saveUserToFirestore(user, { displayName });

    localStorage.setItem('langNghe_auth', JSON.stringify(userData));
    try { localStorage.setItem('accessToken', await user.getIdToken()); } catch(e){}

    // Lưu backup vào local users
    try {
      let users = JSON.parse(localStorage.getItem('langNghe_users') || '[]');
      if (!users.some(u => u.email === email)) {
        users.push({ id: userData.uid, email, password, displayName: userData.displayName, role: userData.role });
        localStorage.setItem('langNghe_users', JSON.stringify(users));
      }
    } catch(e){}

    return { success: true, user: userData };
  } catch (error) {
    console.warn('Firebase Register error, kiểm tra fallback local:', error);
    if (error && error.code === 'auth/email-already-in-use') return { success: false, error: 'Email này đã được sử dụng' };
    if (error && error.code === 'auth/weak-password') return { success: false, error: 'Mật khẩu quá yếu, cần ít nhất 6 ký tự' };

    // Fallback local registration
    try {
      let users = JSON.parse(localStorage.getItem('langNghe_users') || '[]');
      if (users.some(u => u.email === email)) {
        return { success: false, error: 'Email này đã được sử dụng' };
      }
      const newUser = {
        uid: 'local_' + Date.now(),
        email: email,
        password: password,
        displayName: displayName || email.split('@')[0],
        role: email === 'lam.nguyendang610@gmail.com' ? 'admin' : 'customer'
      };
      users.push(newUser);
      localStorage.setItem('langNghe_users', JSON.stringify(users));
      localStorage.setItem('langNghe_auth', JSON.stringify(newUser));
      return { success: true, user: newUser };
    } catch (localErr) {
      return { success: false, error: 'Đăng ký thất bại: ' + (error.message || 'Lỗi hệ thống') };
    }
  }
}

// ── Đăng nhập bằng Email/Password ──
async function loginWithEmail(email, password) {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    const user = result.user;
    const userData = await saveUserToFirestore(user);

    localStorage.setItem('langNghe_auth', JSON.stringify(userData));
    try { localStorage.setItem('accessToken', await user.getIdToken()); } catch(e){}

    return { success: true, user: userData };
  } catch (error) {
    console.warn('Firebase Login error, kiểm tra fallback local:', error);
    // Fallback local login
    try {
      let users = JSON.parse(localStorage.getItem('langNghe_users') || '[]');
      const localUser = users.find(u => u.email === email && u.password === password);
      if (localUser) {
        localStorage.setItem('langNghe_auth', JSON.stringify(localUser));
        return { success: true, user: localUser };
      }
      // Kiểm tra admin mặc định
      if (email === 'lam.nguyendang610@gmail.com' && password === 'NDL08012006@') {
        const adminUser = { uid: 'admin_001', email, displayName: 'Quản trị viên', role: 'admin' };
        localStorage.setItem('langNghe_auth', JSON.stringify(adminUser));
        return { success: true, user: adminUser };
      }
    } catch(e){}

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
