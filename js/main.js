const version = 'Ver. 1.0.0';
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
    const minLimit = -25;
    const maxLimit = 12;
    const tolerance = 0; // 端を判定する許容誤差

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
});