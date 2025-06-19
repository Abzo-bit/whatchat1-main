/**
 * Affiche un message d'erreur ou de succès
 * @param {string} message - Le message à afficher
 * @param {string} type - Le type de message ('error' ou 'success')
 * @param {number} duration - Durée d'affichage en ms
 */
export function showError(message, type = 'error', duration = 3000) {
  const errorDiv = document.createElement('div');
  const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
  
  errorDiv.className = `fixed top-4 right-4 ${bgColor} text-white px-4 py-2 rounded shadow-lg z-50`;
  errorDiv.textContent = message;
  
  document.body.appendChild(errorDiv);
  setTimeout(() => errorDiv.remove(), duration);
}