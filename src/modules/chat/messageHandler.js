let currentConversationId = null;

export function setCurrentConversation(id) {
  currentConversationId = id;
  clearMessages();
  loadConversationMessages(id);
}

function clearMessages() {
  const chatMessages = document.querySelector('.flex-1.p-4.overflow-y-auto');
  if (chatMessages) {
    chatMessages.innerHTML = `
      <div class="space-y-4">
        <div class="flex justify-center">
          <div class="bg-[#202c33] px-3 py-1 rounded-lg">
            <p class="text-gray-300 text-xs">Les messages sont chiffrés de bout en bout</p>
          </div>
        </div>
      </div>
    `;
  }
}

export function initializeMessageInput() {
  const messageInput = document.getElementById('messageInput');
  const microIcon = document.getElementById('microIcon');
  const sendIcon = document.getElementById('sendIcon');
  const sendButton = document.getElementById('sendButton');

  if (!messageInput || !microIcon || !sendIcon || !sendButton) {
    console.error('Éléments de message manquants');
    return;
  }

  messageInput.addEventListener('input', function() {
        e.stoppropagation();
    const hasText = this.value.trim().length > 0;
    microIcon.classList.toggle('hidden', hasText);
    sendIcon.classList.toggle('hidden', !hasText);
  });

  sendButton.addEventListener('click', async function() {
        e.stoppropagation();
    const messageText = messageInput.value.trim();
    if (!messageText || !currentConversationId) {
      console.warn('Message vide ou pas de conversation sélectionnée');
      return;
    }

    try {
      // Créer le message avec l'ID de la conversation actuelle
      const message = {
        content: messageText,
        sender: 'me',
        timestamp: new Date().toLocaleTimeString(),
        conversationId: currentConversationId
      };

      // Sauvegarder le message
      const savedMessage = await saveMessage(message);
      
      if (savedMessage) {
        // Vérifier que nous sommes toujours dans la même conversation
        if (currentConversationId === savedMessage.conversationId) {
          displayMessage(savedMessage);
          messageInput.value = '';
          microIcon.classList.remove('hidden');
          sendIcon.classList.add('hidden');
        }
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
    }
  });
}

async function loadConversationMessages(conversationId) {
  if (!conversationId) return;

  try {
    const response = await fetch(`https://json-server-xp3c.onrender.com/messages?conversationId=${conversationId}`);
    if (!response.ok) throw new Error('Erreur lors du chargement des messages');

    const messages = await response.json();
    const chatMessages = document.querySelector('.flex-1.p-4.overflow-y-auto');
    if (!chatMessages) return;

    // Vérifier que nous sommes toujours dans la même conversation
    if (currentConversationId !== conversationId) {
      console.log('La conversation a changé pendant le chargement');
      return;
    }

    chatMessages.innerHTML = `
      <div class="space-y-4">
        <div class="flex justify-center">
          <div class="bg-[#202c33] px-3 py-1 rounded-lg">
            <p class="text-gray-300 text-xs">Les messages sont chiffrés de bout en bout</p>
          </div>
        </div>
        ${messages.filter(msg => msg.conversationId === conversationId)
                  .map(msg => createMessageHTML(msg))
                  .join('')}
      </div>
    `;

    chatMessages.scrollTop = chatMessages.scrollHeight;
  } catch (error) {
    console.error('Erreur lors du chargement des messages:', error);
  }
}

async function saveMessage(message) {
  try {
    const response = await fetch('https://json-server-xp3c.onrender.com/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message)
    });

    if (!response.ok) throw new Error('Erreur lors de la sauvegarde du message');
    return await response.json();
  } catch (error) {
    console.error('Erreur:', error);
    return null;
  }
}

function displayMessage(message) {
  // Vérifier que le message appartient à la conversation courante
  if (message.conversationId !== currentConversationId) {
    console.log('Message ignoré car conversation différente');
    return;
  }

  const chatMessages = document.querySelector('.flex-1.p-4.overflow-y-auto');
  if (!chatMessages) return;

  const messageContainer = chatMessages.querySelector('.space-y-4');
  if (!messageContainer) {
    chatMessages.innerHTML = `<div class="space-y-4"></div>`;
  }

  const messageHTML = createMessageHTML(message);
  messageContainer.insertAdjacentHTML('beforeend', messageHTML);
  chatMessages.scrollTop = chatMessages.scrollHeight;
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