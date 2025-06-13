import { showError } from '../../utils/error-handling.js';
import { setCurrentConversation } from './messageHandler.js';

export function initializeChatSelection() {
  const contactsList = document.querySelector('#contactsList');
  const conversationsList = document.querySelector('#conversationsList');
  
  if (contactsList) {
    contactsList.addEventListener('click', handleConversationSelect);
  }
  
  if (conversationsList) {
    conversationsList.addEventListener('click', handleConversationSelect);
  }
}

function handleConversationSelect(e) {
  // Vérifie si l'événement vient d'un élément valide
  if (!e || !e.target) return;

  // Trouve l'élément de conversation parent le plus proche
  const conversationItem = e.target.closest('[class*="flex items-center"], .contact-item');
  
  if (!conversationItem) {
    console.warn('Aucun élément de conversation trouvé');
    return;
  }

  try {
    // Extraire les informations de la conversation
    const nameElement = conversationItem.querySelector('[class*="text-white"], h3, h4');
    const statusElement = conversationItem.querySelector('[class*="text-[#8696a0]"], p');
    const avatarElement = conversationItem.querySelector('[class*="rounded-full"]');

    if (!nameElement) {
      throw new Error('Élément nom non trouvé');
    }

    const name = nameElement.textContent.trim();
    const status = statusElement?.textContent?.trim() || '';
    const avatar = avatarElement?.outerHTML || '';

    // Générer un ID unique pour la conversation
    const conversationId = `contact_${Date.now()}_${name.replace(/\s+/g, '_')}`;

    // Mettre à jour l'interface
    updateChatHeader(name, status, avatar);

    // Mettre à jour la conversation courante
    setCurrentConversation(conversationId);

    // Fermer le panel de nouvelle discussion si ouvert
    const newChatPanel = document.querySelector('#newChatPanel');
    const conversationsPanel = document.querySelector('#conversationsPanel');
    if (newChatPanel && conversationsPanel) {
      newChatPanel.style.display = 'none';
      conversationsPanel.style.display = 'flex';
    }

    // Mettre à jour la classe active
    document.querySelectorAll('[class*="flex items-center"], .contact-item').forEach(item => {
      item.classList.remove('bg-[#202c33]');
    });
    conversationItem.classList.add('bg-[#202c33]');

  } catch (error) {
    console.error('Erreur lors de la sélection de la conversation:', error);
    showError('Impossible de sélectionner la conversation');
  }
}

// Mettre à jour la fonction updateChatHeader pour utiliser des sélecteurs plus simples
function updateChatHeader(name, status, avatar) {
  const header = document.querySelector('header');
  if (!header) return;

  header.innerHTML = `
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 rounded-full overflow-hidden bg-[#00a884] flex items-center justify-center">
        ${avatar || `<span class="text-white text-xl">${name[0].toUpperCase()}</span>`}
      </div>
      <div class="flex flex-col">
        <h2 class="text-white text-sm font-medium">${name}</h2>
        <p class="text-[#8696a0] text-xs">${status}</p>
      </div>
    </div>
    <div class="flex items-center gap-4">
      <button type="button" class="text-[#aebac1] hover:text-white">
        <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M15.9 14.3H15l-0.3-0.3c1-1.1 1.6-2.7 1.6-4.3 0-3.7-3-6.7-6.7-6.7S3 6 3 9.7s3 6.7 6.7 6.7c1.6 0 3.2-0.6 4.3-1.6l0.3 0.3v0.8l5.1 5.1 1.5-1.5-5-5.2zm-6.2 0c-2.6 0-4.6-2.1-4.6-4.6s2.1-4.6 4.6-4.6 4.6 2.1 4.6 4.6-2 4.6-4.6 4.6z"></path></svg>
      </button>
      <button type="button" class="text-[#aebac1] hover:text-white">
        <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M12 7a2 2 0 1 0-.001-4.001A2 2 0 0 0 12 7zm0 2a2 2 0 1 0-.001 3.999A2 2 0 0 0 12 9zm0 6a2 2 0 1 0-.001 3.999A2 2 0 0 0 12 15z"></path></svg>
      </button>
    </div>
  `;
}

async function loadMessages(contactName) {
  const chatMessages = document.querySelector('.flex-1.p-4.overflow-y-auto');
  if (!chatMessages) return;

  try {
    const response = await fetch(`https://json-server-xp3c.onrender.com/messages?contact=${contactName}`);
    const messages = await response.json();

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

  } catch (error) {
    console.error('Erreur lors du chargement des messages:', error);
  }
}

function createMessageHTML(message) {
  const isOutgoing = message.sender === 'me';
  return `
    <div class="flex ${isOutgoing ? 'justify-end' : 'justify-start'}">
      <div class="max-w-[60%] bg-${isOutgoing ? '[#005c4b]' : '[#202c33]'} rounded-lg px-3 py-2">
        <p class="text-white">${message.content}</p>
        <p class="text-[#8696a0] text-xs text-right">${message.timestamp}</p>
      </div>
    </div>
  `;
}

function addToRecentConversations(conversation) {
  const conversationsList = document.querySelector('#conversationsList');
  if (!conversationsList) return;

  // Vérifier si la conversation existe déjà
  const existingConversation = conversationsList.querySelector(`[data-id="${conversation.id}"]`);
  if (existingConversation) return;

  const conversationHTML = `
    <div class="flex items-center px-4 py-3 hover:bg-[#202c33] cursor-pointer" 
         data-id="${conversation.id}"
         data-name="${conversation.name}"
         ${conversation.isGroup ? 'class="group-conversation"' : ''}>
      <div class="w-12 h-12 rounded-full bg-[#00a884] flex items-center justify-center mr-4">
        ${conversation.avatar}
      </div>
      <div>
        <h4 class="text-white">${conversation.name}</h4>
        <p class="text-[#8696a0] text-sm">${conversation.status}</p>
      </div>
    </div>
  `;

  conversationsList.insertAdjacentHTML('afterbegin', conversationHTML);
}

export { addToRecentConversations };