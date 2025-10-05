const version = 'Ver. 1.0.0';

const minLimit = -10;
const maxLimit = 8;
const tolerance = 0; // 端を判定する許容誤差
// ----------初期化----------
$(function () {
    showPage(0);
    // バージョンの表示
    $('.version').text(version);

    // 曲のデータを取得
    getSongs(() => {
        showSongs(Object.values(songs));
        setTimeout(function () {
            // 履歴のデータを取得
            getHistories(() => {
                showHistories(Object.values(histories));
            });
        }, 100);
    });

    // 絞り込みのスライダー
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
            start: [minLimit, maxLimit],
            connect: true,
            range: { min: minLimit, max: maxLimit },
            step: 1
        });

        // 表示更新
        $slider.noUiSlider.on('update', function (values) {
            const minVal = Math.round(values[0]);
            const maxVal = Math.round(values[1]);

            // 端まで行ったか判定（toleranceを使って誤差吸収）
            const showMin = (minVal <= minLimit + tolerance) ? "下限なし" : toneFromInt(minVal);
            const showMax = (maxVal >= maxLimit - tolerance) ? "上限なし" : toneFromInt(maxVal);

            $rangeText.text(`${showMin} ～ ${showMax}`);
        });
    });

    // formのsubmit関連
    // 歌の検索
    $('#song-filtering-and-sorting-form').submit(() => {
        const $form = $(this);

        const title = $form.find('[name="title"]').val();
        const artist = $form.find('[name="artist"]').val();
        const chestMinNote = $form.find('[name="chestMinNote"]').get(0).noUiSlider.get().map(Number);
        const chestMaxNote = $form.find('[name="chestMaxNote"]').get(0).noUiSlider.get().map(Number);
        const headMinNote = $form.find('[name="headMinNote"]').get(0).noUiSlider.get().map(Number);
        const headMaxNote = $form.find('[name="headMaxNote"]').get(0).noUiSlider.get().map(Number);
        const overallMaxNote = $form.find('[name="overallMaxNote"]').get(0).noUiSlider.get().map(Number);
        const order = $form.find('[name="order"]').val();

        let filteringConditionFuncs = [];
        let orderFunc;

        // タイトル
        if(title) {
            filteringConditionFuncs.push((song) => {
                return song.title.toLowerCase().includes(title.toLowerCase());
            });
        }

        // アーティスト
        if(artist) {
            filteringConditionFuncs.push((song) => {
                return song.artist.toLowerCase().includes(artist.toLowerCase());
            });
        }
        
        // 地声最低音
        if(chestMinNote[0] > minLimit) {
            filteringConditionFuncs.push((song) => {
                if(song.chestMinNote.status !== 'known') return false;
                return song.chestMinNote.value >= chestMinNote[0];
            });
        }
        if(chestMinNote[1] < maxLimit) {
            filteringConditionFuncs.push((song) => {
                if(song.chestMinNote.status !== 'known') return false;
                return song.chestMinNote.value <= chestMinNote[1];
            });
        }

        // 地声最高音
        if(chestMaxNote[0] > minLimit) {
            filteringConditionFuncs.push((song) => {
                if(song.chestMaxNote.status !== 'known') return false;
                return song.chestMaxNote.value >= chestMaxNote[0];
            });
        }
        if(chestMaxNote[1] < maxLimit) {
            filteringConditionFuncs.push((song) => {
                if(song.chestMaxNote.status !== 'known') return false;
                return song.chestMaxNote.value <= chestMaxNote[1];
            });
        }

        // 裏声最低音
        if(headMinNote[0] > minLimit) {
            filteringConditionFuncs.push((song) => {
                if(song.headMinNote.status !== 'known') return false;
                return song.headMinNote.value >= headMinNote[0];
            });
        }
        if(headMinNote[1] < maxLimit) {
            filteringConditionFuncs.push((song) => {
                if(song.headMinNote.status !== 'known') return false;
                return song.headMinNote.value <= headMinNote[1];
            });
        }

        // 裏声最高音
        if(headMaxNote[0] > minLimit) {
            filteringConditionFuncs.push((song) => {
                if(song.headMaxNote.status !== 'known') return false;
                return song.headMaxNote.value >= headMaxNote[0];
            });
        }
        if(headMaxNote[1] < maxLimit) {
            filteringConditionFuncs.push((song) => {
                if(song.headMaxNote.status !== 'known') return false;
                return song.headMaxNote.value <= headMaxNote[1];
            });
        }

        // 最高音
        if(overallMaxNote[0] > minLimit) {
            filteringConditionFuncs.push((song) => {
                if(song.overallMaxNote.status !== 'known') return false;
                return song.overallMaxNote.value >= overallMaxNote[0];
            });
        }
        if(overallMaxNote[1] < maxLimit) {
            filteringConditionFuncs.push((song) => {
                if(song.overallMaxNote.status !== 'known') return false;
                return song.overallMaxNote.value <= overallMaxNote[1];
            });
        }

        if(order === 'createdAt') {
            orderFunc = (songA, songB) => {
                return songB.createdAt - songA.createdAt;
            };
        } else if (order === 'title') {
            orderFunc = (songA, songB) => {
                if (songB.title > songA.title) return -1;
                if (songB.title === songA.title) return 0;
                if (songB.title < songA.title) return 1;
            };
        } else if (order === 'artist') {
            orderFunc = (songA, songB) => {
                if (songB.artist > songA.artist) return -1;
                if (songB.artist === songA.artist) return 0;
                if (songB.artist < songA.artist) return 1;
            };
        }else if(order === 'chestMinNote') {
            orderFunc = (songA, songB) => {
                if(songA.overallMaxNote.status !== 'known' && songB.overallMaxNote.status !== 'known') return 0;
                if(songA.overallMaxNote.status !== 'known') return 1;
                if(songB.overallMaxNote.status !== 'known') return -1;
                return songB.overallMaxNote.value - songA.overallMaxNote.value;
            };
        }

        filterAndSortSongs({
            'filteringConditionFuncs': filteringConditionFuncs,
            'orderFunc': orderFunc,
        });

        return false;
    });

    // 音域データの検索
});