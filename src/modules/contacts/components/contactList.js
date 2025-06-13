import { DEFAULT_AVATAR } from '../../../utils/assets.js';
import { createContactHTML, updateContactHeader } from './contactUI.js';

export function displayContacts(contacts) {
     if (!contacts || !Array.isArray(contacts)) {
        contacts = [];
    }
    const contactsList = document.querySelector('.flex-1.overflow-y-auto');
    if (!contactsList) {
        console.error('Liste des contacts non trouvée');
        return;
    }

    const sortedContacts = [...contacts].sort((a, b) => {
        return new Date(b.timestamp) - new Date(a.timestamp);
    });

    contactsList.innerHTML = sortedContacts.map(contact => 
        createContactHTML(contact)).join('');
    addContactListeners(sortedContacts);
}

function addContactListeners(contacts) {
    document.querySelectorAll('.contact-item').forEach(item => {
        item.addEventListener('click', () => {
            const contactId = parseInt(item.dataset.id);
            const selectedContact = contacts.find(c => c.id === contactId);
            if (selectedContact) {
                updateContactHeader(selectedContact);
                document.querySelectorAll('.contact-item').forEach(el => {
                    el.classList.remove('bg-gray-800');
                });
                item.classList.add('bg-gray-800');
            }
        });
    });
}