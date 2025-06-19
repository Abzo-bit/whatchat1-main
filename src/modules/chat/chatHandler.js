/**
 * Dépendances :
 * - messageHandler.js: loadConversationMessages, setCurrentConversation, initializeMessageInput
 * - error-handling.js: showError
 * - config.js: API_URL
 * - storageManager.js: getConversationFromLocal, saveSelectedConversation, getSelectedConversations
 */

import { generateConversationId } from '../../utils/idGenerator.js';
import { API_URL } from '../../config.js';
import { showError } from '../../utils/error-handling.js';
import { 
  loadConversationMessages,
  setCurrentConversation,
  initializeMessageInput 
} from './messageHandler.js';
import { getSelectedConversations } from '../storage/storageManager.js';

// Variables partagées
const messageCache = new Map();
const LOCAL_STORAGE_KEY = 'whatchat_messages_';

// Variable pour stocker la fonction de mise à jour
let conversationsUpdater = null;

// Fonction pour définir l'updater
 function setConversationsUpdater(callback) {
    conversationsUpdater = callback;
}

// Fonction pour obtenir l'updater
 function getConversationsUpdater() {
    return conversationsUpdater;
}

// Fonction pour afficher les messages
 function displayMessages(messages) {
  const chatMessages = document.querySelector('.flex-1.p-4.overflow-y-auto');
  if (!chatMessages) return;

  chatMessages.innerHTML = `
    <div class="space-y-4">
      <div class="flex justify-center">
        <div class="bg-[#202c33] px-3 py-1 rounded-lg">
          <p class="text-gray-300 text-xs">Les messages sont chiffrés de bout en bout</p>
        </div>
      </div>
      ${messages.map(msg => createMessageHTML(msg)).join('')}
    </div>
  `;

  // Faire défiler jusqu'au dernier message
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Ajouter l'export
 function saveMessages(conversationId, messages) {
  try {
    localStorage.setItem(
      `${LOCAL_STORAGE_KEY}${conversationId}`, 
      JSON.stringify(messages)
    );
    messageCache.set(conversationId, messages);
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des messages:', error);
  }
}

// Fonction createMessageHTML (à déplacer avant displayMessages)
function createMessageHTML(message) {
  const isOutgoing = message.sender === 'me';
  const messageTime = new Date(message.timestamp).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  return `
    <div class="flex ${isOutgoing ? 'justify-end' : 'justify-start'} mb-3 group">
      <div class="relative max-w-[65%]">
        <!-- Menu contextuel du message -->
        <div class="absolute right-0 -top-8 opacity-0 group-hover:opacity-100 flex bg-[#233138] rounded-lg shadow-lg transition-opacity">
          <button class="reply-button p-2 hover:bg-[#182229] rounded-lg transition-colors"
                  data-message-id="${message.id}"
                  data-message-content="${encodeURIComponent(message.content)}"
                  data-message-sender="${message.sender}">
            <svg viewBox="0 0 24 24" height="20" width="20" fill="currentColor" class="text-[#8696a0]">
              <path d="M14.6 16.6L19.2 12L14.6 7.4L16 6L22 12L16 18L14.6 16.6ZM9.4 16.6L4.8 12L9.4 7.4L8 6L2 12L8 18L9.4 16.6Z"></path>
            </svg>
          </button>
        </div>

        ${message.replyTo ? `
          <div class="bg-[#1f2937] p-2 rounded-t-lg -mb-1 border-l-4 border-[#00a884]">
            <div class="text-[#00a884] text-sm font-medium mb-1">
              ${message.replyTo.sender === 'me' ? 'Vous' : 'Message précédent'}
            </div>
            <div class="text-[#8696a0] text-sm truncate">
              ${message.replyTo.content}
            </div>
          </div>
        ` : ''}

        <div class="bg-${isOutgoing ? '[#005c4b]' : '[#202c33]'} text-white rounded-lg px-3 py-2">
          <p class="text-[15px] leading-[20px] break-words">${message.content}</p>
          <div class="flex items-center justify-end gap-1 mt-1">
            <span class="text-[11px] text-[#8696a0]">${messageTime}</span>
            ${isOutgoing ? getMessageStatusIcon(message.status) : ''}
          </div>
        </div>
      </div>
    </div>
  `;
}

// Ajouter cette fonction pour gérer les icônes de statut des messages
function getMessageStatusIcon(status) {
  switch (status) {
    case 'sent':
      return `
        <svg viewBox="0 0 16 15" width="16" height="15" class="text-[#8696a0] fill-current">
          <path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512z"/>
        </svg>`;
    case 'delivered':
      return `
        <svg viewBox="0 0 16 15" width="16" height="15" class="text-[#8696a0] fill-current">
          <path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z"/>
        </svg>`;
    case 'read':
      return `
        <svg viewBox="0 0 16 15" width="16" height="15" class="text-[#53bdeb] fill-current">
          <path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512z"/>
        </svg>`;
    default:
      return '';
  }
}

 async function loadRecentConversations() {
  try {
    const conversationsList = document.querySelector('#conversationsList');
    if (!conversationsList) return;

    // Vider la liste avant de la remplir
    conversationsList.innerHTML = '';

    // Récupérer tous les messages, contacts et groupes
    const [messagesResponse, contactsResponse, groupsResponse] = await Promise.all([
      fetch(`${API_URL}/messages`),
      fetch(`${API_URL}/contacts`),
      fetch(`${API_URL}/groups`)
    ]);

    const messages = await messagesResponse.json();
    const contacts = await contactsResponse.json();
    const groups = await groupsResponse.json();

    // Map pour stocker les conversations uniques
    const uniqueConversations = new Map();

    // Regrouper les messages par conversation
    const messagesByConversation = messages.reduce((acc, message) => {
      if (!acc[message.conversationId]) {
        acc[message.conversationId] = [];
      }
      acc[message.conversationId].push(message);
      return acc;
    }, {});

    // Traiter les contacts
    contacts.forEach(contact => {
      const conversationMessages = messagesByConversation[contact.id] || [];
      // Trier les messages par date pour avoir le plus récent
      const lastMessage = conversationMessages.sort((a, b) => 
        new Date(b.timestamp) - new Date(a.timestamp)
      )[0];

      uniqueConversations.set(contact.id, {
        id: contact.id,
        name: contact.name,
        type: 'contact',
        timestamp: lastMessage ? lastMessage.timestamp : contact.lastSeen || new Date().toISOString(),
        lastMessage: lastMessage ? {
          content: lastMessage.content,
          sender: lastMessage.sender
        } : null
      });
    });

    // Traiter les groupes
    groups.forEach(group => {
      const conversationMessages = messagesByConversation[group.id] || [];
      const lastMessage = conversationMessages.sort((a, b) => 
        new Date(b.timestamp) - new Date(a.timestamp)
      )[0];

      uniqueConversations.set(group.id, {
        id: group.id,
        name: group.name,
        type: 'group',
        timestamp: lastMessage ? lastMessage.timestamp : group.createdAt,
        lastMessage: lastMessage ? {
          content: lastMessage.content,
          sender: lastMessage.sender
        } : null
      });
    });

    // Trier et afficher
    const sortedConversations = Array.from(uniqueConversations.values())
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Ajouter les conversations triées au DOM
    sortedConversations.forEach(conversation => {
      conversationsList.insertAdjacentHTML('beforeend', createConversationHTML(conversation));
    });

  } catch (error) {
    console.error('Erreur lors du chargement des conversations:', error);
    showError('Erreur lors du chargement des conversations');
  }
}

// Mettre à jour la fonction createConversationHTML
function createConversationHTML(conversation) {
  try {
    const initials = conversation.name
      .split(' ')
      .map(word => word[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();

    // Formatter le dernier message
    let lastMessageText = '';
    if (conversation.lastMessage) {
      const isSentByMe = conversation.lastMessage.sender === 'me';
      lastMessageText = isSentByMe ? 
        `Vous : ${conversation.lastMessage.content}` : 
        conversation.type === 'group' ? 
          `${conversation.lastMessage.sender} : ${conversation.lastMessage.content}` :
          conversation.lastMessage.content;
    } else {
      lastMessageText = conversation.type === 'group' ? 
        'Nouveau groupe créé' : 'Démarrer la conversation';
    }

    return `
      <div class="flex items-center px-4 py-3 hover:bg-[#202c33] cursor-pointer conversation-item" 
           data-id="${conversation.id}"
           data-type="${conversation.type}">
        <div class="w-12 h-12 rounded-full bg-[#00a884] flex items-center justify-center mr-4">
          <span class="text-white text-sm font-medium">${initials}</span>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex justify-between items-center">
            <h4 class="text-white text-[15px] truncate flex-1">${conversation.name}</h4>
            <span class="text-[#8696a0] text-xs whitespace-nowrap ml-2">
              ${new Date(conversation.timestamp).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </span>
          </div>
          <div class="flex items-center text-[#8696a0] text-sm">
            <p class="truncate flex-1">${lastMessageText}</p>
          </div>
        </div>
      </div>
    `;
  } catch (error) {
    console.error('Erreur lors de la création du HTML de conversation:', error);
    return '';
  }
}

// Modifier la fonction updateChatHeader
async function updateChatHeader(name, status, type = 'contact', conversationId) {
  const headerContainer = document.querySelector('header');
  if (!headerContainer) return;

  const initials = name
    .split(' ')
    .map(word => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  headerContainer.innerHTML = `
    <div class="flex items-center justify-between w-full">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-full bg-[#00a884] flex items-center justify-center">
          <span class="text-white text-sm font-medium">${initials}</span>
        </div>
        <div class="flex flex-col">
          <h2 class="text-white text-[16px] font-medium">${name}</h2>
          <p class="text-[13px]" id="headerStatus"></p>
        </div>
      </div>
    </div>
  `;

  const statusElement = headerContainer.querySelector('#headerStatus');
  
  if (type === 'contact') {
    // Logique existante pour les contacts
    try {
      const response = await fetch(`${API_URL}/contacts/${conversationId}`);
      const contact = await response.json();
      
      if (statusElement) {
        if (contact.isOnline) {
          statusElement.className = 'text-[#00a884] text-[13px]';
          statusElement.textContent = 'en ligne';
        } else if (contact.lastSeen) {
          statusElement.className = 'text-[#8696a0] text-[13px]';
          statusElement.textContent = formatLastSeen(contact.lastSeen);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du statut:', error);
    }
  } else if (type === 'group') {
    // Nouvelle logique pour les groupes
    try {
      const response = await fetch(`${API_URL}/groups/${conversationId}`);
      const group = await response.json();
      
      if (statusElement && group.participants) {
        statusElement.className = 'text-[#8696a0] text-[13px]';
        
        // Récupérer les noms des participants
        const participantsPromises = group.participants.map(async (participantId) => {
          const participantResponse = await fetch(`${API_URL}/contacts/${participantId}`);
          const participant = await participantResponse.json();
          return participant.name;
        });

        const participantNames = await Promise.all(participantsPromises);
        const totalParticipants = participantNames.length;
        
        // Limiter l'affichage à 5 participants
        const displayNames = participantNames.slice(0, 5);
        let displayText = displayNames.join(', ');
        
        // Ajouter le compteur si plus de 5 participants
        if (totalParticipants > 5) {
          displayText += ` et ${totalParticipants - 5} autres`;
        }
        
        statusElement.textContent = `${displayText} • ${totalParticipants} participants`;
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des membres du groupe:', error);
      if (statusElement) {
        statusElement.textContent = 'Erreur de chargement des participants';
      }
    }
  }
}

// Fonction pour formater la dernière connexion
function formatLastSeen(lastSeen) {
  const now = new Date();
  const lastSeenDate = new Date(lastSeen);
  const diffInMinutes = Math.floor((now - lastSeenDate) / 1000 / 60);
  
  if (diffInMinutes < 1) return 'en ligne';
  if (diffInMinutes < 60) return `vu il y a ${diffInMinutes} min`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `vu il y a ${diffInHours}h`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `vu il y a ${diffInDays}j`;
  
  return `vu le ${lastSeenDate.toLocaleDateString()}`;
}

// Fonction pour gérer les mises à jour périodiques du statut
let statusUpdateInterval = null;
function startStatusUpdates(contactId) {
  if (statusUpdateInterval) {
    clearInterval(statusUpdateInterval);
  }

  async function updateStatus() {
    try {
      const response = await fetch(`${API_URL}/contacts/${contactId}`);
      const contact = await response.json();
      
      const statusElement = document.querySelector('#headerStatus');
      if (statusElement) {
        if (contact.isOnline) {
          statusElement.className = 'text-[#00a884] text-[13px]';
          statusElement.textContent = 'en ligne';
        } else if (contact.lastSeen) {
          statusElement.className = 'text-[#8696a0] text-[13px]';
          statusElement.textContent = formatLastSeen(contact.lastSeen);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
    }
  }

  updateStatus();
  statusUpdateInterval = setInterval(updateStatus, 30000); // Toutes les 30 secondes
}

// Arrêter les mises à jour du statut
function stopStatusUpdates() {
  if (statusUpdateInterval) {
    clearInterval(statusUpdateInterval);
    statusUpdateInterval = null;
  }
}

// Appeler cette fonction lors de la sélection d'une conversation
async function handleConversationSelect(e) {
  const item = e.target.closest('.conversation-item, .contact-item');
  if (!item || item.classList.contains('selected')) return;

  const conversationId = item.dataset.id;
  const type = item.dataset.type;
  const name = item.querySelector('h4').textContent;

  try {
    document.querySelector('.conversation-item.selected, .contact-item.selected')?.classList.remove('selected');
    item.classList.add('selected');

    // Mettre à jour l'interface en passant l'ID de la conversation
    await updateChatHeader(name, '', type, conversationId);
    await setCurrentConversation(conversationId);
  } catch (error) {
    console.error('Erreur:', error);
    showError('Erreur lors de la sélection de la conversation');
  }
}

// Regrouper tous les exports en haut du fichier
export {
    setConversationsUpdater,
    getConversationsUpdater,
    displayMessages,
    loadRecentConversations,
    handleConversationSelect,
    initializeChatSelection, // Ajout de cette ligne
    updateChatHeader,
    saveMessages
};

// Ajouter la définition de la fonction initializeChatSelection
function initializeChatSelection() {
    const conversationsList = document.querySelector('#conversationsList');
    
    if (conversationsList) {
        conversationsList.addEventListener('click', handleConversationSelect);
    }

    // Charger les conversations au démarrage
    loadRecentConversations();
}

// Charger les conversations récentes au démarrage
initializeChatSelection();
