/* --------------------------------------------------
 * ROYAL INDIAN WEDDING - JAVASCRIPT ENGINE
 * -------------------------------------------------- */

document.addEventListener('DOMContentLoaded', () => {
    
    // Elements
    const enterOverlay = document.getElementById('enter-overlay');
    const enterBtn = document.getElementById('enter-btn');
    const mainContent = document.getElementById('main-content');
    const bgMusic = document.getElementById('bg-music');
    const musicBtn = document.getElementById('music-btn');
    const cinematicIntro = document.getElementById('cinematic-intro');
    
    // Audio Context for Sound Synthesis
    let audioCtx = null;

    /* --------------------------------------------------
     * 1. WEB AUDIO API SYNTHESIZER
     * -------------------------------------------------- */
    
    function initAudio() {
        // Create Audio Context (cross-browser)
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AudioContextClass();
    }

    // Plays the conch sound from assets/shankh2.mp3
    function playConchSound() {
        const conchAudio = new Audio('assets/shankh2.mp3');
        conchAudio.volume = 0.8;
        conchAudio.play().catch(e => console.log('Audio playback failed:', e));
    }

    // Synthesizes a beautiful temple brass bell with non-harmonic overtones
    function playTempleBell(frequency, timeOffset) {
        if (!audioCtx) return;
        
        const now = audioCtx.currentTime + timeOffset;
        
        // In brass bells, overtones have specific ratios to root frequency:
        // 1.0 (Root), 2.0 (Octave), 2.4 (Minor Third), 3.0 (Fifth), 4.0 (Double Octave)
        const ratios = [1.0, 2.0, 2.4, 3.0, 4.0];
        const gains = [0.5, 0.25, 0.15, 0.1, 0.05];
        
        const bellGain = audioCtx.createGain();
        bellGain.gain.setValueAtTime(0, now);
        bellGain.gain.linearRampToValueAtTime(0.8, now + 0.01); // Instant strike
        bellGain.gain.exponentialRampToValueAtTime(0.001, now + 4.0); // Long tail ring
        bellGain.connect(audioCtx.destination);

        ratios.forEach((ratio, idx) => {
            const osc = audioCtx.createOscillator();
            const oscGain = audioCtx.createGain();
            
            osc.type = 'sine';
            osc.frequency.value = frequency * ratio;
            
            oscGain.gain.value = gains[idx];
            
            osc.connect(oscGain);
            oscGain.connect(bellGain);
            
            osc.start(now);
            osc.stop(now + 4.5);
        });
    }

    /* --------------------------------------------------
     * 2. CURSOR SPARKLES TRAILING EFFECT
     * -------------------------------------------------- */
    
    window.addEventListener('mousemove', (e) => {
        // Limit sparkle spawning density
        if (Math.random() > 0.15) return;
        
        const sparkle = document.createElement('div');
        sparkle.classList.add('cursor-sparkle');
        sparkle.style.left = `${e.clientX}px`;
        sparkle.style.top = `${e.clientY}px`;
        
        // Random size and angle variations
        const size = Math.random() * 6 + 2;
        sparkle.style.width = `${size}px`;
        sparkle.style.height = `${size}px`;
        
        const container = document.getElementById('sparkle-container');
        if (container) {
            container.appendChild(sparkle);
            setTimeout(() => sparkle.remove(), 800);
        }
    });

    /* --------------------------------------------------
     * 3. FLOWER SHOWER CANVAS PHYSICS
     * -------------------------------------------------- */
    
    const canvas = document.getElementById('flower-canvas');
    const ctx = canvas.getContext('2d');
    
    let canvasWidth = window.innerWidth;
    let canvasHeight = window.innerHeight;
    
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    
    window.addEventListener('resize', () => {
        canvasWidth = window.innerWidth;
        canvasHeight = window.innerHeight;
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
    });

    // Petal class for rose and marigold particles
    class Petal {
        constructor() {
            this.reset();
            // Start at random Y coordinates initially
            this.y = Math.random() * canvasHeight - canvasHeight;
        }

        reset() {
            this.x = Math.random() * canvasWidth;
            this.y = -20;
            this.size = Math.random() * 15 + 8;
            this.speedY = Math.random() * 1.5 + 1.0;
            this.speedX = Math.random() * 1.0 - 0.5;
            this.rotation = Math.random() * 360;
            this.rotationSpeed = Math.random() * 2 - 1;
            
            // 75% Rose petals, 25% Marigold flowers
            this.type = Math.random() > 0.25 ? 'rose' : 'marigold';
            
            // Random soft hues
            if (this.type === 'rose') {
                const redHues = [340, 350, 0, 10];
                this.hue = redHues[Math.floor(Math.random() * redHues.length)];
                this.saturation = 80 + Math.random() * 20;
                this.lightness = 30 + Math.random() * 15;
            } else {
                // Gold / Orange / Yellow for Marigolds
                const orangeHues = [35, 45, 20];
                this.hue = orangeHues[Math.floor(Math.random() * orangeHues.length)];
                this.saturation = 90 + Math.random() * 10;
                this.lightness = 50 + Math.random() * 10;
            }
            this.opacity = Math.random() * 0.4 + 0.6;
        }

        update() {
            this.y += this.speedY;
            this.x += this.speedX + Math.sin(this.y / 30) * 0.4; // sway drift
            this.rotation += this.rotationSpeed;

            if (this.y > canvasHeight + 20) {
                this.reset();
            }
        }

        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate((this.rotation * Math.PI) / 180);
            ctx.globalAlpha = this.opacity;

            if (this.type === 'rose') {
                // Draw Rose Petal (Smooth teardrop/heart shape)
                ctx.fillStyle = `hsl(${this.hue}, ${this.saturation}%, ${this.lightness}%)`;
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.bezierCurveTo(-this.size/2, -this.size/2, -this.size, this.size/3, 0, this.size);
                ctx.bezierCurveTo(this.size, this.size/3, this.size/2, -this.size/2, 0, 0);
                ctx.closePath();
                ctx.fill();
                
                // Add soft petal crease lines
                ctx.strokeStyle = `hsl(${this.hue}, ${this.saturation}%, ${this.lightness - 10}%)`;
                ctx.lineWidth = 0.5;
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(0, this.size * 0.7);
                ctx.stroke();
            } else {
                // Draw Marigold Flower (Circular ruffled texture)
                const petalsCount = 6;
                ctx.fillStyle = `hsl(${this.hue}, ${this.saturation}%, ${this.lightness}%)`;
                for (let i = 0; i < petalsCount; i++) {
                    ctx.rotate((360 / petalsCount * Math.PI) / 180);
                    ctx.beginPath();
                    ctx.arc(this.size * 0.35, 0, this.size * 0.4, 0, Math.PI * 2);
                    ctx.fill();
                }
                // Center bud
                ctx.fillStyle = `hsl(${this.hue - 10}, 100%, 35%)`;
                ctx.beginPath();
                ctx.arc(0, 0, this.size * 0.25, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.restore();
        }
    }

    const petalsArray = [];
    const maxPetals = 70;
    for (let i = 0; i < maxPetals; i++) {
        petalsArray.push(new Petal());
    }

    function animateFlowerShower() {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        petalsArray.forEach(petal => {
            petal.update();
            petal.draw();
        });
        requestAnimationFrame(animateFlowerShower);
    }

    /* --------------------------------------------------
     * 4. EXPERIENCE TRIGGER (ENTRY BUTTON CLICK)
     * -------------------------------------------------- */
    
    let hasEntered = false;
    enterBtn.addEventListener('click', () => {
        if (hasEntered) return;
        hasEntered = true;
        
        initAudio();
        
        // 1. Play door opening/exit animations on overlay
        enterOverlay.classList.add('opened');
        
        // 2. Play Conch shell blast (Shankh Naad) immediately
        playConchSound();
        
        // 3. Schedule beautiful holy temple chimes
        playTempleBell(440, 1.8); // A4
        playTempleBell(554.37, 2.1); // C#5
        playTempleBell(659.25, 2.4); // E5
        playTempleBell(880, 2.8); // A5

        setTimeout(() => {
            // Remove overlay and show site container
            enterOverlay.classList.add('hidden');
            mainContent.classList.remove('hidden');
            
            // Fade-in main container elements
            setTimeout(() => {
                mainContent.classList.add('visible');
                musicBtn.classList.remove('hidden');
                
                // Start background music loop and fade it in
                bgMusic.volume = 0;
                bgMusic.play().catch(e => console.log('Autoplay policy caught:', e));
                
                // Fade music to full comfortable volume
                let vol = 0;
                const fadeInterval = setInterval(() => {
                    if (vol < 0.6) {
                        vol += 0.05;
                        bgMusic.volume = vol;
                    } else {
                        clearInterval(fadeInterval);
                    }
                }, 100);
            }, 100);
            
            // Start Flower Physics loop
            animateFlowerShower();
            
        }, 1500);

        // Remove active-cinematic after standard delay (transition out of dark om)
        setTimeout(() => {
            cinematicIntro.classList.remove('active-cinematic');
            cinematicIntro.style.display = 'none';
        }, 5500);
    });

    /* --------------------------------------------------
     * 5. MUSIC CONTROLLER (MUTING)
     * -------------------------------------------------- */
    
    musicBtn.addEventListener('click', () => {
        if (bgMusic.paused) {
            bgMusic.play();
            musicBtn.classList.remove('muted');
        } else {
            bgMusic.pause();
            musicBtn.classList.add('muted');
        }
    });

    /* --------------------------------------------------
     * 6. COUNTDOWN TIMER CALCULATOR
     * -------------------------------------------------- */
    
    // Target Date: 30 November, 2026
    const targetDate = new Date('2026-11-30T00:00:00').getTime();

    const countdown = () => {
        const now = new Date().getTime();
        const difference = targetDate - now;

        if (difference <= 0) {
            document.getElementById('days').innerText = "00";
            document.getElementById('hours').innerText = "00";
            document.getElementById('minutes').innerText = "00";
            document.getElementById('seconds').innerText = "00";
            return;
        }

        // Time calculations
        const d = Math.floor(difference / (1000 * 60 * 60 * 24));
        const h = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((difference % (1000 * 60)) / 1000);

        // Format to double digits
        document.getElementById('days').innerText = String(d).padStart(2, '0');
        document.getElementById('hours').innerText = String(h).padStart(2, '0');
        document.getElementById('minutes').innerText = String(m).padStart(2, '0');
        document.getElementById('seconds').innerText = String(s).padStart(2, '0');
    };

    // Run every second
    setInterval(countdown, 1000);
    countdown();

    /* --------------------------------------------------
     * 7. SCROLL REVEAL (INTERSECTION OBSERVER)
     * -------------------------------------------------- */
    
    const revealOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal-active');
                observer.unobserve(entry.target); // Reveal once
            }
        });
    }, revealOptions);

    // Track scroll elements
    const elementsToReveal = document.querySelectorAll('.scroll-reveal, .scroll-reveal-left, .scroll-reveal-right');
    elementsToReveal.forEach(el => revealObserver.observe(el));

    /* --------------------------------------------------
     * 8. REAL-TIME GLOBAL VISITOR COUNTER LOGIC
     * -------------------------------------------------- */
    
    function renderVisitorCount(count) {
        const formatted = String(count).padStart(5, '0');
        for (let i = 1; i <= 5; i++) {
            const digitEl = document.getElementById(`vc-d${i}`);
            if (digitEl) {
                digitEl.innerText = formatted[i - 1] || '0';
            }
        }
    }

    async function initVisitorCounter() {
        const STORAGE_KEY = 'wedding_visitor_count_v2';
        const BASE_COUNT = 10; // Start at 10
        
        let localCount = parseInt(localStorage.getItem(STORAGE_KEY), 10);
        if (isNaN(localCount) || localCount < BASE_COUNT) {
            localCount = BASE_COUNT;
        }

        // Show base estimate (starts with 10)
        renderVisitorCount(localCount);

        try {
            const namespace = 'aditya_komal_wedding_invitation_v2';
            const res = await fetch(`https://api.counterapi.dev/v1/${namespace}/visits/up`);
            if (res.ok) {
                const data = await res.json();
                if (data && typeof data.count === 'number') {
                    const realCount = BASE_COUNT + (data.count - 1);
                    localStorage.setItem(STORAGE_KEY, realCount);
                    renderVisitorCount(realCount);
                    return;
                }
            }
        } catch (err) {
            console.log('Global counter API offline, using local counter fallback:', err);
        }

        // Fallback if network/API is unavailable: increment on every visit
        localCount += 1;
        localStorage.setItem(STORAGE_KEY, localCount);
        renderVisitorCount(localCount);
    }

    initVisitorCounter();
});
