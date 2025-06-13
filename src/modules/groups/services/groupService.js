import { API_URL } from '../../../config.js';

export async function fetchGroups() {
    try {
        const response = await fetch(`${API_URL}/groups`);
        if (!response.ok) throw new Error('Erreur de chargement des groupes');
        return await response.json();
    } catch (error) {
        console.error('Erreur:', error);
        return [];
    }
}

export async function createGroup(groupData) {
    try {
        const response = await fetch(`${API_URL}/groups`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(groupData)
        });
        if (!response.ok) throw new Error('Erreur de création du groupe');
        return await response.json();
    } catch (error) {
        console.error('Erreur:', error);
        return null;
    }
}

export async function addMemberToGroup(groupId, memberId) {
    try {
        const response = await fetch(`${API_URL}/groups/${groupId}/members`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ memberId })
        });
        if (!response.ok) throw new Error('Erreur d\'ajout du membre');
        return await response.json();
    } catch (error) {
        console.error('Erreur:', error);
        return null;
    }
}