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
        var s = symbols[Math.floor(Math.random() * symbols.length)];
        var p = Math.random();
        var result = "";
        if (p < 0.33) {
            result = w + s + years[Math.floor(Math.random() * years.length)];
        } else if (p < 0.66) {
            var nums = Math.floor(Math.random() * 900) + 100;
            result = w + s + nums + "**";
        } else {
            var nums = Math.floor(Math.random() * 90) + 10;
            result = w + s + nums;
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
