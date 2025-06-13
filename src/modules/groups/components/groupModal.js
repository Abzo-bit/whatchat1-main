import { showErrors } from '../../modal/modalHandlers.js';
import { validateGroup } from '../utils/groupValidator.js';

export function initializeGroupModal(createGroup, fetchGroups, displayGroups) {
    const modal = document.getElementById('createGroupModal');
    const form = document.getElementById('createGroupForm');
    const photoInput = document.getElementById('groupPhoto');
    const photoButton = document.getElementById('groupPhotoButton');
    const cancelButton = document.getElementById('cancelGroup');
    
    document.querySelector('#createGroupBtn').addEventListener('click', () => {
        modal.classList.remove('hidden');
    });

    cancelButton?.addEventListener('click', () => {
        e.stoppropagation();
        modal.classList.add('hidden');
        form.reset();
    });

    photoButton?.addEventListener('click', () => photoInput.click());
    
    form?.addEventListener('submit', async (e) => {
        e.stoppropagation();
        e.preventDefault();
        await handleGroupSubmit(e, modal, form, createGroup, fetchGroups, displayGroups);
    });
}

async function handleGroupSubmit(e, modal, form, createGroup, fetchGroups, displayGroups) {
    const formData = {
        name: form.querySelector('#groupName').value.trim(),
        description: form.querySelector('#groupDescription').value.trim(),
        photo: document.querySelector('#groupPhotoPreview').src || null,
        members: [], // À implémenter avec la sélection des membres
        createdAt: new Date().toISOString(),
        admin: localStorage.getItem('userId')
    };

    const { isValid, errors } = validateGroup(formData);
    if (!isValid) {
        showErrors(errors);
        return;
    }

    try {
        const newGroup = await createGroup(formData);
        if (newGroup) {
            const groups = await fetchGroups();
            displayGroups(groups);
            modal.classList.add('hidden');
            form.reset();
        }
    } catch (error) {
        console.error('Erreur:', error);
        showErrors({ name: "Erreur lors de la création du groupe" });
    }
}