// Aurora background - runs a canvas animation
function startAurora() {
  const canvas = document.getElementById('auroraCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h;
  let time = 0;
  let frameCount = 0;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  function drawAurora(t) {
    ctx.clearRect(0, 0, w, h);

    for (let b = 0; b < 2; b++) {
      const speed = 0.12 + b * 0.04;
      const height = 0.15 + b * 0.05;
      const baseY = 0.3 + b * 0.3 + Math.sin(t * 0.08 + b) * 0.12;

      ctx.beginPath();
      ctx.moveTo(0, h);

      for (let x = 0; x <= w; x += 10) {
        const p = x / w;
        const wave = Math.sin(p * 3.5 + t * speed + b * 1.2) * height
                   + Math.sin(p * 6 + t * 0.06 + b * 2.5) * height * 0.4;
        ctx.lineTo(x, (baseY + wave) * h);
      }

      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fillStyle = `rgba(212,165,116,${0.06 - b * 0.015})`;
      ctx.fill();
    }
  }

  function animate() {
    time += 0.016;
    frameCount++;
    // skip every other frame for performance
    if (frameCount % 2 === 0) drawAurora(time);
    requestAnimationFrame(animate);
  }
  animate();
}
startAurora();

// parallax on mouse move
const depthElements = document.querySelectorAll('.bg-depth');
let parallaxRaf = null;

document.addEventListener('mousemove', (e) => {
  if (parallaxRaf) return;
  parallaxRaf = requestAnimationFrame(() => {
    parallaxRaf = null;
    const x = (e.clientX / window.innerWidth - 0.5) * 2;
    const y = (e.clientY / window.innerHeight - 0.5) * 2;

    depthElements.forEach((el, i) => {
      const factor = (i + 1) * 3;
      el.style.transform = `translate(${x * factor}px, ${y * factor}px)`;
    });

    document.querySelectorAll('.hero-blob').forEach((blob, i) => {
      const factor = (i + 1) * 0.5;
      blob.style.transform = `translate(${x * 10 * factor}px, ${y * 10 * factor}px)`;
    });
  });
});

// loading screen
const loadingScreen = document.getElementById('loadingScreen');
const loadingBar = document.getElementById('loadingBar');
const skipBtn = document.getElementById('skipIntro');
let loadingProgress = 0;
let loadingComplete = false;

const particleCanvas = document.getElementById('particleCanvas');
const pCtx = particleCanvas.getContext('2d');
let particleW, particleH;
let particles = [];

function resizeParticleCanvas() {
  particleW = particleCanvas.width = window.innerWidth;
  particleH = particleCanvas.height = window.innerHeight;
}
resizeParticleCanvas();
window.addEventListener('resize', resizeParticleCanvas);

class Particle {
  constructor() {
    this.reset();
  }
  reset() {
    this.x = Math.random() * particleW;
    this.y = Math.random() * particleH;
    this.size = Math.random() * 2 + 0.5;
    this.speedX = (Math.random() - 0.5) * 0.5;
    this.speedY = (Math.random() - 0.5) * 0.5;
    this.opacity = Math.random() * 0.5 + 0.1;
    this.hue = Math.random() > 0.5 ? 35 : 25;
  }
  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    if (this.x < 0 || this.x > particleW || this.y < 0 || this.y > particleH) this.reset();
  }
  draw() {
    pCtx.beginPath();
    pCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    pCtx.fillStyle = `hsla(${this.hue}, 50%, 70%, ${this.opacity})`;
    pCtx.fill();
  }
}

for (let i = 0; i < 80; i++) particles.push(new Particle());

function animateParticles() {
  pCtx.clearRect(0, 0, particleW, particleH);
  particles.forEach(p => { p.update(); p.draw(); });
  // draw connections between close particles
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 150) {
        pCtx.beginPath();
        pCtx.moveTo(particles[i].x, particles[i].y);
        pCtx.lineTo(particles[j].x, particles[j].y);
        pCtx.strokeStyle = `hsla(35, 50%, 70%, ${0.05 * (1 - dist / 150)})`;
        pCtx.lineWidth = 0.5;
        pCtx.stroke();
      }
    }
  }
  requestAnimationFrame(animateParticles);
}
animateParticles();

// simulate loading progress
function simulateLoading() {
  const interval = setInterval(() => {
    loadingProgress += Math.random() * 6 + 2;
    if (loadingProgress >= 100) {
      loadingProgress = 100;
      clearInterval(interval);
      loadingComplete = true;
      convergeToBunny();
      setTimeout(hideLoading, 800);
    }
    loadingBar.style.width = loadingProgress + '%';
  }, 100);
}
simulateLoading();

// bunny shape points for particle convergence
const bunnyPoints = (() => {
  const pts = [];
  for (let i = 0; i < 200; i++) {
    const angle = Math.random() * Math.PI * 2;
    const r = 0.3 + Math.random() * 0.3;
    const baseX = 0.5 + Math.cos(angle) * r;
    const baseY = 0.5 + Math.sin(angle) * r * 0.9;
    let x = baseX;
    let y = baseY;
    // left ear
    if (Math.random() < 0.15) {
      x = 0.4 + (Math.random() - 0.5) * 0.08;
      y = 0.15 + Math.random() * 0.2;
    }
    // right ear
    else if (Math.random() < 0.15) {
      x = 0.6 + (Math.random() - 0.5) * 0.08;
      y = 0.15 + Math.random() * 0.2;
    }
    // face center
    else if (Math.random() < 0.3) {
      x = 0.5 + (Math.random() - 0.5) * 0.2;
      y = 0.5 + (Math.random() - 0.5) * 0.2;
    }
    pts.push({ x: x * particleW, y: y * particleH });
  }
  return pts;
})();

let converging = false;

function convergeToBunny() {
  converging = true;
  particles.forEach((p, i) => {
    const target = bunnyPoints[i % bunnyPoints.length];
    p.targetX = target.x;
    p.targetY = target.y;
    p.speedX = 0;
    p.speedY = 0;
  });
}

// override particle update during convergence
const _origParticleUpdate = Particle.prototype.update;
Particle.prototype.update = function() {
  if (converging && this.targetX != null) {
    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    this.x += dx * 0.03;
    this.y += dy * 0.03;
    this.opacity = Math.min(1, this.opacity + 0.01);
    this.size = Math.min(3, this.size + 0.05);
    return;
  }
  _origParticleUpdate.call(this);
};

function hideLoading() {
  if (!loadingScreen.classList.contains('hidden')) {
    loadingScreen.classList.add('hidden');
    document.body.style.overflow = '';
    startHeroParticles();
    startTypingEffect();
  }
}

skipBtn.addEventListener('click', () => {
  if (!loadingComplete) {
    loadingProgress = 100;
    loadingBar.style.width = '100%';
    loadingComplete = true;
    if (!converging) convergeToBunny();
    setTimeout(hideLoading, 600);
  } else {
    hideLoading();
  }
});

// fallback auto-hide after 4s
let loadTimer = setTimeout(() => {
  if (!loadingComplete) {
    loadingProgress = 100;
    loadingBar.style.width = '100%';
    loadingComplete = true;
    if (!converging) convergeToBunny();
    setTimeout(hideLoading, 800);
  }
}, 4000);

// hero particle canvas (mouse interactive)
function startHeroParticles() {
  const heroCanvas = document.getElementById('heroCanvas');
  if (!heroCanvas) return;
  const ctx = heroCanvas.getContext('2d');
  let w, h;
  const heroParticles = [];
  const mouse = { x: -1000, y: -1000 };

  function resize() {
    const rect = heroCanvas.parentElement.getBoundingClientRect();
    w = heroCanvas.width = rect.width;
    h = heroCanvas.height = rect.height;
  }
  resize();
  window.addEventListener('resize', resize);

  document.addEventListener('mousemove', (e) => {
    const rect = heroCanvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });

  class HeroParticle {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = Math.random() * w;
      this.y = Math.random() * h;
      this.size = Math.random() * 2 + 0.5;
      this.speedX = (Math.random() - 0.5) * 0.3;
      this.speedY = (Math.random() - 0.5) * 0.3;
      this.opacity = Math.random() * 0.4 + 0.1;
    }
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      const dx = mouse.x - this.x;
      const dy = mouse.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 200) {
        const force = (200 - dist) / 200;
        this.x -= dx * force * 0.01;
        this.y -= dy * force * 0.01;
      }
      if (this.x < 0 || this.x > w || this.y < 0 || this.y > h) this.reset();
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(212, 165, 116, ${this.opacity})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < 35; i++) heroParticles.push(new HeroParticle());

  function animate() {
    ctx.clearRect(0, 0, w, h);
    heroParticles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animate);
  }
  animate();
}

// typing effect
const typingElement = document.getElementById('typingText');
let typingStarted = false;

function startTypingEffect() {
  if (!typingElement || typingStarted) return;
  typingStarted = true;
  
  const phrases = ['web apps, and games.', 'interactive tools.', 'things people use.'];
  let phraseIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  function typeEffect() {
    if (!typingElement) return;
    const currentPhrase = phrases[phraseIndex];

    if (!isDeleting) {
      typingElement.textContent = currentPhrase.substring(0, charIndex + 1);
      charIndex++;
      if (charIndex === currentPhrase.length) {
        isDeleting = true;
        setTimeout(typeEffect, 2500);
        return;
      }
      setTimeout(typeEffect, 60);
    } else {
      typingElement.textContent = currentPhrase.substring(0, charIndex - 1);
      charIndex--;
      if (charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        setTimeout(typeEffect, 400);
        return;
      }
      setTimeout(typeEffect, 30);
    }
  }
  typeEffect();
}

// start typing if loading screen already hidden
if (!loadingScreen.classList.contains('hidden')) {
  // will be started by hideLoading
} else {
  setTimeout(startTypingEffect, 500);
}

// magnetic buttons effect
document.querySelectorAll('.magnetic-btn').forEach(btn => {
  btn.addEventListener('mousemove', (e) => {
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
  });

  btn.addEventListener('mouseleave', () => {
    btn.style.transform = 'translate(0, 0)';
  });
});

// scroll progress bar
const scrollProgress = document.getElementById('scrollProgress');
window.addEventListener('scroll', () => {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = (scrollTop / docHeight) * 100;
  scrollProgress.style.width = progress + '%';
});

// navbar behavior
const navbar = document.getElementById('navbar');
const mobileToggle = document.getElementById('mobileToggle');
const navLinks = document.getElementById('navLinks');

window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }

  // highlight active section
  const sections = document.querySelectorAll('section[id]');
  let current = '';
  sections.forEach(section => {
    const top = section.offsetTop - 200;
    if (window.scrollY >= top) current = section.id;
  });
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.toggle('active', link.dataset.section === current);
  });
});

mobileToggle.addEventListener('click', () => {
  mobileToggle.classList.toggle('active');
  navLinks.classList.toggle('open');
});

// close mobile nav on link click
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    mobileToggle.classList.remove('active');
    navLinks.classList.remove('open');
  });
});

// scroll reveal with IntersectionObserver
const revealElements = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

revealElements.forEach(el => revealObserver.observe(el));

// timeline items
const timelineItems = document.querySelectorAll('.timeline-item');
const timelineObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.2 });

timelineItems.forEach(item => timelineObserver.observe(item));

// stat counters
const statNumbers = document.querySelectorAll('.stat-number');

const statObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const target = parseInt(entry.target.dataset.target);
      animateCounter(entry.target, target);
      statObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

statNumbers.forEach(stat => statObserver.observe(stat));

function animateCounter(element, target) {
  if (target === 0) {
    element.textContent = '0+';
    return;
  }
  let current = 0;
  const increment = target / 60;
  const interval = setInterval(() => {
    current += increment;
    if (current >= target) {
      current = target;
      clearInterval(interval);
    }
    element.textContent = Math.floor(current) + '+';
  }, 20);
}

// project filtering + search
const filterBtns = document.querySelectorAll('.filter-btn');
const galleryItems = document.querySelectorAll('.gallery-item');
const searchInput = document.getElementById('projectSearch');

function filterProjects() {
  const activeFilter = document.querySelector('.filter-btn.active');
  const filter = activeFilter ? activeFilter.dataset.filter : 'all';
  const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';

  galleryItems.forEach(item => {
    const matchesFilter = filter === 'all' || item.dataset.category === filter;
    const title = item.querySelector('h4')?.textContent?.toLowerCase() || '';
    const tags = item.querySelector('span')?.textContent?.toLowerCase() || '';
    const matchesSearch = !searchTerm || title.includes(searchTerm) || tags.includes(searchTerm);
    
    if (matchesFilter && matchesSearch) {
      item.classList.remove('hidden');
    } else {
      item.classList.add('hidden');
    }
  });
}

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    filterProjects();
  });
});

if (searchInput) {
  searchInput.addEventListener('input', filterProjects);
}

// contact form -> discord webhook
const contactForm = document.getElementById('contactForm');
const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1530187373080481873/aAdTpXpSgZ4kPmU1YMSPvKe4ztCRvWVR48_3DaGBW2y_jlbeRGW-RJ3l-xCJ8FQEKtlb';

const RATE_LIMIT = {
  COOLDOWN_MS: 30000,
  MAX_SUBMISSIONS: 3,
  WINDOW_MS: 3600000
};

function getRateLimitData() {
  try {
    const data = localStorage.getItem('portfolio_ratelimit');
    return data ? JSON.parse(data) : { timestamps: [], cooldownUntil: 0 };
  } catch {
    return { timestamps: [], cooldownUntil: 0 };
  }
}

function saveRateLimitData(data) {
  try {
    localStorage.setItem('portfolio_ratelimit', JSON.stringify(data));
  } catch { /* storage might be blocked */ }
}

function checkRateLimit() {
  const now = Date.now();
  const data = getRateLimitData();

  if (data.cooldownUntil > now) {
    const remaining = Math.ceil((data.cooldownUntil - now) / 1000);
    return { allowed: false, reason: 'cooldown', remaining };
  }

  data.timestamps = data.timestamps.filter(ts => now - ts < RATE_LIMIT.WINDOW_MS);

  if (data.timestamps.length >= RATE_LIMIT.MAX_SUBMISSIONS) {
    const oldest = data.timestamps[0];
    const resetIn = Math.ceil((oldest + RATE_LIMIT.WINDOW_MS - now) / 1000);
    return { allowed: false, reason: 'max_reached', remaining: resetIn };
  }

  return { allowed: true };
}

function recordSubmission() {
  const now = Date.now();
  const data = getRateLimitData();
  data.timestamps.push(now);
  data.cooldownUntil = now + RATE_LIMIT.COOLDOWN_MS;
  saveRateLimitData(data);
}

function formatCooldown(seconds) {
  if (seconds >= 60) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  }
  return `${seconds}s`;
}

if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = contactForm.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;

    const check = checkRateLimit();
    if (!check.allowed) {
      if (check.reason === 'cooldown') {
        btn.innerHTML = `<span>Wait ${formatCooldown(check.remaining)}</span>`;
      } else {
        const minutes = Math.ceil(check.remaining / 60);
        btn.innerHTML = `<span>Limit reached — try in ${minutes}m</span>`;
      }
      btn.style.pointerEvents = 'none';
      setTimeout(() => {
        btn.innerHTML = originalText;
        btn.style.pointerEvents = '';
      }, 2500);
      return;
    }
    
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const subject = document.getElementById('subject').value.trim();
    const message = document.getElementById('message').value.trim();
    
    if (!name || !email || !message) {
      btn.innerHTML = '<span>Please fill required fields</span>';
      setTimeout(() => { btn.innerHTML = originalText; }, 2000);
      return;
    }
    
    btn.innerHTML = '<span>Sending...</span>';
    btn.style.pointerEvents = 'none';
    
    if (DISCORD_WEBHOOK_URL) {
      try {
        const embed = {
          embeds: [{
            title: 'New Portfolio Contact Message',
            color: 13934836,
            fields: [
              { name: 'Name', value: name, inline: true },
              { name: 'Email', value: email, inline: true },
              { name: 'Subject', value: subject || 'No subject', inline: false },
              { name: 'Message', value: message, inline: false }
            ],
            timestamp: new Date().toISOString()
          }]
        };
        
        const res = await fetch(DISCORD_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(embed)
        });
        
        if (!res.ok) throw new Error('Webhook failed');
        
        recordSubmission();
        
        btn.innerHTML = '<span>Message Sent!</span>';
        setTimeout(() => {
          btn.innerHTML = originalText;
          btn.style.pointerEvents = '';
          contactForm.reset();
        }, 2000);
      } catch (err) {
        console.error('Discord webhook error:', err);
        btn.innerHTML = '<span>Failed to send. Try again?</span>';
        setTimeout(() => {
          btn.innerHTML = originalText;
          btn.style.pointerEvents = '';
        }, 2000);
      }
    } else {
      btn.innerHTML = '<span>Message Sent!</span>';
      setTimeout(() => {
        btn.innerHTML = originalText;
        btn.style.pointerEvents = '';
        contactForm.reset();
      }, 2000);
    }
  });
}

// back to top
const backToTop = document.getElementById('backToTop');
backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const href = this.getAttribute('href');
    if (href === '#') return;
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// start particles & typing if loading was already skipped
if (loadingScreen.classList.contains('hidden')) {
  startHeroParticles();
  startTypingEffect();
}
