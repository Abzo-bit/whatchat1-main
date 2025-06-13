export function showTemporaryNotification(message, duration = 30000) {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-gray-800 text-white px-6 py-4 rounded-lg shadow-xl z-50 transform transition-all duration-300 ease-in-out translate-y-0 opacity-100';
    
    // Contenu du message
    const messageDiv = document.createElement('div');
    messageDiv.className = 'flex items-center space-x-4';
    messageDiv.innerHTML = `
        <span class="text-lg">${message}</span>
    `;
    
    // Timer
    const timer = document.createElement('div');
    timer.className = 'mt-2 text-sm text-gray-400';
    
    notification.appendChild(messageDiv);
    notification.appendChild(timer);
    document.body.appendChild(notification);

    let timeLeft = duration / 1000;
    const interval = setInterval(() => {
        timeLeft -= 1;
        timer.textContent = `Disparaît dans ${timeLeft}s`;
        
        if (timeLeft <= 0) {
            notification.classList.replace('opacity-100', 'opacity-0');
            notification.classList.replace('translate-y-0', '-translate-y-4');
            
            setTimeout(() => {
                notification.remove();
                clearInterval(interval);
            }, 300);
        }
    }, 1000);
}