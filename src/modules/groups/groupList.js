export async function displayGroups() {
  try {
    const response = await fetch('https://json-server-xp3c.onrender.com/groups');
    const groups = await response.json();
    
    const conversationsList = document.querySelector('#conversationsList');
    if (!conversationsList) {
      console.error('Liste des conversations non trouvée');
      return;
    }

    // Créer le HTML pour chaque groupe
    groups.forEach(group => {
      const groupHTML = `
        <div class="group-conversation flex items-center px-4 py-3 hover:bg-[#202c33] cursor-pointer" 
             data-group-id="${group.id}" 
             data-name="${group.name}">
          <div class="w-12 h-12 rounded-full bg-[#00a884] flex items-center justify-center mr-4">
            <span class="text-white text-xl">${group.avatar || group.name.charAt(0).toUpperCase()}</span>
          </div>
          <div class="flex-1">
            <div class="flex justify-between items-center">
              <h4 class="text-white text-[15px]">${group.name}</h4>
              <span class="text-[#8696a0] text-xs">${group.timestamp || 'Aujourd\'hui'}</span>
            </div>
            <p class="text-[#8696a0] text-sm">
              ${group.lastMessage || `${group.participants?.length || 0} participants`}
            </p>
          </div>
        </div>
      `;

      conversationsList.insertAdjacentHTML('afterbegin', groupHTML);
    });

  } catch (error) {
    console.error('Erreur lors du chargement des groupes:', error);
  }
}

// Ajout d'un console.log pour déboguer
async function selectGroup(groupId) {
  console.log('Groupe sélectionné:', groupId);
  try {
    const response = await fetch(`https://json-server-xp3c.onrender.com/groups/${groupId}`);
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération du groupe');
    }
    const group = await response.json();
    console.log('Données du groupe:', group);
    updateGroupHeader(group);
  } catch (error) {
    console.error('Erreur:', error);
  }
}

function updateGroupHeader(group) {
  const chatHeader = document.querySelector('header');
  if (!chatHeader) return;

  chatHeader.innerHTML = `
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 rounded-full bg-[#00a884] flex items-center justify-center">
        <span class="text-white text-xl">${group.avatar || group.name.charAt(0).toUpperCase()}</span>
      </div>
      <div class="flex flex-col">
        <h2 class="text-white text-sm font-medium">${group.name}</h2>
        <p class="text-[#8696a0] text-xs">${group.participants?.length || 0} participants</p>
      </div>
    </div>
    <div class="flex items-center gap-4">
      <button class="text-[#aebac1] hover:text-white transition-colors">
        <svg viewBox="0 0 24 24" height="24" width="24" fill="currentColor">
          <path d="M15.9 14.3H15l-0.3-0.3c1-1.1 1.6-2.7 1.6-4.3 0-3.7-3-6.7-6.7-6.7S3 6 3 9.7s3 6.7 6.7 6.7c1.6 0 3.2-0.6 4.3-1.6l0.3 0.3v0.8l5.1 5.1 1.5-1.5-5-5.2zm-6.2 0c-2.6 0-4.6-2.1-4.6-4.6s2.1-4.6 4.6-4.6 4.6 2.1 4.6 4.6-2 4.6-4.6 4.6z"></path>
        </svg>
      </button>
      <button class="text-[#aebac1] hover:text-white transition-colors">
        <svg viewBox="0 0 24 24" height="24" width="24" fill="currentColor">
          <path d="M12 7a2 2 0 1 0-.001-4.001A2 2 0 0 0 12 7zm0 2a2 2 0 1 0-.001 3.999A2 2 0 0 0 12 9zm0 6a2 2 0 1 0-.001 3.999A2 2 0 0 0 12 15z"></path>
        </svg>
      </button>
    </div>
  `;
}