export function validateGroup(groupData) {
    const errors = {};
    
    if (!groupData.name?.trim()) {
        errors.name = "Le nom du groupe est requis";
    } else if (groupData.name.length < 3) {
        errors.name = "Le nom du groupe doit contenir au moins 3 caractères";
    }
    
    if (!groupData.description?.trim()) {
        errors.description = "La description du groupe est requise";
    }
    
    // Ajouter d'autres validations au besoin
    
    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
}