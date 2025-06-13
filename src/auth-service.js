const API_URL = 'https://whatchat-xbg2.onrender.com';

export async function sendOTP(phone) {
    try {
        // Générer un code OTP à 6 chiffres pour la simulation
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Stocker le code temporairement pour la vérification
        sessionStorage.setItem('currentOTP', otp);
        sessionStorage.setItem('phone', phone);

        // Simuler un délai réseau
        await new Promise(resolve => setTimeout(resolve, 1000));

        return { 
            success: true, 
            otp,
            message: `Code de vérification: ${otp}`
        };
    } catch (error) {
        console.error('Erreur sendOTP:', error);
        throw new Error('Impossible d\'envoyer le code de vérification');
    }
}

export async function verifyOTP(phone, code) {
    try {
        const storedOTP = sessionStorage.getItem('currentOTP');
        const storedPhone = sessionStorage.getItem('phone');

        if (phone !== storedPhone || code !== storedOTP) {
            throw new Error('Code invalide');
        }

        // Simuler un délai réseau
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Nettoyer les données temporaires
        sessionStorage.removeItem('currentOTP');
        
        // Générer un token simple pour la simulation
        const token = btoa(`${phone}:${Date.now()}`);

        return {
            success: true,
            token,
            message: 'Authentification réussie'
        };
    } catch (error) {
        console.error('Erreur verifyOTP:', error);
        throw new Error('Code invalide ou expiré');
    }
}