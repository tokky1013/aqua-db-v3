// ---------------------データ関連---------------------
let songs = {};
let histories = {};
let artists = [];

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
            artists = [];
            resData.forEach((elem) => {
                song = new Song(elem);
                songs[song.uuid] = song;
                
                // artistsに入ってなければアーティスト名を追加
                const artist = song.artist;
                if(!artists.includes(artist)) {
                    artists.push(artist);
                }
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
                    delete histories[history.uuid];
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
    $form.find('[name="sortingOrder"]').val('createdAt');
    $form.find('[name="sortingDirection"]').val('1');
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
    $form.find('[name="sortingOrder"]').val('createdAt');
    $form.find('[name="sortingDirection"]').val('1');
}

// ---------------------Full-Screen Modal---------------------
function displaySongDetail(uuid) {
    const song = getSong(uuid);

    let relatedHistoriesHtml = '';

    let relatedHistories = Object.values(histories)
        .filter((history) => { return history.song.uuid === uuid; })
        .sort((historyA, historyB) => { return historyA.key - historyB.key });
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
                <h5>音域データ</h5>
                <div>${relatedHistoriesHtml}</div>
                <div class="empty-mes">音域データが登録されていません</div>
                <div class="flex-fill"></div>

                <div class="detail-btns">
                    <label onclick="openUpdateSongPage('${song.uuid}');" class="clickable">
                        <img class="detail-btn edit" src="./img/edit.svg">
                        編集
                    </label>
                    <label onclick="deleteSong('${song.uuid}');" class="clickable">
                        <img class="detail-btn delete" src="./img/delete.svg">
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
                    <label onclick="openUpdateHistoryPage('${history.uuid}');">
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

function openUpdateSongPage(uuid) {
    function getOctave(num) {
        return Math.floor(num / 12) + 3;
    }
    function getTone(num) {
        return (num + 48) % 12;
    }

    const html = `
        <form class="song-form" id="song-update-form">
            <div class="field-input-container">
                <div class="field-input-name">タイトル</div>
                <div class="field-input"><input type="text" name="title"></div>
            </div>
            <div class="field-input-container">
                <div class="field-input-name">アーティスト名</div>
                <div class="field-input">
                    <input type="text" name="artist">
                    <div class="candidates"></div>
                </div>
            </div>
            <div class="field-input-container">
                <div class="field-input-name">地声音域</div>
                <div class="field-input">
                    <input type="checkbox" name="notChestExists" id="input-chest-exists">
                    <label for="input-chest-exists" class="pl-2">地声なし</label>

                    <div>
                        <div class="field-input-name">地声最低音</div>
                        <div class="field-input">
                            <select name="chestMinOctave" id="input-chest-min-octave" class="mr-2">
                                <option value="0">low</option>
                                <option value="1">mid1</option>
                                <option value="2">mid2</option>
                                <option value="3" selected>hi</option>
                                <option value="4">hihi</option>
                                <option value="5">hihihi</option>
                            </select>
                            <select name="chestMinTone" id="input-chest-min-tone">
                                <option value="0">A</option>
                                <option value="1">A#</option>
                                <option value="2">B</option>
                                <option value="3">C</option>
                                <option value="4">C#</option>
                                <option value="5">D</option>
                                <option value="6">D#</option>
                                <option value="7">E</option>
                                <option value="8">F</option>
                                <option value="9">F#</option>
                                <option value="10">G</option>
                                <option value="11">G#</option>
                            </select><br>
                            <input type="checkbox" name="chestMinUnknown" id="input-chest-min-unknown" class="input-unknown">
                            <label for="input-chest-min-unknown" class="pl-2">不明</label>
                        </div>
                        <div class="field-input-name">地声最高音</div>
                        <div class="field-input">
                            <select name="chestMaxOctave" id="input-chest-max-octave" class="mr-2">
                                <option value="0">low</option>
                                <option value="1">mid1</option>
                                <option value="2">mid2</option>
                                <option value="3" selected>hi</option>
                                <option value="4">hihi</option>
                                <option value="5">hihihi</option>
                            </select>
                            <select name="chestMaxTone" id="input-chest-max-tone">
                                <option value="0">A</option>
                                <option value="1">A#</option>
                                <option value="2">B</option>
                                <option value="3">C</option>
                                <option value="4">C#</option>
                                <option value="5">D</option>
                                <option value="6">D#</option>
                                <option value="7">E</option>
                                <option value="8">F</option>
                                <option value="9">F#</option>
                                <option value="10">G</option>
                                <option value="11">G#</option>
                            </select><br>
                            <input type="checkbox" name="chestMaxUnknown" id="input-chest-max-unknown" class="input-unknown">
                            <label for="input-chest-max-unknown" class="pl-2">不明</label>
                        </div>
                    </div>
                </div>
            </div>
            <div class="field-input-container">
                <div class="field-input-name">裏声音域</div>
                <div class="field-input">
                    <input type="checkbox" name="notHeadExists" id="input-head-exists">
                    <label for="input-head-exists" class="pl-2">裏声なし</label>

                    <div>
                        <div class="field-input-name">裏声最低音</div>
                        <div class="field-input">
                            <select name="headMinOctave" id="input-head-min-octave" class="mr-2">
                                <option value="0">low</option>
                                <option value="1">mid1</option>
                                <option value="2">mid2</option>
                                <option value="3" selected>hi</option>
                                <option value="4">hihi</option>
                                <option value="5">hihihi</option>
                            </select>
                            <select name="headMinTone" id="input-head-min-tone">
                                <option value="0">A</option>
                                <option value="1">A#</option>
                                <option value="2">B</option>
                                <option value="3">C</option>
                                <option value="4">C#</option>
                                <option value="5">D</option>
                                <option value="6">D#</option>
                                <option value="7">E</option>
                                <option value="8">F</option>
                                <option value="9">F#</option>
                                <option value="10">G</option>
                                <option value="11">G#</option>
                            </select><br>
                            <input type="checkbox" name="headMinUnknown" id="input-head-min-unknown" class="input-unknown">
                            <label for="input-head-min-unknown" class="pl-2">不明</label>
                        </div>
                        <div class="field-input-name">裏声最高音</div>
                        <div class="field-input">
                            <select name="headMaxOctave" id="input-head-max-octave" class="mr-2">
                                <option value="0">low</option>
                                <option value="1">mid1</option>
                                <option value="2">mid2</option>
                                <option value="3" selected>hi</option>
                                <option value="4">hihi</option>
                                <option value="5">hihihi</option>
                            </select>
                            <select name="headMaxTone" id="input-head-max-tone">
                                    <option value="0">A</option>
                                    <option value="1">A#</option>
                                    <option value="2">B</option>
                                    <option value="3">C</option>
                                    <option value="4">C#</option>
                                    <option value="5">D</option>
                                    <option value="6">D#</option>
                                    <option value="7">E</option>
                                    <option value="8">F</option>
                                    <option value="9">F#</option>
                                    <option value="10">G</option>
                                    <option value="11">G#</option>
                            </select><br>
                            <input type="checkbox" name="headMaxUnknown" id="input-head-max-unknown" class="input-unknown">
                            <label for="input-head-max-unknown" class="pl-2">不明</label>
                        </div>
                    </div>
                </div>
            </div>
            <div class="field-input-container">
                <div class="field-input-name">最高音</div>
                <div class="field-input">
                    <input type="checkbox" name="autoFill" id="input-auto-fill">
                    <label for="input-auto-fill" class="pl-2">最高音を自動で設定</label><br>

                    <select name="overallMaxOctave" id="input-overall-max-octave" class="mr-2">
                        <option value="0">low</option>
                        <option value="1">mid1</option>
                        <option value="2">mid2</option>
                        <option value="3" selected>hi</option>
                        <option value="4">hihi</option>
                        <option value="5">hihihi</option>
                    </select>
                    <select name="overallMaxTone" id="input-overall-max-tone">
                        <option value="0">A</option>
                        <option value="1">A#</option>
                        <option value="2">B</option>
                        <option value="3">C</option>
                        <option value="4">C#</option>
                        <option value="5">D</option>
                        <option value="6">D#</option>
                        <option value="7">E</option>
                        <option value="8">F</option>
                        <option value="9">F#</option>
                        <option value="10">G</option>
                        <option value="11">G#</option>
                    </select><br>
                    <input type="checkbox" name="overallMaxUnknown" id="input-overall-max-unknown" class="input-unknown">
                    <label for="input-overall-max-unknown" class="pl-2">不明</label>
                </div>
            </div>
            <div class="flex-fill"></div>
            <div class="btn-container">
                <button type="button" class="cancel-btn clickable">キャンセル</button>
                <input class="submit-btn clickable" type="submit" value="更新">
            </div>
        </form>
    `;
    openFullScreenModal('曲を更新', html, `update-song-${uuid}`);

    // キャセルボタンを押すと閉じるように
    $('#song-update-form .cancel-btn').on('click', function() {
        closeFullScreenModal(fullScreenModalId, `update-song-${uuid}`);
    });

    // 入力欄に値をセット
    const song = getSong(uuid);
    const $form = $('#song-update-form')

    $form.find('[name="title"]').val(song.title);
    $form.find('[name="artist"]').val(song.artist);
    $form.find('[name="notChestExists"]').prop('checked', song.chestMinNote.status === 'notExist');
    $form.find('[name="chestMinOctave"]').val(song.chestMinNote.value === null ? 1 : getOctave(song.chestMinNote.value));
    $form.find('[name="chestMinTone"]').val(song.chestMinNote.value === null ? 0 : getTone(song.chestMinNote.value));
    $form.find('[name="chestMinUnknown"]').prop('checked', song.chestMinNote.status === 'unknown');
    $form.find('[name="chestMaxOctave"]').val(song.chestMaxNote.value === null ? 3 : getOctave(song.chestMaxNote.value));
    $form.find('[name="chestMaxTone"]').val(song.chestMaxNote.value === null ? 0 : getTone(song.chestMaxNote.value));
    $form.find('[name="chestMaxUnknown"]').prop('checked', song.chestMaxNote.status === 'unknown');
    $form.find('[name="notHeadExists"]').prop('checked', song.headMinNote.status === 'notExist');
    $form.find('[name="headMinOctave"]').val(song.headMinNote.value === null ? 2 : getOctave(song.headMinNote.value));
    $form.find('[name="headMinTone"]').val(song.headMinNote.value === null ? 0 : getTone(song.headMinNote.value));
    $form.find('[name="headMinUnknown"]').prop('checked', song.headMinNote.status === 'unknown');
    $form.find('[name="headMaxOctave"]').val(song.headMaxNote.value === null ? 3 : getOctave(song.headMaxNote.value));
    $form.find('[name="headMaxTone"]').val(song.headMaxNote.value === null ? 0 : getTone(song.headMaxNote.value));
    $form.find('[name="headMaxUnknown"]').prop('checked', song.headMaxNote.status === 'unknown');
    $form.find('[name="overallMaxOctave"]').val(song.overallMaxNote.value === null ? 3 : getOctave(song.overallMaxNote.value));
    $form.find('[name="overallMaxTone"]').val(song.overallMaxNote.value === null ? 0 : getTone(song.overallMaxNote.value));
    $form.find('[name="overallMaxUnknown"]').prop('checked', song.overallMaxNote.status === 'unknown');


    // 音域が不明のときにselectタグを非活性化
    $('.input-unknown').change(function () {
        $(this).prevAll('select').prop('disabled', $(this).prop('checked'));
    });

    $('#song-update-form select').change(function() {
        $(this).nextAll('.input-unknown').first().prop('checked', false)
    });

    // 最高音を自動で設定する可動かを変えたときに、selectタグとcheckboxの活性/非活性を設定
    $('#input-auto-fill').change(function () {
        const $inputUnknown = $(this).nextAll('.input-unknown');
        $inputUnknown.prop('disabled', $(this).prop('checked'));

        $(this).nextAll('select').prop('disabled', $(this).prop('checked') || $inputUnknown.prop('checked'));
    });

    // 地声・裏声の最高音を変更したときに最高音を更新
    $('#song-update-form select, #input-chest-exists, #input-chest-max-unknown, #input-head-exists, #input-head-max-unknown, #input-auto-fill').change(function () {
        if ($('#input-auto-fill').prop('checked')) {
            // 最高音の入力欄（ここを更新）
            const $inputOverallMaxOctave = $('#input-overall-max-octave');
            const $inputOverallMaxTone = $('#input-overall-max-tone');

            // 地声・裏声が存在するかどうか
            const notChestExists = $('#input-chest-exists').prop('checked');
            const notHeadExists = $('#input-head-exists').prop('checked');

            // 地声・裏声の最高音が不明かどうか
            const chestMaxUnknown = $('#input-chest-max-unknown').prop('checked');
            const headMaxUnknown = $('#input-head-max-unknown').prop('checked');

            // 地声と裏声の最高音の値
            let chestMaxOctave = $('#input-chest-max-octave').val() - 0;
            let chestMaxTone = $('#input-chest-max-tone').val() - 0;
            let headMaxOctave = $('#input-head-max-octave').val() - 0;
            let headMaxTone = $('#input-head-max-tone').val() - 0;

            // 地声・裏声が存在しなければ、値を-1にする
            if(notChestExists) {
                chestMaxOctave = -1;
            }
            if(notHeadExists) {
                headMaxOctave = -1;
            }

            // これ以下を書き換える
            if ((!notChestExists && chestMaxUnknown) || (!notHeadExists && headMaxUnknown) || (notChestExists && notHeadExists)) {
                $('#input-overall-max-unknown').prop('checked', true);
            } else {
                $('#input-overall-max-unknown').prop('checked', false);

                if (chestMaxOctave > headMaxOctave) {
                    $inputOverallMaxOctave.val(chestMaxOctave);
                    $inputOverallMaxTone.val(chestMaxTone);
                } else if (chestMaxOctave < headMaxOctave) {
                    $inputOverallMaxOctave.val(headMaxOctave);
                    $inputOverallMaxTone.val(headMaxTone);
                } else {
                    $inputOverallMaxOctave.val(chestMaxOctave);
                    $inputOverallMaxTone.val(Math.max(chestMaxTone, headMaxTone));
                }
            }
        }
    });

    // submit時の処理
    $('#song-update-form').submit(function() {
        function getTone(octave, tone) {
            return (octave - 3) * 12 + tone;
        }

        const $form = $(this);

        const title = $form.find('[name="title"]').val();
        const artist = $form.find('[name="artist"]').val();
        const notChestExists = $form.find('[name="notChestExists"]').prop('checked');
        const chestMinOctave = $form.find('[name="chestMinOctave"]').val() - 0;
        const chestMinTone = $form.find('[name="chestMinTone"]').val() - 0;
        const chestMinUnknown = $form.find('[name="chestMinUnknown"]').prop('checked');
        const chestMaxOctave = $form.find('[name="chestMaxOctave"]').val() - 0;
        const chestMaxTone = $form.find('[name="chestMaxTone"]').val() - 0;
        const chestMaxUnknown = $form.find('[name="chestMaxUnknown"]').prop('checked');
        const notHeadExists = $form.find('[name="notHeadExists"]').prop('checked');
        const headMinOctave = $form.find('[name="headMinOctave"]').val() - 0;
        const headMinTone = $form.find('[name="headMinTone"]').val() - 0;
        const headMinUnknown = $form.find('[name="headMinUnknown"]').prop('checked');
        const headMaxOctave = $form.find('[name="headMaxOctave"]').val() - 0;
        const headMaxTone = $form.find('[name="headMaxTone"]').val() - 0;
        const headMaxUnknown = $form.find('[name="headMaxUnknown"]').prop('checked');
        const overallMaxOctave = $form.find('[name="overallMaxOctave"]').val() - 0;
        const overallMaxTone = $form.find('[name="overallMaxTone"]').val() - 0;
        const overallMaxUnknown = $form.find('[name="overallMaxUnknown"]').prop('checked');

        // 曲のデータをセット
        let newSongDict = song.toDict();
        newSongDict.title = title;
        newSongDict.artist = artist;

        // 地声の音域をセット
        if(notChestExists) {
            newSongDict.chestMinNoteValue = null;
            newSongDict.chestMinNoteStatus = 'notExist';
            newSongDict.chestMaxNoteValue = null;
            newSongDict.chestMaxNoteStatus = 'notExist';
        } else {
            if(chestMinUnknown) {
                newSongDict.chestMinNoteValue = null;
                newSongDict.chestMinNoteStatus = 'unknown';
            } else {
                newSongDict.chestMinNoteValue = getTone(chestMinOctave, chestMinTone);
                newSongDict.chestMinNoteStatus = 'known';
            }
            if(chestMaxUnknown) {
                newSongDict.chestMaxNoteValue = null;
                newSongDict.chestMaxNoteStatus = 'unknown';
            } else {
                newSongDict.chestMaxNoteValue = getTone(chestMaxOctave, chestMaxTone);
                newSongDict.chestMaxNoteStatus = 'known';
            }
        }
        // 裏声の音域をセット
        if(notHeadExists) {
            newSongDict.headMinNoteValue = null;
            newSongDict.headMinNoteStatus = 'notExist';
            newSongDict.headMaxNoteValue = null;
            newSongDict.headMaxNoteStatus = 'notExist';
        } else {
            if(headMinUnknown) {
                newSongDict.headMinNoteValue = null;
                newSongDict.headMinNoteStatus = 'unknown';
            } else {
                newSongDict.headMinNoteValue = getTone(headMinOctave, headMinTone);
                newSongDict.headMinNoteStatus = 'known';
            }
            if(headMaxUnknown) {
                newSongDict.headMaxNoteValue = null;
                newSongDict.headMaxNoteStatus = 'unknown';
            } else {
                newSongDict.headMaxNoteValue = getTone(headMaxOctave, headMaxTone);
                newSongDict.headMaxNoteStatus = 'known';
            }
        }
        if(overallMaxUnknown) {
            newSongDict.overallMaxNoteValue = null;
            newSongDict.overallMaxNoteStatus = 'unknown';
        } else {
            newSongDict.overallMaxNoteValue = getTone(overallMaxOctave, overallMaxTone);
            newSongDict.overallMaxNoteStatus = 'known';
        }

        // 曲を登録
        song.update(newSongDict, () => {
            console.log(newSongDict)
            // 表示を更新
            updateDisplayedSong(uuid);

            // 追加ページを閉じる
            closeFullScreenModal(fullScreenModalId, `update-song-${uuid}`);
        });

        return false;
    });
}
function openUpdateHistoryPage(uuid) {
    openFullScreenModal('音域データを更新', '', `update-history-${uuid}`);
}

function openAddSongPage() {
    const html = `
        <form class="song-form" id="song-register-form">
            <div class="field-input-container">
                <div class="field-input-name">タイトル</div>
                <div class="field-input"><input type="text" name="title"></div>
            </div>
            <div class="field-input-container">
                <div class="field-input-name">アーティスト名</div>
                <div class="field-input">
                    <input type="text" name="artist">
                    <div class="candidates"></div>
                </div>
            </div>
            <div class="field-input-container">
                <div class="field-input-name">地声音域</div>
                <div class="field-input">
                    <input type="checkbox" name="notChestExists" id="input-chest-exists">
                    <label for="input-chest-exists" class="pl-2">地声なし</label>

                    <div>
                        <div class="field-input-name">地声最低音</div>
                        <div class="field-input">
                            <select name="chestMinOctave" id="input-chest-min-octave" class="mr-2">
                                <option value="0">low</option>
                                <option value="1" selected>mid1</option>
                                <option value="2">mid2</option>
                                <option value="3">hi</option>
                                <option value="4">hihi</option>
                                <option value="5">hihihi</option>
                            </select>
                            <select name="chestMinTone" id="input-chest-min-tone">
                                <option value="0">A</option>
                                <option value="1">A#</option>
                                <option value="2">B</option>
                                <option value="3">C</option>
                                <option value="4">C#</option>
                                <option value="5">D</option>
                                <option value="6">D#</option>
                                <option value="7">E</option>
                                <option value="8">F</option>
                                <option value="9">F#</option>
                                <option value="10">G</option>
                                <option value="11">G#</option>
                            </select><br>
                            <input type="checkbox" name="chestMinUnknown" id="input-chest-min-unknown" class="input-unknown">
                            <label for="input-chest-min-unknown" class="pl-2">不明</label>
                        </div>
                        <div class="field-input-name">地声最高音</div>
                        <div class="field-input">
                            <select name="chestMaxOctave" id="input-chest-max-octave" class="mr-2">
                                <option value="0">low</option>
                                <option value="1">mid1</option>
                                <option value="2">mid2</option>
                                <option value="3" selected>hi</option>
                                <option value="4">hihi</option>
                                <option value="5">hihihi</option>
                            </select>
                            <select name="chestMaxTone" id="input-chest-max-tone">
                                <option value="0">A</option>
                                <option value="1">A#</option>
                                <option value="2">B</option>
                                <option value="3">C</option>
                                <option value="4">C#</option>
                                <option value="5">D</option>
                                <option value="6">D#</option>
                                <option value="7">E</option>
                                <option value="8">F</option>
                                <option value="9">F#</option>
                                <option value="10">G</option>
                                <option value="11">G#</option>
                            </select><br>
                            <input type="checkbox" name="chestMaxUnknown" id="input-chest-max-unknown" class="input-unknown">
                            <label for="input-chest-max-unknown" class="pl-2">不明</label>
                        </div>
                    </div>
                </div>
            </div>
            <div class="field-input-container">
                <div class="field-input-name">裏声音域</div>
                <div class="field-input">
                    <input type="checkbox" name="notHeadExists" id="input-head-exists">
                    <label for="input-head-exists" class="pl-2">裏声なし</label>

                    <div>
                        <div class="field-input-name">裏声最低音</div>
                        <div class="field-input">
                            <select name="headMinOctave" id="input-head-min-octave" class="mr-2">
                                <option value="0">low</option>
                                <option value="1">mid1</option>
                                <option value="2" selected>mid2</option>
                                <option value="3">hi</option>
                                <option value="4">hihi</option>
                                <option value="5">hihihi</option>
                            </select>
                            <select name="headMinTone" id="input-head-min-tone">
                                <option value="0">A</option>
                                <option value="1">A#</option>
                                <option value="2">B</option>
                                <option value="3">C</option>
                                <option value="4">C#</option>
                                <option value="5">D</option>
                                <option value="6">D#</option>
                                <option value="7">E</option>
                                <option value="8">F</option>
                                <option value="9">F#</option>
                                <option value="10">G</option>
                                <option value="11">G#</option>
                            </select><br>
                            <input type="checkbox" name="headMinUnknown" id="input-head-min-unknown" class="input-unknown">
                            <label for="input-head-min-unknown" class="pl-2">不明</label>
                        </div>
                        <div class="field-input-name">裏声最高音</div>
                        <div class="field-input">
                            <select name="headMaxOctave" id="input-head-max-octave" class="mr-2">
                                <option value="0">low</option>
                                <option value="1">mid1</option>
                                <option value="2">mid2</option>
                                <option value="3" selected>hi</option>
                                <option value="4">hihi</option>
                                <option value="5">hihihi</option>
                            </select>
                            <select name="headMaxTone" id="input-head-max-tone">
                                    <option value="0">A</option>
                                    <option value="1">A#</option>
                                    <option value="2">B</option>
                                    <option value="3">C</option>
                                    <option value="4">C#</option>
                                    <option value="5">D</option>
                                    <option value="6">D#</option>
                                    <option value="7">E</option>
                                    <option value="8">F</option>
                                    <option value="9">F#</option>
                                    <option value="10">G</option>
                                    <option value="11">G#</option>
                            </select><br>
                            <input type="checkbox" name="headMaxUnknown" id="input-head-max-unknown" class="input-unknown">
                            <label for="input-head-max-unknown" class="pl-2">不明</label>
                        </div>
                    </div>
                </div>
            </div>
            <div class="field-input-container">
                <div class="field-input-name">最高音</div>
                <div class="field-input">
                    <input type="checkbox" name="autoFill" id="input-auto-fill" checked>
                    <label for="input-auto-fill" class="pl-2">最高音を自動で設定</label><br>

                    <select name="overallMaxOctave" id="input-overall-max-octave" class="mr-2" disabled>
                        <option value="0">low</option>
                        <option value="1">mid1</option>
                        <option value="2">mid2</option>
                        <option value="3" selected>hi</option>
                        <option value="4">hihi</option>
                        <option value="5">hihihi</option>
                    </select>
                    <select name="overallMaxTone" id="input-overall-max-tone" disabled>
                        <option value="0">A</option>
                        <option value="1">A#</option>
                        <option value="2">B</option>
                        <option value="3">C</option>
                        <option value="4">C#</option>
                        <option value="5">D</option>
                        <option value="6">D#</option>
                        <option value="7">E</option>
                        <option value="8">F</option>
                        <option value="9">F#</option>
                        <option value="10">G</option>
                        <option value="11">G#</option>
                    </select><br>
                    <input type="checkbox" name="overallMaxUnknown" id="input-overall-max-unknown" class="input-unknown" disabled>
                    <label for="input-overall-max-unknown" class="pl-2">不明</label>
                </div>
            </div>
            <div class="flex-fill"></div>
            <div class="btn-container">
                <button type="button" class="cancel-btn clickable">キャンセル</button>
                <input class="submit-btn clickable" type="submit" value="登録">
            </div>
        </form>
    `;
    openFullScreenModal('曲を追加', html, 'add-song');

    // キャセルボタンを押すと閉じるように
    $('#song-register-form .cancel-btn').on('click', function() {
        closeFullScreenModal(fullScreenModalId, 'add-song');
    });

    // 音域が不明のときにselectタグを非活性化
    $('.input-unknown').change(function () {
        $(this).prevAll('select').prop('disabled', $(this).prop('checked'));
    });

    // 最高音を自動で設定する可動かを変えたときに、selectタグとcheckboxの活性/非活性を設定
    $('#input-auto-fill').change(function () {
        const $inputUnknown = $(this).nextAll('.input-unknown');
        $inputUnknown.prop('disabled', $(this).prop('checked'));

        $(this).nextAll('select').prop('disabled', $(this).prop('checked') || $inputUnknown.prop('checked'));
    });

    // 地声・裏声の最高音を変更したときに最高音を更新
    $('#song-register-form select, #input-chest-exists, #input-chest-max-unknown, #input-head-exists, #input-head-max-unknown, #input-auto-fill').change(function () {
        if ($('#input-auto-fill').prop('checked')) {
            // 最高音の入力欄（ここを更新）
            const $inputOverallMaxOctave = $('#input-overall-max-octave');
            const $inputOverallMaxTone = $('#input-overall-max-tone');

            // 地声・裏声が存在するかどうか
            const notChestExists = $('#input-chest-exists').prop('checked');
            const notHeadExists = $('#input-head-exists').prop('checked');

            // 地声・裏声の最高音が不明かどうか
            const chestMaxUnknown = $('#input-chest-max-unknown').prop('checked');
            const headMaxUnknown = $('#input-head-max-unknown').prop('checked');

            // 地声と裏声の最高音の値
            let chestMaxOctave = $('#input-chest-max-octave').val() - 0;
            let chestMaxTone = $('#input-chest-max-tone').val() - 0;
            let headMaxOctave = $('#input-head-max-octave').val() - 0;
            let headMaxTone = $('#input-head-max-tone').val() - 0;

            // 地声・裏声が存在しなければ、値を-1にする
            if(notChestExists) {
                chestMaxOctave = -1;
            }
            if(notHeadExists) {
                headMaxOctave = -1;
            }

            // これ以下を書き換える
            if ((!notChestExists && chestMaxUnknown) || (!notHeadExists && headMaxUnknown) || (notChestExists && notHeadExists)) {
                $('#input-overall-max-unknown').prop('checked', true);
            } else {
                $('#input-overall-max-unknown').prop('checked', false);

                if (chestMaxOctave > headMaxOctave) {
                    $inputOverallMaxOctave.val(chestMaxOctave);
                    $inputOverallMaxTone.val(chestMaxTone);
                } else if (chestMaxOctave < headMaxOctave) {
                    $inputOverallMaxOctave.val(headMaxOctave);
                    $inputOverallMaxTone.val(headMaxTone);
                } else {
                    $inputOverallMaxOctave.val(chestMaxOctave);
                    $inputOverallMaxTone.val(Math.max(chestMaxTone, headMaxTone));
                }
            }
        }
    });

    // submit時の処理
    $('#song-register-form').submit(function() {
        function getTone(octave, tone) {
            return (octave - 3) * 12 + tone;
        }

        const $form = $(this);

        const title = $form.find('[name="title"]').val();
        const artist = $form.find('[name="artist"]').val();
        const notChestExists = $form.find('[name="notChestExists"]').prop('checked');
        const chestMinOctave = $form.find('[name="chestMinOctave"]').val() - 0;
        const chestMinTone = $form.find('[name="chestMinTone"]').val() - 0;
        const chestMinUnknown = $form.find('[name="chestMinUnknown"]').prop('checked');
        const chestMaxOctave = $form.find('[name="chestMaxOctave"]').val() - 0;
        const chestMaxTone = $form.find('[name="chestMaxTone"]').val() - 0;
        const chestMaxUnknown = $form.find('[name="chestMaxUnknown"]').prop('checked');
        const notHeadExists = $form.find('[name="notHeadExists"]').prop('checked');
        const headMinOctave = $form.find('[name="headMinOctave"]').val() - 0;
        const headMinTone = $form.find('[name="headMinTone"]').val() - 0;
        const headMinUnknown = $form.find('[name="headMinUnknown"]').prop('checked');
        const headMaxOctave = $form.find('[name="headMaxOctave"]').val() - 0;
        const headMaxTone = $form.find('[name="headMaxTone"]').val() - 0;
        const headMaxUnknown = $form.find('[name="headMaxUnknown"]').prop('checked');
        const overallMaxOctave = $form.find('[name="overallMaxOctave"]').val() - 0;
        const overallMaxTone = $form.find('[name="overallMaxTone"]').val() - 0;
        const overallMaxUnknown = $form.find('[name="overallMaxUnknown"]').prop('checked');

        // 曲のデータをセット
        let newSong = new Song();
        newSong.title = title;
        newSong.artist = artist;

        // 地声の音域をセット
        if(notChestExists) {
            newSong.chestMinNote = {
                value: null,
                status: 'notExist'
            };
            newSong.chestMaxNote = {
                value: null,
                status: 'notExist'
            };
        } else {
            if(chestMinUnknown) {
                newSong.chestMinNote = {
                    value: null,
                    status: 'unknown'
                };
            } else {
                newSong.chestMinNote = {
                    value: getTone(chestMinOctave, chestMinTone),
                    status: 'known'
                };
            }
            if(chestMaxUnknown) {
                newSong.chestMaxNote = {
                    value: null,
                    status: 'unknown'
                };
            } else {
                newSong.chestMaxNote = {
                    value: getTone(chestMaxOctave, chestMaxTone),
                    status: 'known'
                };
            }
        }
        // 裏声の音域をセット
        if(notHeadExists) {
            newSong.headMinNote = {
                value: null,
                status: 'notExist'
            };
            newSong.headMaxNote = {
                value: null,
                status: 'notExist'
            };
        } else {
            if(headMinUnknown) {
                newSong.headMinNote = {
                    value: null,
                    status: 'unknown'
                };
            } else {
                newSong.headMinNote = {
                    value: getTone(headMinOctave, headMinTone),
                    status: 'known'
                };
            }
            if(headMaxUnknown) {
                newSong.headMaxNote = {
                    value: null,
                    status: 'unknown'
                };
            } else {
                newSong.headMaxNote = {
                    value: getTone(headMaxOctave, headMaxTone),
                    status: 'known'
                };
            }
        }
        if(overallMaxUnknown) {
            newSong.overallMaxNote = {
                value: null,
                status: 'unknown'
            };
        } else {
            newSong.overallMaxNote = {
                value: getTone(overallMaxOctave, overallMaxTone),
                status: 'known'
            };
        }

        // 曲が重複していないかチェック
        for (const registeredSong of Object.values(songs)) {
            if(newSong.equals(registeredSong)) {
                if(confirm('同じタイトルとアーティスト名の曲が登録されています。登録しますか？')) {
                    break;
                } else {
                    return false;
                }
            }
        }

        // 曲を登録
        newSong.add(() => {
            // 配列に追加
            songs[newSong.uuid] = newSong;

            // リストを再表示
            filterAndSortSongs(prevSongConditions);

            // 追加ページを閉じる
            closeFullScreenModal(fullScreenModalId, 'add-song');

            // 詳細ページを表示するか聞く
            if(confirm('曲を追加しました。詳細ページに移動しますか？')) {
                displaySongDetail(newSong.uuid);
            }
        });

        return false;
    });
}
function openAddHistoryPage() {
    openFullScreenModal('音域データを追加', '', 'add-history');
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