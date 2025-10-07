class ApiClass {
    constructor() {
        this.uuid = crypto.randomUUID();
        this.createdAt = new Date().getTime();
    }

    post(mode='add', f=null) {
        let params = this.toDict();
        params.sheet = this.sheet();
        params.mode = mode;

        post(params, (data) => {if(f !== null) f(data);});
    }

    getCreatedAt() {
        const date = new Date(this.createdAt);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // 月は0から始まる
        const day = String(date.getDate()).padStart(2, '0');

        return `${year}/${month}/${day}`;
    }

    // データを連想配列に変換する
    toDict() {
        throw new Error('Abstract method!');
    }

    // スプレッドシート上のシート名を返す
    sheet() {
        throw new Error('Abstract method!');
    }
}

class History extends ApiClass {
    constructor(dict=null) {
        super();

        if(dict) {
            this.fromDict(dict);
        }else {
            this.song = null;
            this.key = 0;
            this.score = '';
            this.machineType = '';
            this.comment = '';
            this.hasSung = false;
            this.isFavourite = false;
        }
    }

    getChestMinNote() {
        return this.song.getChestMinNote(this.key);
    } 
    getChestMaxNote() {
        return this.song.getChestMaxNote(this.key);
    } 
    getHeadMinNote() {
        return this.song.getHeadMinNote(this.key);
    } 
    getHeadMaxNote() {
        return this.song.getHeadMaxNote(this.key);
    } 
    getOverallMaxNote() {
        return this.song.getOverallMaxNote(this.key);
    } 

    // 連想配列から読み込む
    fromDict(dict) {
        this.uuid = dict.uuid;
        this.createdAt = dict.createdAt;
        this.song = getSong(dict.songId);
        this.key = dict.key-0;
        this.score = dict.score ? dict.score-0 : dict.score;
        this.machineType = dict.machineType;
        this.comment = dict.comment;
        this.hasSung = dict.hasSung;
        this.isFavourite = dict.isFavourite;
    }

    // データを連想配列に変換する
    toDict() {
        return {
            uuid : this.uuid,
            createdAt : this.createdAt,
            songId : this.song ? this.song.uuid : null,
            key : this.key,
            score : this.score,
            machineType : this.machineType,
            comment : this.comment,
            hasSung : this.hasSung,
            isFavourite : this.isFavourite,
        };
    }

    registerHasSung(hasSung, f=null) {
        this.hasSung = hasSung;
        this.post('register-has-sung', f);
    }

    registerIsFavorite(isFavourite, f=null) {
        this.isFavourite = isFavourite;
        this.post('register-is-favorite', f);
    }

    // スプレッドシート上のシート名を返す
    sheet() {
        return 'history';
    }

    clone() {
        return new History(this.toDict());
    }
}

// 曲のクラス
// それぞれの最高音・最低音は整数値(value)で管理する
// 最高音・最低音のstatusはknown(valueが有効)、notExist(存在しない)、unknown(不明)の三種類
class Song extends ApiClass {
    constructor(dict=null) {
        super();
        
        if(dict) {
            this.fromDict(dict);
        }else {
            this.title = '';
            this.artist = '';
            this.chestMinNote = {
                value: null,
                status: 'unknown'
            };
            this.chestMaxNote = {
                value: null,
                status: 'unknown'
            };
            this.headMinNote = {
                value: null,
                status: 'unknown'
            };
            this.headMaxNote = {
                value: null,
                status: 'unknown'
            };
            this.overallMaxNote = {
                value: null,
                status: 'unknown'
            };
        }
    }
    getChestMinNote(key=0) {
        if(this.chestMinNote.status == 'known') {
            return this.toneFromInt(this.chestMinNote.value + key);
        } else if(this.chestMinNote.status == 'notExist') {
            return '-';
        } else {
            return '不明';
        }
    }
    getChestMaxNote(key=0) {
        if(this.chestMaxNote.status == 'known') {
            return this.toneFromInt(this.chestMaxNote.value + key);
        } else if(this.chestMaxNote.status == 'notExist') {
            return '-';
        } else {
            return '不明';
        }
    }
    getHeadMinNote(key=0) {
        if(this.headMinNote.status == 'known') {
            return this.toneFromInt(this.headMinNote.value + key);
        } else if(this.headMinNote.status == 'notExist') {
            return '-';
        } else {
            return '不明';
        }
    }
    getHeadMaxNote(key=0) {
        if(this.headMaxNote.status == 'known') {
            return this.toneFromInt(this.headMaxNote.value + key);
        } else if(this.headMaxNote.status == 'notExist') {
            return '-';
        } else {
            return '不明';
        }
    }
    getOverallMaxNote(key=0) {
        if(this.overallMaxNote.status == 'known') {
            return this.toneFromInt(this.overallMaxNote.value + key);
        } else if(this.overallMaxNote.status == 'notExist') {
            return '-';
        } else {
            return '不明';
        }
    }
    
    toneFromInt(num) {
        const tones = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'];
        const octave = ['low', 'mid1', 'mid2', 'hi', 'hihi', 'hihihi'];

        return octave[Math.floor(num / 12) + 3] + tones[(num + 48) % 12];
    }
    // 連想配列から読み込む
    fromDict(dict) {
        this.uuid = dict.uuid;
        this.createdAt = dict.createdAt;
        this.title = dict.title;
        this.artist = dict.artist;
        this.chestMinNote = {
            value : dict.chestMinNoteStatus === 'known' ? dict.chestMinNoteValue-0 : dict.chestMinNoteValue,
            status : dict.chestMinNoteStatus
        };
        this.chestMaxNote = {
            value : dict.chestMaxNoteStatus === 'known' ? dict.chestMaxNoteValue-0 : dict.chestMaxNoteValue,
            status : dict.chestMaxNoteStatus
        };
        this.headMinNote = {
            value : dict.headMinNoteStatus === 'known' ? dict.headMinNoteValue-0 : dict.headMinNoteValue,
            status : dict.headMinNoteStatus
        };
        this.headMaxNote = {
            value : dict.headMaxNoteStatus === 'known' ? dict.headMaxNoteValue-0 : dict.headMaxNoteValue,
            status : dict.headMaxNoteStatus
        };
        this.overallMaxNote = {
            value : dict.overallMaxNoteStatus === 'known' ? dict.overallMaxNoteValue-0 : dict.overallMaxNoteValue,
            status : dict.overallMaxNoteStatus
        };
    }

    // データを連想配列に変換する
    toDict() {
        return {
            uuid : this.uuid,
            createdAt : this.createdAt,
            title : this.title,
            artist : this.artist,
            chestMinNoteValue : this.chestMinNote.value,
            chestMinNoteStatus : this.chestMinNote.status,
            chestMaxNoteValue : this.chestMaxNote.value,
            chestMaxNoteStatus : this.chestMaxNote.status,
            headMinNoteValue : this.headMinNote.value,
            headMinNoteStatus : this.headMinNote.status,
            headMaxNoteValue : this.headMaxNote.value,
            headMaxNoteStatus : this.headMaxNote.status,
            overallMaxNoteValue : this.overallMaxNote.value,
            overallMaxNoteStatus : this.overallMaxNote.status,
        };
    }

    // スプレッドシート上のシート名を返す
    sheet() {
        return 'songs';
    }

    clone() {
        return new Song(this.toDict());
    }
}