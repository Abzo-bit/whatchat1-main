import { 
    fetchContacts, 
    createContact,
    initializeContactModal 
} from './modules/contacts/index.js';
import { API_URL } from './config.js';
import { initializeFilters } from './filters.js';
import { initializeSearch } from './search.js';
import { preloadImages } from './utils/assets.js';
import { handleNewContact } from './modules/contacts/contactForm.js';
import { handleNewGroup } from './modules/groups/groupForm.js';
import { displayGroups } from './modules/groups/groupList.js';
import { initializeChatSelection, loadRecentConversations } from './modules/chat/chatHandler.js';
import { initializeMessageInput, handleSendMessage } from './modules/chat/messageHandler.js';
import { updateAllContactsWithNewFields, simulateStatusChanges } from './modules/contacts/services/contactService.js';
import { loadContacts } from './modules/contacts/contactList.js';

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
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault(); // Changé de stopPropagation à preventDefault
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
    e.preventDefault(); // Utiliser preventDefault au lieu de stopPropagation
    newChatMenu.classList.toggle('hidden');
  });

  document.addEventListener('click', (e) => {
    e.preventDefault(); 
    if (!newChatMenu.contains(e.target) && !newChatButton.contains(e.target)) {
      newChatMenu.classList.add('hidden');
    }
  });
}

function initializeNewChatPanel() {
  const conversationsPanel = document.querySelector('#conversationsPanel');
  const newChatPanel = document.querySelector('#newChatPanel');
  const newChatButton = document.querySelector('[data-icon="new-chat-outline"]')?.parentElement;
  const backButton = document.querySelector('#backToConversations');

  if (!conversationsPanel || !newChatPanel || !newChatButton || !backButton) {
    console.error('Éléments manquants pour l\'initialisation du panel de nouvelle discussion');
    return;
  }

  // Afficher le panel de nouvelle discussion
  newChatButton.addEventListener('click', (e) => {
    e.preventDefault();
    conversationsPanel.style.display = 'none';
    newChatPanel.style.display = 'flex';
    loadContacts(); // Utilisation de la fonction importée
  });

  // Retour au panel des conversations
  backButton.addEventListener('click', (e) => {
    e.preventDefault(); // Utiliser preventDefault au lieu de stopPropagation
    newChatPanel.style.display = 'none';
    conversationsPanel.style.display = 'flex';
  });
}

export async function initializeApp() {
    try {
        if (!checkAuth()) return;
        
        if (window.appInitialized) {
            console.log('Application déjà initialisée');
            return;
        }
        
        // Mettre à jour les contacts avec les nouveaux champs
        console.log('Mise à jour des contacts...');
        // await updateAllContactsWithNewFields();
        console.log('Mise à jour des contacts terminée');
        
        // Initialiser la simulation des statuts (optionnel, pour la démo)
        await simulateStatusChanges();
        
        // Initialiser les composants
        handleNewContact();
        handleNewGroup();
        initializeNewChatPanel();
        initializeSearch();
        initializeFilters();
        initializeChatSelection();
        initializeMessageInput();
        
        // Charger les conversations une seule fois
        // await loadRecentConversations();

        // Ajoutez également l'initialisation des statuts
        initializeStatusUpdates();
        
        window.appInitialized = true;
        console.log('Application initialisée avec succès');
    } catch (error) {
        console.error('Erreur lors de l\'initialisation:', error);
    }
}

// Utiliser createContactModal() et initializeContactModalHandlers() directement sans redéfinir showContactModal
function initializeContactFunctions() {
  const newContactButton = document.querySelector('#newContactButton');
    
  if (!newContactButton) {
    console.error('Bouton nouveau contact non trouvé');
    return;
  }

  newContactButton.addEventListener('click', (e) => {
    e.preventDefault();
    console.log('Clic sur nouveau contact');
    const modal = createContactModal();
    document.body.appendChild(modal);
    initializeContactModalHandlers(modal);
  });
}

// Ne garder que celle-ci
document.addEventListener('DOMContentLoaded', async () => {
  if (window.appInitialized) return;
  
  try {
    if (!checkAuth()) return;
    
    // Gérer les ressources statiques
    handleStaticResources();
    
    // Charger les conversations sauvegardées
    await loadRecentConversations();
    
    // Initialiser le reste de l'application 
    initializeApp();
    
    window.appInitialized = true;
  } catch (error) {
    console.error('Erreur lors de l\'initialisation:', error);
  }
});

// Ajoutez cette fonction pour gérer les ressources statiques
function handleStaticResources() {
  // Gérer les erreurs d'images
  const images = document.querySelectorAll('img');
  images.forEach(img => {
    img.onerror = () => {
      img.src = '/default-avatar.png'; // Image par défaut
    };
  });
  
  // Gérer les erreurs de fonts
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
  link.onerror = () => {
    // Charger une version locale en fallback
    const localLink = document.createElement('link');
    localLink.rel = 'stylesheet';
    localLink.href = '/assets/fonts/fontawesome.min.css';
    document.head.appendChild(localLink);
  };
  document.head.appendChild(link);
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

    closeButton.addEventListener('click', (e) => {
        e.preventDefault();
        modal.remove();
    });

    form.addEventListener('submit', async (e) => {
      e.stopPropagation(); // Empêcher le comportement par défaut
        e.preventDefault(); // Utiliser seulement preventDefault ici
        
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

            modal.remove();
            await loadContacts(); // Ajout de await ici
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur lors de la création du contact');
        }
    });
}

// Ajouter cette fonction
function initializeStatusUpdates() {
  // Mettre à jour les statuts toutes les 60 secondes
  setInterval(async () => {
    try {
      const response = await fetch(`${API_URL}/contacts`);
      const contacts = await response.json();
      
      // Mettre à jour les statuts dans l'interface
      contacts.forEach(contact => {
        const contactElement = document.querySelector(`[data-id="${contact.id}"]`);
        if (contactElement) {
          const statusElement = contactElement.querySelector('.text-xs span');
          if (statusElement) {
            if (contact.isOnline) {
              statusElement.className = 'text-[#00a884]';
              statusElement.textContent = 'en ligne';
            } else {
              statusElement.className = 'text-[#8696a0]';
              statusElement.textContent = formatLastSeen(contact.lastSeen);
            }
          }
        }
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour des statuts:', error);
    }
  }, 60000); // 60 secondes
}
