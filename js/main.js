const version = 'Ver. 1.0.0';
// ----------burger----------
let nav = $('#nav-area');
let btn = $('.toggle-btn');
let mask = $('#mask');

btn.on('click', () => {
    nav.toggleClass('open');
    btn.toggleClass('open');
});
mask.on('click', () => {
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
// ----------モーダル----------
$('.modal').on('click touchstart', (e) => {
    e.stopPropagation();
});

// ----------初期化----------
$(function () {
    showPage(0);
    // バージョンの表示
    $('.version').text(version);

    // 曲のデータを取得
    getSongs(() => {
        showSongs(Object.values(songs));
        setTimeout(function() {
            // 履歴のデータを取得
            getHistories(() => {
                showHistories(Object.values(histories));
            });
        }, 100);
    });
});