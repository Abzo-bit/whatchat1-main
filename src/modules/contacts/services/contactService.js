import { generateContactId } from '../../../utils/idGenerator.js';
import { API_URL } from '../../../config.js';

export async function fetchContacts() {
    try {
        const response = await fetch(`${API_URL}/contacts`);
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
    try {
        const newContact = {
            ...contactData,
            id: generateContactId(),
            createdAt: new Date().toISOString(),
            isOnline: false, // Ajout du statut en ligne
            lastSeen: new Date().toISOString(), // Ajout de la dernière connexion
            status: contactData.status || "Salut ! J'utilise WhatsChat."
        };

        const response = await fetch(`${API_URL}/contacts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newContact)
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

export async function updateContactStatus(contactId, isOnline = false) {
  try {
    const updateData = {
      isOnline,
      lastSeen: isOnline ? null : new Date().toISOString()
    };

    const response = await fetch(`${API_URL}/contacts/${contactId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la mise à jour du statut');
    }

    return await response.json();
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut:', error);
    throw error;
  }
}

// Fonction pour mettre à jour tous les contacts existants avec les nouveaux champs
export async function updateAllContactsWithNewFields() {
    try {
        const contacts = await fetchContacts();
        console.log('Mise à jour des contacts existants...');
        
        const updates = contacts.map(async contact => {
            const needsUpdate = !contact.hasOwnProperty('isOnline') || 
                              !contact.hasOwnProperty('lastSeen') ||
                              !contact.hasOwnProperty('status');

            if (needsUpdate) {
                console.log(`Mise à jour du contact: ${contact.name}`);
                const updatedContact = {
                    ...contact,
                    isOnline: contact.isOnline || false,
                    lastSeen: contact.lastSeen || new Date().toISOString(),
                    status: contact.status || "Salut ! J'utilise WhatsChat."
                };

                const response = await fetch(`${API_URL}/contacts/${contact.id}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(updatedContact)
                });

                if (!response.ok) {
                    throw new Error(`Erreur lors de la mise à jour du contact ${contact.id}`);
                }

                return await response.json();
            }
            return contact;
        });

        await Promise.all(updates);
        console.log('Mise à jour des contacts terminée avec succès');
    } catch (error) {
        console.error('Erreur lors de la mise à jour des contacts:', error);
        throw error;
    }
}

// Fonction pour simuler des changements de statut aléatoires (pour la démo)
export async function simulateStatusChanges() {
    try {
        const contacts = await fetchContacts();
        
        setInterval(async () => {
            const randomContact = contacts[Math.floor(Math.random() * contacts.length)];
            const newStatus = Math.random() > 0.5;
            
            try {
                await updateContactStatus(randomContact.id, newStatus);
                console.log(`Statut de ${randomContact.name} mis à jour: ${newStatus ? 'en ligne' : 'hors ligne'}`);
            } catch (error) {
                console.error('Erreur lors de la simulation:', error);
            }
        }, 30000); // Toutes les 30 secondes
    } catch (error) {
        console.error('Erreur lors de l\'initialisation de la simulation:', error);
    }
}