import { generateGroupId } from '../../utils/idGenerator.js';
import { createGroupModal, closeModal } from '../modal/formHandler.js';
import { showError } from '../../utils/error-handling.js';
import { displayGroups } from './groupList.js';
import { saveSelectedConversation } from '../storage/storageManager.js';
import { loadRecentConversations } from '../chat/chatHandler.js';
import { DEFAULT_AVATAR } from './../../utils/assets.js';
function validateGroupData(groupName, participants) {
  if (!groupName || groupName.trim().length < 3) {
    throw new Error('Le nom du groupe doit contenir au moins 3 caractères');
  }
  
  if (!participants || participants.length < 2) {
    throw new Error('Sélectionnez au moins 2 participants');
  }
  
  return true;
}

export function handleNewGroup() {
  const newGroupButton = document.querySelector('#newGroupButton');
  
  if (!newGroupButton) {
    console.warn('Bouton nouveau groupe non trouvé');
    return;
  }

  newGroupButton.addEventListener('click', (e) => {
    const modal = createGroupModal();
    document.body.appendChild(modal);
    
    // Ajouter les gestionnaires d'événements pour la fermeture
    const closeButton = modal.querySelector('#closeModal');
    const modalBackground = modal;
    
    // Fermeture par le bouton X
    closeButton.addEventListener('click', () => {
      closeModal(modal, modal.querySelector('form'));
    });

    // Fermeture en cliquant en dehors du modal
    modalBackground.addEventListener('click', (e) => {
      if (e.target === modalBackground) {
        closeModal(modal, modal.querySelector('form'));
      }
    });

    // Initialiser le formulaire
    initializeGroupForm(modal);
  });
}

function validateForm(groupName, selectedParticipants) {
  const errors = {};
  
  // Validation du nom du groupe
  if (!groupName) {
    errors.name = "Le nom du groupe est requis";
  } else if (groupName.length < 3) {
    errors.name = "Le nom doit contenir au moins 3 caractères";
  } else if (groupName.length > 20) {
    errors.name = "Le nom ne doit pas dépasser 50 caractères";
  }

  // Validation des participants
  if (!selectedParticipants || selectedParticipants.length < 2) {
    errors.participants = "Sélectionnez au moins 2 participants";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

async function initializeGroupForm(modal) {
  const form = modal.querySelector('#newGroupForm');
  if (!form) {
    console.error('Formulaire de groupe non trouvé');
    return;
  }

  const groupNameInput = form.querySelector('#groupName');
  const submitButton = form.querySelector('button[type="submit"]');
  let selectedParticipantsCount = 0;

  // Validation en temps réel du nom
  groupNameInput.addEventListener('input', (e) => {
    e.preventDefault();
    const value = e.target.value.trim();
    const errorElement = form.querySelector('.error-message');
    let isValid = true;

    if (!value) {
      showFieldError(errorElement, "Le nom du groupe est requis");
      isValid = false;
    } else if (value.length < 3) {
      showFieldError(errorElement, "Le nom doit contenir au moins 3 caractères");
      isValid = false;
    } else if (value.length > 20) {
      showFieldError(errorElement, "Le nom ne doit pas dépasser 50 caractères");
      isValid = false;
    } else {
      hideFieldError(errorElement);
    }

    updateSubmitButton();
  });

  // Chargement et gestion des participants
  try {
    const response = await fetch('https://json-server-xp3c.onrender.com/contacts');
    const contacts = await response.json();
    
    const participantsList = modal.querySelector('#participantsList');
    participantsList.innerHTML = contacts.map(contact => `
      <div class="flex items-center px-4 py-2 hover:bg-[#2a3942] rounded">
        <input 
          type="checkbox" 
          id="contact-${contact.id}" 
          name="participants" 
          value="${contact.id}"
          class="mr-3"
        >
        <label for="contact-${contact.id}" class="flex items-center gap-3 cursor-pointer">
          <div class="w-10 h-10 rounded-full bg-[#00a884] flex items-center justify-center">
            ${contact.avatar ? 
              `<img src="${DEFAULT_AVATAR}" alt="${contact.name}" class="w-full h-full rounded-full">` :
              `<span class="text-white">${contact.name.charAt(0).toUpperCase()}</span>`
            }
          </div>
          <span class="text-white">${contact.name}</span>
        </label>
      </div>
    `).join('');

    // Gestion des changements de sélection
    const checkboxes = participantsList.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
      checkbox.addEventListener('change', () => {
        selectedParticipantsCount = Array.from(checkboxes).filter(cb => cb.checked).length;
        const errorElement = form.querySelector('.participants-error');
        
        if (selectedParticipantsCount < 2) {
          showFieldError(errorElement, "Sélectionnez au moins 2 participants");
        } else {
          hideFieldError(errorElement);
        }

        updateSubmitButton();
      });
    });

  } catch (error) {
    showError('Erreur lors du chargement des contacts');
  }

  // Fonction de mise à jour du bouton submit
  function updateSubmitButton() {
    const nameValid = groupNameInput.value.trim().length >= 3;
    const participantsValid = selectedParticipantsCount >= 2;
    submitButton.disabled = !(nameValid && participantsValid);
  }

  // Gestion de la soumission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const formData = new FormData(form);
    const groupName = formData.get('name').trim();
    const selectedParticipants = Array.from(form.querySelectorAll('input[name="participants"]:checked'))
      .map(input => input.value);

    const validation = validateForm(groupName, selectedParticipants);
    
    if (!validation.isValid) {
      Object.entries(validation.errors).forEach(([field, message]) => {
        const errorElement = form.querySelector(`.${field}-error`);
        if (errorElement) {
          showFieldError(errorElement, message);
        }
      });
      return;
    }

    try {
      // Vérifier si le groupe existe déjà
      const existingGroups = await fetch('https://json-server-xp3c.onrender.com/groups').then(r => r.json());
      const groupExists = existingGroups.some(g => g.name.toLowerCase() === groupName.toLowerCase());

      if (groupExists) {
        showError('Un groupe avec ce nom existe déjà');
        return;
      }

      // Créer le nouveau groupe avec le nouveau format d'ID
      const newGroup = {
        id: generateGroupId(),
        name: groupName,
        participants: selectedParticipants,
        createdAt: new Date().toISOString(),
        avatar: groupName.charAt(0).toUpperCase(),
        lastMessage: "",
        timestamp: new Date().toISOString(),
        type: 'group'
      };

      const response = await fetch('https://json-server-xp3c.onrender.com/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newGroup)
      });

      if (!response.ok) throw new Error('Erreur lors de la création du groupe');

      // Sauvegarder le groupe dans les conversations sélectionnées
      saveSelectedConversation({
        id: newGroup.id,
        name: newGroup.name,
        type: 'group',
        timestamp: newGroup.timestamp,
        lastMessage: newGroup.lastMessage,
        status: `${selectedParticipants.length} participants`
      });

      // Fermer le modal et actualiser les conversations
      modal.remove();
      await loadRecentConversations();
      showError('Groupe créé avec succès !', 'success');

    } catch (error) {
      console.error('Erreur:', error);
      showError('Erreur lors de la création du groupe');
    }
  });
}

function showFieldError(element, message) {
  element.textContent = message;
  element.classList.remove('hidden');
}

function hideFieldError(element) {
  element.textContent = '';
  element.classList.add('hidden');
}