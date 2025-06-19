// Imports nécessaires
import { displayMessages } from './chatHandler.js';
import { showError } from '../../utils/error-handling.js';
import { API_URL } from '../../config.js';
import { 
  getConversationFromLocal, 
  saveSelectedConversation, 
  getSelectedConversations, 
  saveMessages
} from '../storage/storageManager.js';
import { generateMessageId } from '../../utils/idGenerator.js';

// Regrouper les exports au début du fichier
export {
    loadConversationMessages,
    setCurrentConversation,
    setConversationsUpdater,
    getConversationsUpdater,
    initializeMessageInput,
    handleSendMessage
};

// Variables partagées
const messageCache = new Map();
const LOCAL_STORAGE_KEY = 'whatchat_messages_';
let messageInput;
let replyingTo = null;
let currentConversationId = null;
let conversationsUpdater = null;

// Définition des fonctions
async function loadConversationMessages(conversationId) {
  if (!conversationId) return [];

  try {
    // D'abord vérifier le cache
    let messages = messageCache.get(conversationId);
    
    if (!messages) {
      // Ensuite vérifier le localStorage
      const savedMessages = localStorage.getItem(`${LOCAL_STORAGE_KEY}${conversationId}`);
      if (savedMessages) {
        messages = JSON.parse(savedMessages);
      } else {
        // Enfin, charger depuis l'API
        const response = await fetch(`${API_URL}/messages?conversationId=${conversationId}`);
        if (!response.ok) throw new Error('Erreur de chargement des messages');
        messages = await response.json();
        
        // Mettre en cache les messages
        messageCache.set(conversationId, messages);
        saveMessages(conversationId, messages);
      }
    }
    
    return messages;

  } catch (error) {
    console.error('Erreur:', error);
    return [];
  }
}

async function setCurrentConversation(conversationId) {
  currentConversationId = conversationId;
  const messages = await loadConversationMessages(conversationId);
  displayMessages(messages);
  saveSelectedConversation(conversationId);
}

// Supprimer le mot-clé export ici
function setConversationsUpdater(callback) {
  conversationsUpdater = callback;
}

// Supprimer le mot-clé export ici
function getConversationsUpdater() {
  return conversationsUpdater;
}

function initializeMessageInput() {
  const messageInput = document.querySelector('#messageInput');
  const sendButton = document.querySelector('#sendButton');
  const micButton = document.querySelector('#micButton');

  if (!messageInput || !sendButton || !micButton) {
    console.error('Éléments de message manquants');
    return;
  }

  // Gérer l'affichage des boutons lors de la saisie
  messageInput.addEventListener('input', () => {
    const hasText = messageInput.value.trim().length > 0;
    sendButton.style.display = hasText ? 'block' : 'none';
    micButton.style.display = hasText ? 'none' : 'block';
  });

  // Gérer l'envoi avec le bouton
  sendButton.addEventListener('click', () => {
    if (messageInput.value.trim()) {
      handleSendMessage();
    }
  });

  // Gérer l'envoi avec la touche Entrée
  messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey && messageInput.value.trim()) {
      e.preventDefault();
      handleSendMessage();
    }
  });
}

async function handleSendMessage() {
  if (!currentConversationId) {
    showError('Veuillez sélectionner une conversation');
    return;
  }

  const messageInput = document.querySelector('#messageInput');
  const sendButton = document.querySelector('#sendButton');
  const micButton = document.querySelector('#micButton');
  
  if (!messageInput || !messageInput.value.trim()) return;

  const messageText = messageInput.value.trim();
  
  try {
    // Créer et envoyer le message de l'utilisateur
    const newMessage = {
      id: generateMessageId(),
      content: messageText,
      sender: 'me',
      timestamp: new Date().toISOString(),
      conversationId: currentConversationId,
      status: 'sent'
    };

    // Effacer l'input et mettre à jour les boutons
    messageInput.value = '';
    sendButton.style.display = 'none';
    micButton.style.display = 'block';

    // Mettre à jour l'interface avec le message de l'utilisateur
    const currentMessages = messageCache.get(currentConversationId) || [];
    currentMessages.push(newMessage);

    // Vérifier si c'est un groupe ou un contact
    const isGroup = await checkIfGroup(currentConversationId);
    
    if (!isGroup) {
      // Générer une réponse automatique après 1 seconde seulement pour les contacts
      setTimeout(async () => {
        try {
          const response = await fetch(`${API_URL}/contacts/${currentConversationId}`);
          const contact = await response.json();

          if (contact) {
            const autoResponse = {
              id: generateMessageId(),
              content: generateAutoResponse(messageText),
              sender: contact.name,
              timestamp: new Date().toISOString(),
              conversationId: currentConversationId,
              status: 'received'
            };

            currentMessages.push(autoResponse);
            messageCache.set(currentConversationId, currentMessages);
            displayMessages(currentMessages);
            saveMessages(currentConversationId, currentMessages);

            if (conversationsUpdater) {
              await conversationsUpdater();
            }
          }
        } catch (error) {
          console.error('Erreur lors de la génération de la réponse automatique:', error);
        }
      }, 1000);
    }

    // Afficher le message de l'utilisateur immédiatement
    displayMessages(currentMessages);
    messageCache.set(currentConversationId, currentMessages);
    
    // Sauvegarder et envoyer au serveur
    await saveMessages(currentConversationId, currentMessages);
    await fetch(`${API_URL}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newMessage)
    });

  } catch (error) {
    console.error('Erreur:', error);
    showError('Erreur lors de l\'envoi du message');
    messageInput.value = messageText;
  }
}

// Fonction utilitaire pour vérifier si l'ID correspond à un groupe
async function checkIfGroup(id) {
  try {
    const response = await fetch(`${API_URL}/groups/${id}`);
    return response.ok;
  } catch (error) {
    return false;
  }
}

// Fonction pour générer des réponses automatiques
function generateAutoResponse(receivedMessage) {
  const responses = [
    "D'accord, je comprends !",
    "Merci pour votre message !",
    "Intéressant, dites-m'en plus.",
    "Je vois ce que vous voulez dire.",
    "C'est noté !",
    "Je vous réponds dès que possible.",
    "Très bien, je prends note.",
    "Message reçu !"
  ];
  
  // Réponses contextuelles basées sur le message reçu
  if (receivedMessage.toLowerCase().includes('bonjour')) {
    return "Bonjour ! Comment allez-vous ?";
  }
  if (receivedMessage.toLowerCase().includes('merci')) {
    return "Je vous en prie !";
  }
  if (receivedMessage.toLowerCase().includes('?')) {
    return "Laissez-moi réfléchir à votre question...";
  }

  // Sinon, retourner une réponse aléatoire
  return responses[Math.floor(Math.random() * responses.length)];
}

// Fonctions utilitaires internes (non exportées)
 function createMessageHTML(message) {
  const isOutgoing = message.sender === 'me';
  const messageTime = new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return `
    <div class="flex ${isOutgoing ? 'justify-end' : 'justify-start'} mb-2 group">
      <div class="relative max-w-[65%]">
        <div class="bg-${isOutgoing ? '[#005c4b]' : '[#202c33]'} text-white rounded-lg px-3 py-2 
                    ${isOutgoing ? 'rounded-tr-none' : 'rounded-tl-none'}">
          <p class="text-[15px] leading-[20px] break-words">${message.content}</p>
          <div class="flex items-center justify-end gap-1 mt-1 -mb-0.5">
            <span class="text-[11px] text-[#8696a0] min-w-[55px]">${messageTime}</span>
            ${isOutgoing ? `
              <div class="text-[#53bdeb]">
                ${message.status === 'read' ? `
                  <svg viewBox="0 0 16 11" width="16" height="11" class="fill-current">
                    <path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z"/>
                  </svg>
                ` : `
                  <svg viewBox="0 0 16 15" width="16" height="15" class="fill-current">
                    <path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512z"/>
                  </svg>
                `}
              </div>
            ` : ''}
          </div>
        </div>
        <div class="absolute top-0 ${isOutgoing ? 'right-0' : 'left-0'} w-2 h-2 
                    ${isOutgoing ? 'bg-[#005c4b]' : 'bg-[#202c33]'}
                    transform ${isOutgoing ? 'translate-x-full' : '-translate-x-full'}
                    ${isOutgoing ? 'rounded-tr-lg' : 'rounded-tl-lg'}">
        </div>
        ${message.unreadCount ? `
          <div class="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-[5px] py-[3px] 
                      rounded-full bg-[#00a884] text-white text-[11px] font-medium 
                      opacity-0 group-hover:opacity-100 transition-opacity">
            ${message.unreadCount}
          </div>
        ` : ''}
      </div>
    </div>
  `;
}



function cancelReply() {
  const replyContainer = document.querySelector('#replyContainer');
  if (replyContainer) {
    replyContainer.classList.add('hidden');
    replyContainer.innerHTML = '';
  }
  replyingTo = null;
}

function findMessageById(messageId) {
  const currentMessages = messageCache.get(currentConversationId) || [];
  return currentMessages.find(msg => msg.id === messageId);
}

// Dans main.js
document.addEventListener('DOMContentLoaded', () => {
  // ... autres initialisations
  initializeMessageInput();
});
