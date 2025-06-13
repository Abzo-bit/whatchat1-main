import { 
    fetchContacts, 
    createContact,
    initializeContactModal 
} from './modules/contacts/index.js';
import { initializeFilters } from './filters.js';
import { initializeSearch } from './search.js';
import { preloadImages } from './utils/assets.js';
import { handleNewContact } from './modules/contacts/contactForm.js';
import { displayContacts } from './modules/contacts/contactList.js';
import { handleNewGroup } from './modules/groups/groupForm.js';
import { displayGroups } from './modules/groups/groupList.js';
import { initializeChatSelection } from './modules/chat/chatHandler.js';
import { initializeMessageInput } from './modules/chat/messageHandler.js';

function checkAuth() {
    const authToken = localStorage.getItem('auth_token');
    const currentPath = window.location.pathname;
    
    if (!authToken && currentPath !== './login.html') {
        window.location.href = './login.html';
        return false;
    }
    
    if (authToken && currentPath === './login.html') {
        window.location.href = './';
        return false;
    }
    
    return true;
}

function initializeLogout() {
    const logoutBtn = document.querySelector('#logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
    e.stopPropagation();
            localStorage.removeItem('auth_token');
            window.location.href = '/login.html';
        });
    }
}

// Ajouter cette fonction dans votre fichier main.js
function initializeNewChatMenu() {
  const newChatButton = document.querySelector('button[title="new-chat-outline"]');
  const newChatMenu = document.querySelector('#newChatMenu');

  if (!newChatButton || !newChatMenu) {
    console.warn('Les éléments du menu de nouveau chat sont manquants');
    return;
  }

  newChatButton.addEventListener('click', (e) => {
    e.stopPropagation();
    newChatMenu.classList.toggle('hidden');
  });

  document.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!newChatMenu.contains(e.target) && !newChatButton.contains(e.target)) {
      newChatMenu.classList.add('hidden');
    }
  });
}

function initializeNewChatPanel() {
  const conversationsPanel = document.querySelector('#conversationsPanel');
  const newChatPanel = document.querySelector('#newChatPanel');
  const newChatButton = document.querySelector('[data-icon="new-chat-outline"]').parentElement;
  const backButton = document.querySelector('#backToConversations');

  if (!conversationsPanel || !newChatPanel || !newChatButton || !backButton) {
    console.error('Éléments manquants pour l\'initialisation du panel de nouvelle discussion');
    return;
  }

  // Afficher le panel de nouvelle discussion
  newChatButton.addEventListener('click', () => {
    e.stopPropagation();
    conversationsPanel.style.display = 'none';
    newChatPanel.style.display = 'flex';
    loadContacts(); // Cette ligne appelle la fonction loadContacts
  });

  // Retour au panel des conversations
  backButton.addEventListener('click', () => {
    e.stopPropagation();
    newChatPanel.style.display = 'none';
    conversationsPanel.style.display = 'flex';
  });
}

async function initializeApp() {
  try {
    if (!checkAuth()) return;

    // Charger les informations du propriétaire
    const ownerResponse = await fetch('https://json-server-xp3c.onrender.com/owner');
    const owner = await ownerResponse.json();

    // Mettre à jour l'avatar dans la sidebar
    const profileAvatar = document.querySelector('.sidebar-profile');
    if (profileAvatar) {
      profileAvatar.innerHTML = `
        <div class="w-8 h-8 rounded-full bg-[#00a884] flex items-center justify-center cursor-pointer">
          ${owner.avatar ? 
            `<img src="${owner.avatar}" alt="Mon profil" class="w-full h-full rounded-full">` :
            `<span class="text-white text-sm">${owner.name[0].toUpperCase()}</span>`
          }
        </div>
      `;
    }

    // Initialiser les composants
    handleNewContact();
    handleNewGroup();
    
    await displayGroups();
    await displayContacts();

    // Initialiser les autres fonctionnalités
    initializeNewChatPanel();
    initializeSearch();
    initializeFilters();
    initializeChatSelection();
    initializeMessageInput();

  } catch (error) {
    console.error('Erreur lors de l\'initialisation:', error);
  }
}

// Fonction pour charger et afficher les contacts
async function loadContacts() {
  try {
    const [contactsResponse, ownerResponse] = await Promise.all([
      fetch('https://json-server-xp3c.onrender.com/contacts'),
      fetch('https://json-server-xp3c.onrender.com/owner')
    ]);

    const contacts = await contactsResponse.json();
    const owner = await ownerResponse.json();
    
    const contactsList = document.querySelector('#contactsList');
    if (!contactsList) return;

    // Créer le HTML pour le propriétaire
    const ownerHTML = `
      <div class="flex items-center px-6 py-3 hover:bg-[#202c33] cursor-pointer border-t border-[#222d34]">
        <div class="w-12 h-12 rounded-full bg-[#00a884] flex items-center justify-center mr-4">
          ${owner.avatar ? 
            `<img src="${owner.avatar}" alt="Mon profil" class="w-full h-full rounded-full">` :
            `<span class="text-white text-xl">${owner.name[0].toUpperCase()}</span>`
          }
        </div>
        <div>
          <h4 class="text-white">Message personnel</h4>
          <p class="text-[#8696a0] text-sm">${owner.status || "Disponible"}</p>
        </div>
      </div>
    `;

    // Générer le HTML pour les contacts
    const contactsHTML = contacts.map(contact => `
      <div class="flex items-center px-6 py-3 hover:bg-[#202c33] cursor-pointer">
        <div class="w-12 h-12 rounded-full bg-[#00a884] flex items-center justify-center mr-4">
          ${contact.avatar ? 
            `<img src="${contact.avatar}" alt="${contact.name}" class="w-full h-full rounded-full">` :
            `<span class="text-white text-xl">${contact.name[0].toUpperCase()}</span>`
          }
        </div>
        <div>
          <h4 class="text-white">${contact.name}</h4>
          <p class="text-[#8696a0] text-sm">${contact.status || "Salut ! J'utilise WhatsChat."}</p>
        </div>
      </div>
    `).join('');

    // Structure finale
    contactsList.innerHTML = `
      ${ownerHTML}
      <!-- Autres contacts -->
      <div class="mt-4">
        <h3 class="text-[#008069] text-sm px-6 py-3">#</h3>
        ${contactsHTML}
      </div>
    `;

  } catch (error) {
    console.error('Erreur lors du chargement des contacts:', error);
  }
}

// Ajouter dans votre main.js
function initializeContactFunctions() {
  const newContactButton = document.querySelector('#newContactButton');
  
  if (!newContactButton) {
    console.error('Bouton nouveau contact non trouvé');
    return;
  }

  newContactButton.addEventListener('click', () => {
    e.stopPropagation();
    console.log('Clic sur nouveau contact');
    showContactModal();
  });
}

// Assurez-vous que la fonction est appelée au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    e.stopPropagation();
  initializeContactFunctions();
});

function showContactModal() {
  const modal = createContactModal();
  document.body.appendChild(modal);
  initializeContactModalHandlers(modal);
}

function createContactModal() {
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
  modal.innerHTML = `
    <div class="bg-[#202c33] rounded-lg p-6 w-[480px]">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-white text-xl">Nouveau contact</h2>
        <button class="text-[#aebac1] hover:text-white" id="closeContactModal">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
      </div>

      <form id="newContactForm" class="space-y-6">
        <div class="space-y-4">
          <div>
            <label class="block text-[#aebac1] text-sm mb-2" for="contactName">
              Nom
            </label>
            <input 
              type="text" 
              id="contactName" 
              name="name"
              required
              class="w-full bg-[#2a3942] text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00a884]"
              placeholder="Entrez le nom du contact"
            >
          </div>

          <div>
            <label class="block text-[#aebac1] text-sm mb-2" for="contactPhone">
              Numéro de téléphone
            </label>
            <input 
              type="tel" 
              id="contactPhone" 
              name="phone"
              required
              class="w-full bg-[#2a3942] text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00a884]"
              placeholder="+221 XX XXX XX XX"
            >
          </div>
        </div>

        <button 
          type="submit"
          class="w-full bg-[#00a884] text-white py-2 rounded-lg hover:bg-[#008070] transition-colors"
        >
          Ajouter le contact
        </button>
      </form>
    </div>
  `;
  return modal;
}

function initializeContactModalHandlers(modal) {
  const closeButton = modal.querySelector('#closeContactModal');
  const form = modal.querySelector('#newContactForm');

  closeButton.addEventListener('click', () => {
    modal.remove();
  });

  form.addEventListener('submit', async (e) => {
    e.stopPropagation();
    e.preventDefault();
    
    const formData = new FormData(form);
    const contactData = {
      name: formData.get('name'),
      phone: formData.get('phone'),
      avatar: formData.get('name').charAt(0).toUpperCase(),
      status: "Salut ! J'utilise WhatsChat."
    };

    try {
      const response = await fetch('https://json-server-xp3c.onrender.com/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactData)
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la création du contact');
      }

      // Recharger les contacts et fermer le modal
      modal.remove();
      loadContacts();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la création du contact');
    }
  });
}

// S'assurer que l'app est initialisée au chargement
document.addEventListener('DOMContentLoaded', initializeApp);
e.stopPropagation();