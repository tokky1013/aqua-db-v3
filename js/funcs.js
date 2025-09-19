// ---------------------データ関連---------------------
let songs = {};
let data = {};

function getSong(uuid) {
    return songs[uuid];
}

function getData() {
    get(
        {sheet: "data"},
        resData => {
            let dataObj;
            data = {};
            resData.forEach(elem => {
                dataObj = new Data(elem);
                data[dataObj.uuid] = dataObj;
            });
        }
    );
}

function getSongs() {
    get(
        {sheet: "songs"},
        resData => {
            let song;
            songs = {};
            resData.forEach(elem => {
                song = new Song(elem);
                songs[song.uuid] = song;
            });
        }
    );
}

// 曲、データの追加画面の表示
function showAddPopup() {

}

// ---------------------メニュー関連---------------------
function closeMenu() {
    $("#nav-area").removeClass("open");
    $(".toggle-btn").removeClass("open");
}

// ---------------------ページ関連---------------------
function showPage(n) {
    let pageElems = $(".page");
    pageElems.each(function(i, elem) {
        const pageElem = $(elem);
        if(pageElem.data("page-num") == n) {
            pageElem.css("display", "block");
        }else {
            pageElem.css("display", "none");
        }
    });
}

// ---------------------データの表示---------------------
function showSongs(songArr) {
    let html = '';
    songArr.forEach(song => {
        html += `
            <label onclick="displaySongDetail('${song.uuid}')">
                <h4>${song.title}</h4>
                <p>${song.artist}　${song.getCreatedAt()}</p>
                <table>
                    <tr>
                        <th>地低</th>
                        <th>地高</th>
                        <th>裏低</th>
                        <th>裏高</th>
                        <th>最高音</th>
                    </tr>
                    <tr>
                        <td>${song.getChestMinNote()}</td>
                        <td>${song.getChestMaxNote()}</td>
                        <td>${song.getHeadMinNote()}</td>
                        <td>${song.getHeadMaxNote()}</td>
                        <td>${song.getOverallMaxNote()}</td>
                    </tr>
                </table>
            </label>
        `
    });

    document.getElementById("list").innerHTML = html;
}

function displaySongDetail(uuid) {
    alert(uuid);
}