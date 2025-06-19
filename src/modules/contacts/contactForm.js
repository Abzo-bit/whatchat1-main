import { generateContactId } from '../../utils/idGenerator.js';
import { validatePhone, validateName, formatPhone } from '../../utils/validations.js';
import { showError } from '../../utils/error-handling.js';

export function handleNewContact() {
    const newContactButton = document.querySelector('#newContactButton');
    
    if (newContactButton) {
        newContactButton.addEventListener('click', (e) => {
            e.preventDefault();
            const modal = createContactModal();
            document.body.appendChild(modal);
            
            // Gestionnaire de fermeture pour le bouton X
            const closeButton = modal.querySelector('#closeModal');
            closeButton?.addEventListener('click', (e) => {
                e.preventDefault();
                modal.remove();
            });

            // Gestionnaire de fermeture en cliquant en dehors du modal
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    const form = modal.querySelector('#newContactForm');
                    if (form) {
                        form.reset();
                    }
                    modal.remove();
                }
            });

            // Empêcher la propagation des clics depuis le contenu du modal
            const modalContent = modal.querySelector('[class*="bg-[#202c33]"]'); // Modification ici
            if (modalContent) {
                modalContent.addEventListener('click', (e) => {
                    e.stopPropagation();
                });
            }

            initializeContactForm(modal);
        });
    }
}

function initializeContactForm(modal) {
    const form = modal.querySelector('#newContactForm');
    const nameInput = form.querySelector('#contactName');
    const phoneInput = form.querySelector('#contactPhone');
    
    phoneInput.addEventListener('input', (e) => {
        e.preventDefault();
        const isValid = validatePhone(e.target.value);
        toggleError(phoneInput, isValid, 'Format invalide (ex: +221 7X XXX XX XX)');
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        try {
            const formData = {
                id: generateContactId(), // Utiliser generateContactId au lieu de generateUniqueId
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
            window.location.reload();
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
    modal.className = 'fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-fadeIn';
    modal.innerHTML = `
      <div class="bg-[#202c33] w-[480px] rounded-lg overflow-hidden shadow-xl transform transition-all">
        <!-- Header -->
        <div class="bg-[#008069] px-6 py-4 flex items-center gap-6">
          <button class="text-white hover:opacity-80" id="closeModal">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              <path d="M19.8 4.8l-1.6-1.6L12 9.5 5.8 3.2 4.2 4.8l6.2 6.3-6.2 6.3 1.6 1.6L12 12.7l6.2 6.3 1.6-1.6-6.2-6.3"/>
            </svg>
          </button>
          <h2 class="text-white text-xl font-medium">Nouveau contact</h2>
        </div>

        <!-- Formulaire -->
        <form id="newContactForm" class="p-6 space-y-6">
          <!-- Photo de profil -->
          <div class="flex justify-center">
            <div class="relative group">
              <div class="w-24 h-24 rounded-full bg-[#00a884] flex items-center justify-center cursor-pointer overflow-hidden hover:opacity-90">
                <span class="text-white text-4xl" id="avatarPreview"><i class="fa-solid fa-user-plus"></i></span>
              </div>
              <input type="file" id="avatarInput" class="hidden" accept="image/*">
            </div>
          </div>

          <!-- Champs du formulaire -->
          <div class="space-y-4">
            <div class="relative">
              <input 
                type="text" 
                id="contactName" 
                name="name"
                class="peer w-full bg-transparent text-white px-4 py-3 border-b border-[#8696a026] focus:border-[#00a884] focus:outline-none transition-colors placeholder-transparent"
                placeholder="Nom"
              >
              <label 
                for="contactName" 
                class="absolute left-4 -top-2.5 text-sm text-[#8696a0] transition-all
                       peer-placeholder-shown:text-base peer-placeholder-shown:top-3 
                       peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-[#00a884]"
              >
                Nom <span class="text-red-500">*</span>
              </label>
            </div>

            <div class="relative">
              <input 
                type="tel" 
                id="contactPhone" 
                name="phone
                class="peer w-full bg-transparent text-white px-4 py-3 border-b border-[#8696a026] focus:border-[#00a884] focus:outline-none transition-colors placeholder-transparent"
                placeholder="Téléphone"
              >
              <label 
                for="contactPhone" 
                class="absolute left-4 -top-2.5 text-sm text-[#8696a0] transition-all
                       peer-placeholder-shown:text-base peer-placeholder-shown:top-3 
                       peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-[#00a884]"
              >
                Numéro de téléphone <span class="text-red-500">*</span>
              </label>
              <p class="mt-1 text-xs text-[#8696a0]">Exemple: +221 7X XXX XX XX</p>
            </div>
          </div>

          <!-- Messages d'erreur -->
          <div class="space-y-2">
            <p class="name-error hidden text-red-500 text-sm"></p>
            <p class="phone-error hidden text-red-500 text-sm"></p>
          </div>

          <!-- Bouton de soumission -->
          <div class="flex justify-end pt-4 border-t border-[#8696a026]">
            <button 
              type="submit"
              class="bg-[#00a884] text-white px-6 py-2 rounded-lg hover:bg-[#008069] transition-colors
                     disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <span>Ajouter le contact</span>
              <svg class="w-5 h-5 hidden" id="loadingSpinner" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </button>
          </div>
        </form>
      </div>
    `;
    return modal;
}
