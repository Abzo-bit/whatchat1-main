import fs from 'fs';
import path from 'path';

export const uploadConfig = {
    UPLOAD_DIR: 'public/assets/images/contacts',
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif']
};

export function createUploadPath(filename) {
    const timestamp = Date.now();
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    return `/assets/images/contacts/${timestamp}_${sanitizedFilename}`;
}

export function saveImage(base64Data, filename) {
    try {
        // Extraire les données réelles de base64
        const base64Image = base64Data.split(';base64,').pop();
        const uploadPath = path.join(process.cwd(), uploadConfig.UPLOAD_DIR);
        
        // Créer le dossier s'il n'existe pas
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }

        const imagePath = createUploadPath(filename);
        const fullPath = path.join(process.cwd(), 'public', imagePath);

        // Sauvegarder l'image
        fs.writeFileSync(fullPath, base64Image, { encoding: 'base64' });

        return imagePath;
    } catch (error) {
        console.error('Erreur lors de la sauvegarde de l\'image:', error);
        throw new Error('Impossible de sauvegarder l\'image');
    }
}