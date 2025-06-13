import { uploadConfig, createUploadPath } from '../../services/uploadService.js';

export function handlePhotoChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Validation du type de fichier
    if (!uploadConfig.ALLOWED_TYPES.includes(file.type)) {
        alert('Type de fichier non supporté. Utilisez JPG, PNG ou GIF.');
        return;
    }

    // Validation de la taille
    if (file.size > uploadConfig.MAX_FILE_SIZE) {
        alert('Image trop volumineuse. Taille maximum : 5MB');
        return;
    }

    // Créer le chemin de l'image
    const imagePath = createUploadPath(file.name);
    const preview = document.querySelector('#photoPreview');
    
    // Créer un FileReader pour l'aperçu
    const reader = new FileReader();
    reader.onload = (readerEvent) => {
        preview.src = readerEvent.target.result;
        preview.dataset.originalFile = file.name;
        preview.dataset.path = imagePath;
        preview.classList.remove('hidden');
    };
    reader.readAsDataURL(file);
}