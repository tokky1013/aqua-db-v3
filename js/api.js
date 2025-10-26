const url = 'https://script.google.com/macros/s/AKfycbz0UOCIg7jYUBBMyyYjjR0IqE6RBbCyPX76iwBpr2DDpABnRg--JOwmr71-pASpjmd6/exec';
let SECRET_TOKEN = 'd47f6f90-db00-4208-a56b-0c3640837f33';

// 最初にしか実行しない設計なので、ローディングスピナーを表示する処理は書かない
// デフォルトのhtmlを消すことでローディング中のメッセージも消す
// getのみエラー時の関数を受け取る
function get(params, funcOk = null, errorFunc=null, funcFinally = null) {
    const query = new URLSearchParams({
        token: SECRET_TOKEN,
        sheet: params.sheet,
    });

    fetch(url + '?' + query)
        .then((res) => res.json())
        .then((data) => {
            if (data.ok) {
                if (funcOk !== null) funcOk(data.data);
            } else if (data.httpStatus === 403) {
                // トークンが不正な時の処理
                if($(`#full-screen-modal-${fullScreenModalId}`).data('fsm-name') !== 'set-token' && confirm('トークンが不正です。トークンの設定ページに移動しますか？')) {
                    openSetTokenPage();
                }
            } else {
                if (errorFunc !== null) errorFunc();
                console.error(data.error.code, data.error.message);
                alert('不明なエラーが発生しました。');
            }
        })
        .catch((err) => {
            if (errorFunc !== null) errorFunc();
            console.error(err);
            alert('不明なエラーが発生しました。');
        })
        .finally(() => {
            if (funcFinally !== null) funcFinally();
        });
}

function post(params, funcOk = null, funcFinally = null) {
    // ローディングスピナーを表示
    showLoadingSpiner();

    const form = new FormData();
    form.append('token', SECRET_TOKEN);
    for (const key in params) {
        form.append(key, params[key]);
    }

    fetch(url, {
        method: 'POST',
        body: form,
    })
        .then((res) => res.json())
        .then((data) => {
            if (data.ok) {
                if (funcOk !== null) funcOk(data.data);
            } else if (data.httpStatus === 403) {
                // トークンが不正な時の処理
                if($(`#full-screen-modal-${fullScreenModalId}`).data('fsm-name') !== 'set-token' && confirm('トークンが不正です。トークンの設定ページに移動しますか？')) {
                    openSetTokenPage();
                }
            } else {
                console.error(data.error.code, data.error.message);
                alert('不明なエラーが発生しました。');
            }
        })
        .catch((err) => {
            console.error(err);
            alert('不明なエラーが発生しました。');
        })
        .finally(() => {
            if (funcFinally !== null) funcFinally();
            // ローディングスピナーを隠す
            hideLoadingSpiner();
        });
}