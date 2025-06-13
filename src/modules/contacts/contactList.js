export async function displayContacts() {
  try {
    const response = await fetch('http://localhost:3001/contacts');
    const contacts = await response.json();
    
    if (!Array.isArray(contacts)) {
      console.error('Les contacts ne sont pas dans un format valide');
      return;
    }

    const contactList = document.getElementById('contactsList');
    if (!contactList) {
      console.error('Element contact-list non trouvé');
      return;
    }

    contactList.innerHTML = '';

    contacts.forEach(contact => {
      const contactElement = document.createElement('div');
      contactElement.className = 'contact-item p-4 hover:bg-gray-100 cursor-pointer';
      contactElement.innerHTML = `
        <div class="flex items-center">
          <div class="w-12 h-12 rounded-full bg-gray-300 mr-4">
            ${contact.avatar ? `<img src="${contact.avatar}" alt="${contact.name}" class="w-full h-full rounded-full">` : ''}
          </div>
          <div>
            <h3 class="font-semibold">${contact.name}</h3>
            <p class="text-sm text-gray-600">${contact.status || 'Hey, j\'utilise WhatsChat!'}</p>
          </div>
        </div>
      `;
      contactList.appendChild(contactElement);
    });
  } catch (error) {
    console.error('Erreur lors du chargement des contacts:', error);
  }
}