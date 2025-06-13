import { ValidationError } from './errors.js';

export const phoneRegex = /^(\+221|221)?[76|77|78|70|75]\d{8}$/;

/**
 * Valide un numéro de téléphone sénégalais
 * Format: +221 7X XXX XX XX
 */
export function validatePhone(phone) {
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

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
  const cleaned = phone.replace(/\D/g, '');
  if (!validatePhone(cleaned)) return phone;
  
  const matches = cleaned.match(/^(?:221)?(\d{2})(\d{3})(\d{2})(\d{2})$/);
  if (matches) {
    return `+221 ${matches[1]} ${matches[2]} ${matches[3]} ${matches[4]}`;
  }
  return phone;
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
  if (!formData.phone || !formData.phone.trim()) {
    errors.phone = "Le numéro de téléphone est requis";
  } else if (!validatePhone(formData.phone)) {
    errors.phone = "Format de numéro invalide (ex: +221 7X XXX XX XX)";
  }
  
  // Si des erreurs sont trouvées, on les lance
  if (Object.keys(errors).length > 0) {
    throw new ValidationError(JSON.stringify(errors));
  }

  return true;
}

/**
 * Formate uniformément un numéro de téléphone
 */
export function formatPhoneNumber(phone) {
  const cleaned = phone.replace(/\D/g, '');
  const withCountryCode = cleaned.startsWith('221') 
    ? cleaned 
    : cleaned.startsWith('7') 
      ? '221' + cleaned 
      : cleaned;

  const match = withCountryCode.match(/^221(\d{2})(\d{3})(\d{2})(\d{2})$/);
  if (match) {
    return `+${match[1]} ${match[2]} ${match[3]} ${match[4]}`;
  }
  return phone;
}