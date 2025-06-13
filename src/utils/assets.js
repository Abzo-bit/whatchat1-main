export const DEFAULT_AVATAR = '/assets/images/default-avatar.png';
export const CHAT_BACKGROUND = '/assets/images/chat-bg.png';
export const PROFILE_IMAGE = '/assets/images/profile.jpg';

let imagesPreloaded = false;

export function handleImageError(event) {
    const img = event.target;
    if (!img.dataset.fallbackAttempted) {
        img.dataset.fallbackAttempted = 'true';
        img.src = DEFAULT_AVATAR;
    }
}

export async function preloadImages() {
    if (imagesPreloaded) return;

    const images = [DEFAULT_AVATAR, CHAT_BACKGROUND, PROFILE_IMAGE];
    
    try {
        await Promise.all(images.map(src => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => resolve(true);
                img.onerror = () => {
                    console.warn(`Impossible de charger l'image: ${src}`);
                    resolve(false);
                };
                img.src = src;
            });
        }));
        imagesPreloaded = true;
    } catch (error) {
        console.error('Erreur lors du préchargement des images:', error);
    }
}

// Ajouter les gestionnaires d'erreur aux images existantes
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('img').forEach(img => {
        img.addEventListener('error', handleImageError);
    });
});