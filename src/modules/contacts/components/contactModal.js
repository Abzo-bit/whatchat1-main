import { showModal, closeModal } from '../../modal/modalHandlers.js';
import { handlePhotoChange } from '../../modal/photoHandler.js';
import { handleSubmit } from '../../modal/formHandler.js';

export function initializeContactModal(fetchContacts, displayContacts, createContact) {
    const modal = document.getElementById('createContactModal');
    const form = document.getElementById('createContactForm');
    const photoInput = document.getElementById('contactPhoto');
    const photoButton = document.getElementById('photoButton');
    const cancelButton = document.getElementById('cancelContact');
    const addContactButton = document.querySelector('.fa-user-plus');

    // Initialiser les écouteurs d'événements
    if (addContactButton) {
        addContactButton.addEventListener('click', (e) => {
            showModal(modal);
            e.stopPropagation();
        });
    }

    if (cancelButton) {
        cancelButton.addEventListener('click', (e) => {
            closeModal(modal, form);
            e.stopPropagation();
        });
    }

    if (photoButton) {
        photoButton.addEventListener('click', (e) => {
            photoInput.click();
            e.stopPropagation();
        });
    }

    if (photoInput) {
        photoInput.addEventListener('change', (e) => {
            handlePhotoChange(e);
            e.stopPropagation();
        });
    }

    if (form) {
        form.addEventListener('submit', (e) => 
            handleSubmit(e, modal, form, createContact, fetchContacts, displayContacts)
        );
    }

    // Fermer le modal en cliquant en dehors
    modal?.addEventListener('click', (e) => {
    e.stopPropagation();
        if (e.target === modal) {
            closeModal(modal, form);
        }
    });
}