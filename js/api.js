const url = 'https://script.google.com/macros/s/AKfycbx0qli8RKgftFgl5GNetRMHkKl6S048rd8vXjXGO1kVOT_ozaDt6QFxnucJAsoPcY4/exec';
let SECRET_TOKEN = 'd47f6f90-db00-4208-a56b-0c3640837f33';

function get(params, funcOk = null, funcFinally=null) {
    const query = new URLSearchParams({
        token: SECRET_TOKEN,
        sheet: params.sheet,
    });

    fetch(url + '?' + query)
        .then((res) => res.json())
        .then((data) => {
            if (data.ok) {
                if(funcOk !== null) funcOk(data.data);
            } else if (data.httpStatus === 403) {
                alert(data.error.message);
            } else {
                console.error(data.error.code, data.error.message)
            }
        })
        .catch((err) => {
            console.error(err);
        })
        .finally(() => {
            if(funcFinally !== null) funcFinally();
        });
}

function post(params, funcOk = null, funcFinally=null) {
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
                if(funcOk !== null) funcOk(data.data);
            } else if (data.httpStatus === 403) {
                alert(data.error.message);
            } else {
                console.error(data.error.code, data.error.message)
            }
        })
        .catch((err) => {
            console.error(err);
        })
        .finally(() => {
            if(funcFinally !== null) funcFinally();
        });
}

function deleteHistory(historyId) {
    if (confirm('このデータを削除しますか？')) {
        post(params = {
            sheet: 'history',
            mode: 'delete',
            uuid: historyId
        });
    }
}

function deleteSong(songId) {
    if (confirm(`この曲を削除しますか？
この曲に関するデータは完全に削除されます。`)) {
        post(params = {
            sheet: 'songs',
            mode: 'delete',
            uuid: songId
        });
    }
}