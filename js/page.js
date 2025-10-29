const closeThreshold = 150;
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

    // $fsm.removeClass('open');
    $fsm.css('left', '100dvw');
    setTimeout(() => {
        $fsm.remove();
    }, 200);
}

function closeAllFullScreenModal() {
    const $fullScreenModal = $('.full-screen-modal');
    // $fullScreenModal.removeClass('open');
    $fullScreenModal.css('left', '100dvw');
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

    // Full-Screen Modal
    // 左にスライドで閉じるように
    let fsmTouchStartPos;
    $(document).on('touchstart', '.full-screen-modal.open', function(e) {
        fsmTouchStartPos = e.changedTouches[0].pageX;
        $(this).css('transition', '0');

        e.stopPropagation();
    });

    let fsmMoving = false;
    $(document).on('touchmove', '.full-screen-modal.open', function(e) {
        const touchPos = e.changedTouches[0].pageX;
        const threshold = 30;
        
        if(touchPos - fsmTouchStartPos > threshold || (fsmMoving && touchPos - fsmTouchStartPos > 0)) {
            $(this).css('left', (touchPos - fsmTouchStartPos) + 'px');
            fsmMoving = true;
        }else {
            fsmMoving = false;
        }

        e.stopPropagation();
    });

    $(document).on('touchend', '.full-screen-modal.open', function(e) {
        const touchPos = e.changedTouches[0].pageX;
        $(this).css('transition', '0.2s');

        if(touchPos - fsmTouchStartPos > closeThreshold) {
            closeFullScreenModal(fullScreenModalId);
        } else {
            $(this).css('left', '0');
        }

        e.stopPropagation();
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
    let lastScrollY = [
        $('.page[data-page-num="0"]').scrollTop(),
        $('.page[data-page-num="1"]').scrollTop(),
    ];
    const threshold = 50;

    $('.page').on('scroll', function () {
        const $page = $(this);
        const pageNum = $page.data('page-num');
        const currentScrollY = $page.scrollTop();
        const diff = currentScrollY - lastScrollY[pageNum];

        if (Math.abs(diff) > threshold) {
            if (diff > 0) {
                $('header').addClass('hidden');
                $('.toggle-btn').addClass('hidden');
            } else {
                $('header').removeClass('hidden');
                $('.toggle-btn').removeClass('hidden');
            }
            lastScrollY[pageNum] = currentScrollY;
        }
    });
});