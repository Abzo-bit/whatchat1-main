import { validatePhone, validateName, formatPhone } from '../../utils/validations.js';
import { showError } from '../../utils/error-handling.js';

export function handleNewContact() {
  // Utiliser le bon sélecteur qui correspond à l'ID dans le HTML
  const newContactButton = document.querySelector('#newContactButton');
  
  if (!newContactButton) {
    console.warn('Bouton nouveau contact non trouvé');
    return;
  }

  newContactButton.addEventListener('click', (e) => {
    e.stopPropagation();
    const modal = createContactModal();
    document.body.appendChild(modal);
    initializeContactForm(modal);
  });
}

function initializeContactForm(modal) {
  const form = modal.querySelector('form');
  const nameInput = form.querySelector('#contactName');
  const phoneInput = form.querySelector('#contactPhone');
  const closeBtn = modal.querySelector('#closeModal');
  
  // Validation en temps réel
  nameInput.addEventListener('input', (e) => {
    e.stopPropagation();
    const isValid = validateName(e.target.value);
    toggleError(nameInput, isValid, 'Le nom doit contenir au moins 2 caractères');
  });

  phoneInput.addEventListener('input', (e) => {
    e.stopPropagation();
    e.preventDefault()   
    const isValid = validatePhone(e.target.value);
    toggleError(phoneInput, isValid, 'Format invalide (ex: +221 7X XXX XX XX)');
    if (isValid) {
      e.target.value = formatPhone(e.target.value);
    }
  });

  // Gestion de la fermeture
  closeBtn.addEventListener('click', () => modal.remove());

  // Gestion de la soumission
  form.addEventListener('submit', async (e) => {
    e.stopPropagation();
    e.preventDefault();
    
    try {
      const formData = {
        name: nameInput.value.trim(),
        phone: phoneInput.value.trim(),
        avatar: nameInput.value.trim().charAt(0).toUpperCase(),
        status: "Salut ! J'utilise WhatsChat."
      };

      if (!validateName(formData.name)) {
        throw new Error('Nom invalide');
      }
      if (!validatePhone(formData.phone)) {
        throw new Error('Numéro de téléphone invalide');
      }

      const response = await fetch('https://json-server-xp3c.onrender.com/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la création du contact');
      }

      modal.remove();
      window.location.reload(); // Recharger pour voir le nouveau contact
    } catch (error) {
      showError(error.message);
    }
  });
}

function toggleError(input, isValid, message) {
  const errorDiv = input.parentElement.querySelector('.error-message');
  if (!isValid) {
    if (!errorDiv) {
      const error = document.createElement('p');
      error.className = 'error-message text-red-500 text-sm mt-1';
      error.textContent = message;
      input.parentElement.appendChild(error);
    }
  } else if (errorDiv) {
    errorDiv.remove();
  }
}

function createContactModal() {
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
  modal.innerHTML = `
    <div class="bg-[#202c33] rounded-lg p-6 w-[480px]">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-white text-xl">Nouveau contact</h2>
        <button class="text-[#aebac1] hover:text-white" id="closeModal">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
      </div>

      <form id="newContactForm" class="space-y-6" novalidate>
        <div class="space-y-4">
          <div>
            <label class="block text-[#aebac1] text-sm mb-2" for="contactName">
              Nom <span class="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              id="contactName" 
              name="name"
              minlength="2"
              maxlength="50"
              class="w-full bg-[#2a3942] text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00a884]"
              placeholder="Entrez le nom du contact"
            >
            <p class="name-error hidden text-red-500 text-sm mt-1"></p>
          </div>

          <div>
            <label class="block text-[#aebac1] text-sm mb-2" for="contactPhone">
              Numéro de téléphone <span class="text-red-500">*</span>
            </label>
            <input 
              type="tel" 
              id="contactPhone" 
              name="phone"
              pattern="^(\+221|221)?[76|77|78|70|75]\d{8}$"
              class="w-full bg-[#2a3942] text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00a884]"
              placeholder="+221 7X XXX XX XX"
            >
            <p class="phone-error hidden text-red-500 text-sm mt-1"></p>
          </div>
        </div>

        <button 
          type="submit"
          class="w-full bg-[#00a884] text-white py-2 rounded-lg hover:bg-[#008070] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled
        >
          Ajouter le contact
        </button>
      </form>
    </div>
  `;
  return modal;
}
