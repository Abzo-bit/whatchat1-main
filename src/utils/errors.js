export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NetworkError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NetworkError';
  }
}

export const ErrorMessages = {
  REQUIRED_FIELD: 'Ce champ est obligatoire',
  INVALID_PHONE: 'Numéro de téléphone invalide',
  NETWORK_ERROR: 'Erreur de connexion au serveur',
  DUPLICATE_CONTACT: 'Ce contact existe déjà',
  SERVER_ERROR: 'Erreur serveur',
};