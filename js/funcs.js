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

function deleteHistory(historyId) {
    if (confirm('このデータを削除しますか？')) {
        post(params = {
            sheet: 'history',
            mode: 'delete',
            uuid: historyId
        }, (data) => {
            closeFullScreenModal(fullScreenModalId, `history-detail-${historyId}`);
            delete histories[historyId];
            deleteDisplayedData(historyId);
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
        }, (data) => {
            closeFullScreenModal(fullScreenModalId, `song-detail-${songId}`);
            delete songs[songId];

            deleteDisplayedData(songId);
            // 紐づく履歴を消す
            for (const history of Object.values(histories)) {
                if (history.song.uuid === songId) {
                    deleteDisplayedData(history.uuid);
                }
            }
        });
    }
}
// ---------------------データの表示---------------------
let prevSongConditions = null;
let prevHistoryConditions = null;
function showSongs(songArr) {
    let html = '';
    songArr.forEach((song) => {
        html += `
            <label class="clickable ${song.uuid}" onclick="displaySongDetail('${song.uuid}')">
                <h4 class="${song.uuid}-title">${song.getTitle()}</h4>
                <div><div class="artist-name ${song.uuid}-artist">${song.getArtist()}</div> <div class="${song.uuid}-created-at">${song.getCreatedAt()}</div></div>
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
                    <h4 class="${history.uuid}-song-title">${history.song.getTitle()}</h4>
                    <img src="./img/star.svg" class="is-favorite ${history.uuid}-is-favorite ${history.isFavorite ? 'favorite' : ''}">
                </div>
                <div>
                    <div class="artist-name ${history.uuid}-song-artist">${history.song.getArtist()}</div>
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
                <p class="comment ${history.uuid}-comment"">${history.getComment()}</p>
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

    let relatedHistoriesHtml = '';

    let relatedHistories = Object.values(histories)
        .filter((history) => {return history.song.uuid === uuid;})
        .sort((historyA, historyB) => {return historyA.key - historyB.key});
    for (const history of relatedHistories) {
        relatedHistoriesHtml += getHistoryListHtml(history);
    }

    const html = `
        <div class="h-100 detail-page">
            <div class="song-detail ${uuid}">
                <h4 class="${song.uuid}-song-title">${song.getTitle()}</h4>
                <div class="field-content text-right mc-1 ${song.uuid}-created-at">${song.getCreatedAt()}</div>
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

                <div>
                    <div class="field-container">
                        <div class="field-name">アーティスト</div>
                        <div class="field-content ${song.uuid}-song-artist">${song.getArtist()}</div>
                    </div>
                </div>
                <div>${relatedHistoriesHtml}</div>
                <div class="empty-mes">音域データが登録されていません</div>
                <div class="flex-fill"></div>

                <div class="detail-btns">
                    <label>
                        <img class="detail-btn edit clickable" src="./img/edit.svg">
                        編集
                    </label>
                    <label onclick="deleteSong('${song.uuid}');">
                        <img class="detail-btn delete clickable" src="./img/delete.svg">
                        削除
                    </label>
                </div>
            </div>
        </div>
        <div class="deleted-mes">このデータは削除されました</div>
    `;
    openFullScreenModal('詳細', html, 'song-detail-' + song.uuid);
}
function displayHistoryDetail(uuid) {
    const history = getHistory(uuid);

    const html = `
        <div class="h-100 detail-page">
            <div class="history-detail ${uuid}">
                <h4 class="${history.uuid}-song-title">${history.song.getTitle()}</h4>
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
                        <div class="field-content ${history.uuid}-song-artist">${history.song.getArtist()}</div>
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
                        <img class="detail-btn is-favorite clickable ${history.uuid}-is-favorite ${history.isFavorite ? ' favorite' : ''}" src="./img/star.svg">
                    </label>
                    <label>
                        <img class="detail-btn edit clickable" src="./img/edit.svg">
                    </label>
                    <label onclick="deleteHistory('${history.uuid}');">
                        <img class="detail-btn delete clickable" src="./img/delete.svg">
                    </label>
                </div>
            </div>
        </div>
        <div class="deleted-mes">このデータは削除されました</div>
    `;

    openFullScreenModal('詳細', html, 'history-detail-' + history.uuid);

    $(`.detail-btn.${history.uuid}-has-sung`).on('click', function () {
        const hasSung = $(this).hasClass('sung');
        history.registerHasSung(!hasSung, (data) => {
            updateDisplayedHistory(history.uuid);
        });
    });
    $(`.detail-btn.${history.uuid}-is-favorite`).on('click', function () {
        const isFavorite = $(this).hasClass('favorite');
        history.registerIsFavorite(!isFavorite, (data) => {
            updateDisplayedHistory(history.uuid);
        });
    });
}

function getHistoryListHtml(history) {
    return `
        <div class="related-history ${history.uuid}" onclick="displayHistoryDetail('${history.uuid}')">
            <div class="key-container">
                <div class="related-history-key ${history.uuid}-key">${history.getKey()}</div>
                <div class="flex-fill"></div>
                <div class="has-sung ${history.uuid}-has-sung ${history.hasSung ? ' sung' : ''}"></div>
                <img src="./img/star.svg" class="is-favorite ${history.uuid}-is-favorite ${history.isFavorite ? 'favorite' : ''}">
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
            <div class="related-history-comment ${history.uuid}-comment">${history.getComment()}</div>
        </div>
    `;
}

function openAddSongPage() {
    openFullScreenModal('曲を追加', '', 'add-song');
}

// ---------------------表示の更新---------------------
// 未テスト
function updateDisplayedSong(uuid) {
    const song = getSong(uuid);

    $(`.${song.uuid}-song-title`).text(song.getTitle());
    $(`.${song.uuid}-song-artist`).text(song.getArtist());
    $(`.${song.uuid}-chest-min-note`).text(song.getChestMinNote());
    $(`.${song.uuid}-chest-max-note`).text(song.getChestMaxNote());
    $(`.${song.uuid}-head-min-note`).text(song.getHeadMinNote());
    $(`.${song.uuid}-head-max-note`).text(song.getHeadMaxNote());
    $(`.${song.uuid}-overall-max-note`).text(song.getOverallMaxNote());
    $(`.${song.uuid}-created-at`).text(song.getCreatedAt());

    // 紐づいた履歴を更新
    for (const history of Object.values(histories)) {
        if (history.song.uuid === uuid) {
            updateDisplayedHistory(history.uuid);
        }
    }
}

function updateDisplayedHistory(uuid) {
    const history = getHistory(uuid);

    $(`.${history.uuid}-song-title`).text(history.song.getTitle());
    $(`.${history.uuid}-song-artist`).text(history.song.getArtist());
    $(`.${history.uuid}-chest-min-note`).text(history.getChestMinNote());
    $(`.${history.uuid}-chest-max-note`).text(history.getChestMaxNote());
    $(`.${history.uuid}-head-min-note`).text(history.getHeadMinNote());
    $(`.${history.uuid}-head-max-note`).text(history.getHeadMaxNote());
    $(`.${history.uuid}-overall-max-note`).text(history.getOverallMaxNote());
    $(`.${history.uuid}-created-at`).text(history.getCreatedAt());
    $(`.${history.uuid}-key`).text(history.getKey());
    $(`.${history.uuid}-score`).text(history.getScore());
    $(`.${history.uuid}-comment`).text(history.getComment());
    if (history.hasSung) {
        $(`.${history.uuid}-has-sung`).addClass('sung');
    } else {
        $(`.${history.uuid}-has-sung`).removeClass('sung');
    }
    if (history.isFavorite) {
        $(`.${history.uuid}-is-favorite`).addClass('favorite');
    } else {
        $(`.${history.uuid}-is-favorite`).removeClass('favorite');
    }
}

function deleteDisplayedData(uuid) {
    $(`*:has(> .${uuid})`).contents().filter(function () {
        return this.nodeType === 3 && !/¥S/.test(this.nodeValue);
    }).remove();
    $(`.${uuid}`).remove();
}