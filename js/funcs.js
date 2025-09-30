// ---------------------データ関連---------------------
let songs = {};
let histories = {};

function getSong(uuid) {
    return songs[uuid];
}

function getHistories(funcFinally=null) {
    get(
        {sheet: 'history'},
        (resData) => {
            let historyObj;
            histories = {};
            resData.forEach((elem) => {
                historyObj = new History(elem);
                histories[historyObj.uuid] = historyObj;
            });
        },
        funcFinally
    );
}

function getSongs(funcFinally=null) {
    get(
        {sheet: 'songs'},
        (resData) => {
            let song;
            songs = {};
            resData.forEach((elem) => {
                song = new Song(elem);
                songs[song.uuid] = song;
            });
        },
        funcFinally
    );
}

// 曲、データの追加画面の表示
function showAddModal() {

}

// ---------------------メニュー関連---------------------
function closeMenu() {
    $('#nav-area').removeClass('open');
    $('.toggle-btn').removeClass('open');
}

// ---------------------ページ関連---------------------
function showPage(n) {
    let pageElems = $('.page');
    pageElems.each(function(i, elem) {
        const pageElem = $(elem);
        if(pageElem.data('page-num') == n) {
            pageElem.css('display', 'block');
        }else {
            pageElem.css('display', 'none');
        }
    });
    closeMenu();
}

// ---------------------データの表示---------------------
function showSongs(songArr) {
    let html = '';
    songArr.forEach((song) => {
        html += `
            <label onclick="displaySongDetail('${song.uuid}')">
                <h4>${song.title}</h4>
                <div><div class="artist-name">${song.artist}</div> <div>${song.getCreatedAt()}</div></div>
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

    $('#song-list').html(html);
}

function showHistories(historyArr) {
    let html = '';
    historyArr.forEach((history) => {
        let key = history.key;
        if(key > 0) {
            key = 'キー +' + key;
        } else if(key === 0) {
            key = '原曲キー';
        } else {
            key = 'キー ' + key;
        }

        html += `
            <label onclick="displayHistoryDetail('${history.uuid}')">
                <div class="title-container${history.hasSung ? ' sung' : ''}"><h4>${history.song.title}</h4></div>
                <div><div class="artist-name">${history.song.artist}</div><div>${key}</div><div>${history.getCreatedAt()}</div></div>
                <table>
                    <tr>
                        <th>地低</th>
                        <th>地高</th>
                        <th>裏低</th>
                        <th>裏高</th>
                        <th>最高音</th>
                    </tr>
                    <tr>
                        <td>${history.getChestMinNote()}</td>
                        <td>${history.getChestMaxNote()}</td>
                        <td>${history.getHeadMinNote()}</td>
                        <td>${history.getHeadMaxNote()}</td>
                        <td>${history.getOverallMaxNote()}</td>
                    </tr>
                </table>
            </label>
        `
    });

    $('#history-list').html(html);
}

// ---------------------モーダル---------------------
function openModal(n) {
    $('#modal-container').css('display', 'flex');

    let modalElems = $('.modal-content');
    modalElems.each(function(i, elem) {
        const modalElem = $(elem);
        if(modalElem.data('modal-num') == n) {
            modalElem.css('display', 'block');
        }else {
            modalElem.css('display', 'none');
        }
    });
}
function closeModal() {
    $('#modal-container').css('display', 'none');
}
function displaySongDetail(uuid) {
    alert(uuid);
}
function displayHistoryDetail(uuid) {
    alert(uuid);
}