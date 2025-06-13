import { DEFAULT_AVATAR } from '../../../utils/assets.js';

export function createContactHTML(contact) {
    return `
        <div class="flex items-center gap-4 p-4 hover:bg-gray-800 cursor-pointer contact-item" data-id="${contact.id}">
            <img src="${contact.photo || DEFAULT_AVATAR}" 
                 alt="${contact.name}" 
                 class="w-12 h-12 rounded-full object-cover"
                 onerror="this.onerror=null; this.src='${DEFAULT_AVATAR}';">
            <div class="flex-1">
                <div class="flex justify-between">
                    <h3 class="font-semibold text-white">${contact.name}</h3>
                    <span class="text-sm text-gray-400">${contact.timestamp}</span>
                </div>
                <div class="flex justify-between">
                    <p class="text-sm text-gray-400">${contact.lastMessage || 'Nouveau contact'}</p>
                    ${contact.unread ? `<span class="bg-green-500 text-white rounded-full px-2 py-1 text-xs">${contact.unread}</span>` : ''}
                </div>
            </div>
        </div>
    `;
}

export function updateContactHeader(contact) {
    const headerName = document.querySelector('#pnom');
    const headerImage = document.querySelector('header img');
    if (headerName) headerName.textContent = contact.name;
    if (headerImage) headerImage.src = contact.photo || DEFAULT_AVATAR;
}