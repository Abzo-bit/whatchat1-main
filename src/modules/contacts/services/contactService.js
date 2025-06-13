const API_URL = import.meta.env.VITE_API_URL;

export async function fetchContacts() {
    const authToken = localStorage.getItem('auth_token');
    if (!authToken) {
        throw new Error('Token d\'authentification manquant');
    }

    try {
        const response = await fetch(`${API_URL}/contacts`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Erreur lors du chargement des contacts:', error);
        throw error;
    }
}

export async function createContact(contactData) {
    const authToken = localStorage.getItem('auth_token');
    if (!authToken) {
        throw new Error('Token d\'authentification manquant');
    }

    try {
        const response = await fetch(`${API_URL}/contacts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(contactData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Erreur lors de la création du contact');
        }

        return await response.json();
    } catch (error) {
        console.error('Erreur:', error);
        throw error;
    }
}