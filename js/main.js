const version = "Ver. 1.0.0";
// ----------burger----------
let nav = $("#nav-area");
let btn = $(".toggle-btn");
let mask = $("#mask");

btn.on('click', () => {
    nav.toggleClass("open");
    btn.toggleClass("open");
});
mask.on('click', () => {
    closeMenu();
});

// メニューを開いた時にスクロールしないようにする
document.getElementById("mask").addEventListener("wheel", function (event) {
    event.preventDefault();
}, { passive: false });
document.getElementById("nav-area").addEventListener("wheel", function (event) {
    event.preventDefault();
}, { passive: false });

// ----------ヘッダーの表示・非表示の切り替え----------
$(window).on('scroll', () => {
    const selectElement = document.querySelector('header');
    const selectStyle = getComputedStyle(selectElement);
    const styleValue = String(selectStyle.getPropertyValue('--header-height')).trim();
    const headerHeight = styleValue.replace("px", "") - 0;

    const scrollHeight = $(this).scrollTop();
    if (scrollHeight > headerHeight) {
        $("header").addClass("hidden");
        $(".toggle-btn").addClass("hidden");
    } else {
        $("header").removeClass("hidden");
        $(".toggle-btn").removeClass("hidden");
    }
});

// ----------初期化----------
$(function () {
    showPage(0);

    // getSongsの引数で関数渡せるようにする？
    // getSongs();
    // setTimeout(function() {
    //     getData();
    // }, 500);
    // バージョンの表示
    $("#version").text(version);
});