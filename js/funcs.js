// ---------------------データ関連---------------------
let songs = {};
let histories = {};

function getSong(uuid) {
    return songs[uuid];
}

function getHistory(uuid) {
    return histories[uuid];
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
            filterAndSortHistories({
                'filteringConditionFuncs': [],
                'orderFunc': (historyA, historyB) => {
                    return historyB.createdAt - historyA.createdAt;
                },
            });
        },
        () => { $('#history-list').html('<div class="error-mes">エラーが発生しました</div>'); },
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
            filterAndSortSongs({
                'filteringConditionFuncs': [],
                'orderFunc': (historyA, historyB) => {
                    return historyB.createdAt - historyA.createdAt;
                },
            });
        },
        () => { $('#song-list').html('<div class="error-mes">エラーが発生しました</div>'); },
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
            <label class="clickable ${song.uuid}" onclick="displaySongDetail('${song.uuid}')">
                <h4 class="${song.uuid}-title">${song.title}</h4>
                <div><div class="artist-name ${song.uuid}-artist">${song.artist}</div> <div class="${song.uuid}-created-at">${song.getCreatedAt()}</div></div>
                <table>
                    <tr>
                        <th>地低</th>
                        <th>地高</th>
                        <th>裏低</th>
                        <th>裏高</th>
                        <th>最高音</th>
                    </tr>
                    <tr>
                        <td class="${song.uuid}-chest-min-note">${song.getChestMinNote()}</td>
                        <td class="${song.uuid}-chest-max-note">${song.getChestMaxNote()}</td>
                        <td class="${song.uuid}-head-min-note">${song.getHeadMinNote()}</td>
                        <td class="${song.uuid}-head-max-note">${song.getHeadMaxNote()}</td>
                        <td class="${song.uuid}-overall-max-note">${song.getOverallMaxNote()}</td>
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
        html += `
            <label class="clickable ${history.uuid}" onclick="displayHistoryDetail('${history.uuid}')">
                <div class="title-container ${history.uuid}-has-sung ${history.hasSung ? ' sung' : ''}">
                    <h4 class="${history.uuid}-song-title">${history.song.title}</h4>
                    <img src="./img/star.svg" class="is-favorite ${history.uuid}-is-favorite ${history.isFavourite ? 'favorite' : ''}">
                </div>
                <div>
                    <div class="artist-name ${history.uuid}-song-artist">${history.song.artist}</div>
                    <div class="${history.uuid}-key">${history.getKey()}</div>
                    <div class="${history.uuid}-created-at">${history.getCreatedAt()}</div>
                </div>
                <table>
                    <tr>
                        <th>地低</th>
                        <th>地高</th>
                        <th>裏低</th>
                        <th>裏高</th>
                        <th>最高音</th>
                    </tr>
                    <tr>
                        <td class="${history.uuid}-chest-min-note">${history.getChestMinNote()}</td>
                        <td class="${history.uuid}-chest-max-note">${history.getChestMaxNote()}</td>
                        <td class="${history.uuid}-head-min-note">${history.getHeadMinNote()}</td>
                        <td class="${history.uuid}-head-max-note">${history.getHeadMaxNote()}</td>
                        <td class="${history.uuid}-overall-max-note">${history.getOverallMaxNote()}</td>
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
function filterAndSortHistories(conditions) {
    let filteringConditionFuncs = conditions.filteringConditionFuncs;
    let orderFunc = conditions.orderFunc;

    prevHistoryConditions = {
        'filteringConditionFuncs': filteringConditionFuncs,
        'orderFunc': orderFunc,
    };

    let displayedHistories = Object.values(histories);
    displayedHistories = filterArr(displayedHistories, filteringConditionFuncs);
    displayedHistories = sortArr(displayedHistories, orderFunc);

    showHistories(displayedHistories);
}

function resetFilterAndSortSongsForm() {
    const $form = $('#song-filtering-and-sorting-form');

    $form.find('[name="title"]').val('');
    $form.find('[name="artist"]').val('');
    $form.find('[name="chestMinNote"]').get(0).noUiSlider.set([minVoiceRangeLimit, maxVoiceRangeLimit]);
    $form.find('[name="chestMaxNote"]').get(0).noUiSlider.set([minVoiceRangeLimit, maxVoiceRangeLimit]);
    $form.find('[name="headMinNote"]').get(0).noUiSlider.set([minVoiceRangeLimit, maxVoiceRangeLimit]);
    $form.find('[name="headMaxNote"]').get(0).noUiSlider.set([minVoiceRangeLimit, maxVoiceRangeLimit]);
    $form.find('[name="overallMaxNote"]').get(0).noUiSlider.set([minVoiceRangeLimit, maxVoiceRangeLimit]);
    $form.find('[name="order"]').val('createdAt');
}

function resetFilterAndSortHistoriesForm() {
    const $form = $('#history-filtering-and-sorting-form');

    $form.find('[name="title"]').val('');
    $form.find('[name="artist"]').val('');
    $form.find('[name="sung"]').prop('checked', false);
    $form.find('[name="notSung"]').prop('checked', false);
    $form.find('[name="favorite"]').prop('checked', false);
    $form.find('[name="notFavorite"]').prop('checked', false);
    $form.find('[name="key"]').get(0).noUiSlider.set([minKeyRangeLimit, maxKeyRangeLimit]);
    $form.find('[name="chestMinNote"]').get(0).noUiSlider.set([minVoiceRangeLimit, maxVoiceRangeLimit]);
    $form.find('[name="chestMaxNote"]').get(0).noUiSlider.set([minVoiceRangeLimit, maxVoiceRangeLimit]);
    $form.find('[name="headMinNote"]').get(0).noUiSlider.set([minVoiceRangeLimit, maxVoiceRangeLimit]);
    $form.find('[name="headMaxNote"]').get(0).noUiSlider.set([minVoiceRangeLimit, maxVoiceRangeLimit]);
    $form.find('[name="overallMaxNote"]').get(0).noUiSlider.set([minVoiceRangeLimit, maxVoiceRangeLimit]);
    $form.find('[name="order"]').val('createdAt');
}

// ---------------------Full-Screen Modal---------------------
function displaySongDetail(uuid) {
    const song = getSong(uuid);
    openFullScreenModal('詳細', '');
}
function displayHistoryDetail(uuid) {
    const history = getHistory(uuid);

    const html = `
        <div id="${uuid}" class="history-detail detail-page">
            <h4 class="${history.uuid}-song-title">${history.song.title}</h4>
            <div class="song-detail-button" onclick="displaySongDetail('${history.song.uuid}')">この曲の詳細を表示する</div>
            <div class="field-content text-right mc-1 ${history.uuid}-created-at">${history.getCreatedAt()}</div>
            <table>
                <tr>
                    <th>地低</th>
                    <th>地高</th>
                    <th>裏低</th>
                    <th>裏高</th>
                    <th>最高音</th>
                </tr>
                <tr>
                    <td class="${history.uuid}-chest-min-note">${history.getChestMinNote()}</td>
                    <td class="${history.uuid}-chest-max-note">${history.getChestMaxNote()}</td>
                    <td class="${history.uuid}-head-min-note">${history.getHeadMinNote()}</td>
                    <td class="${history.uuid}-head-max-note">${history.getHeadMaxNote()}</td>
                    <td class="${history.uuid}-overall-max-note">${history.getOverallMaxNote()}</td>
                </tr>
            </table>

            <div>
                <div class="field-container">
                    <div class="field-name">アーティスト</div>
                    <div class="field-content ${history.uuid}-song-artist">${history.song.artist}</div>
                </div>
                <div class="field-container">
                    <div class="field-name">キー</div>
                    <div class="field-content ${history.uuid}-key">${history.getKey()}</div>
                </div>
                <div class="field-container">
                    <div class="field-name">最高得点</div>
                    <div class="field-content ${history.uuid}-score">${history.getScore()}</div>
                </div>
                <div class="field-container">
                    <div>
                        <div>コメント</div>
                        <div class="comment ${history.uuid}-comment">${history.getComment()}</div>
                    </div>
                </div>
            </div>
            <div class="flex-fill"></div>

            <div class="detail-btns">
                <label>
                    <div class="detail-btn has-sung clickable ${history.uuid}-has-sung ${history.hasSung ? ' sung' : ''}"></div>
                </label>
                <label>
                    <img class="detail-btn is-favorite clickable ${history.uuid}-is-favorite ${history.isFavourite ? ' favorite' : ''}" src="./img/star.svg">
                </label>
                <label>
                    <img class="detail-btn edit clickable" src="./img/edit.svg">
                </label>
                <label>
                    <img class="detail-btn delete clickable" src="./img/delete.svg">
                </label>
            </div>
        </div>
        <div class="deleted-mes">このデータは削除されました</div>
    `;

    openFullScreenModal('詳細', html);
}

function openAddSongPage() {
    openFullScreenModal('曲を追加', '');
}