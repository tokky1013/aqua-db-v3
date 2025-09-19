const url = "https://script.google.com/macros/s/AKfycbyuSquQdKjrG7OGBdmrZHDDKPTMN-bY1s96GTmxZBxOjzosfjx5h5l-rJt-Ffdi0JE/exec";
const SECRET_TOKEN = "85b3e936-a968-49ae-9cc7-d2ad0207ca1b";

function get() {
    const query = new URLSearchParams({
        token : SECRET_TOKEN
    });
    
    fetch(url + "?" + query)
        .then(res => res.json())
        .then(data => console.log(data))
        .catch(err => {
            alert("トークンが違う可能性があります。");
        });
}

function post(){
    const form = new FormData();
    form.append("token", SECRET_TOKEN);
    form.append("uuid", crypto.randomUUID());
    form.append("title", "なもなき歌");
    
    fetch(url, {
        method: "POST",
        body: form,
    })
        .then(res => res.json())
        .then(data => console.log(data))
        .catch(err => {
            alert("トークンが違う可能性があります。");
        });
}

post();