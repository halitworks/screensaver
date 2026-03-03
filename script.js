var wl = null,
    ti = null,
    st = 0;

window.addEventListener('load', function () {
    document.getElementById('loading-screen').classList.add('fade-out');
});

var cdInterval = null,
    iftarInterval = null,
    timerAlarm = null;

function startCountdown() {
    if (cdInterval) {
        clearInterval(cdInterval);
        cdInterval = null;
        stopAlarm();
        document.getElementById('cdStartBtn').innerText = 'Başlat';
        document.getElementById('cdStartBtn').className = 'tp-btn success';
        return;
    }
    var h = parseInt(document.getElementById('cdH').value) || 0;
    var m = parseInt(document.getElementById('cdM').value) || 0;
    var s = parseInt(document.getElementById('cdS').value) || 0;
    var total = h * 3600 + m * 60 + s;
    if (total <= 0) {
        showToast('Süre girin!');
        return;
    }
    document.getElementById('cdStartBtn').innerText = 'Durdur';
    document.getElementById('cdStartBtn').className = 'tp-btn accent';
    cdInterval = setInterval(function () {
        total--;
        if (total <= 0) {
            clearInterval(cdInterval);
            cdInterval = null;
            document.getElementById('cdDisplay').innerText = '00:00:00';
            document.getElementById('cdDisplay').style.color = 'var(--danger)';
            playAlarm();
            return;
        }
        var hh = Math.floor(total / 3600);
        var mm = Math.floor((total % 3600) / 60);
        var ss = total % 60;
        document.getElementById('cdDisplay').innerText = String(hh).padStart(2, '0') + ':' + String(mm).padStart(2, '0') + ':' + String(ss).padStart(2, '0');
        document.getElementById('cdDisplay').style.color = total <= 10 ? 'var(--danger)' : 'var(--success)';
    }, 1000);
}

function resetCountdown() {
    if (cdInterval) {
        clearInterval(cdInterval);
        cdInterval = null;
    }
    stopAlarm();
    document.getElementById('cdDisplay').innerText = String(parseInt(document.getElementById('cdH').value) || 0).padStart(2, '0') + ':' + String(parseInt(document.getElementById('cdM').value) || 0).padStart(2, '0') + ':' + String(parseInt(document.getElementById('cdS').value) || 0).padStart(2, '0');
    document.getElementById('cdDisplay').style.color = 'var(--success)';
    document.getElementById('cdStartBtn').innerText = 'Başlat';
    document.getElementById('cdStartBtn').className = 'tp-btn success';
}

function playAlarm() {
    if (timerAlarm) return;
    var ac = new (window.AudioContext || window.webkitAudioContext)();
    timerAlarm = {
        ac: ac,
        active: true
    };

    function beep() {
        if (!timerAlarm || !timerAlarm.active) return;
        var osc = ac.createOscillator();
        var g = ac.createGain();
        osc.connect(g);
        g.connect(ac.destination);
        osc.frequency.setValueAtTime(880, ac.currentTime);
        g.gain.setValueAtTime(0, ac.currentTime);
        g.gain.linearRampToValueAtTime(0.5, ac.currentTime + 0.1);
        g.gain.linearRampToValueAtTime(0, ac.currentTime + 0.4);
        osc.start();
        osc.stop(ac.currentTime + 0.5);
        timerAlarm.timeout = setTimeout(beep, 1000);
    }
    beep();
}

function stopAlarm() {
    if (timerAlarm) {
        timerAlarm.active = false;
        if (timerAlarm.timeout) clearTimeout(timerAlarm.timeout);
        try {
            timerAlarm.ac.close();
        } catch (e) { }
        timerAlarm = null;
    }
}

const RAMADAN_2026 = [{
    d: 19,
    m: 1,
    t: "18:49"
}, {
    d: 20,
    m: 1,
    t: "18:51"
}, {
    d: 21,
    m: 1,
    t: "18:52"
}, {
    d: 22,
    m: 1,
    t: "18:53"
}, {
    d: 23,
    m: 1,
    t: "18:54"
}, {
    d: 24,
    m: 1,
    t: "18:55"
}, {
    d: 25,
    m: 1,
    t: "18:56"
}, {
    d: 26,
    m: 1,
    t: "18:58"
}, {
    d: 27,
    m: 1,
    t: "18:59"
}, {
    d: 28,
    m: 1,
    t: "19:00"
}, {
    d: 1,
    m: 2,
    t: "19:01"
}, {
    d: 2,
    m: 2,
    t: "19:02"
}, {
    d: 3,
    m: 2,
    t: "19:03"
}, {
    d: 4,
    m: 2,
    t: "19:05"
}, {
    d: 5,
    m: 2,
    t: "19:06"
}, {
    d: 6,
    m: 2,
    t: "19:07"
}, {
    d: 7,
    m: 2,
    t: "19:08"
}, {
    d: 8,
    m: 2,
    t: "19:09"
}, {
    d: 9,
    m: 2,
    t: "19:10"
}, {
    d: 10,
    m: 2,
    t: "19:11"
}, {
    d: 11,
    m: 2,
    t: "19:12"
}, {
    d: 12,
    m: 2,
    t: "19:14"
}, {
    d: 13,
    m: 2,
    t: "19:15"
}, {
    d: 14,
    m: 2,
    t: "19:16"
}, {
    d: 15,
    m: 2,
    t: "19:17"
}, {
    d: 16,
    m: 2,
    t: "19:18"
}, {
    d: 17,
    m: 2,
    t: "19:19"
}, {
    d: 18,
    m: 2,
    t: "19:20"
}, {
    d: 19,
    m: 2,
    t: "19:21"
}];

async function updateIftarCountdown() {
    if (iftarInterval) clearInterval(iftarInterval);
    const statusEl = document.getElementById('iftarStatus');
    const displayEl = document.getElementById('iftarDisplay');

    function iftarTick() {
        var now = new Date();
        var curD = now.getDate(),
            curM = now.getMonth();
        var target = null,
            infoIdx = -1;
        for (var i = 0; i < RAMADAN_2026.length; i++) {
            var item = RAMADAN_2026[i];
            var itemDate = new Date(2026, item.m, item.d);
            var tParts = item.t.split(':');
            var iftarToday = new Date(2026, item.m, item.d, parseInt(tParts[0]), parseInt(tParts[1]), 0);
            if (iftarToday > now) {
                target = iftarToday;
                infoIdx = i + 1;
                break;
            }
        }
        if (!target) {
            displayEl.innerText = "--:--:--";
            statusEl.innerText = "Ramazan programı sona erdi.";
            return;
        }
        var diff = target - now,
            secs = Math.floor(diff / 1000);
        var hh = Math.floor(secs / 3600),
            mm = Math.floor((secs % 3600) / 60),
            ss = secs % 60;
        displayEl.innerText = String(hh).padStart(2, '0') + ':' + String(mm).padStart(2, '0') + ':' + String(ss).padStart(2, '0');
        statusEl.innerHTML = `Ramazan ${infoIdx}. Gün \uD83C\uDF19`;
    }
    iftarTick();
    iftarInterval = setInterval(iftarTick, 1000);
}

var fakeVid = document.getElementById('fakeVideo');
document.addEventListener('contextmenu', function (e) {
    e.preventDefault();
});

function openOverlay(id) {
    document.getElementById(id).style.display = 'flex';
    if (id === 'browser-test-mode') updateDeviceList();
}

function closeAllModes() {
    stopQrScanner();
    document.querySelectorAll('.overlay').forEach(function (e) {
        e.style.display = 'none';
    });
    document.getElementById('speedFrame').src = '';
    var lk = document.getElementById('last-key-display');
    if (lk) lk.innerText = '';
    stopBrowserTests();
}

function copyText(t) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(t).catch(function () { });
    } else {
        var el = document.createElement('textarea');
        el.value = t;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
    }
    showToast('Kopyalandi!');
}

function showToast(msg) {
    var d = document.createElement('div');
    d.style.cssText = 'position:fixed;bottom:70px;left:50%;transform:translateX(-50%);background:#22c55e;color:#000;padding:8px 20px;border-radius:50px;font-weight:700;font-size:13px;z-index:9999;pointer-events:none;white-space:nowrap';
    d.innerText = msg;
    document.body.appendChild(d);
    setTimeout(function () {
        if (d.parentNode) d.parentNode.removeChild(d);
    }, 2000);
}

async function requestWL() {
    if ('wakeLock' in navigator) {
        try {
            wl = await navigator.wakeLock.request('screen');
            updSt();
        } catch (e) { }
    }
}

function updSt() {
    var wS = document.getElementById('wl-stat'),
        vS = document.getElementById('vid-stat');
    if (wl) {
        wS.innerText = 'WakeLock: Aktif';
        wS.classList.add('ok');
    } else {
        wS.innerText = 'WakeLock: Kapalı';
        wS.classList.remove('ok');
    }
    if (!fakeVid.paused) {
        vS.innerText = 'FakeVideo: Aktif';
        vS.classList.add('ok');
    } else {
        vS.innerText = 'FakeVideo: Kapalı';
        vS.classList.remove('ok');
    }
}

async function toggleWakeLock() {
    var e = document.getElementById('wakeBtn'),
        t = document.getElementById('timer-display');
    if (wl || e.classList.contains('active')) {
        if (wl) {
            await wl.release();
            wl = null;
        }
        fakeVid.pause();
        e.innerText = 'Ekran Kapanmasını Engelle';
        e.classList.remove('active');
        clearInterval(ti);
        t.innerText = 'Aktif Sure: 00:00:00';
        updSt();
    } else {
        await requestWL();
        fakeVid.play().then(function () {
            updSt();
        }).catch(function () { });
        e.innerText = 'Ekran Kapanması Engellendi!';
        e.classList.add('active');
        st = Date.now();
        ti = setInterval(function () {
            var s = Math.floor((Date.now() - st) / 1e3),
                n = Math.floor(s / 3600),
                r = Math.floor(s % 3600 / 60),
                o = s % 60;
            t.innerText = 'Aktif Sure: ' + String(n).padStart(2, '0') + ':' + String(r).padStart(2, '0') + ':' + String(o).padStart(2, '0');
            updSt();
        }, 1e3);
    }
}

document.addEventListener('visibilitychange', async function () {
    if (wl && document.visibilityState === 'visible') await requestWL();
});

var ml = [
    [
        ['Escape', 'Esc'],
        ['F1', 'F1'],
        ['F2', 'F2'],
        ['F3', 'F3'],
        ['F4', 'F4'],
        ['F5', 'F5'],
        ['F6', 'F6'],
        ['F7', 'F7'],
        ['F8', 'F8'],
        ['F9', 'F9'],
        ['F10', 'F10'],
        ['F11', 'F11'],
        ['F12', 'F12']
    ],
    [
        ['Backquote', '`'],
        ['Digit1', '1'],
        ['Digit2', '2'],
        ['Digit3', '3'],
        ['Digit4', '4'],
        ['Digit5', '5'],
        ['Digit6', '6'],
        ['Digit7', '7'],
        ['Digit8', '8'],
        ['Digit9', '9'],
        ['Digit0', '0'],
        ['Minus', '-'],
        ['Equal', '='],
        ['Backspace', 'Bksp']
    ],
    [
        ['Tab', 'Tab'],
        ['KeyQ', 'Q'],
        ['KeyW', 'W'],
        ['KeyE', 'E'],
        ['KeyR', 'R'],
        ['KeyT', 'T'],
        ['KeyY', 'Y'],
        ['KeyU', 'U'],
        ['KeyI', 'I'],
        ['KeyO', 'O'],
        ['KeyP', 'P'],
        ['BracketLeft', '['],
        ['BracketRight', ']'],
        ['Enter', 'Enter']
    ],
    [
        ['CapsLock', 'Caps'],
        ['KeyA', 'A'],
        ['KeyS', 'S'],
        ['KeyD', 'D'],
        ['KeyF', 'F'],
        ['KeyG', 'G'],
        ['KeyH', 'H'],
        ['KeyJ', 'J'],
        ['KeyK', 'K'],
        ['KeyL', 'L'],
        ['Semicolon', ';'],
        ['Quote', '\''],
        ['Backslash', '\\']
    ],
    [
        ['ShiftLeft', 'Shift'],
        ['IntlBackslash', '<'],
        ['KeyZ', 'Z'],
        ['KeyX', 'X'],
        ['KeyC', 'C'],
        ['KeyV', 'V'],
        ['KeyB', 'B'],
        ['KeyN', 'N'],
        ['KeyM', 'M'],
        ['Comma', ','],
        ['Period', '.'],
        ['Slash', '/'],
        ['ShiftRight', 'Shift']
    ],
    [
        ['ControlLeft', 'Ctrl'],
        ['MetaLeft', 'Win'],
        ['AltLeft', 'Alt'],
        ['Space', ' '],
        ['AltRight', 'AltGr'],
        ['ContextMenu', 'Ctx'],
        ['ControlRight', 'Ctrl']
    ]
];
var dil = [
    [
        ['Insert', 'Ins'],
        ['Home', 'Hm'],
        ['PageUp', 'PgU']
    ],
    [
        ['Delete', 'Del'],
        ['End', 'End'],
        ['PageDown', 'PgD']
    ]
];
var al = [
    [
        ['ArrowUp', 'Up']
    ],
    [
        ['ArrowLeft', 'Lt'],
        ['ArrowDown', 'Dn'],
        ['ArrowRight', 'Rt']
    ]
];
var nl = [
    ['NumLock', 'NL'],
    ['NumpadDivide', '/'],
    ['NumpadMultiply', '*'],
    ['NumpadSubtract', '-'],
    ['Numpad7', '7'],
    ['Numpad8', '8'],
    ['Numpad9', '9'],
    ['NumpadAdd', '+'],
    ['Numpad4', '4'],
    ['Numpad5', '5'],
    ['Numpad6', '6'],
    ['Numpad1', '1'],
    ['Numpad2', '2'],
    ['Numpad3', '3'],
    ['NumpadEnter', 'Ent'],
    ['Numpad0', '0'],
    ['NumpadDecimal', '.']
];

function ck(rows, tid) {
    var a = document.getElementById(tid);
    rows.forEach(function (row) {
        var tr = document.createElement('div');
        tr.className = 'keyboard-row';
        row.forEach(function (kd) {
            var k = document.createElement('div');
            k.className = 'key';
            k.dataset.code = kd[0];
            k.innerText = kd[1];
            tr.appendChild(k);
        });
        a.appendChild(tr);
    });
}
ck(ml, 'mainKb');
ck(dil, 'midKb');
ck(al, 'arrowKb');
var nKb = document.getElementById('numKb');
nl.forEach(function (kd) {
    var k = document.createElement('div');
    k.className = 'key';
    k.dataset.code = kd[0];
    k.innerText = kd[1];
    nKb.appendChild(k);
});

function resetTest() {
    document.querySelectorAll('.key.tested').forEach(function (e) {
        e.classList.remove('tested');
    });
}
window.addEventListener('keydown', function (e) {
    var tm = document.getElementById('test-mode'),
        cm = document.getElementById('clean-mode');
    var kbMode = (tm && getComputedStyle(tm).display !== 'none') || (cm && getComputedStyle(cm).display !== 'none');
    if (e.key === 'F5' && !kbMode) return;
    if (e.key.startsWith('F') && !isNaN(e.key.slice(1))) e.preventDefault();
    if (kbMode) {
        if (e.key === 'Escape') {
            e.preventDefault();
            closeAllModes();
            return;
        }
        if (e.ctrlKey && e.key.toLowerCase() === 'x') {
            e.preventDefault();
            resetTest();
            return;
        }
        if (e.key !== 'F12') e.preventDefault();
        var kEl = document.querySelector('[data-code="' + e.code + '"]');
        if (kEl) kEl.classList.add('pressed', 'tested');
        var lk = document.getElementById('last-key-display');
        if (lk) lk.innerText = e.key === ' ' ? 'SPACE' : e.key.toUpperCase();
    } else if (e.key === 'Escape') {
        var active = false;
        document.querySelectorAll('.overlay').forEach(o => {
            if (getComputedStyle(o).display !== 'none') active = true;
        });
        if (active) {
            e.preventDefault();
            closeAllModes();
        }
    }
}, true);
window.addEventListener('keyup', function (e) {
    var kEl = document.querySelector('[data-code="' + e.code + '"]');
    if (kEl) kEl.classList.remove('pressed');
}, true);
var selectedFile = null;

function formatBytes(b) {
    if (!b) return '0 B';
    var k = 1024,
        s = ['B', 'KB', 'MB', 'GB'],
        i = Math.floor(Math.log(b) / Math.log(k));
    return (b / Math.pow(k, i)).toFixed(2) + ' ' + s[i];
}

function fmtSec(s) {
    var m = Math.floor(s / 60),
        sec = Math.round(s % 60);
    return (m > 0 ? m + 'dk ' : '') + sec + 'sn';
}

function handleFile(f) {
    if (!f) return;
    selectedFile = f;
    document.getElementById('fileName').innerText = f.name;
    document.getElementById('fileSize').innerText = formatBytes(f.size);
    document.getElementById('fileInfo').classList.add('show');
    document.getElementById('convertBtn').disabled = false;
    document.getElementById('convertBtn').innerText = 'Donustur';
    document.getElementById('progressArea').classList.remove('show');
}
document.getElementById('dropZone').addEventListener('click', function () {
    document.getElementById('mp4Input').click();
});
document.getElementById('mp4Input').addEventListener('change', function (e) {
    if (e.target.files[0]) handleFile(e.target.files[0]);
});
document.getElementById('dropZone').addEventListener('dragover', function (e) {
    e.preventDefault();
    document.getElementById('dropZone').classList.add('dragover');
});
document.getElementById('dropZone').addEventListener('dragleave', function () {
    document.getElementById('dropZone').classList.remove('dragover');
});
document.getElementById('dropZone').addEventListener('drop', function (e) {
    e.preventDefault();
    document.getElementById('dropZone').classList.remove('dragover');
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
});

function f32to16(inp) {
    var o = new Int16Array(inp.length);
    for (var i = 0; i < inp.length; i++) {
        var s = Math.max(-1, Math.min(1, inp[i]));
        o[i] = s < 0 ? s * 32768 : s * 32767;
    }
    return o;
}
async function startConversion() {
    if (!selectedFile) return;
    var cb = document.getElementById('convertBtn'),
        pa = document.getElementById('progressArea'),
        pf = document.getElementById('progressFill'),
        pt = document.getElementById('progressText'),
        ptm = document.getElementById('progressTime');
    cb.disabled = true;
    cb.innerText = 'Donusturuluyor...';
    pa.classList.add('show');
    pt.innerText = 'Ses cikariliyor...';
    pf.style.width = '10%';
    ptm.innerText = '';
    try {
        var ab = await selectedFile.arrayBuffer();
        pf.style.width = '25%';
        pt.innerText = 'Kod cozuluyor...';
        var actx = new (window.AudioContext || window.webkitAudioContext)();
        var abuf = await actx.decodeAudioData(ab);
        actx.close();
        var nc = abuf.numberOfChannels,
            sr = abuf.sampleRate,
            enc = new lamejs.Mp3Encoder(nc, sr, 192),
            mp3d = [],
            bs = 1152,
            left = f32to16(abuf.getChannelData(0)),
            right = nc > 1 ? f32to16(abuf.getChannelData(1)) : left,
            total = left.length,
            ts = Date.now(),
            pr = 0;
        for (var i = 0; i < total; i += bs) {
            var lc = left.subarray(i, i + bs),
                rc = right.subarray(i, i + bs),
                mb = nc > 1 ? enc.encodeBuffer(lc, rc) : enc.encodeBuffer(lc);
            if (mb.length) mp3d.push(mb);
            pr += bs;
            if (pr % (bs * 80) === 0) {
                var pct = Math.min(95, 40 + Math.round(pr / total * 55));
                pf.style.width = pct + '%';
                var elapsed = (Date.now() - ts) / 1000,
                    spd = pr / elapsed,
                    rem = Math.max(0, (total - pr) / spd);
                pt.innerText = 'Kodlaniyor %' + pct;
                ptm.innerHTML = '⏳ Kalan: <span style="color:#fff;font-size:18px">' + fmtSec(rem) + '</span>';
                await new Promise(function (r) {
                    setTimeout(r, 0);
                });
            }
        }
        var e2 = enc.flush();
        if (e2.length) mp3d.push(e2);
        pf.style.width = '100%';
        pt.innerText = 'Tamamlandi!';
        ptm.innerText = 'Toplam: ' + fmtSec((Date.now() - ts) / 1000);
        var blob = new Blob(mp3d, {
            type: 'audio/mpeg'
        }),
            url = URL.createObjectURL(blob),
            a = document.createElement('a');
        a.href = url;
        a.download = selectedFile.name.replace(/\.[^.]+$/, '') + '.mp3';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        cb.innerText = 'Tamamlandi';
        setTimeout(function () {
            cb.disabled = false;
            cb.innerText = 'Donustur';
        }, 3000);
    } catch (err) {
        pt.innerText = 'Hata: ' + err.message;
        pf.style.width = '0%';
        cb.disabled = false;
        cb.innerText = 'Tekrar Dene';
    }
}
async function getLocalIP() {
    return new Promise(function (resolve) {
        try {
            var pc = new RTCPeerConnection({
                iceServers: []
            });
            pc.createDataChannel('');
            pc.createOffer().then(function (o) {
                pc.setLocalDescription(o);
            });
            pc.onicecandidate = function (ev) {
                if (!ev || !ev.candidate) return;
                var m = (ev.candidate.candidate || '').match(/(\d+\.\d+\.\d+\.\d+)/);
                if (m && !m[1].startsWith('0.')) {
                    resolve(m[1]);
                    pc.close();
                }
            };
            setTimeout(function () {
                resolve('Bulunamadi');
            }, 3000);
        } catch (ex) {
            resolve('Desteklenmiyor');
        }
    });
}
async function loadIPInfo() {
    var card = document.getElementById('ipCard');
    card.innerHTML = '<div class="tp-row"><span class="tp-row-key">Yükleniyor</span><span class="tp-row-val">...</span></div>';
    async function fetchIP(url) {
        const res = await fetch(url, {
            timeout: 5000
        });
        if (!res.ok) throw new Error('Fetch failed');
        return res.json();
    }
    try {
        let ipData;
        try {
            ipData = await fetchIP('https://ipapi.co/json/');
        } catch (e) {
            ipData = await fetchIP('https://ipinfo.io/json');
        }
        var localIP = await getLocalIP();
        var ua = navigator.userAgent.match(/(Chrome|Firefox|Safari|Edge|Opera)[\/\s][\d.]+/);
        var rows = [
            ['Public IP', ipData.ip || ipData.query || '-'],
            ['Şehir', ipData.city || '-'],
            ['Ülke', ipData.country_name || ipData.country || '-'],
            ['ISP', ipData.org || '-'],
            ['Local IP', localIP],
            ['Tarayıcı', ua ? ua[0] : 'Bilinmiyor'],
            ['Platform', navigator.platform || '-']
        ];
        card.innerHTML = rows.map(function (r) {
            return '<div class="tp-row"><span class="tp-row-key">' + r[0] + '</span><span class="tp-row-val">' + r[1] + '</span></div>';
        }).join('');
    } catch (e) {
        card.innerHTML = '<div class="tp-row"><span class="tp-row-key">Hata</span><span class="tp-row-val">Bağlantı Sorunu (IP Servisi Yanıt Vermiyor)</span></div>';
        console.error('IP Info Error:', e);
    }
}
async function pingOnce(url) {
    var s = Date.now();
    try {
        await fetch(url, {
            mode: 'no-cors',
            cache: 'no-store'
        });
        return Date.now() - s;
    } catch (e) {
        return -1;
    }
}
async function runPing() {
    var url = document.getElementById('pingTarget').value.trim() || 'https://google.com';
    var card = document.getElementById('pingCard');
    card.style.display = 'block';
    card.innerHTML = '<div class="ping-row"><span>Olculuyor...</span><span></span></div>';
    var times = [];
    for (var i = 0; i < 5; i++) {
        var t = await pingOnce(url);
        times.push(t);
        card.innerHTML = times.map(function (tt, ii) {
            var cls = tt < 0 ? 'ping-bad' : tt < 100 ? 'ping-good' : tt < 400 ? 'ping-ok' : 'ping-bad';
            return '<div class="ping-row"><span>Ping ' + (ii + 1) + '</span><span class="ping-badge ' + cls + '">' + (tt < 0 ? 'Hata' : tt + 'ms') + '</span></div>';
        }).join('');
        await new Promise(function (r) {
            setTimeout(r, 300);
        });
    }
    var valid = times.filter(function (tt) {
        return tt > 0;
    });
    if (valid.length) {
        var avg = Math.round(valid.reduce(function (a, b) {
            return a + b;
        }, 0) / valid.length);
        card.innerHTML += '<div class="ping-row" style="font-weight:700"><span>Ortalama</span><span class="ping-badge ping-good">' + avg + 'ms</span></div>';
    }
}
async function runMultiPing() {
    var targets = ['https://google.com', 'https://cloudflare.com', 'https://azure.com', 'https://github.com'];
    var card = document.getElementById('pingCard');
    card.style.display = 'block';
    card.innerHTML = '<div class="ping-row"><span>Olculuyor...</span><span></span></div>';
    var results = await Promise.all(targets.map(async function (u) {
        return [u.replace('https://', ''), await pingOnce(u)];
    }));
    card.innerHTML = results.map(function (r) {
        var cls = r[1] < 0 ? 'ping-bad' : r[1] < 100 ? 'ping-good' : r[1] < 400 ? 'ping-ok' : 'ping-bad';
        return '<div class="ping-row"><span>' + r[0] + '</span><span class="ping-badge ' + cls + '">' + (r[1] < 0 ? 'Hata' : r[1] + 'ms') + '</span></div>';
    }).join('');
}
async function shaDigest(str, algo) {
    var buf = await crypto.subtle.digest(algo, new TextEncoder().encode(str));
    return Array.from(new Uint8Array(buf)).map(function (b) {
        return b.toString(16).padStart(2, '0');
    }).join('');
}
async function shaDigestBuf(buf, algo) {
    var h = await crypto.subtle.digest(algo, buf);
    return Array.from(new Uint8Array(h)).map(function (b) {
        return b.toString(16).padStart(2, '0');
    }).join('');
}
async function generateHash() {
    var txt = document.getElementById('hashInput').value;
    if (!txt) {
        showToast('Metin girin!');
        return;
    }
    document.getElementById('hashResults').style.display = 'block';
    ['h-md5', 'h-sha1', 'h-sha256', 'h-sha512'].forEach(function (id) {
        document.getElementById(id).innerText = 'Hesaplaniyor...';
    });
    var r = await Promise.all([shaDigest(txt, 'SHA-1'), shaDigest(txt, 'SHA-256'), shaDigest(txt, 'SHA-512')]);
    document.getElementById('h-md5').innerText = CryptoJS.MD5(txt).toString();
    document.getElementById('h-sha1').innerText = r[0];
    document.getElementById('h-sha256').innerText = r[1];
    document.getElementById('h-sha512').innerText = r[2];
}
async function hashFromFile(e) {
    var f = e.target.files[0];
    if (!f) return;
    document.getElementById('hashInput').value = '[Dosya: ' + f.name + ']';
    document.getElementById('hashResults').style.display = 'block';
    ['h-md5', 'h-sha1', 'h-sha256', 'h-sha512'].forEach(function (id) {
        document.getElementById(id).innerText = 'Hesaplaniyor...';
    });
    var buf = await f.arrayBuffer();
    var wa = CryptoJS.lib.WordArray.create(buf);
    var r = await Promise.all([shaDigestBuf(buf, 'SHA-1'), shaDigestBuf(buf, 'SHA-256'), shaDigestBuf(buf, 'SHA-512')]);
    document.getElementById('h-md5').innerText = CryptoJS.MD5(wa).toString();
    document.getElementById('h-sha1').innerText = r[0];
    document.getElementById('h-sha256').innerText = r[1];
    document.getElementById('h-sha512').innerText = r[2];
}

function doB64Encode() {
    try {
        document.getElementById('b64out').value = btoa(unescape(encodeURIComponent(document.getElementById('b64in').value)));
    } catch (e) {
        document.getElementById('b64out').value = 'Hata: ' + e.message;
    }
}

function doB64Decode() {
    try {
        document.getElementById('b64out').value = decodeURIComponent(escape(atob(document.getElementById('b64in').value)));
    } catch (e) {
        document.getElementById('b64out').value = 'Hatali Base64';
    }
}

function loadSysInfo() {
    var c = document.getElementById('sysinfoCard');
    var ua = navigator.userAgent.match(/(Chrome|Firefox|Safari|Edge|Opera)[\/\s][\d.]+/);
    var rows = [
        ['Ekran', screen.width + 'x' + screen.height],
        ['Pencere', window.innerWidth + 'x' + window.innerHeight],
        ['Piksel', window.devicePixelRatio + 'x'],
        ['Renk', screen.colorDepth + ' bit'],
        ['Tarayici', ua ? ua[0] : 'Bilinmiyor'],
        ['Platform', navigator.platform || '-'],
        ['Dil', navigator.language],
        ['CPU', navigator.hardwareConcurrency || '-'],
        ['RAM', navigator.deviceMemory || '-'],
        ['Cevrimici', navigator.onLine ? 'Evet' : 'Hayir'],
        ['Touch', navigator.maxTouchPoints > 0 ? 'Var' : 'Yok'],
        ['Batarya', navigator.getBattery ? 'Kontrol...' : 'Desteklenmiyor']
    ];
    c.innerHTML = rows.map(function (r) {
        return '<div class="tp-row"><span class="tp-row-key">' + r[0] + '</span><span class="tp-row-val">' + r[1] + '</span></div>';
    }).join('');
    if (navigator.getBattery) navigator.getBattery().then(function (bat) {
        var els = c.querySelectorAll('.tp-row-val');
        if (els[11]) els[11].innerText = Math.round(bat.level * 100) + '%' + (bat.charging ? ' charge' : '');
    });
}
var camStream = null,
    micStream = null,
    micAnim = null,
    spkLoop = null;
async function updateDeviceList() {
    const select = document.getElementById('micSelect');
    if (!select) return;
    try {
        await navigator.mediaDevices.getUserMedia({
            audio: true
        }).then(s => s.getTracks().forEach(t => t.stop()));
        const devices = await navigator.mediaDevices.enumerateDevices();
        const mics = devices.filter(d => d.kind === 'audioinput');
        select.innerHTML = mics.map(m => `<option value="${m.deviceId}">${m.label || 'Mikrofon ' + m.deviceId.slice(0, 5)}</option>`).join('');
        if (mics.length === 0) select.innerHTML = '<option value="">Mikrofon Bulunamadı</option>';
    } catch (e) {
        select.innerHTML = '<option value="">İzin Gerekli</option>';
    }
}
async function testCamera() {
    var btn = document.getElementById('camBtn'),
        status = document.getElementById('camStatus'),
        prev = document.getElementById('camPreview');
    if (camStream) {
        camStream.getTracks().forEach(function (t) {
            t.stop();
        });
        camStream = null;
        prev.style.display = 'none';
        status.innerText = 'Durduruldu';
        btn.innerText = 'Kamerayı Test Et';
        return;
    }
    try {
        camStream = await navigator.mediaDevices.getUserMedia({
            video: true
        });
        prev.srcObject = camStream;
        prev.style.display = 'block';
        status.innerText = 'Kamera çalışıyor!';
        status.style.color = '#22c55e';
        btn.innerText = 'Durdur';
    } catch (e) {
        status.innerText = 'Hata: ' + e.message;
        status.style.color = '#ef4444';
    }
}
async function testMic() {
    var btn = document.getElementById('micBtn'),
        status = document.getElementById('micStatus'),
        bar = document.getElementById('micBar');
    var deviceId = document.getElementById('micSelect').value;
    if (micStream) {
        micStream.getTracks().forEach(function (t) {
            t.stop();
        });
        micStream = null;
        cancelAnimationFrame(micAnim);
        bar.style.width = '0%';
        status.innerText = 'Durduruldu';
        btn.innerText = 'Mikrofonu Test Et';
        return;
    }
    try {
        const constraints = {
            audio: deviceId ? {
                deviceId: {
                    exact: deviceId
                }
            } : true
        };
        micStream = await navigator.mediaDevices.getUserMedia(constraints);
        var mctx = new (window.AudioContext || window.webkitAudioContext)(),
            src = mctx.createMediaStreamSource(micStream),
            anal = mctx.createAnalyser();
        anal.fftSize = 256;
        src.connect(anal);
        var data = new Uint8Array(anal.frequencyBinCount);

        function tick() {
            micAnim = requestAnimationFrame(tick);
            anal.getByteFrequencyData(data);
            var avg = data.reduce(function (a, b) {
                return a + b;
            }, 0) / data.length;
            bar.style.width = Math.min(100, avg * 2.5) + '%';
        }
        tick();
        status.innerText = 'Mikrofon çalışıyor!';
        status.style.color = '#22c55e';
        btn.innerText = 'Durdur';
    } catch (e) {
        status.innerText = 'Hata: ' + e.message;
        status.style.color = '#ef4444';
    }
}

function testSpeaker() {
    if (spkLoop) return;
    const status = document.getElementById('spkStatus');
    const startBtn = document.getElementById('spkStartBtn');
    const stopBtn = document.getElementById('spkStopBtn');
    var ac = new (window.AudioContext || window.webkitAudioContext)();
    spkLoop = {
        ac: ac,
        active: true
    };

    function play() {
        if (!spkLoop || !spkLoop.active) return;
        var osc = ac.createOscillator();
        var gain = ac.createGain();
        osc.connect(gain);
        gain.connect(ac.destination);
        osc.frequency.value = 440;
        gain.gain.setValueAtTime(0, ac.currentTime);
        gain.gain.linearRampToValueAtTime(0.3, ac.currentTime + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.9);
        osc.start();
        osc.stop(ac.currentTime + 1);
        spkLoop.timeout = setTimeout(play, 1200);
    }
    play();
    status.innerText = 'Ses çalınıyor...';
    status.style.color = '#22c55e';
    startBtn.disabled = true;
    stopBtn.disabled = false;
}

function stopSpeaker() {
    if (spkLoop) {
        spkLoop.active = false;
        if (spkLoop.timeout) clearTimeout(spkLoop.timeout);
        try {
            spkLoop.ac.close();
        } catch (e) { }
        spkLoop = null;
    }
    document.getElementById('spkStatus').innerText = 'Durduruldu';
    document.getElementById('spkStartBtn').disabled = false;
    document.getElementById('spkStopBtn').disabled = true;
}

function stopBrowserTests() {
    if (camStream) {
        camStream.getTracks().forEach(function (t) {
            t.stop();
        });
        camStream = null;
        var p = document.getElementById('camPreview');
        if (p) p.style.display = 'none';
    }
    if (micStream) {
        micStream.getTracks().forEach(function (t) {
            t.stop();
        });
        micStream = null;
    }
    if (micAnim) cancelAnimationFrame(micAnim);
    stopSpeaker();
}
var mL = 0,
    mR = 0,
    mM = 0,
    mD = 0,
    mS = 0;
document.getElementById('mouseArea').addEventListener('mousemove', function (e) {
    var r = document.getElementById('mouseArea').getBoundingClientRect();
    document.getElementById('mPos').innerText = Math.round(e.clientX - r.left) + ', ' + Math.round(e.clientY - r.top);
});
document.getElementById('mouseArea').addEventListener('click', function () {
    document.getElementById('mLeft').innerText = ++mL;
});
document.getElementById('mouseArea').addEventListener('dblclick', function () {
    document.getElementById('mDouble').innerText = ++mD;
});
document.getElementById('mouseArea').addEventListener('contextmenu', function (e) {
    e.preventDefault();
    document.getElementById('mRight').innerText = ++mR;
});
document.getElementById('mouseArea').addEventListener('mousedown', function (e) {
    if (e.button === 1) {
        e.preventDefault();
        document.getElementById('mMiddle').innerText = ++mM;
    }
});
document.getElementById('mouseArea').addEventListener('wheel', function () {
    document.getElementById('mScroll').innerText = ++mS;
});

function resetMouseTest() {
    mL = mR = mM = mD = mS = 0;
    ['mLeft', 'mRight', 'mMiddle', 'mDouble', 'mScroll'].forEach(function (id) {
        document.getElementById(id).innerText = '0';
    });
    document.getElementById('mPos').innerText = '-';
}
var convFile = null;
document.getElementById('convDropZone').onclick = () => document.getElementById('convInput').click();
document.getElementById('convInput').onchange = (e) => handleConvFile(e.target.files[0]);
document.getElementById('convDropZone').ondragover = (e) => {
    e.preventDefault();
    document.getElementById('convDropZone').classList.add('dragover');
};
document.getElementById('convDropZone').ondragleave = () => document.getElementById('convDropZone').classList.remove('dragover');
document.getElementById('convDropZone').ondrop = (e) => {
    e.preventDefault();
    document.getElementById('convDropZone').classList.remove('dragover');
    handleConvFile(e.dataTransfer.files[0]);
};

function handleConvFile(f) {
    if (!f || !f.type.startsWith('image/')) return;
    convFile = f;
    document.getElementById('convFileName').innerText = f.name;
    document.getElementById('convFileSize').innerText = formatBytes(f.size);
    document.getElementById('convFileInfo').style.display = 'block';
    document.getElementById('doConvBtn').style.display = 'block';
}

function convertImageFormat() {
    if (!convFile) return;
    var btn = document.getElementById('doConvBtn');
    var fmt = document.getElementById('convFormat').value;
    btn.disabled = true;
    btn.innerText = 'İşleniyor...';
    var img = new Image();
    var url = URL.createObjectURL(convFile);
    img.onload = function () {
        var cv = document.createElement('canvas');
        cv.width = img.naturalWidth || img.width || 800;
        cv.height = img.naturalHeight || img.height || 600;
        var ctx = cv.getContext('2d');
        ctx.fillStyle = 'transparent';
        if (fmt === 'image/jpeg') {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, cv.width, cv.height);
        }
        ctx.drawImage(img, 0, 0, cv.width, cv.height);
        cv.toBlob(function (blob) {
            var durl = URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = durl;
            var ext = fmt.split('/')[1] === 'jpeg' ? 'jpg' : fmt.split('/')[1];
            a.download = convFile.name.replace(/\.[^.]+$/, '') + '-converted.' + ext;
            a.click();
            setTimeout(() => {
                URL.revokeObjectURL(url);
                URL.revokeObjectURL(durl);
            }, 1000);
            btn.disabled = false;
            btn.innerText = 'Dönüştür ve İndir';
        }, fmt, 0.9);
    };
    img.onerror = function () {
        showToast('Görsel yüklenemedi!');
        btn.disabled = false;
        btn.innerText = 'Dönüştür ve İndir';
        URL.revokeObjectURL(url);
    };
    img.src = url;
}
var pdfMergeFiles = [],
    pdfSplitFile = null;

function addPdfFiles(e, mode) {
    if (mode === 'merge') {
        pdfMergeFiles = pdfMergeFiles.concat(Array.from(e.target.files));
        document.getElementById('pdfMergeList').innerHTML = pdfMergeFiles.map(function (f) {
            return '<li style="display:flex;justify-content:space-between;padding:7px 10px;background:var(--card);border-radius:8px;margin-bottom:5px;font-size:13px"><span>' + f.name + '</span><span style="color:rgba(255,255,255,0.4)">' + formatBytes(f.size) + '</span></li>';
        }).join('');
    } else {
        pdfSplitFile = e.target.files[0];
        if (pdfSplitFile) document.getElementById('pdfSplitInfo').innerText = 'Secildi: ' + pdfSplitFile.name;
    }
}
async function mergePDFs() {
    if (pdfMergeFiles.length < 2) {
        showToast('En az 2 PDF secin!');
        return;
    }
    document.getElementById('pdfStatus').innerText = 'Birlestiriliyor...';
    try {
        var merged = await PDFLib.PDFDocument.create();
        for (var i = 0; i < pdfMergeFiles.length; i++) {
            var bytes = await pdfMergeFiles[i].arrayBuffer();
            var doc = await PDFLib.PDFDocument.load(bytes);
            var pages = await merged.copyPages(doc, doc.getPageIndices());
            pages.forEach(function (p) {
                merged.addPage(p);
            });
        }
        var out = await merged.save();
        var blob = new Blob([out], {
            type: 'application/pdf'
        }),
            url = URL.createObjectURL(blob),
            a = document.createElement('a');
        a.href = url;
        a.download = 'birlestirilmis.pdf';
        a.click();
        URL.revokeObjectURL(url);
        document.getElementById('pdfStatus').innerText = 'Birlestirildi!';
    } catch (e) {
        document.getElementById('pdfStatus').innerText = 'Hata: ' + e.message;
    }
}
async function splitPDF() {
    if (!pdfSplitFile) {
        showToast('PDF secin!');
        return;
    }
    var range = document.getElementById('pdfRange').value.trim();
    if (!range) {
        showToast('Sayfa araligi girin!');
        return;
    }
    document.getElementById('pdfStatus').innerText = 'Bolunuyor...';
    try {
        var bytes = await pdfSplitFile.arrayBuffer();
        var doc = await PDFLib.PDFDocument.load(bytes);
        var total = doc.getPageCount(),
            pages = new Set();
        range.split(',').forEach(function (p) {
            p = p.trim();
            if (p.indexOf('-') >= 0) {
                var pp = p.split('-');
                for (var j = parseInt(pp[0]) - 1; j <= Math.min(parseInt(pp[1]) - 1, total - 1); j++) pages.add(j);
            } else {
                var n = parseInt(p) - 1;
                if (n >= 0 && n < total) pages.add(n);
            }
        });
        var newDoc = await PDFLib.PDFDocument.create();
        var copied = await newDoc.copyPages(doc, Array.from(pages));
        copied.forEach(function (p) {
            newDoc.addPage(p);
        });
        var out = await newDoc.save();
        var blob = new Blob([out], {
            type: 'application/pdf'
        }),
            url = URL.createObjectURL(blob),
            a = document.createElement('a');
        a.href = url;
        a.download = 'bolunmus.pdf';
        a.click();
        URL.revokeObjectURL(url);
        document.getElementById('pdfStatus').innerText = pages.size + ' sayfa cikarildi!';
    } catch (e) {
        document.getElementById('pdfStatus').innerText = 'Hata: ' + e.message;
    }
}
var imgFiles = [];

function loadImages(e) {
    imgFiles = Array.from(e.target.files);
    document.getElementById('imgGrid').innerHTML = imgFiles.map(function (f) {
        return '<div class="img-thumb"><img src="' + URL.createObjectURL(f) + '" loading="lazy"><div class="sz">' + formatBytes(f.size) + '</div></div>';
    }).join('');
    document.getElementById('imgOptions').style.display = imgFiles.length ? 'block' : 'none';
}
async function compressImages() {
    var qual = parseInt(document.getElementById('qualRange').value) / 100;
    var fmt = document.getElementById('imgFormat').value;
    for (var i = 0; i < imgFiles.length; i++) {
        var f = imgFiles[i];
        var bmp = await createImageBitmap(f);
        var cv = document.createElement('canvas');
        cv.width = bmp.width;
        cv.height = bmp.height;
        cv.getContext('2d').drawImage(bmp, 0, 0);
        (function (fname, canv) {
            canv.toBlob(function (blob) {
                var url = URL.createObjectURL(blob),
                    a = document.createElement('a');
                a.href = url;
                a.download = fname.replace(/\.[^.]+$/, '') + '-compressed.' + fmt.split('/')[1];
                a.click();
                setTimeout(function () {
                    URL.revokeObjectURL(url);
                }, 1000);
            }, fmt, qual);
        })(f.name, cv);
    }
    showToast(imgFiles.length + ' dosya indirildi!');
}

function generateQR() {
    var txt = document.getElementById('qrInput').value.trim();
    if (!txt) {
        showToast('İçerik girin!');
        return;
    }
    var canvas = document.getElementById('qrCanvas');
    canvas.style.display = 'block';
    QRCode.toCanvas(canvas, txt, {
        width: 220,
        margin: 2,
        color: {
            dark: '#000000',
            light: '#ffffff'
        }
    }, function (err) {
        if (err) {
            console.error(err);
            showToast('Hata!');
        } else {
            document.getElementById('qrDownBtn').style.display = 'block';
        }
    });
}

function generateWifiQR() {
    var ssid = document.getElementById('wifiSsid').value.trim(),
        pass = document.getElementById('wifiPass').value,
        sec = document.getElementById('wifiSec').value;
    if (!ssid) {
        showToast('Ağ adı girin!');
        return;
    }
    var str = 'WIFI:T:' + sec + ';S:' + ssid + ';P:' + pass + ';;';
    var canvas = document.getElementById('wifiQrCanvas');
    canvas.style.display = 'block';
    QRCode.toCanvas(canvas, str, {
        width: 220,
        margin: 2,
        color: {
            dark: '#000000',
            light: '#ffffff'
        }
    }, function (err) {
        if (err) {
            console.error(err);
            showToast('Hata!');
        } else {
            document.getElementById('wifiDlBtn').style.display = 'block';
        }
    });
}

function downloadQR(cid, name) {
    var canvas = document.getElementById(cid);
    var a = document.createElement('a');
    a.download = name + '.png';
    a.href = canvas.toDataURL();
    a.click();
}

function togglePwOpt(el) {
    if (document.getElementById('pwMantıklı').classList.contains('checked')) return;
    el.classList.toggle('checked');
    var cb = el.querySelector('input');
    if (cb) cb.checked = el.classList.contains('checked');
}

function toggleMantıklı(el) {
    el.classList.toggle('checked');
    var isM = el.classList.contains('checked');
    var cb = el.querySelector('input');
    if (cb) cb.checked = isM;
    var others = document.querySelectorAll('#pwOpts .pw-checkbox:not(#pwMantıklı)');
    var slider = document.getElementById('pwLen');
    var sliderLabel = slider.previousElementSibling;
    if (isM) {
        others.forEach(o => o.classList.add('disabled-opt'));
        slider.classList.add('disabled-opt');
        sliderLabel.classList.add('disabled-opt');
    } else {
        others.forEach(o => o.classList.remove('disabled-opt'));
        slider.classList.remove('disabled-opt');
        sliderLabel.classList.remove('disabled-opt');
    }
}

function generatePassword() {
    var isMantıklı = document.getElementById('pwMantıklı').classList.contains('checked');
    if (isMantıklı) {
        var words = ["Istanbul", "Ankara", "Izmir", "Bursa", "Antalya", "Adana", "Konya", "Gaziantep", "Mersin", "Diyarbakir", "Kayseri", "Eskisehir", "Samsun", "Denizli", "Sanliurfa", "Sakarya", "Malatya", "Trabzon", "Mugla", "Aydin", "London", "Paris", "Berlin", "Madrid", "Rome", "Amsterdam", "Vienna", "Prague", "Brussels", "Lisbon", "Athens", "Warsaw", "Budapest", "Stockholm", "Oslo", "Helsinki", "Copenhagen", "Dublin", "Zurich", "Geneva", "Milan", "Barcelona", "Munich", "Frankfurt", "Venice", "Florence", "Lyon", "Marseille", "Porto", "Seville", "Newyork", "Chicago", "Houston", "Miami", "Boston", "Washington", "Losangeles", "Sanfrancisco", "Lasvegas", "Dallas", "Toronto", "Montreal", "Vancouver", "Ottawa", "Mexico", "Havana", "Rio", "Saopaulo", "Buenosaires", "Santiago", "Tokyo", "Seoul", "Beijing", "Shanghai", "Bangkok", "Singapore", "Jakarta", "Mumbai", "Delhi", "Dubai", "Doha", "Riyadh", "Sydney", "Melbourne", "Cairo", "Casablanca", "Moscow", "Kiev", "Baku", "Tashkent", "Turkey", "Germany", "France", "Italy", "Spain", "England", "Russia", "Japan", "China", "Korea", "Brazil", "Canada", "America", "Mexico", "Egypt", "Greece", "Norway", "Sweden", "Switzerland", "Holland"];
        var symbols = [".", "@", "*", "_", "!"];
        var years = ["2026", "2025", "2024", "2023", "2022", "2021", "2020", "2019", "2018", "2017", "2016", "2015", "2014", "2013", "2012", "2011", "2010", "2009", "2008", "2007", "2006", "2005", "2004", "2003", "2002", "2001", "2000", "1999", "1998", "1997", "1996", "1995", "1994", "1993", "1992", "1991", "1990", "1989", "1988", "1987", "1986", "1985", "1984", "1983", "1982", "1981", "1980"];
        var w = words[Math.floor(Math.random() * words.length)];
        var s1 = symbols[Math.floor(Math.random() * symbols.length)];
        var s2 = symbols[Math.floor(Math.random() * symbols.length)];
        var ss = s1 + s2;
        var p = Math.random();
        var result = "";
        if (p < 0.33) {
            result = w + ss + years[Math.floor(Math.random() * years.length)];
        } else if (p < 0.66) {
            var nums = Math.floor(Math.random() * 900) + 100;
            result = w + ss + nums;
        } else {
            var nums = Math.floor(Math.random() * 90) + 10;
            result = w + ss + nums;
        }
        document.getElementById('pwResult').innerText = result;
    } else {
        var len = parseInt(document.getElementById('pwLen').value);
        var opts = document.querySelectorAll('#pwOpts .pw-checkbox.checked');
        var chars = '';
        opts.forEach(function (o) {
            if (o.dataset.chars) chars += o.dataset.chars;
        });
        if (!chars) {
            showToast('En az bir karakter seti sec!');
            return;
        }
        var pw = '',
            arr = new Uint32Array(len);
        crypto.getRandomValues(arr);
        arr.forEach(function (n) {
            pw += chars[n % chars.length];
        });
        // Enforce minimum 2 symbols
        var symbolChars = '!@#$%^*()-_=+[]{}|;:,./';
        var pwArr = pw.split('');
        var symbolCount = 0;
        for (var si = 0; si < pwArr.length; si++) {
            if (symbolChars.indexOf(pwArr[si]) >= 0) symbolCount++;
        }
        while (symbolCount < 2 && len >= 2) {
            var rndIdx = Math.floor(Math.random() * pwArr.length);
            if (symbolChars.indexOf(pwArr[rndIdx]) < 0) {
                pwArr[rndIdx] = symbolChars[Math.floor(Math.random() * symbolChars.length)];
                symbolCount++;
            }
        }
        pw = pwArr.join('');
        document.getElementById('pwResult').innerText = pw;
    }
    document.getElementById('pwCopyNote').innerText = 'Kopyalamak icin tikla';
}

function copyPw() {
    var pw = document.getElementById('pwResult').innerText;
    if (pw && pw !== 'Uret butonuna bas') copyText(pw);
}
var pomInterval = null,
    pomTime = 25 * 60,
    pomActive = false,
    pomType = 'focus',
    pomCycle = 0;

function togglePomodoro() {
    var btn = document.getElementById('pomBtn'),
        disp = document.getElementById('pomDisplay'),
        stat = document.getElementById('pomStat');
    if (pomActive) {
        clearInterval(pomInterval);
        pomActive = false;
        btn.innerText = 'Başlat';
        btn.className = 'tp-btn success';
    } else {
        pomActive = true;
        btn.innerText = 'Durdur';
        btn.className = 'tp-btn danger';
        pomInterval = setInterval(function () {
            pomTime--;
            if (pomTime < 0) {
                playAlarm();
                if (pomType === 'focus') {
                    pomCycle++;
                    updatePomDots();
                    if (pomCycle % 4 === 0) {
                        pomType = 'long';
                        pomTime = 15 * 60;
                        stat.innerText = 'UZUN MOLA';
                    } else {
                        pomType = 'break';
                        pomTime = 5 * 60;
                        stat.innerText = 'KISA MOLA';
                    }
                } else {
                    pomType = 'focus';
                    pomTime = 25 * 60;
                    stat.innerText = 'ODAKLANMA';
                }
            }
            var m = Math.floor(pomTime / 60),
                s = pomTime % 60;
            disp.innerText = (m < 10 ? '0' + m : m) + ':' + (s < 10 ? '0' + s : s);
        }, 1000);
    }
}

function resetPomodoro() {
    clearInterval(pomInterval);
    pomInterval = null;
    pomActive = false;
    pomTime = 25 * 60;
    pomType = 'focus';
    pomCycle = 0;
    document.getElementById('pomBtn').innerText = 'Başlat';
    document.getElementById('pomBtn').className = 'tp-btn success';
    document.getElementById('pomDisplay').innerText = '25:00';
    document.getElementById('pomStat').innerText = 'ODAKLANMA';
    updatePomDots();
    stopAlarm();
}

function updatePomDots() {
    var dots = document.querySelectorAll('.pom-dot');
    dots.forEach((d, i) => d.classList.toggle('active', i < (pomCycle % 4 || (pomCycle > 0 ? 4 : 0))));
}

// ========== DOCX MERGE ==========
var docxMergeFiles = [];

function addDocxFiles(e) {
    docxMergeFiles = docxMergeFiles.concat(Array.from(e.target.files));
    renderDocxList();
    document.getElementById('docxStatus').innerText = docxMergeFiles.length + ' dosya secildi';
}

function renderDocxList() {
    var list = document.getElementById('docxMergeList');
    list.innerHTML = docxMergeFiles.map(function (f, i) {
        var upBtn = i > 0 ? '<span class="docx-order-btn" onclick="moveDocxFile(' + i + ',-1)" title="Yukari">▲</span>' : '<span class="docx-order-btn" style="opacity:0.2">▲</span>';
        var downBtn = i < docxMergeFiles.length - 1 ? '<span class="docx-order-btn" onclick="moveDocxFile(' + i + ',1)" title="Asagi">▼</span>' : '<span class="docx-order-btn" style="opacity:0.2">▼</span>';
        var removeBtn = '<span class="docx-order-btn docx-remove-btn" onclick="removeDocxFile(' + i + ')" title="Kaldir">✕</span>';
        return '<li class="docx-file-item" draggable="true" data-idx="' + i + '">' +
            '<span class="docx-file-num">' + (i + 1) + '</span>' +
            '<span class="docx-file-name">' + f.name + '</span>' +
            '<span class="docx-file-size">' + formatBytes(f.size) + '</span>' +
            '<span class="docx-file-actions">' + upBtn + downBtn + removeBtn + '</span>' +
            '</li>';
    }).join('');

    // Drag-and-drop reorder
    var items = list.querySelectorAll('.docx-file-item');
    items.forEach(function (item) {
        item.addEventListener('dragstart', function (e) {
            e.dataTransfer.setData('text/plain', item.dataset.idx);
            item.style.opacity = '0.4';
        });
        item.addEventListener('dragend', function () {
            item.style.opacity = '1';
        });
        item.addEventListener('dragover', function (e) {
            e.preventDefault();
            item.style.borderTop = '2px solid var(--accent)';
        });
        item.addEventListener('dragleave', function () {
            item.style.borderTop = '';
        });
        item.addEventListener('drop', function (e) {
            e.preventDefault();
            item.style.borderTop = '';
            var from = parseInt(e.dataTransfer.getData('text/plain'));
            var to = parseInt(item.dataset.idx);
            if (from !== to) {
                var moved = docxMergeFiles.splice(from, 1)[0];
                docxMergeFiles.splice(to, 0, moved);
                renderDocxList();
            }
        });
    });
}

function moveDocxFile(idx, dir) {
    var newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= docxMergeFiles.length) return;
    var temp = docxMergeFiles[idx];
    docxMergeFiles[idx] = docxMergeFiles[newIdx];
    docxMergeFiles[newIdx] = temp;
    renderDocxList();
}

function removeDocxFile(idx) {
    docxMergeFiles.splice(idx, 1);
    renderDocxList();
    document.getElementById('docxStatus').innerText = docxMergeFiles.length > 0 ? docxMergeFiles.length + ' dosya secildi' : '';
}

async function mergeDocx() {
    if (docxMergeFiles.length < 2) {
        showToast('En az 2 DOCX dosyasi secin!');
        return;
    }
    var status = document.getElementById('docxStatus');
    status.innerText = 'Birlestiriliyor...';
    status.style.color = 'var(--accent)';

    try {
        var baseZip = await JSZip.loadAsync(await docxMergeFiles[0].arrayBuffer());
        var baseXml = await baseZip.file('word/document.xml').async('string');

        var bodyEndPos = baseXml.lastIndexOf('</w:body>');
        if (bodyEndPos < 0) throw new Error('Gecersiz DOCX formati');

        var sectPrPos = baseXml.lastIndexOf('<w:sectPr', bodyEndPos);
        var insertPos = sectPrPos >= 0 ? sectPrPos : bodyEndPos;

        var xmlBefore = baseXml.substring(0, insertPos);
        var xmlAfter = baseXml.substring(insertPos);

        var extra = '';

        for (var i = 1; i < docxMergeFiles.length; i++) {
            status.innerText = (i + 1) + '/' + docxMergeFiles.length + ' isleniyor...';

            var zip = await JSZip.loadAsync(await docxMergeFiles[i].arrayBuffer());
            var xml = await zip.file('word/document.xml').async('string');

            var bStart = xml.indexOf('<w:body');
            if (bStart < 0) continue;
            var bTagEnd = xml.indexOf('>', bStart);
            if (bTagEnd < 0) continue;
            bTagEnd += 1;

            var bEnd = xml.lastIndexOf('</w:body>');
            if (bEnd < 0) continue;

            var bodyInner = xml.substring(bTagEnd, bEnd);

            var sIdx = bodyInner.lastIndexOf('<w:sectPr');
            if (sIdx >= 0) bodyInner = bodyInner.substring(0, sIdx);

            bodyInner = bodyInner.replace(/\s+$/, '');

            if (bodyInner.length > 0) {
                extra += '<w:p><w:r><w:br w:type="page"/></w:r></w:p>';
                extra += bodyInner;
            }

            var mediaList = [];
            zip.forEach(function (path, file) {
                if (path.startsWith('word/media/') && !file.dir) {
                    mediaList.push({ path: path, entry: file });
                }
            });
            for (var j = 0; j < mediaList.length; j++) {
                if (!baseZip.file(mediaList[j].path)) {
                    var mdata = await mediaList[j].entry.async('uint8array');
                    baseZip.file(mediaList[j].path, mdata);
                }
            }
        }

        baseZip.file('word/document.xml', xmlBefore + extra + xmlAfter);

        var blob = await baseZip.generateAsync({
            type: 'blob',
            compression: 'DEFLATE',
            compressionOptions: { level: 6 }
        });

        if (window.showSaveFilePicker) {
            try {
                var handle = await window.showSaveFilePicker({
                    suggestedName: 'birlestirilmis.docx',
                    types: [{
                        description: 'Word Belgesi',
                        accept: { 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] }
                    }]
                });
                var writable = await handle.createWritable();
                await writable.write(blob);
                await writable.close();
            } catch (saveErr) {
                if (saveErr.name === 'AbortError') {
                    status.innerText = 'Kaydetme iptal edildi';
                    status.style.color = 'rgba(255,255,255,0.5)';
                    return;
                }
                throw saveErr;
            }
        } else {
            var url = URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            a.download = 'birlestirilmis.docx';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setTimeout(function () { URL.revokeObjectURL(url); }, 5000);
        }

        status.innerText = docxMergeFiles.length + ' dosya basariyla birlestirildi!';
        status.style.color = 'var(--success)';
        docxMergeFiles = [];
        document.getElementById('docxMergeList').innerHTML = '';
    } catch (e) {
        status.innerText = 'Hata: ' + e.message;
        status.style.color = '#ef4444';
        console.error('DOCX Merge Error:', e);
    }
}

// ========== QR / BARKOD OKUYUCU ==========
var qrScanner = null;
var qrScanResults = [];
var qrCurrentFacing = 'environment';

function startQrScanner(facing) {
    if (!facing) facing = qrCurrentFacing;
    qrCurrentFacing = facing;
    qrScanResults = [];
    updateQrResultsList();
    updateCamButtons();

    if (qrScanner) {
        try { qrScanner.stop().then(function () { qrScanner.clear(); }).catch(function () { }); } catch (e) { }
        qrScanner = null;
    }

    document.getElementById('qr-reader').innerHTML = '';

    qrScanner = new Html5Qrcode('qr-reader');
    qrScanner.start(
        { facingMode: facing },
        {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
            formatsToSupport: [
                Html5QrcodeSupportedFormats.QR_CODE,
                Html5QrcodeSupportedFormats.EAN_13,
                Html5QrcodeSupportedFormats.EAN_8,
                Html5QrcodeSupportedFormats.CODE_128,
                Html5QrcodeSupportedFormats.CODE_39,
                Html5QrcodeSupportedFormats.CODE_93,
                Html5QrcodeSupportedFormats.UPC_A,
                Html5QrcodeSupportedFormats.UPC_E,
                Html5QrcodeSupportedFormats.ITF,
                Html5QrcodeSupportedFormats.CODABAR,
                Html5QrcodeSupportedFormats.DATA_MATRIX,
                Html5QrcodeSupportedFormats.PDF_417
            ]
        },
        function (decodedText) {
            // Add result to list (avoid duplicates in a row)
            if (qrScanResults.length === 0 || qrScanResults[qrScanResults.length - 1].text !== decodedText) {
                qrScanResults.push({
                    text: decodedText,
                    time: new Date().toLocaleTimeString('tr-TR')
                });
                updateQrResultsList();
                if (navigator.vibrate) navigator.vibrate(100);
                showToast('Kod okundu!');
            }
        },
        function () {
            // Error - ignore (scanning continues)
        }
    ).catch(function (err) {
        document.getElementById('qr-reader').innerHTML = '<div style="padding:30px;color:rgba(255,255,255,0.5);font-size:13px">Kamera erişimi reddedildi veya desteklenmiyor.<br><br>Hata: ' + err + '</div>';
    });
}

function switchQrCamera(facing) {
    qrCurrentFacing = facing;
    var savedResults = qrScanResults.slice();
    if (qrScanner) {
        try {
            qrScanner.stop().then(function () {
                qrScanner.clear();
                qrScanner = null;
                qrScanResults = savedResults;
                startQrScannerKeepResults(facing);
            }).catch(function () {
                qrScanner = null;
                qrScanResults = savedResults;
                startQrScannerKeepResults(facing);
            });
        } catch (e) {
            qrScanner = null;
            qrScanResults = savedResults;
            startQrScannerKeepResults(facing);
        }
    } else {
        qrScanResults = savedResults;
        startQrScannerKeepResults(facing);
    }
}

function startQrScannerKeepResults(facing) {
    updateCamButtons();
    document.getElementById('qr-reader').innerHTML = '';
    qrScanner = new Html5Qrcode('qr-reader');
    qrScanner.start(
        { facingMode: facing },
        {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
            formatsToSupport: [
                Html5QrcodeSupportedFormats.QR_CODE,
                Html5QrcodeSupportedFormats.EAN_13,
                Html5QrcodeSupportedFormats.EAN_8,
                Html5QrcodeSupportedFormats.CODE_128,
                Html5QrcodeSupportedFormats.CODE_39,
                Html5QrcodeSupportedFormats.CODE_93,
                Html5QrcodeSupportedFormats.UPC_A,
                Html5QrcodeSupportedFormats.UPC_E,
                Html5QrcodeSupportedFormats.ITF,
                Html5QrcodeSupportedFormats.CODABAR,
                Html5QrcodeSupportedFormats.DATA_MATRIX,
                Html5QrcodeSupportedFormats.PDF_417
            ]
        },
        function (decodedText) {
            if (qrScanResults.length === 0 || qrScanResults[qrScanResults.length - 1].text !== decodedText) {
                qrScanResults.push({
                    text: decodedText,
                    time: new Date().toLocaleTimeString('tr-TR')
                });
                updateQrResultsList();
                if (navigator.vibrate) navigator.vibrate(100);
                showToast('Kod okundu!');
            }
        },
        function () { }
    ).catch(function (err) {
        document.getElementById('qr-reader').innerHTML = '<div style="padding:30px;color:rgba(255,255,255,0.5);font-size:13px">Kamera değiştirilemedi.<br><br>Hata: ' + err + '</div>';
    });
}

function updateCamButtons() {
    var backBtn = document.getElementById('camBackBtn');
    var frontBtn = document.getElementById('camFrontBtn');
    if (backBtn && frontBtn) {
        if (qrCurrentFacing === 'environment') {
            backBtn.className = 'tp-btn primary';
            frontBtn.className = 'tp-btn ghost';
        } else {
            backBtn.className = 'tp-btn ghost';
            frontBtn.className = 'tp-btn primary';
        }
    }
}

function updateQrResultsList() {
    var listEl = document.getElementById('qrResultsList');
    var countEl = document.getElementById('qrScanCount');
    if (!listEl) return;
    if (qrScanResults.length === 0) {
        listEl.innerHTML = '';
        if (countEl) countEl.innerText = '';
        return;
    }
    if (countEl) countEl.innerText = qrScanResults.length + ' kod okundu';
    listEl.innerHTML = qrScanResults.map(function (r, i) {
        var isUrl = r.text.match(/^https?:\/\//i);
        var openBtnHtml = isUrl ? '<button class="tp-btn success" onclick="window.open(\'' + r.text.replace(/'/g, "\\'") + '\',\'_blank\')" style="padding:6px 10px;font-size:11px;margin-left:4px">🔗</button>' : '';
        return '<div class="tp-card" style="text-align:left;margin-bottom:8px;word-break:break-all;animation:fadeIn 0.3s ease">' +
            '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">' +
            '<span style="font-size:10px;color:rgba(255,255,255,0.3);font-weight:600">#' + (i + 1) + ' • ' + r.time + '</span>' +
            '<div>' +
            '<button class="tp-btn primary" onclick="copyText(\'' + r.text.replace(/'/g, "\\'").replace(/\\/g, '\\\\') + '\')" style="padding:6px 10px;font-size:11px">📋</button>' +
            openBtnHtml +
            '</div></div>' +
            '<div style="font-size:14px;font-weight:600;color:var(--success)">' + r.text + '</div>' +
            '</div>';
    }).join('');
    // Auto scroll to bottom
    listEl.scrollTop = listEl.scrollHeight;
}

function stopQrScanner() {
    if (qrScanner) {
        try {
            qrScanner.stop().then(function () {
                qrScanner.clear();
                qrScanner = null;
            }).catch(function () {
                qrScanner = null;
            });
        } catch (e) {
            qrScanner = null;
        }
    }
    qrScanResults = [];
}

// ========== BENCHMARK ==========
function benchMedian(arr) {
    var s = arr.slice().sort(function (a, b) { return a - b; });
    var m = Math.floor(s.length / 2);
    return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

// Reference baselines (ms) - what a fast mid-range PC achieves
var BENCH_REF = { cpuMath: 80, cpuSort: 60, cpuStr: 40, cpuCrypto: 30, gpu2d: 250, gpuWgl: 50 };
function benchScoreCalc(actual, ref) {
    if (actual <= 0) return 0;
    return Math.min(10000, Math.round((ref / actual) * 5000));
}
function fmtBenchScore(sc, ms) { return sc + ' (' + Math.round(ms) + 'ms)'; }

async function benchCpuMath() {
    var mResult = 0;
    var t0 = performance.now();
    for (var i = 0; i < 5000000; i++) {
        mResult += Math.sin(i) * Math.cos(i) + Math.sqrt(i) + Math.pow(i % 100, 2.5);
    }
    return performance.now() - t0;
}

function benchCpuSort(sortArr) {
    var t0 = performance.now();
    for (var k = 0; k < 5; k++) {
        var copy = sortArr.slice();
        copy.sort(function (a, b) { return a - b; });
    }
    return performance.now() - t0;
}

function benchCpuString() {
    var t0 = performance.now();
    var arr = [];
    for (var s = 0; s < 200000; s++) {
        arr.push(String.fromCharCode(65 + (s % 26)));
        if (s % 10000 === 0) arr.join('').match(/[A-Z]{3,}/g);
    }
    arr.join('');
    return performance.now() - t0;
}

async function benchCpuCrypto() {
    var enc = new TextEncoder();
    var t0 = performance.now();
    for (var c = 0; c < 500; c++) {
        await crypto.subtle.digest('SHA-256', enc.encode('benchmark-test-data-' + c));
    }
    return performance.now() - t0;
}

function benchGpu2d(ctx) {
    var t0 = performance.now();
    for (var f = 0; f < 50; f++) {
        ctx.clearRect(0, 0, 800, 600);
        for (var d = 0; d < 2000; d++) {
            ctx.fillStyle = 'hsl(' + (d % 360) + ',80%,50%)';
            ctx.beginPath();
            ctx.arc((d * 7) % 800, (d * 13) % 600, (d % 20) + 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    return performance.now() - t0;
}

function benchGpuWebgl(gl) {
    var t0 = performance.now();
    var verts = new Float32Array(600);
    for (var w = 0; w < 500; w++) {
        for (var v = 0; v < 600; v++) verts[v] = ((w * 7 + v * 13) % 200 - 100) / 100;
        gl.bufferData(gl.ARRAY_BUFFER, verts, gl.DYNAMIC_DRAW);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, 100);
    }
    gl.finish();
    return performance.now() - t0;
}

async function runBenchmark() {
    var btn = document.getElementById('benchStartBtn');
    var scoreEl = document.getElementById('benchScore');
    var labelEl = document.getElementById('benchLabel');
    var progressEl = document.getElementById('benchProgress');
    var fillEl = document.getElementById('benchFill');
    var stepEl = document.getElementById('benchStep');
    var detailsEl = document.getElementById('benchDetails');
    var RUNS = 3;

    btn.disabled = true;
    btn.innerText = 'Test Çalışıyor...';
    progressEl.style.display = 'block';
    detailsEl.style.display = 'none';
    scoreEl.innerText = '...';
    labelEl.innerText = 'Testler çalışıyor, lütfen bekleyin';
    fillEl.style.width = '0%';

    var scores = {};
    var times = {};
    await new Promise(r => setTimeout(r, 200));

    // 1. CPU Math (warmup + 3 runs, median)
    stepEl.innerText = '1/6 CPU Matematik (ısınma)...';
    fillEl.style.width = '5%';
    await new Promise(r => setTimeout(r, 50));
    await benchCpuMath(); // warmup
    await new Promise(r => setTimeout(r, 100));
    var mathTimes = [];
    for (var mi = 0; mi < RUNS; mi++) {
        stepEl.innerText = '1/6 CPU Matematik (' + (mi + 1) + '/' + RUNS + ')...';
        await new Promise(r => setTimeout(r, 50));
        mathTimes.push(await benchCpuMath());
        await new Promise(r => setTimeout(r, 100));
    }
    times.cpuMath = benchMedian(mathTimes);
    scores.cpuMath = benchScoreCalc(times.cpuMath, BENCH_REF.cpuMath);
    document.getElementById('bCpuMath').innerText = fmtBenchScore(scores.cpuMath, times.cpuMath);

    // 2. CPU Sort (warmup + 3 runs, median)
    fillEl.style.width = '20%';
    var sortArr = [];
    for (var j = 0; j < 100000; j++) sortArr.push(Math.random());
    stepEl.innerText = '2/6 CPU Sıralama (ısınma)...';
    await new Promise(r => setTimeout(r, 50));
    benchCpuSort(sortArr); // warmup
    await new Promise(r => setTimeout(r, 100));
    var sortTimes = [];
    for (var si = 0; si < RUNS; si++) {
        stepEl.innerText = '2/6 CPU Sıralama (' + (si + 1) + '/' + RUNS + ')...';
        await new Promise(r => setTimeout(r, 50));
        sortTimes.push(benchCpuSort(sortArr));
        await new Promise(r => setTimeout(r, 100));
    }
    times.cpuSort = benchMedian(sortTimes);
    scores.cpuSort = benchScoreCalc(times.cpuSort, BENCH_REF.cpuSort);
    document.getElementById('bCpuSort').innerText = fmtBenchScore(scores.cpuSort, times.cpuSort);

    // 3. CPU String (warmup + 3 runs, median)
    fillEl.style.width = '38%';
    stepEl.innerText = '3/6 CPU String (ısınma)...';
    await new Promise(r => setTimeout(r, 50));
    benchCpuString(); // warmup
    await new Promise(r => setTimeout(r, 100));
    var strTimes = [];
    for (var sti = 0; sti < RUNS; sti++) {
        stepEl.innerText = '3/6 CPU String (' + (sti + 1) + '/' + RUNS + ')...';
        await new Promise(r => setTimeout(r, 50));
        strTimes.push(benchCpuString());
        await new Promise(r => setTimeout(r, 100));
    }
    times.cpuStr = benchMedian(strTimes);
    scores.cpuStr = benchScoreCalc(times.cpuStr, BENCH_REF.cpuStr);
    document.getElementById('bCpuStr').innerText = fmtBenchScore(scores.cpuStr, times.cpuStr);

    // 4. CPU Crypto (warmup + 3 runs, median)
    fillEl.style.width = '52%';
    stepEl.innerText = '4/6 CPU Crypto (ısınma)...';
    await new Promise(r => setTimeout(r, 50));
    await benchCpuCrypto(); // warmup
    await new Promise(r => setTimeout(r, 100));
    var cryptoTimes = [];
    for (var ci = 0; ci < RUNS; ci++) {
        stepEl.innerText = '4/6 CPU Crypto (' + (ci + 1) + '/' + RUNS + ')...';
        await new Promise(r => setTimeout(r, 50));
        cryptoTimes.push(await benchCpuCrypto());
        await new Promise(r => setTimeout(r, 100));
    }
    times.cpuCrypto = benchMedian(cryptoTimes);
    scores.cpuCrypto = benchScoreCalc(times.cpuCrypto, BENCH_REF.cpuCrypto);
    document.getElementById('bCpuCrypto').innerText = fmtBenchScore(scores.cpuCrypto, times.cpuCrypto);

    // 5. GPU Canvas 2D (warmup + 3 runs, median)
    fillEl.style.width = '68%';
    var cv = document.createElement('canvas');
    cv.width = 800; cv.height = 600;
    var ctx = cv.getContext('2d');
    stepEl.innerText = '5/6 GPU Canvas 2D (ısınma)...';
    await new Promise(r => setTimeout(r, 50));
    benchGpu2d(ctx); // warmup
    await new Promise(r => setTimeout(r, 100));
    var gpu2dTimes = [];
    for (var gi = 0; gi < RUNS; gi++) {
        stepEl.innerText = '5/6 GPU Canvas 2D (' + (gi + 1) + '/' + RUNS + ')...';
        await new Promise(r => setTimeout(r, 50));
        gpu2dTimes.push(benchGpu2d(ctx));
        await new Promise(r => setTimeout(r, 100));
    }
    times.gpu2d = benchMedian(gpu2dTimes);
    scores.gpu2d = benchScoreCalc(times.gpu2d, BENCH_REF.gpu2d);
    document.getElementById('bGpu2d').innerText = fmtBenchScore(scores.gpu2d, times.gpu2d);

    // 6. GPU WebGL (warmup + 3 runs, median)
    fillEl.style.width = '84%';
    var glCanvas = document.createElement('canvas');
    glCanvas.width = 512; glCanvas.height = 512;
    var gl = glCanvas.getContext('webgl') || glCanvas.getContext('experimental-webgl');
    if (gl) {
        var vs = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vs, 'attribute vec2 p;void main(){gl_Position=vec4(p,0,1);}');
        gl.compileShader(vs);
        var fs = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fs, 'precision mediump float;void main(){gl_FragColor=vec4(1,0,0,1);}');
        gl.compileShader(fs);
        var prog = gl.createProgram();
        gl.attachShader(prog, vs); gl.attachShader(prog, fs);
        gl.linkProgram(prog); gl.useProgram(prog);
        var buf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        var loc = gl.getAttribLocation(prog, 'p');
        gl.enableVertexAttribArray(loc);
        gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

        stepEl.innerText = '6/6 GPU WebGL (ısınma)...';
        await new Promise(r => setTimeout(r, 50));
        benchGpuWebgl(gl); // warmup
        await new Promise(r => setTimeout(r, 100));
        var wglTimes = [];
        for (var wi = 0; wi < RUNS; wi++) {
            stepEl.innerText = '6/6 GPU WebGL (' + (wi + 1) + '/' + RUNS + ')...';
            await new Promise(r => setTimeout(r, 50));
            wglTimes.push(benchGpuWebgl(gl));
            await new Promise(r => setTimeout(r, 100));
        }
        times.gpuWgl = benchMedian(wglTimes);
        scores.gpuWgl = benchScoreCalc(times.gpuWgl, BENCH_REF.gpuWgl);
        document.getElementById('bGpuWgl').innerText = fmtBenchScore(scores.gpuWgl, times.gpuWgl);
        gl.getExtension('WEBGL_lose_context')?.loseContext();
    } else {
        scores.gpuWgl = 0;
        document.getElementById('bGpuWgl').innerText = 'Desteklenmiyor';
    }

    // Memory
    var memInfo = performance.memory ? (Math.round(performance.memory.usedJSHeapSize / 1048576) + ' / ' + Math.round(performance.memory.jsHeapSizeLimit / 1048576) + ' MB') : 'Bilgi yok';
    document.getElementById('bMem').innerText = memInfo;

    // Total Score
    fillEl.style.width = '100%';
    stepEl.innerText = 'Tamamlandı!';
    var total = Math.round(
        (scores.cpuMath * 0.20) +
        (scores.cpuSort * 0.15) +
        (scores.cpuStr * 0.10) +
        (scores.cpuCrypto * 0.15) +
        (scores.gpu2d * 0.20) +
        (scores.gpuWgl * 0.20)
    );
    scoreEl.innerText = total.toLocaleString('tr-TR') + ' / 10.000';

    var rating, rColor, rBg, rGlow;
    if (total >= 8500) {
        rating = '🔥 MÜKEMMEL'; rColor = '#fbbf24'; rBg = 'linear-gradient(135deg, rgba(251,191,36,0.15), rgba(245,158,11,0.08))'; rGlow = '0 0 20px rgba(251,191,36,0.3)';
    } else if (total >= 6500) {
        rating = '💪 ÇOK İYİ'; rColor = '#34d399'; rBg = 'linear-gradient(135deg, rgba(52,211,153,0.15), rgba(16,185,129,0.08))'; rGlow = '0 0 20px rgba(52,211,153,0.3)';
    } else if (total >= 4500) {
        rating = '👍 İYİ'; rColor = '#60a5fa'; rBg = 'linear-gradient(135deg, rgba(96,165,250,0.15), rgba(59,130,246,0.08))'; rGlow = '0 0 20px rgba(96,165,250,0.3)';
    } else if (total >= 2500) {
        rating = '⚡ ORTA'; rColor = '#fb923c'; rBg = 'linear-gradient(135deg, rgba(251,146,60,0.15), rgba(249,115,22,0.08))'; rGlow = '0 0 20px rgba(251,146,60,0.2)';
    } else {
        rating = '🐢 DÜŞÜK'; rColor = '#f87171'; rBg = 'linear-gradient(135deg, rgba(248,113,113,0.15), rgba(239,68,68,0.08))'; rGlow = '0 0 20px rgba(248,113,113,0.2)';
    }

    scoreEl.style.color = rColor;
    labelEl.innerHTML = '<div style="display:inline-block;padding:10px 28px;border-radius:50px;background:' + rBg + ';border:1px solid ' + rColor + '33;box-shadow:' + rGlow + ';font-size:18px;font-weight:900;letter-spacing:2px;color:' + rColor + '">' + rating + '</div>';
    detailsEl.style.display = 'block';
    btn.disabled = false;
    btn.innerText = '🔄 Tekrar Test Et';
}

// ========== HESAP MAKİNESİ ==========
var calcExpr = '';
var calcCurrent = '0';
var calcOp = '';
var calcPrev = '';
var calcReset = false;

(function initCalc() {
    var grid = document.getElementById('calcGrid');
    if (!grid) return;
    var buttons = [
        { t: 'C', cls: 'fn' }, { t: '⌫', cls: 'fn' }, { t: '%', cls: 'fn' }, { t: '÷', cls: 'op' },
        { t: '7', cls: '' }, { t: '8', cls: '' }, { t: '9', cls: '' }, { t: '×', cls: 'op' },
        { t: '4', cls: '' }, { t: '5', cls: '' }, { t: '6', cls: '' }, { t: '−', cls: 'op' },
        { t: '1', cls: '' }, { t: '2', cls: '' }, { t: '3', cls: '' }, { t: '+', cls: 'op' },
        { t: '±', cls: 'fn' }, { t: '0', cls: '' }, { t: '.', cls: '' }, { t: '=', cls: 'eq' }
    ];
    buttons.forEach(function (b) {
        var btn = document.createElement('button');
        btn.className = 'calc-btn ' + b.cls;
        btn.innerText = b.t;
        btn.onclick = function () { calcPress(b.t); };
        grid.appendChild(btn);
    });
})();

function calcPress(key) {
    var resultEl = document.getElementById('calcResult');
    var exprEl = document.getElementById('calcExpr');

    if (key >= '0' && key <= '9') {
        if (calcReset) { calcCurrent = ''; calcReset = false; }
        if (calcCurrent === '0') calcCurrent = key;
        else calcCurrent += key;
    } else if (key === '.') {
        if (calcReset) { calcCurrent = '0'; calcReset = false; }
        if (calcCurrent.indexOf('.') < 0) calcCurrent += '.';
    } else if (key === 'C') {
        calcCurrent = '0'; calcPrev = ''; calcOp = ''; calcExpr = '';
        exprEl.innerText = '';
    } else if (key === '⌫') {
        calcCurrent = calcCurrent.length > 1 ? calcCurrent.slice(0, -1) : '0';
    } else if (key === '±') {
        if (calcCurrent !== '0') {
            calcCurrent = calcCurrent.charAt(0) === '-' ? calcCurrent.slice(1) : '-' + calcCurrent;
        }
    } else if (key === '%') {
        calcCurrent = String(parseFloat(calcCurrent) / 100);
    } else if (key === '+' || key === '−' || key === '×' || key === '÷') {
        if (calcPrev && calcOp && !calcReset) {
            calcCurrent = String(calcCompute(parseFloat(calcPrev), parseFloat(calcCurrent), calcOp));
        }
        calcPrev = calcCurrent;
        calcOp = key;
        calcExpr = calcPrev + ' ' + key;
        exprEl.innerText = calcExpr;
        calcReset = true;
    } else if (key === '=') {
        if (calcPrev && calcOp) {
            calcExpr = calcPrev + ' ' + calcOp + ' ' + calcCurrent;
            calcCurrent = String(calcCompute(parseFloat(calcPrev), parseFloat(calcCurrent), calcOp));
            exprEl.innerText = calcExpr + ' =';
            calcPrev = '';
            calcOp = '';
            calcReset = true;
        }
    }

    // Format display
    var display = calcCurrent;
    if (display.length > 12) display = parseFloat(display).toExponential(6);
    resultEl.innerText = display;
}

function calcCompute(a, b, op) {
    switch (op) {
        case '+': return a + b;
        case '−': return a - b;
        case '×': return a * b;
        case '÷': return b !== 0 ? a / b : 'Hata';
        default: return b;
    }
}

// ========== URL KISALTICI ==========
async function shortenUrl() {
    var input = document.getElementById('urlLongInput');
    var resultDiv = document.getElementById('urlShortResult');
    var resultText = document.getElementById('urlShortText');
    var url = input.value.trim();

    if (!url) {
        showToast('Lütfen bir URL girin!');
        return;
    }
    if (!url.match(/^https?:\/\//i)) {
        url = 'https://' + url;
        input.value = url;
    }

    resultDiv.style.display = 'none';
    showToast('Kısaltılıyor...');

    try {
        var response = await fetch('https://tinyurl.com/api-create.php?url=' + encodeURIComponent(url));
        if (!response.ok) throw new Error('API hatası');
        var shortUrl = await response.text();
        resultText.innerText = shortUrl;
        resultDiv.style.display = 'block';
        showToast('Link kısaltıldı!');
    } catch (e) {
        showToast('Kısaltma başarısız! Geçerli bir URL deneyin.');
    }
}

// ========== METİN / KOD PAYLAŞ ==========
async function createPaste() {
    var input = document.getElementById('pasteInput');
    var resultDiv = document.getElementById('pasteResult');
    var linkEl = document.getElementById('pasteLink');
    var btn = document.getElementById('pasteBtn');
    var text = input.value.trim();

    if (!text) {
        showToast('Lütfen paylaşmak istediğiniz metni girin!');
        return;
    }

    btn.disabled = true;
    btn.innerText = 'Oluşturuluyor...';
    resultDiv.style.display = 'none';

    try {
        // Try paste.rs
        var response = await fetch('https://paste.rs/', {
            method: 'POST',
            body: text
        });
        if (!response.ok) throw new Error('API hatası');
        var pasteUrl = (await response.text()).trim();
        linkEl.innerText = pasteUrl;
        resultDiv.style.display = 'block';
        showToast('Link oluşturuldu!');
    } catch (e1) {
        try {
            // Fallback: bytebin
            var r2 = await fetch('https://bytebin.lucko.me/post', {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain' },
                body: text
            });
            if (!r2.ok) throw new Error('Fallback hatası');
            var data = await r2.json();
            var url = 'https://bytebin.lucko.me/' + data.key;
            linkEl.innerText = url;
            resultDiv.style.display = 'block';
            showToast('Link oluşturuldu!');
        } catch (e2) {
            showToast('Oluşturulamadı! İnternet bağlantınızı kontrol edin.');
        }
    }

    btn.disabled = false;
    btn.innerText = '🚀 Link Oluştur';
}

// ========== KOD EDİTÖR SATIR NUMARALARI ==========
function updateLineNumbers() {
    var input = document.getElementById('pasteInput');
    var lineNums = document.getElementById('pasteLineNums');
    var stats = document.getElementById('pasteStats');
    var text = input.value;
    var lines = text.split('\n');
    var nums = [];
    for (var i = 1; i <= Math.max(lines.length, 1); i++) nums.push(i);
    lineNums.innerText = nums.join('\n');
    stats.innerText = 'Satır: ' + lines.length + ' · Karakter: ' + text.length;
}

// Sync scroll between line numbers and textarea
document.addEventListener('DOMContentLoaded', function () {
    var input = document.getElementById('pasteInput');
    var lineNums = document.getElementById('pasteLineNums');
    if (input && lineNums) {
        input.addEventListener('scroll', function () {
            lineNums.scrollTop = input.scrollTop;
        });
        // Tab key support
        input.addEventListener('keydown', function (e) {
            if (e.key === 'Tab') {
                e.preventDefault();
                var start = this.selectionStart;
                var end = this.selectionEnd;
                this.value = this.value.substring(0, start) + '    ' + this.value.substring(end);
                this.selectionStart = this.selectionEnd = start + 4;
                updateLineNumbers();
            }
        });
    }
});

// ========== ARAMA / FİLTRE ==========
function filterTools(query) {
    var q = query.toLocaleLowerCase('tr-TR').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ç/g, 'c').replace(/ğ/g, 'g');
    var buttons = document.querySelectorAll('.tool-grid .tool-btn');
    buttons.forEach(function (btn) {
        var label = (btn.querySelector('.label')?.innerText || '').toLocaleLowerCase('tr-TR').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ç/g, 'c').replace(/ğ/g, 'g');
        var desc = (btn.querySelector('.desc')?.innerText || '').toLocaleLowerCase('tr-TR').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ç/g, 'c').replace(/ğ/g, 'g');
        if (!q || label.indexOf(q) >= 0 || desc.indexOf(q) >= 0) {
            btn.style.display = '';
        } else {
            btn.style.display = 'none';
        }
    });
    // Hide empty category headers
    var grids = document.querySelectorAll('.tool-grid');
    grids.forEach(function (grid) {
        var header = grid.previousElementSibling;
        if (header && header.classList.contains('cat-header')) {
            var visibleBtns = grid.querySelectorAll('.tool-btn:not([style*="display: none"])');
            header.style.display = visibleBtns.length === 0 ? 'none' : '';
            grid.style.display = visibleBtns.length === 0 ? 'none' : '';
        }
    });
}

// ========== FİNANS WİDGET ==========
var dovizLoaded = false;

function loadFinanceUrl(url) {
    var container = document.getElementById('dovizWidget');
    var loader = document.getElementById('dovizLoader');
    loader.style.display = 'flex';

    // Yükleniyor durumundayken iframe'i saydamlaştır
    if (container.querySelector('iframe')) {
        container.querySelector('iframe').style.opacity = '0.3';
    }

    // JSON timeout'unu önlemek ve hızlı yükleme sağlamak için Codetabs üzerinden raw text çekiyoruz
    fetch('https://api.codetabs.com/v1/proxy?quest=' + encodeURIComponent(url))
        .then(res => res.text())
        .then(html => {
            if (!html || html.length < 50) throw new Error("No content");

            // Tüm göreceli linklerin doğru etki alanına (dovizborsa.com) çözümlenmesi için base etiketi
            const baseTag = `<base href="${new URL(url).origin}/">`;
            if (html.includes('<head>')) {
                html = html.replace('<head>', '<head>' + baseTag);
            } else {
                html = baseTag + html;
            }

            // Linkleri yakalayıp ebeveyn (parent) penceresine mesaj atan Javascript
            const interceptScript = `
            <script>
                document.addEventListener('click', function(e) {
                    let a = e.target.closest('a');
                    if (a && a.href) {
                        e.preventDefault();
                        window.parent.postMessage({ type: 'financeNavigate', url: a.href }, '*');
                    }
                });
            <\/script>
            `;

            if (html.includes('</body>')) {
                html = html.replace('</body>', interceptScript + '</body>');
            } else {
                html = html + interceptScript;
            }

            // Eğer iframe yoksa oluştur, varsa srcdoc güncelle
            let iframe = container.querySelector('iframe');
            if (!iframe) {
                iframe = document.createElement('iframe');
                iframe.style = "width:100%; height:100%; border:none; border-radius:12px; display:block; transition: opacity 0.3s; background:#111;";
                iframe.onload = function () {
                    document.getElementById('dovizLoader').style.display = 'none';
                    iframe.style.opacity = '1';
                };
                container.innerHTML = '';
                container.appendChild(iframe);
            }
            // srcdoc güncellendiğinde onload tekrar tetiklenir
            iframe.srcdoc = html;
        })
        .catch(err => {
            loader.style.display = 'none';
            container.innerHTML = '<div style="color:#ef4444;text-align:center;padding:20px;">Bağlantı zaman aşımına uğradı veya bu sayfa engelleniyor.<br><button onclick="loadFinanceUrl(\'https://dovizborsa.com/\')" style="margin-top:10px;padding:8px 16px;background:var(--accent);color:#fff;border:none;border-radius:6px;cursor:pointer;">Ana Sayfa\'ya Dön</button></div>';
        });
}

// Ana uygulamada child iframe'in link mesajlarını yakalama
window.addEventListener('message', function (e) {
    if (e.data && e.data.type === 'financeNavigate') {
        loadFinanceUrl(e.data.url);
    }
});

function loadDovizWidget() {
    if (dovizLoaded) return;
    dovizLoaded = true;
    loadFinanceUrl('https://dovizborsa.com/');
}

// Patch openOverlay for finance & iftar widgets
var _origOpenOverlay = typeof openOverlay === 'function' ? openOverlay : null;
document.addEventListener('DOMContentLoaded', function () {
    var origOpen = window.openOverlay;
    if (!origOpen) return;
    window.openOverlay = function (id) {
        origOpen(id);
        if (id === 'doviz-mode') loadDovizWidget();
        if (id === 'iftar-mode') initIftar();
    };
});

// ========== İFTAR SAYAÇ ==========
const cities = ["Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Aksaray", "Amasya", "Ankara", "Antalya", "Ardahan", "Artvin", "Aydın", "Balıkesir", "Bartın", "Batman", "Bayburt", "Bilecik", "Bingöl", "Bitlis", "Bolu", "Burdur", "Bursa", "Çanakkale", "Çankırı", "Çorum", "Denizli", "Diyarbakır", "Düzce", "Edirne", "Elazığ", "Erzincan", "Erzurum", "Eskişehir", "Gaziantep", "Giresun", "Gümüşhane", "Hakkari", "Hatay", "Iğdır", "Isparta", "İstanbul", "İzmir", "Kahramanmaraş", "Karabük", "Karaman", "Kars", "Kastamonu", "Kayseri", "Kilis", "Kırıkkale", "Kırklareli", "Kırşehir", "Kocaeli", "Konya", "Kütahya", "Malatya", "Manisa", "Mardin", "Mersin", "Muğla", "Muş", "Nevşehir", "Niğde", "Ordu", "Osmaniye", "Rize", "Sakarya", "Samsun", "Şanlıurfa", "Siirt", "Sinop", "Sivas", "Şırnak", "Tekirdağ", "Tokat", "Trabzon", "Tunceli", "Uşak", "Van", "Yalova", "Yozgat", "Zonguldak"];

let iftarTimes = {};
let activeCity = null;
let locationRequested = false;

async function fetchCityTime(city) {
    if (iftarTimes[city]) {
        if (iftarTimes[city] instanceof Promise) return await iftarTimes[city];
        return iftarTimes[city];
    }

    const p = (async () => {
        try {
            const response = await fetch('https://api.aladhan.com/v1/timingsByCity?city=' + encodeURIComponent(city) + '&country=Turkey&method=13');
            const data = await response.json();
            if (data && data.data && data.data.timings) {
                const time = data.data.timings.Maghrib;
                iftarTimes[city] = time;
                return time;
            } else {
                delete iftarTimes[city];
                return null;
            }
        } catch (e) {
            delete iftarTimes[city];
            return null;
        }
    })();

    iftarTimes[city] = p;
    return await p;
}

function getCountdown(timeStr) {
    if (!timeStr) return null;
    const now = new Date();
    const [h, m] = timeStr.split(':');
    const target = new Date();
    target.setHours(h, m, 0, 0);

    let diff = target - now;
    if (diff < 0) return "İftar Açıldı";

    const hh = Math.floor(diff / 3600000);
    const mm = Math.floor((diff % 3600000) / 60000);
    const ss = Math.floor((diff % 60000) / 1000);
    return { hh, mm, ss, text: `${hh}s ${mm}d ${ss}sn`, short: `${hh}s ${mm}d` };
}

async function updateUI() {
    if (!activeCity) return;
    const time = await fetchCityTime(activeCity);
    const cd = getCountdown(time);
    const bigCounter = document.getElementById("bigCountdown");
    const activeName = document.getElementById("activeCityName");

    if (activeName) activeName.innerText = activeCity;
    if (bigCounter) {
        if (cd === "İftar Açıldı") {
            bigCounter.innerText = "🌙 İFTAR VAKTİ!";
        } else if (cd) {
            bigCounter.innerText = "⏳ " + cd.text;
        }
    }
}

function detectUserLocation() {
    if (locationRequested) return;
    locationRequested = true;

    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(async function (position) {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            try {
                const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=tr`);
                const data = await res.json();
                let foundStr = data.city || data.principalSubdivision || "";
                foundStr = foundStr.replace(" Province", "");
                const match = cities.find(x => x.toLowerCase() === foundStr.toLowerCase() || x.toLowerCase().includes(foundStr.toLowerCase()) || foundStr.toLowerCase().includes(x.toLowerCase()));
                if (match) {
                    activeCity = match;
                    document.getElementById("geoErrorMsg").style.display = "none";
                }
            } catch (e) { console.warn("Geo Fetch Error:", e); }
            updateUI();
        }, function (error) {
            console.warn("Geo Error:", error);
            const errDiv = document.getElementById("geoErrorMsg");
            if (errDiv) errDiv.style.display = "block";
            activeCity = "İstanbul";
            updateUI();
        });
    } else {
        activeCity = "İstanbul";
        updateUI();
    }
}

let iftarInitialized = false;
function initIftar() {
    if (iftarInitialized) return;
    if (!document.getElementById("activeCityName")) return;
    iftarInitialized = true;

    detectUserLocation();
    detectUserLocation();

    if (iftarInterval) clearInterval(iftarInterval);
    iftarInterval = setInterval(updateUI, 1000);
}
