export function initializeSearch(contacts) {
    const searchInput = document.querySelector('#searchInput');
    const contactsList = document.querySelector('#contactsList');
    
    // Attendre que le DOM soit complètement chargé
    document.addEventListener('DOMContentLoaded', () => {
        if (!searchInput || !contactsList) {
            console.warn('Éléments de recherche non trouvés dans le DOM');
            return;
        }

        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const filteredContacts = contacts.filter(contact => 
                contact.name.toLowerCase().includes(searchTerm)
            );
            displayFilteredContacts(filteredContacts);
        });
    });
}

function displayFilteredContacts(contacts) {
    const contactsList = document.querySelector('#contactsList');
    if (!contactsList) return;
    
    contactsList.innerHTML = contacts.map(contact => `
        <div class="contact-item p-4 hover:bg-whatsapp-gray-light cursor-pointer">
            <div class="flex items-center">
                <div class="w-12 h-12 rounded-full bg-whatsapp-green flex items-center justify-center text-white">
                    ${contact.avatar}
                </div>
                <div class="ml-4">
                    <h3 class="text-white">${contact.name}</h3>
                    <p class="text-gray-400">${contact.lastMessage}</p>
                </div>
            </div>
        </div>
    `).join('');
}