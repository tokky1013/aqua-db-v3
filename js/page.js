// ---------------------ページ関連---------------------
function showPage(n) {
    $(`.page[data-page-num="${n}"]`).css('display', 'block');
    $(`.page:not([data-page-num="${n}"])`).css('display', 'none');
    $('#add-song-btn').css('display', n === 0 ? 'block' : 'none');

    closeSlideOver();
    closeMenu();
    closeAllFullScreenModal();
}

// ---------------------Slide Over---------------------
function openSlideOver(n) {
    $('#slide-over-container').addClass('open');
    $(`.slide-over[data-slide-over-num="${n}"]`).addClass('open');
    $(`.slide-over:not([data-slide-over-num="${n}"])`).removeClass('open');

    closeMenu();
    closeAllFullScreenModal();
}

function closeSlideOver() {
    $('.slide-over').removeClass('open');
    setTimeout(() => {
        $('#slide-over-container').removeClass('open');
    }, 200);
}

// ---------------------Burger Menu---------------------
function openMenu() {
    $('#nav-area').toggleClass('open');
    $('.toggle-btn').toggleClass('open');

    closeAllFullScreenModal();
}
function closeMenu() {
    $('#nav-area').removeClass('open');
    $('.toggle-btn').removeClass('open');
}

// ---------------------Full-Screen Modal---------------------
let fullScreenModalId = -1;
function openFullScreenModal(title, html, name) {
    fullScreenModalId++;

    const innerHtml = `
        <div class="full-screen-modal open" id="full-screen-modal-${fullScreenModalId}" data-fsm-name="${name}">
            <div class="full-screen-modal-header">
                <label class="full-screen-modal-back-btn clickable"></label>
                <h4>${title}</h4>
                <label class="full-screen-modal-close-btn clickable" onclick="closeAllFullScreenModal();"></label>
            </div>
            <div class="full-screen-modal-main">${html}</div>
        </div>`;

    const $newFullScreenModal = $(innerHtml);
    $('#full-screen-modal-container').append($newFullScreenModal);

    $(`#full-screen-modal-${fullScreenModalId} .full-screen-modal-back-btn`).on('click', (e) => {
        closeFullScreenModal(fullScreenModalId);
        e.stopPropagation();
    });

    closeSlideOver();
    closeMenu();
}

function closeFullScreenModal(fsmId, fsmName = null) {
    const $fsm = $(`#full-screen-modal-${fsmId}`);
    if(fsmName !== null) {
        if($fsm.data('fsm-name') !== fsmName) return;
    }
    if(fullScreenModalId === fsmId) fullScreenModalId--;

    $fsm.removeClass('open');
    setTimeout(() => {
        $fsm.remove();
    }, 200);
}

function closeAllFullScreenModal() {
    const $fullScreenModal = $('.full-screen-modal');
    $fullScreenModal.removeClass('open');
    fullScreenModalId = -1;
    setTimeout(() => {
        $fullScreenModal.remove();
    }, 200);
}

// ---------------------Loading Spiner---------------------
function showLoadingSpiner() {
    $('.loading').removeClass('d-none');
}
function hideLoadingSpiner() {
    $('.loading').addClass('d-none');
}

// ---------------------イベントの設定---------------------
$(function () {
    // ---------------------Slide Over---------------------
    $('#slide-over-container').on('click', closeSlideOver);
    $('.slide-over').on('click', (e) => {
        e.stopPropagation();
    });
    // ---------------------Burger Menu---------------------
    // 開閉のイベントをセット
    $('.toggle-btn').on('click', () => {
        openMenu();
    });
    $('#mask').on('click', () => {
        closeMenu();
    });

    // メニューを開いた時にスクロールしないようにする
    document.getElementById('mask').addEventListener('wheel', (e) => {
        e.preventDefault();
    }, { passive: false });
    document.getElementById('nav-area').addEventListener('wheel', (e) => {
        e.preventDefault();
    }, { passive: false });
    document.getElementById('mask').addEventListener('touchmove', (e) => {
        e.preventDefault();
    }, { passive: false });
    document.getElementById('nav-area').addEventListener('touchmove', (e) => {
        e.preventDefault();
    }, { passive: false });

    // ヘッダーの表示・非表示の切り替え
    // $(window).on('scroll', () => {
    //     const selectElement = document.querySelector('header');
    //     const selectStyle = getComputedStyle(selectElement);
    //     const styleValue = String(selectStyle.getPropertyValue('--header-height')).trim();
    //     const headerHeight = styleValue.replace('px', '') - 0;

    //     const scrollHeight = $(this).scrollTop();
    //     if (scrollHeight > headerHeight) {
    //         $('header').addClass('hidden');
    //         $('.toggle-btn').addClass('hidden');
    //     } else {
    //         $('header').removeClass('hidden');
    //         $('.toggle-btn').removeClass('hidden');
    //     }
    // });

    let lastScrollY = $(window).scrollTop();
    const threshold = 50;

    $(window).on('scroll', function () {
        const currentScrollY = $(this).scrollTop();
        const diff = currentScrollY - lastScrollY;

        if (Math.abs(diff) > threshold) {
            if (diff > 0) {
                $('header').addClass('hidden');
                $('.toggle-btn').addClass('hidden');
            } else {
                $('header').removeClass('hidden');
                $('.toggle-btn').removeClass('hidden');
            }
            lastScrollY = currentScrollY;
        }
    });
});