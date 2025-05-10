// Shirt customizer functionality
function switchShirtView() {
    const front = document.getElementById('front');
    const back = document.getElementById('back');
    if (!front || !back) {
        console.error('Shirt preview elements not found');
        return;
    }

    const isFrontVisible = parseInt(front.style.zIndex || '2') > parseInt(back.style.zIndex || '1');
    if (isFrontVisible) {
        front.style.zIndex = '1';
        back.style.zIndex = '2';
        back.style.transform = 'translateX(0)';
        front.style.transform = 'translateX(-100%)';
    } else {
        front.style.zIndex = '2';
        back.style.zIndex = '1';
        front.style.transform = 'translateX(0)';
        back.style.transform = 'translateX(100%)';
    }
}

function addSticker(src) {
    const preview = document.querySelector('.preview[z-index="2"]') || document.getElementById('front');
    if (!preview) {
        console.error('Preview container not found');
        return;
    }

    const sticker = document.createElement('img');
    sticker.src = src;
    sticker.className = 'sticker';
    sticker.style.position = 'absolute';
    sticker.style.width = '50px';
    sticker.style.cursor = 'move';
    sticker.style.top = '50px';
    sticker.style.left = '50px';

    let isDragging = false;
    let currentX, currentY;

    function startDragging(e) {
        isDragging = true;
        const clientX = e.clientX || e.touches[0].clientX;
        const clientY = e.clientY || e.touches[0].clientY;
        currentX = clientX - parseInt(sticker.style.left || '50');
        currentY = clientY - parseInt(sticker.style.top || '50');
        e.preventDefault();
    }

    function dragSticker(e) {
        if (!isDragging) return;
        const clientX = e.clientX || e.touches[0].clientX;
        const clientY = e.clientY || e.touches[0].clientY;
        let newLeft = clientX - currentX;
        let newTop = clientY - currentY;

        // Boundary checking
        const previewRect = preview.getBoundingClientRect();
        const stickerRect = sticker.getBoundingClientRect();
        newLeft = Math.max(0, Math.min(newLeft, previewRect.width - stickerRect.width));
        newTop = Math.max(0, Math.min(newTop, previewRect.height - stickerRect.height));

        sticker.style.left = newLeft + 'px';
        sticker.style.top = newTop + 'px';
    }

    function stopDragging() {
        isDragging = false;
    }

    // Mouse events
    sticker.addEventListener('mousedown', startDragging);
    document.addEventListener('mousemove', dragSticker);
    document.addEventListener('mouseup', stopDragging);

    // Touch events for mobile
    sticker.addEventListener('touchstart', startDragging);
    document.addEventListener('touchmove', dragSticker);
    document.addEventListener('touchend', stopDragging);

    // Clean up event listeners when sticker is removed
    sticker.addEventListener('remove', () => {
        document.removeEventListener('mousemove', dragSticker);
        document.removeEventListener('mouseup', stopDragging);
        document.removeEventListener('touchmove', dragSticker);
        document.removeEventListener('touchend', stopDragging);
    });

    preview.appendChild(sticker);
} 
