import { API_URL } from '../../config.js';

export async function loadContacts() {
  console.log('Chargement des contacts...');
  try {
    const response = await fetch(`${API_URL}/contacts`);
    console.log('Réponse de l\'API:', response);
    const contacts = await response.json();
    console.log('Contacts reçus:', contacts);
    
    const contactsList = document.querySelector('#contactsList');
    if (!contactsList) return;

    const contactsHTML = contacts.map(contact => {
      const initials = contact.name
        .split(' ')
        .map(word => word[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

      // Générer le statut du contact
      const statusText = contact.isOnline 
        ? '<span class="text-[#00a884]">en ligne</span>'
        : contact.lastSeen 
          ? `<span class="text-[#8696a0]">vu la dernière fois le ${new Date(contact.lastSeen).toLocaleString()}</span>`
          : `<span class="text-[#8696a0]">${contact.status || "Salut ! J'utilise WhatsChat."}</span>`;

      return `
        <div class="flex items-center px-6 py-3 hover:bg-[#202c33] cursor-pointer contact-item" 
             data-id="${contact.id}" 
             data-type="contact">
          <div class="w-12 h-12 rounded-full bg-[#00a884] flex items-center justify-center mr-4">
            <span class="text-white text-sm font-medium">${initials}</span>
          </div>
          <div class="flex-1">
            <h4 class="text-white">${contact.name}</h4>
            <p class="text-[13px]">${statusText}</p>
          </div>
        </div>
      `;
    }).join('');

    contactsList.innerHTML = contactsHTML;
  } catch (error) {
    console.error('Erreur lors du chargement des contacts:', error);
  }
}