import { sendOTP, verifyOTP } from './auth-service.js';
import { showTemporaryNotification } from './utils/notifications.js';

export function validatePhone(phone) {
    const phoneRegex = /^[76|77|78|70|75]\d{8}$/;
    return phoneRegex.test(phone);
}

function redirectToHome() {
    setTimeout(() => {
        window.location.href = '/';
    }, 300); // 300ms de délai pour une transition fluide
}

// Vérifier si l'utilisateur est déjà connecté
function checkExistingAuth() {
    const token = localStorage.getItem('auth_token');
    if (token) {
        redirectToHome();
        return true;
    }
    return false;
}

// Initialiser l'animation de chargement
function showLoadingState(button) {
    button.disabled = true;
    button.innerHTML = `
        <span class="inline-flex items-center">
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Chargement...
        </span>
    `;
}

document.addEventListener('DOMContentLoaded', () => {
    e.stoppropagation();
    // Vérifier l'authentification existante
    if (checkExistingAuth()) return;

    const loginForm = document.getElementById('loginForm');
    const otpContainer = document.getElementById('otpContainer');
    const phoneInput = document.getElementById('phone');
    const phoneError = document.getElementById('phoneError');
    const otpInput = document.getElementById('otp');
    const otpError = document.getElementById('otpError');
    const verifyOtpButton = document.getElementById('verifyOtp');
    const submitButton = loginForm.querySelector('button[type="submit"]');

    loginForm.addEventListener('submit', async (e) => {
        e.stoppropagation();
        e.preventDefault();
        const phone = phoneInput.value;

        try {
            showLoadingState(submitButton);
            phoneError.classList.add('hidden');
            
            if (!validatePhone(phone)) {
                throw new Error('Numéro de téléphone invalide');
            }

            const result = await sendOTP(phone);
            if (result.success) {
                showTemporaryNotification(`Votre code de vérification est : ${result.otp}`);
                loginForm.classList.add('opacity-0');
                setTimeout(() => {
                    loginForm.classList.add('hidden');
                    otpContainer.classList.remove('hidden');
                    otpContainer.classList.add('opacity-100');
                    otpInput.focus();
                }, 300);
            }
        } catch (error) {
            console.error('Erreur:', error);
            phoneError.textContent = error.message;
            phoneError.classList.remove('hidden');
        } finally {
            submitButton.disabled = false;
            submitButton.innerHTML = 'Recevoir le code';
        }
    });

    verifyOtpButton.addEventListener('click', async () => {
        e.stoppropagation();
        const otp = otpInput.value;
        try {
            showLoadingState(verifyOtpButton);
            const storedPhone = sessionStorage.getItem('phone');
            const result = await verifyOTP(storedPhone, otp);
            
            if (result.success) {
                localStorage.setItem('auth_token', result.token);
                otpContainer.classList.add('opacity-0');
                showTemporaryNotification('Connexion réussie', 2000);
                redirectToHome();
            }
        } catch (error) {
            otpError.textContent = error.message;
            otpError.classList.remove('hidden');
        } finally {
            verifyOtpButton.disabled = false;
            verifyOtpButton.innerHTML = 'Vérifier';
        }
    });
});