const version = 'Ver. 1.0.0';

const minVoiceRangeLimit = -8;
const maxVoiceRangeLimit = 10;
const minKeyRangeLimit = -7;
const maxKeyRangeLimit = 7;
const tolerance = 0; // 端を判定する許容誤差
// ----------初期化----------
$(function () {
    showPage(0);
    // バージョンの表示
    $('.version').text(version);

    // 曲のデータを取得
    getSongs(() => {
        setTimeout(function () {
            // 履歴のデータを取得
            getHistories();
        }, 100);
    });

    // 絞り込みのスライダー
    // 音域
    $(".voice-range-box").each(function () {
        const $box = $(this);
        const $slider = $box.find(".voice-range-slider").get(0);
        const $rangeText = $box.find(".voice-range");

        const toneFromInt = (num) => {
            const tones = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'];
            const octave = ['low', 'mid1', 'mid2', 'hi', 'hihi', 'hihihi'];

            return octave[Math.floor(num / 12) + 3] + tones[(num + 48) % 12];
        }

        // スライダー作成
        noUiSlider.create($slider, {
            start: [minVoiceRangeLimit, maxVoiceRangeLimit],
            connect: true,
            range: { min: minVoiceRangeLimit, max: maxVoiceRangeLimit },
            step: 1
        });

        // 表示更新
        $slider.noUiSlider.on('update', function (values) {
            const minVal = Math.round(values[0]);
            const maxVal = Math.round(values[1]);

            // 端まで行ったか判定（toleranceを使って誤差吸収）
            const showMin = (minVal <= minVoiceRangeLimit + tolerance) ? "下限なし" : toneFromInt(minVal);
            const showMax = (maxVal >= maxVoiceRangeLimit - tolerance) ? "上限なし" : toneFromInt(maxVal);

            $rangeText.text(`${showMin} ～ ${showMax}`);
        });
    });

    // キー
    $(".key-range-box").each(function () {
        const $box = $(this);
        const $slider = $box.find(".key-range-slider").get(0);
        const $rangeText = $box.find(".key-range");

        const keyToStr = (key) => {
            if (key > 0) return '+' + key;
            if (key === 0) return '原曲キー';
            return key;
        };

        // スライダー作成
        noUiSlider.create($slider, {
            start: [minKeyRangeLimit, maxKeyRangeLimit],
            connect: true,
            range: { min: minKeyRangeLimit, max: maxKeyRangeLimit },
            step: 1
        });

        // 表示更新
        $slider.noUiSlider.on('update', function (values) {
            const minVal = Math.round(values[0]);
            const maxVal = Math.round(values[1]);

            // 端まで行ったか判定（toleranceを使って誤差吸収）
            const showMin = (minVal <= minKeyRangeLimit + tolerance) ? "下限なし" : keyToStr(minVal);
            const showMax = (maxVal >= maxKeyRangeLimit - tolerance) ? "上限なし" : keyToStr(maxVal);

            $rangeText.text(`${showMin} ～ ${showMax}`);
        });
    });

    // .input-box-options内のチェックボックスを一つしかチェックできないようにする
    $('.input-box-options > div input[type="checkbox"]').on('change', function () {
        const name = $(this).attr('name');
        $(this).parent().find(`*:not([name="${name}"]`).prop('checked', false);
    });

    // formのsubmit関連
    // 歌の検索
    $('#song-filtering-and-sorting-form').submit(function () {
        const $form = $(this);

        const title = $form.find('[name="title"]').val();
        const artist = $form.find('[name="artist"]').val();
        const chestMinNote = $form.find('[name="chestMinNote"]').get(0).noUiSlider.get().map(Number);
        const chestMaxNote = $form.find('[name="chestMaxNote"]').get(0).noUiSlider.get().map(Number);
        const headMinNote = $form.find('[name="headMinNote"]').get(0).noUiSlider.get().map(Number);
        const headMaxNote = $form.find('[name="headMaxNote"]').get(0).noUiSlider.get().map(Number);
        const overallMaxNote = $form.find('[name="overallMaxNote"]').get(0).noUiSlider.get().map(Number);
        const sortingOrder = $form.find('[name="sortingOrder"]').val();
        const sortingDirection = $form.find('[name="sortingDirection"]').val() - 0;

        let filteringConditionFuncs = [];
        let orderFunc;

        // タイトル
        if (title) {
            filteringConditionFuncs.push((song) => {
                return song.title.toLowerCase().includes(title.toLowerCase());
            });
        }

        // アーティスト
        if (artist) {
            filteringConditionFuncs.push((song) => {
                return song.artist.toLowerCase().includes(artist.toLowerCase());
            });
        }

        // 地声最低音
        if (chestMinNote[0] > minVoiceRangeLimit) {
            filteringConditionFuncs.push((song) => {
                if (song.chestMinNote.status !== 'known') return false;
                return song.chestMinNote.value >= chestMinNote[0];
            });
        }
        if (chestMinNote[1] < maxVoiceRangeLimit) {
            filteringConditionFuncs.push((song) => {
                if (song.chestMinNote.status !== 'known') return false;
                return song.chestMinNote.value <= chestMinNote[1];
            });
        }

        // 地声最高音
        if (chestMaxNote[0] > minVoiceRangeLimit) {
            filteringConditionFuncs.push((song) => {
                if (song.chestMaxNote.status !== 'known') return false;
                return song.chestMaxNote.value >= chestMaxNote[0];
            });
        }
        if (chestMaxNote[1] < maxVoiceRangeLimit) {
            filteringConditionFuncs.push((song) => {
                if (song.chestMaxNote.status !== 'known') return false;
                return song.chestMaxNote.value <= chestMaxNote[1];
            });
        }

        // 裏声最低音
        if (headMinNote[0] > minVoiceRangeLimit) {
            filteringConditionFuncs.push((song) => {
                if (song.headMinNote.status !== 'known') return false;
                return song.headMinNote.value >= headMinNote[0];
            });
        }
        if (headMinNote[1] < maxVoiceRangeLimit) {
            filteringConditionFuncs.push((song) => {
                if (song.headMinNote.status !== 'known') return false;
                return song.headMinNote.value <= headMinNote[1];
            });
        }

        // 裏声最高音
        if (headMaxNote[0] > minVoiceRangeLimit) {
            filteringConditionFuncs.push((song) => {
                if (song.headMaxNote.status !== 'known') return false;
                return song.headMaxNote.value >= headMaxNote[0];
            });
        }
        if (headMaxNote[1] < maxVoiceRangeLimit) {
            filteringConditionFuncs.push((song) => {
                if (song.headMaxNote.status !== 'known') return false;
                return song.headMaxNote.value <= headMaxNote[1];
            });
        }

        // 最高音
        if (overallMaxNote[0] > minVoiceRangeLimit) {
            filteringConditionFuncs.push((song) => {
                if (song.overallMaxNote.status !== 'known') return false;
                return song.overallMaxNote.value >= overallMaxNote[0];
            });
        }
        if (overallMaxNote[1] < maxVoiceRangeLimit) {
            filteringConditionFuncs.push((song) => {
                if (song.overallMaxNote.status !== 'known') return false;
                return song.overallMaxNote.value <= overallMaxNote[1];
            });
        }

        if (sortingOrder === 'createdAt') {
            orderFunc = (songA, songB) => {
                return sortingDirection * (songB.createdAt - songA.createdAt);
            };
        } else if (sortingOrder === 'title') {
            orderFunc = (songA, songB) => {
                if (songB.title > songA.title) return -sortingDirection;
                if (songB.title === songA.title) return 0;
                if (songB.title < songA.title) return sortingDirection;
            };
        } else if (sortingOrder === 'artist') {
            orderFunc = (songA, songB) => {
                if (songB.artist > songA.artist) return -sortingDirection;
                if (songB.artist === songA.artist) return 0;
                if (songB.artist < songA.artist) return sortingDirection;
            };
        } else if (sortingOrder === 'chestMinNote') {
            orderFunc = (songA, songB) => {
                if (songA.chestMinNote.status !== 'known' && songB.chestMinNote.status !== 'known') return 0;
                if (songA.chestMinNote.status !== 'known') return 1;
                if (songB.chestMinNote.status !== 'known') return -1;
                return sortingDirection * (songB.chestMinNote.value - songA.chestMinNote.value);
            };
        } else if (sortingOrder === 'chestMaxNote') {
            orderFunc = (songA, songB) => {
                if (songA.chestMaxNote.status !== 'known' && songB.chestMaxNote.status !== 'known') return 0;
                if (songA.chestMaxNote.status !== 'known') return 1;
                if (songB.chestMaxNote.status !== 'known') return -1;
                return sortingDirection * (songB.chestMaxNote.value - songA.chestMaxNote.value);
            };
        } else if (sortingOrder === 'headMinNote') {
            orderFunc = (songA, songB) => {
                if (songA.headMinNote.status !== 'known' && songB.headMinNote.status !== 'known') return 0;
                if (songA.headMinNote.status !== 'known') return 1;
                if (songB.headMinNote.status !== 'known') return -1;
                return sortingDirection * (songB.headMinNote.value - songA.headMinNote.value);
            };
        } else if (sortingOrder === 'headMaxNote') {
            orderFunc = (songA, songB) => {
                if (songA.headMaxNote.status !== 'known' && songB.headMaxNote.status !== 'known') return 0;
                if (songA.headMaxNote.status !== 'known') return 1;
                if (songB.headMaxNote.status !== 'known') return -1;
                return sortingDirection * (songB.headMaxNote.value - songA.headMaxNote.value);
            };
        } else if (sortingOrder === 'overallMaxNote') {
            orderFunc = (songA, songB) => {
                if (songA.overallMaxNote.status !== 'known' && songB.overallMaxNote.status !== 'known') return 0;
                if (songA.overallMaxNote.status !== 'known') return 1;
                if (songB.overallMaxNote.status !== 'known') return -1;
                return sortingDirection * (songB.overallMaxNote.value - songA.overallMaxNote.value);
            };
        }

        filterAndSortSongs({
            'filteringConditionFuncs': filteringConditionFuncs,
            'orderFunc': orderFunc,
        });

        return false;
    });

    $('#history-filtering-and-sorting-form').submit(function () {
        const $form = $(this);

        const title = $form.find('[name="title"]').val();
        const artist = $form.find('[name="artist"]').val();
        const sung = $form.find('[name="sung"]').prop('checked');
        const notSung = $form.find('[name="notSung"]').prop('checked');
        const favorite = $form.find('[name="favorite"]').prop('checked');
        const notFavorite = $form.find('[name="notFavorite"]').prop('checked');
        const key = $form.find('[name="key"]').get(0).noUiSlider.get().map(Number);
        const chestMinNote = $form.find('[name="chestMinNote"]').get(0).noUiSlider.get().map(Number);
        const chestMaxNote = $form.find('[name="chestMaxNote"]').get(0).noUiSlider.get().map(Number);
        const headMinNote = $form.find('[name="headMinNote"]').get(0).noUiSlider.get().map(Number);
        const headMaxNote = $form.find('[name="headMaxNote"]').get(0).noUiSlider.get().map(Number);
        const overallMaxNote = $form.find('[name="overallMaxNote"]').get(0).noUiSlider.get().map(Number);
        const sortingOrder = $form.find('[name="sortingOrder"]').val();
        const sortingDirection = $form.find('[name="sortingDirection"]').val() - 0;

        let filteringConditionFuncs = [];
        let orderFunc;

        // タイトル
        if (title) {
            filteringConditionFuncs.push((history) => {
                return history.song.title.toLowerCase().includes(title.toLowerCase());
            });
        }

        // アーティスト
        if (artist) {
            filteringConditionFuncs.push((history) => {
                return history.song.artist.toLowerCase().includes(artist.toLowerCase());
            });
        }

        // 歌ったことがある/ない曲
        if (sung) {
            filteringConditionFuncs.push((history) => {
                return history.hasSung;
            });
        }
        if (notSung) {
            filteringConditionFuncs.push((history) => {
                return !history.hasSung;
            });
        }

        // お気に入り
        if (favorite) {
            filteringConditionFuncs.push((history) => {
                return history.isFavorite;
            });
        }
        if (notFavorite) {
            filteringConditionFuncs.push((history) => {
                return !history.isFavorite;
            });
        }

        // キー
        if (key[0] > minKeyRangeLimit) {
            filteringConditionFuncs.push((history) => {
                return history.key + history.key >= key[0];
            });
        }
        if (key[1] < maxKeyRangeLimit) {
            filteringConditionFuncs.push((history) => {
                return history.key + history.key <= key[1];
            });
        }

        // 地声最低音
        if (chestMinNote[0] > minVoiceRangeLimit) {
            filteringConditionFuncs.push((history) => {
                if (history.song.chestMinNote.status !== 'known') return false;
                return history.song.chestMinNote.value + history.key >= chestMinNote[0];
            });
        }
        if (chestMinNote[1] < maxVoiceRangeLimit) {
            filteringConditionFuncs.push((history) => {
                if (history.song.chestMinNote.status !== 'known') return false;
                return history.song.chestMinNote.value + history.key <= chestMinNote[1];
            });
        }

        // 地声最高音
        if (chestMaxNote[0] > minVoiceRangeLimit) {
            filteringConditionFuncs.push((history) => {
                if (history.song.chestMaxNote.status !== 'known') return false;
                return history.song.chestMaxNote.value + history.key >= chestMaxNote[0];
            });
        }
        if (chestMaxNote[1] < maxVoiceRangeLimit) {
            filteringConditionFuncs.push((history) => {
                if (history.song.chestMaxNote.status !== 'known') return false;
                return history.song.chestMaxNote.value + history.key <= chestMaxNote[1];
            });
        }

        // 裏声最低音
        if (headMinNote[0] > minVoiceRangeLimit) {
            filteringConditionFuncs.push((history) => {
                if (history.song.headMinNote.status !== 'known') return false;
                return history.song.headMinNote.value + history.key >= headMinNote[0];
            });
        }
        if (headMinNote[1] < maxVoiceRangeLimit) {
            filteringConditionFuncs.push((history) => {
                if (history.song.headMinNote.status !== 'known') return false;
                return history.song.headMinNote.value + history.key <= headMinNote[1];
            });
        }

        // 裏声最高音
        if (headMaxNote[0] > minVoiceRangeLimit) {
            filteringConditionFuncs.push((history) => {
                if (history.song.headMaxNote.status !== 'known') return false;
                return history.song.headMaxNote.value + history.key >= headMaxNote[0];
            });
        }
        if (headMaxNote[1] < maxVoiceRangeLimit) {
            filteringConditionFuncs.push((history) => {
                if (history.song.headMaxNote.status !== 'known') return false;
                return history.song.headMaxNote.value + history.key <= headMaxNote[1];
            });
        }

        // 最高音
        if (overallMaxNote[0] > minVoiceRangeLimit) {
            filteringConditionFuncs.push((history) => {
                if (history.song.overallMaxNote.status !== 'known') return false;
                return history.song.overallMaxNote.value + history.key >= overallMaxNote[0];
            });
        }
        if (overallMaxNote[1] < maxVoiceRangeLimit) {
            filteringConditionFuncs.push((history) => {
                if (history.song.overallMaxNote.status !== 'known') return false;
                return history.song.overallMaxNote.value + history.key <= overallMaxNote[1];
            });
        }

        if (sortingOrder === 'createdAt') {
            orderFunc = (historyA, historyB) => {
                return sortingDirection * (historyB.createdAt - historyA.createdAt);
            };
        } else if (sortingOrder === 'title') {
            orderFunc = (historyA, historyB) => {
                if (historyB.song.title > historyA.song.title) return -sortingDirection;
                if (historyB.song.title === historyA.song.title) return 0;
                if (historyB.song.title < historyA.song.title) return sortingDirection;
            };
        } else if (sortingOrder === 'artist') {
            orderFunc = (historyA, historyB) => {
                if (historyB.song.artist > historyA.song.artist) return -sortingDirection;
                if (historyB.song.artist === historyA.song.artist) return 0;
                if (historyB.song.artist < historyA.song.artist) return sortingDirection;
            };
        } else if (sortingOrder === 'chestMinNote') {
            orderFunc = (historyA, historyB) => {
                if (historyA.song.chestMinNote.status !== 'known' && historyB.song.chestMinNote.status !== 'known') return 0;
                if (historyA.song.chestMinNote.status !== 'known') return 1;
                if (historyB.song.chestMinNote.status !== 'known') return -1;
                return sortingDirection * (historyB.song.chestMinNote.value + historyB.key - historyA.song.chestMinNote.value - historyA.key);
            };
        } else if (sortingOrder === 'chestMaxNote') {
            orderFunc = (historyA, historyB) => {
                if (historyA.song.chestMaxNote.status !== 'known' && historyB.song.chestMaxNote.status !== 'known') return 0;
                if (historyA.song.chestMaxNote.status !== 'known') return 1;
                if (historyB.song.chestMaxNote.status !== 'known') return -1;
                return sortingDirection * (historyB.song.chestMaxNote.value + historyB.key - historyA.song.chestMaxNote.value - historyA.key);
            };
        } else if (sortingOrder === 'headMinNote') {
            orderFunc = (historyA, historyB) => {
                if (historyA.song.headMinNote.status !== 'known' && historyB.song.headMinNote.status !== 'known') return 0;
                if (historyA.song.headMinNote.status !== 'known') return 1;
                if (historyB.song.headMinNote.status !== 'known') return -1;
                return sortingDirection * (historyB.song.headMinNote.value + historyB.key - historyA.song.headMinNote.value - historyA.key);
            };
        } else if (sortingOrder === 'headMaxNote') {
            orderFunc = (historyA, historyB) => {
                if (historyA.song.headMaxNote.status !== 'known' && historyB.song.headMaxNote.status !== 'known') return 0;
                if (historyA.song.headMaxNote.status !== 'known') return 1;
                if (historyB.song.headMaxNote.status !== 'known') return -1;
                return sortingDirection * (historyB.song.headMaxNote.value + historyB.key - historyA.song.headMaxNote.value - historyA.key);
            };
        } else if (sortingOrder === 'overallMaxNote') {
            orderFunc = (historyA, historyB) => {
                if (historyA.song.overallMaxNote.status !== 'known' && historyB.song.overallMaxNote.status !== 'known') return 0;
                if (historyA.song.overallMaxNote.status !== 'known') return 1;
                if (historyB.song.overallMaxNote.status !== 'known') return -1;
                return sortingDirection * (historyB.song.overallMaxNote.value + historyB.key - historyA.song.overallMaxNote.value - historyA.key);
            };
        } else if (sortingOrder === 'score') {
            orderFunc = (historyA, historyB) => {
                if (!historyA.score && !historyB.score) return 0;
                if (!historyA.score) return 1;
                if (!historyB.score) return -1;
                return sortingDirection * (historyB.score - historyA.score);
            };
        }

        filterAndSortHistories({
            'filteringConditionFuncs': filteringConditionFuncs,
            'orderFunc': orderFunc,
        });

        return false;
    });

    // inputがフォーカスされた時にテキストを選択
    $(document).on('focus', 'input[type="text"], input[type="number"]', function () {
        $(this).select();
    });
    
    // 入力欄がfocusされた時に中央にスクロール
    // Slide Over
    $(document).on('focus', '.slide-over-main input', function() {
        const $scrollContainer = $(this).closest('.slide-over-main');
        const $inputBox = $(this).closest('.input-box');

        $scrollContainer.animate({scrollTop: $inputBox.offset().top - $scrollContainer.offset().top}, 200);
    });
    // フルスクリーンモーダル
    $(document).on('focus', '.full-screen-modal-main input, .full-screen-modal-main textarea', function() {
        const $scrollContainer = $(this).closest('.full-screen-modal-main');
        const $inputBox = $(this).closest('.field-input-container');

        $scrollContainer.animate({scrollTop: $inputBox.offset().top - $scrollContainer.offset().top}, 200);
    });

    // アーティストの入力補助
    $(document).on('input', 'input[name="artist"]', function () {
        const $artistInput = $(this);
        const value = $artistInput.val().toLowerCase();
        const $candidates = $artistInput.nextAll('.candidates').first();
        $candidates.empty();

        const $div = $('<div>');
        if (value.trim().length > 0) {
            let hasCandidate = false;
            for (const artist of artists) {
                if (artist.toLowerCase().includes(value)) {
                    const $candidate = $('<lavel>');
                    $candidate.addClass('candidate');
                    $candidate.text(artist);

                    $div.append($candidate);

                    $candidate.on('mousedown', function () {
                        $artistInput.val($(this).text());
                        $candidates.empty();
                    });
                    hasCandidate = true;
                }
            }
            if(hasCandidate) {
                $candidates.append($div);
            }
        }
    });

    // フルスクリーンモーダルでエンターを押した時にsubmitしないようにする
    $(document).on('keydown', '.full-screen-modal-main form', function (e) {
        if (e.key === 'Enter') e.preventDefault();
    });

    // 音域データの検索
});