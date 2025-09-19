const url = "https://script.google.com/macros/s/AKfycbxViVZWS3378lxd9DSF1qYsEiXWoYM3yV-fSo3oQu1wsnpGwCZwr0xIKmRVRLjPc7us/exec";
let SECRET_TOKEN = "d47f6f90-db00-4208-a56b-0c3640837f33";

function get(params, f=function(data){}) {
    const query = new URLSearchParams({
        token : SECRET_TOKEN,
        sheet : params.sheet,
    });
    
    fetch(url + "?" + query)
        .then(res => res.json())
        .then(data => f(data))
        .catch(err => {
            alert("トークンが間違っている可能性があります。");
        });
}

function post(params, f=function(data){}){
    const form = new FormData();
    form.append("token", SECRET_TOKEN);
    for (const key in params) {
        form.append(key, params[key]);
    }
    
    fetch(url, {
        method: "POST",
        body: form,
    })
        .then(res => res.json())
        .then(data => f(data))
        .catch(err => {
            alert("トークンが間違っている可能性があります。");
        });
}

function deleteData(dataId) {
    if(confirm("このデータを削除しますか？")) {
        post(params={
            sheet : "data",
            mode : "delete",
            uuid : dataId
        });
    }
}

function deleteSong(songId) {
    if(confirm(`この曲を削除しますか？
この曲に関するデータは完全に削除されます。`)) {
        post(params={
            sheet : "songs",
            mode : "delete",
            uuid : songId
        });
    }
}