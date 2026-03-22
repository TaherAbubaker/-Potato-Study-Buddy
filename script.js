// ─── Config ───────────────────────────────────────────────────────────────
const MODES = {
    work: { duration: 25 * 60, label: 'Focus session', tabClass: 'work', ringClass: '' },
    short: { duration: 5 * 60, label: 'Short break 😌', tabClass: 'short', ringClass: 'short' },
    long: { duration: 15 * 60, label: 'Long break 🛋️', tabClass: 'long', ringClass: 'long' },
};

const SPEECHES = {
    work: {
        start: ['Time to cook 🔥', 'Go to war, soldier!', 'Eyes on the prize 👀', 'Let\'s get it!!'],
        minute: ['Keep going!!', 'Looking good~', 'Little by little 🌱', 'You\'re doing it!', 'Almost there...'],
        pause: ['why did u stop 😤', 'bruh... come back', 'pausing is cheating fr', 'nooo come back!!'],
        done: ['YESSS!! Take a break! 🎉', 'LETS GOOO!! 🥔🔥', 'You cooked!!! Rest now~'],
    },
    short: {
        start: ['lil nap time 😴', 'rest ur eyes bestie', 'take a big breath 🌸'],
        minute: ['chillin...', 'zzz...', '🌙 resting...'],
        pause: ['pausing a break?? irl?'],
        done: ['Break is over! Back to work~', 'Ok ok back to it!'],
    },
    long: {
        start: ['BIG rest energy 🛋️', 'deserved honestly', 'ok fine rest...'],
        minute: ['still resting...', 'taking it slow 🌊', '...'],
        pause: ['pausing ur break?? ur wildin'],
        done: ['Long break done!! Let\'s GO!'],
    },
};

// ─── State ────────────────────────────────────────────────────────────────
let currentMode = 'work';
let totalSeconds = MODES[currentMode].duration;
let remaining = totalSeconds;
let running = false;
let interval = null;
let soundOn = true;
let dancing = false;
let completedSessions = 0;

// ─── Elements ─────────────────────────────────────────────────────────────
const timerEl = document.getElementById('timer');
const sessionLabel = document.getElementById('sessionLabel');
const mainBtn = document.getElementById('mainBtn');
const resetBtn = document.getElementById('resetBtn');
const potato = document.getElementById('potato');
const potatoWrap = document.getElementById('potatoWrap');
const speech = document.getElementById('speech');
const soundPill = document.getElementById('soundPill');
const soundLabel = document.getElementById('soundLabel');
const ringProgress = document.getElementById('ringProgress');
const CIRCUMFERENCE = 439.82;

// ─── Helpers ──────────────────────────────────────────────────────────────
function fmt(s) {
    return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function say(txt) {
    speech.style.opacity = '0';
    setTimeout(() => {
        speech.textContent = txt;
        speech.style.opacity = '1';
    }, 150);
}

function updateRing() {
    const pct = remaining / totalSeconds;
    const offset = CIRCUMFERENCE * (1 - pct);
    ringProgress.style.strokeDashoffset = offset;
}

function updateRingColor() {
    ringProgress.className = 'ring-progress ' + MODES[currentMode].ringClass;
}

function render() {
    timerEl.textContent = fmt(remaining);
    updateRing();
    document.title = `${fmt(remaining)} · Potato Study`;
}

function setPotatoMood(mood) {
    potato.classList.remove('sleepy', 'surprised');
    if (mood) potato.classList.add(mood);
}

function spawnSparkles() {
    const emojis = ['✨', '⭐', '🎉', '💫', '🔥', '🥔'];
    for (let i = 0; i < 6; i++) {
        const el = document.createElement('span');
        el.className = 'sparkle';
        el.textContent = pick(emojis);
        el.style.cssText = `
          left: ${20 + Math.random() * 60}%;
          top: ${10 + Math.random() * 60}%;
          --tx: ${(Math.random() - 0.5) * 80}px;
          --ty: ${-30 - Math.random() * 60}px;
          animation-delay: ${Math.random() * 0.3}s;
        `;
        potatoWrap.appendChild(el);
        el.addEventListener('animationend', () => el.remove());
    }
}

function updateDots() {
    document.querySelectorAll('.dot').forEach((dot, i) => {
        dot.classList.toggle('done', i < completedSessions % 4);
    });
}

// ─── Timer control ────────────────────────────────────────────────────────
function startTimer() {
    if (running) return;
    running = true;
    mainBtn.textContent = 'Pause';
    mainBtn.classList.add('running');
    potato.classList.add('bounce');
    say(pick(SPEECHES[currentMode].start));
    interval = setInterval(tick, 1000);
}

function pauseTimer() {
    if (!running) return;
    running = false;
    clearInterval(interval); interval = null;
    mainBtn.textContent = 'Resume';
    mainBtn.classList.remove('running');
    potato.classList.remove('bounce');
    say(pick(SPEECHES[currentMode].pause));
}

function resetTimer() {
    clearInterval(interval); interval = null;
    running = false;
    remaining = totalSeconds;
    mainBtn.textContent = 'Start';
    mainBtn.classList.remove('running');
    potato.classList.remove('bounce');
    setPotatoMood(null);
    render();
    say('Reset! Ready when you are 🥔');
}

function tick() {
    if (remaining > 0) {
        remaining--;
        render();
        if (remaining > 0 && remaining % 60 === 0) {
            say(pick(SPEECHES[currentMode].minute));
        }
        // flash at :10
        if (remaining <= 10 && remaining > 0) {
            timerEl.style.color = remaining % 2 === 0 ? '#ff6b9d' : 'var(--text)';
        }
    } else {
        timerEl.style.color = 'var(--text)';
        clearInterval(interval); interval = null;
        running = false;
        mainBtn.textContent = 'Start';
        mainBtn.classList.remove('running');

        if (currentMode === 'work') {
            completedSessions++;
            updateDots();
        }

        setPotatoMood('surprised');
        potato.classList.add('bounce');
        spawnSparkles();
        say(pick(SPEECHES[currentMode].done));
        playDing();
    }
}

// ─── Mode switching ───────────────────────────────────────────────────────
function setMode(mode) {
    currentMode = mode;
    totalSeconds = MODES[mode].duration;
    remaining = totalSeconds;
    sessionLabel.textContent = MODES[mode].label;
    updateRingColor();

    // update tabs
    document.querySelectorAll('.tab').forEach(t => {
        t.classList.toggle('active', t.dataset.mode === mode);
    });

    // potato mood on break
    if (mode === 'work') setPotatoMood(null);
    else setPotatoMood('sleepy');

    resetTimer();
}

document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => setMode(tab.dataset.mode));
});

// ─── Main button ──────────────────────────────────────────────────────────
mainBtn.addEventListener('click', () => {
    if (running) pauseTimer();
    else startTimer();
});

resetBtn.addEventListener('click', resetTimer);

// ─── Potato click ─────────────────────────────────────────────────────────
potatoWrap.addEventListener('click', () => {
    dancing = !dancing;
    potato.classList.toggle('bounce', dancing);
    potato.classList.add('wiggle');
    potato.addEventListener('animationend', () => potato.classList.remove('wiggle'), { once: true });
    say(dancing ? 'this is my whole career 💃' : 'ok im chilling now');
});

// ─── Sound toggle ─────────────────────────────────────────────────────────
soundLabel.addEventListener('click', () => {
    soundOn = !soundOn;
    soundPill.classList.toggle('on', soundOn);
});

// ─── Audio (Web Audio API beep) ───────────────────────────────────────────
function playDing() {
    if (!soundOn) return;
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const notes = [523, 659, 784, 1047]; // C E G C

        notes.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = 'sine';
            osc.frequency.value = freq;
            const t = ctx.currentTime + i * 0.12;
            gain.gain.setValueAtTime(0, t);
            gain.gain.linearRampToValueAtTime(0.25, t + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
            osc.start(t);
            osc.stop(t + 0.35);
        });
    } catch (e) { }
}

// ─── Keyboard shortcuts ───────────────────────────────────────────────────
document.addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT') return;
    if (e.code === 'Space') { e.preventDefault(); if (running) pauseTimer(); else startTimer(); }
    if (e.key.toLowerCase() === 'r') resetTimer();
});

// ─── Init ─────────────────────────────────────────────────────────────────
setMode('work');
say('Ready to crush it? Let\'s go! 💪');