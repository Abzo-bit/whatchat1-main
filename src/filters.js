export function initializeFilters(contacts, displayContacts) {
    document.querySelectorAll('#bloc #choix').forEach(filter => {
        filter.addEventListener('click', () => {
            updateFilterUI(filter);
            const filteredContacts = filterContacts(contacts, filter.textContent);
            displayContacts(filteredContacts);
        });
    });
}

function updateFilterUI(selectedFilter) {
    document.querySelectorAll('#bloc #choix').forEach(f => 
        f.classList.remove('bg-gray-800', 'text-white'));
    selectedFilter.classList.add('bg-gray-800', 'text-white');
}

function filterContacts(contacts, filterType) {
    switch(filterType) {
        case 'Non lues':
            return contacts.filter(c => c.unread > 0);
        case 'Favoris':
            return contacts.filter(c => c.favorite);
        case 'Groupe':
            return contacts.filter(c => c.isGroup);
        default:
            return [...contacts];
    }
}