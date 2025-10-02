const version = 'Ver. 1.0.0';
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