const SELECTED_CONVERSATIONS_KEY = 'whatchat_selected_conversations';
const MESSAGES_KEY = 'whatchat_messages_';

/**
 * Récupère une conversation depuis le stockage local
 * @param {string} conversationId - L'ID de la conversation
 * @returns {Object|null} La conversation ou null si non trouvée
 */
export function getConversationFromLocal(conversationId) {
  try {
    const conversations = JSON.parse(localStorage.getItem('conversations') || '[]');
    return conversations.find(conv => conv.id === conversationId) || null;
  } catch (error) {
    console.error('Erreur lors de la récupération de la conversation:', error);
    return null;
  }
}

export function saveSelectedConversation(conversation) {
  try {
    const savedConversations = getSelectedConversations();
    
    // Vérifier si la conversation existe déjà
    const existingIndex = savedConversations.findIndex(conv => conv.id === conversation.id);
    
    if (existingIndex >= 0) {
      // Mettre à jour la conversation existante
      savedConversations[existingIndex] = conversation;
    } else {
      // Ajouter la nouvelle conversation
      savedConversations.unshift(conversation);
    }
    
    localStorage.setItem(SELECTED_CONVERSATIONS_KEY, JSON.stringify(savedConversations));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de la conversation:', error);
  }
}

export function getSelectedConversations() {
  try {
    const savedConversations = localStorage.getItem(SELECTED_CONVERSATIONS_KEY);
    if (!savedConversations) return [];
    
    const conversations = JSON.parse(savedConversations);
    // Trier par date du dernier message
    return conversations.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  } catch (error) {
    console.error('Erreur lors de la récupération des conversations:', error);
    return [];
  }
}

export function saveMessages(conversationId, messages) {
  try {
    localStorage.setItem(
      `${MESSAGES_KEY}${conversationId}`, 
      JSON.stringify(messages)
    );
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des messages:', error);
  }
}

export function getMessages(conversationId) {
  try {
    const saved = localStorage.getItem(`${MESSAGES_KEY}${conversationId}`);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('Erreur lors de la récupération des messages:', error);
    return [];
  }
}