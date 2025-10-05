// ---------------------データ関連---------------------
let songs = {};
let histories = {};

function getSong(uuid) {
    return songs[uuid];
}

function getHistories(funcFinally = null) {
    get(
        { sheet: 'history' },
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

function getSongs(funcFinally = null) {
    get(
        { sheet: 'songs' },
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

// ---------------------データの表示---------------------
let prevSongConditions = null;
let prevHistoryConditions = null;
function showSongs(songArr) {
    let html = '';
    songArr.forEach((song) => {
        html += `
            <label class="clickable" onclick="displaySongDetail('${song.uuid}')">
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
        if (key > 0) {
            key = 'キー +' + key;
        } else if (key === 0) {
            key = '原曲キー';
        } else {
            key = 'キー ' + key;
        }

        html += `
            <label class="clickable" onclick="displayHistoryDetail('${history.uuid}')">
                <div class="title-container${history.hasSung ? ' sung' : ''}"><h4>${history.song.title}</h4><img src="./img/star.svg" class="favorite ${history.isFavourite ? '' : ' d-none'}"></div>
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

function filterArr(arr, filteringConditionFuncs) {
    let newArr = arr.map(elem => elem.clone());
    for (const func of filteringConditionFuncs) {
        newArr = newArr.filter(func);
    }
    return newArr;
}

function sortArr(arr, orderFunc) {
    let newArr = arr.map(elem => elem.clone());
    newArr.sort(orderFunc);

    return newArr;
}

function filterAndSortSongs(conditions) {
    let filteringConditionFuncs = conditions.filteringConditionFuncs;
    let orderFunc = conditions.orderFunc;

    prevSongConditions = {
        'filteringConditionFuncs': filteringConditionFuncs,
        'orderFunc': orderFunc,
    };

    let displayedSongs = Object.values(songs);
    displayedSongs = filterArr(displayedSongs, filteringConditionFuncs);
    displayedSongs = sortArr(displayedSongs, orderFunc);

    showSongs(displayedSongs);
}
function filterAndSortHistories(conditions = null) {

}

function resetFilterAndSortSongsForm() {
    const $form = $('#song-filtering-and-sorting-form');

    $form.find('[name="title"]').val('');
    $form.find('[name="artist"]').val('');
    $form.find('[name="chestMinNote"]').get(0).noUiSlider.set([minLimit, maxLimit]);
    $form.find('[name="chestMaxNote"]').get(0).noUiSlider.set([minLimit, maxLimit]);
    $form.find('[name="headMinNote"]').get(0).noUiSlider.set([minLimit, maxLimit]);
    $form.find('[name="headMaxNote"]').get(0).noUiSlider.set([minLimit, maxLimit]);
    $form.find('[name="overallMaxNote"]').get(0).noUiSlider.set([minLimit, maxLimit]);
    $form.find('[name="order"]').val('createdAt');
}

// ---------------------Full-Screen Modal---------------------
function displaySongDetail(uuid) {
    alert(uuid);
}
function displayHistoryDetail(uuid) {
    alert(uuid);
}

function openAddSongPage() {
    openFullScreenModal('曲を追加', '');
}