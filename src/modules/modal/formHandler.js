import { validatePhone, validateName, formatPhone, validateContactData } from '../../utils/validations.js';
import { showError } from '../../utils/error-handling.js';

export function createGroupModal() {
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
  
  modal.innerHTML = `
    <div class="bg-[#202c33] rounded-lg p-6 w-[480px]">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-white text-xl">Nouveau groupe</h2>
        <button class="text-[#aebac1] hover:text-white" id="closeModal">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
      </div>

      <form id="newGroupForm" class="space-y-6">
        <div>
          <label class="block text-[#aebac1] text-sm mb-2" for="groupName">
            Nom du groupe
          </label>
          <input 
            type="text" 
            id="groupName" 
            name="name"
            class="w-full bg-[#2a3942] text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00a884]"
            placeholder="Entrez le nom du groupe"
          >
          <p class="error-message text-red-500 text-sm mt-1 hidden"></p>
        </div>

        <div>
          <label class="block text-[#aebac1] text-sm mb-2">
            Participants
          </label>
          <div id="participantsList" class="max-h-60 overflow-y-auto space-y-2">
            <!-- Les contacts seront injectés ici -->
          </div>
          <p class="participants-error text-red-500 text-sm mt-1 hidden"></p>
        </div>

        <button 
          type="submit"
          class="w-full bg-[#00a884] text-white py-2 rounded-lg hover:bg-[#008070] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled
        >
          Créer le groupe
        </button>
      </form>
    </div>
  `;

  return modal;
}

export async function handleSubmit(e, modal, form, createContact, fetchContacts, displayContacts) {
    e.preventDefault();
    
    const photoPreview = document.querySelector('#photoPreview');
    const formData = {
        name: form.querySelector('#contactName').value.trim(),
        phone: form.querySelector('#contactPhone').value.trim(),
        email: form.querySelector('#contactEmail').value.trim(),
        photo: photoPreview?.src
    };
    
    const { isValid, errors } = validateContactData(formData);
    
    if (!isValid) {
        showError(errors);
        return;
    }
    
    try {
        const newContact = await createContact({
            ...formData,
            id: Date.now(),
            status: "En ligne",
            lastMessage: "",
            timestamp: new Date().toLocaleTimeString(),
            unread: 0
        });

        if (newContact) {
            const updatedContacts = await fetchContacts();
            displayContacts(updatedContacts);
            closeModal(modal, form);
        }
    } catch (error) {
        console.error('Erreur:', error);
        const errorSpan = document.querySelector('#nameError');
        if (errorSpan) {
            errorSpan.textContent = "Erreur lors de la création du contact";
            errorSpan.classList.remove('hidden');
        }
    }
}

export function closeModal(modal, form) {
    if (modal && form) {
        form.reset();
        modal.remove();
    }
}