import { ValidationError } from './errors.js';

/**
 * Valide un nom de contact
 * Minimum 2 caractères
 */
export function validateName(name) {
  return name && name.trim().length >= 2;
}

/**
 * Formate un numéro de téléphone au format sénégalais
 */
export function formatPhone(phone) {
  if (!phone) return '';
  
  // Nettoyer le numéro
  const cleaned = phone.replace(/[^\d+]/g, '');
  
  // Si le numéro commence déjà par +221
  if (cleaned.startsWith('+221')) {
    return cleaned;
  }
  
  // Si le numéro commence par 221
  if (cleaned.startsWith('221')) {
    return '+' + cleaned;
  }
  
  // Si c'est juste un numéro à 9 chiffres
  if (/^[7][0-8]\d{7}$/.test(cleaned)) {
    return '+221' + cleaned;
  }
  
  return phone;
}

/**
 * Valide un numéro de téléphone sénégalais
 */
export function validatePhone(phone) {
  if (!phone) return false;
  const cleaned = phone.replace(/[^\d+]/g, '');
  return /^(\+?221)?[7][0-8]\d{7}$/.test(cleaned);
}

/**
 * Valide les données complètes d'un contact
 */
export function validateContactData(formData) {
  const errors = {};
  
  // Validation du nom
  if (!formData.name || !formData.name.trim()) {
    errors.name = "Le nom est requis";
  } else if (formData.name.length < 2) {
    errors.name = "Le nom doit contenir au moins 2 caractères";
  }
  
  // Validation du téléphone
  if (!formData.phone || !validatePhone(formData.phone)) {
    errors.phone = "Le numéro de téléphone est invalide";
  }
  
  // Si des erreurs sont trouvées, on les lance
  if (Object.keys(errors).length > 0) {
    throw new ValidationError(JSON.stringify(errors));
  }

  return true;
}