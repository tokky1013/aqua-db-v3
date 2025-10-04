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
function openFullScreenModal(title, html) {
    fullScreenModalId++;

    const innerHtml = `
        <div class="full-screen-modal open" id="full-screen-modal-${fullScreenModalId}">
            <div class="full-screen-modal-header">
                <label class="full-screen-modal-back-btn clickable"></label>
                <h3>${title}</h3>
                <label class="full-screen-modal-close-btn clickable" onclick="closeAllFullScreenModal();"></label>
            </div>
            <div class="full-screen-modal-main">${html}</div>
        </div>`;

    const $newFullScreenModal = $(innerHtml);
    $('#full-screen-modal-container').append($newFullScreenModal);

    $(`#full-screen-modal-${fullScreenModalId} .full-screen-modal-back-btn`).on('click touchend', () => {
        $newFullScreenModal.removeClass('open');
        fullScreenModalId--;
        setTimeout(() => {
            $newFullScreenModal.remove();
        }, 200);
    });

    closeSlideOver();
    closeMenu();
}

function closeAllFullScreenModal() {
    const $fullScreenModal = $('.full-screen-modal');
    $fullScreenModal.removeClass('open');
    fullScreenModalId = -1;
    setTimeout(() => {
        $fullScreenModal.remove();
    }, 200);
}

// ---------------------イベントの設定---------------------
$(function () {
    // ---------------------Slide Over---------------------
    $('#slide-over-container').on('click touchend', closeSlideOver);
    $('.slide-over').on('click touchmove scroll touchend', (e) => {
        e.stopPropagation();
    });

    // document.getElementById('slide-over-container').addEventListener('wheel', (e) => {
    //     e.preventDefault();
    // }, { passive: false });
    document.getElementById('slide-over-container').addEventListener('touchmove', (e) => {
        e.preventDefault();
    }, { passive: false });
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

    // ----------ヘッダーの表示・非表示の切り替え----------
    $(window).on('scroll', () => {
        const selectElement = document.querySelector('header');
        const selectStyle = getComputedStyle(selectElement);
        const styleValue = String(selectStyle.getPropertyValue('--header-height')).trim();
        const headerHeight = styleValue.replace('px', '') - 0;

        const scrollHeight = $(this).scrollTop();
        if (scrollHeight > headerHeight) {
            $('header').addClass('hidden');
            $('.toggle-btn').addClass('hidden');
        } else {
            $('header').removeClass('hidden');
            $('.toggle-btn').removeClass('hidden');
        }
    });
});