// Fonction générique pour générer des IDs uniques avec préfixe
function generateBaseId(prefix) {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 10);
  return `${prefix}_${timestamp}_${random}`;
}

// ID pour les groupes
export function generateGroupId() {
  return generateBaseId('group');
}

// ID pour les contacts
export function generateContactId() {
  return generateBaseId('contact');
}

// ID pour les messages
export function generateMessageId() {
  return generateBaseId('msg');
}

// ID pour les conversations
export function generateConversationId() {
  return generateBaseId('conv');
}