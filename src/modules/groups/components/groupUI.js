import { DEFAULT_AVATAR } from '../../../utils/assets.js';

export function createGroupHTML(group) {
    return `
        <div class="flex items-center gap-4 p-4 hover:bg-gray-800 cursor-pointer group-item" data-id="${group.id}">
            <img src="${group.photo || DEFAULT_AVATAR}" 
                 alt="${group.name}" 
                 class="w-12 h-12 rounded-full object-cover"
                 onerror="this.src='${DEFAULT_AVATAR}'">
            <div class="flex-1">
                <div class="flex justify-between">
                    <h3 class="font-semibold text-white">${group.name}</h3>
                    <span class="text-sm text-gray-400">${group.timestamp}</span>
                </div>
                <div class="flex justify-between">
                    <p class="text-sm text-gray-400">${group.lastMessage || 'Nouveau groupe'}</p>
                    ${group.unread ? `<span class="bg-green-500 text-white rounded-full px-2 py-1 text-xs">${group.unread}</span>` : ''}
                </div>
            </div>
        </div>
    `;
}

export function updateGroupHeader(group) {
    const headerName = document.querySelector('#pnom');
    const headerImage = document.querySelector('header img');
    const memberCount = document.querySelector('#memberCount');
    
    if (headerName) headerName.textContent = group.name;
    if (headerImage) headerImage.src = group.photo || DEFAULT_AVATAR;
    if (memberCount) memberCount.textContent = `${group.members.length} membres`;
}