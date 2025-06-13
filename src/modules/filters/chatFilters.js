export function initializeFilters() {
  const filterButtons = document.querySelectorAll('nav button');
  const contactsList = document.querySelector('#contactsList');

  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
          e.stoppropagation();
      // Retirer la classe active de tous les boutons
      filterButtons.forEach(btn => {
        btn.classList.remove('text-[#00a884]', 'border-[#00a884]');
        btn.classList.add('hover:text-white', 'border-transparent');
      });

      // Ajouter la classe active au bouton cliqué
      button.classList.add('text-[#00a884]', 'border-[#00a884]');
      button.classList.remove('hover:text-white', 'border-transparent');

      // Récupérer tous les éléments nécessaires
      const groupsSection = contactsList.querySelector('.groups-section');
      const contactItems = contactsList.querySelectorAll(':scope > div:not(.groups-section)');
      
      // Filtrer selon le bouton cliqué
      const filter = button.textContent.trim().toLowerCase();
      
      switch(filter) {
        case 'groupes':
          contactItems.forEach(item => item.style.display = 'none');
          if (groupsSection) groupsSection.style.display = 'block';
          break;
        case 'toutes':
          contactItems.forEach(item => item.style.display = 'block');
          if (groupsSection) groupsSection.style.display = 'block';
          break;
        default:
          contactItems.forEach(item => item.style.display = 'block');
          if (groupsSection) groupsSection.style.display = 'none';
      }
    });
  });
}