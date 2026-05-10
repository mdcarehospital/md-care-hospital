import { signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { auth } from "./firebase-config.js";

export let isLoggingOut = false;
window.isLoggedIn = localStorage.getItem('mdcare_auth') === 'true';

window.logout = function(btn, redirectUrl = 'index.html') {
    if (btn) {
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-1"></i> Logging out...';
        btn.disabled = true;
    }
    isLoggingOut = true;
    localStorage.removeItem('mdcare_profilePic'); 
    localStorage.removeItem('mdcare_userInitial'); 
    signOut(auth).then(() => {
        localStorage.removeItem('mdcare_auth'); 
        window.isLoggedIn = false; 
        sessionStorage.setItem('mdcare_pendingToast', JSON.stringify({ title: "Logged Out", message: "You have been successfully logged out.", type: "success", duration: 3000 }));
        window.location.href = redirectUrl;
    }).catch(err => console.error(err));
};

window.adminLogout = function(btn) {
    window.logout(btn, 'index.html');
};