export function showModal(modal) {
    if (modal) {
        modal.classList.remove('hidden');
        const modalContent = modal.querySelector('.bg-gray-800');
        if (modalContent) {
            modalContent.classList.add('scale-105');
            setTimeout(() => {
                modalContent.classList.remove('scale-105');
            }, 50);
        }
    }
}

export function closeModal(modal, form) {
    modal.querySelector('.bg-gray-800').classList.add('scale-95');
    setTimeout(() => {
        modal.classList.add('hidden');
        form.reset();
        document.querySelector('#photoPreview').classList.add('hidden');
        clearErrors();
    }, 200);
}

export function clearErrors() {
    document.querySelectorAll('.text-red-500').forEach(error => {
        error.classList.add('hidden');
        error.textContent = '';
    });
}

export function showErrors(errors) {
    Object.keys(errors).forEach(field => {
        const errorSpan = document.querySelector(`#${field}Error`);
        errorSpan.textContent = errors[field];
        errorSpan.classList.remove('hidden');
    });
}