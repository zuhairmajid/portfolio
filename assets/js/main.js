const navToggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.site-nav');
const yearEl = document.querySelector('#year');
const tiltElements = document.querySelectorAll('[data-tilt]');
const canvas = document.getElementById('orb-canvas');

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (navToggle && nav) {
  navToggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });
}

document.addEventListener('click', (event) => {
  if (!nav || !navToggle) return;
  const isClickInside = nav.contains(event.target) || navToggle.contains(event.target);
  if (!isClickInside && nav.classList.contains('is-open')) {
    nav.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
  }
});

if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

if (!prefersReducedMotion && tiltElements.length) {
  tiltElements.forEach((element) => {
    let bounds = element.getBoundingClientRect();
    const handlePointerMove = (event) => {
      bounds = element.getBoundingClientRect();
      const x = event.clientX - bounds.left;
      const y = event.clientY - bounds.top;
      const rotateX = ((y / bounds.height - 0.5) * -10).toFixed(2);
      const rotateY = ((x / bounds.width - 0.5) * 14).toFixed(2);
      element.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    };

    const reset = () => {
      element.style.transform = 'rotateX(0deg) rotateY(0deg)';
    };

    element.addEventListener('pointermove', handlePointerMove);
    element.addEventListener('pointerleave', reset);
    element.addEventListener('pointerup', reset);
  });
}

if (canvas && !prefersReducedMotion) {
  const ctx = canvas.getContext('2d');
  const particles = [];
  const PARTICLE_COUNT = 160;
  let width = 0;
  let height = 0;
  let animationFrame;

  const resize = () => {
    const size = Math.min(window.innerWidth, window.innerHeight) * 0.9;
    width = canvas.width = size;
    height = canvas.height = size;
    createParticles();
  };

  const createParticles = () => {
    particles.length = 0;
    for (let i = 0; i < PARTICLE_COUNT; i += 1) {
      const angle = Math.random() * Math.PI * 2;
      const radius = (Math.sqrt(Math.random()) * width) / 2;
      particles.push({ angle, radius, speed: 0.001 + Math.random() * 0.002, size: 1 + Math.random() * 3 });
    }
  };

  const render = () => {
    ctx.clearRect(0, 0, width, height);
    ctx.save();
    ctx.translate(width / 2, height / 2);

    particles.forEach((particle) => {
      particle.angle += particle.speed;
      const x = Math.cos(particle.angle) * particle.radius;
      const y = Math.sin(particle.angle) * particle.radius * 0.6;
      const depth = (particle.radius / (width / 2)) * 0.8;
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, particle.size * (1 + depth * 2));
      gradient.addColorStop(0, 'rgba(124, 93, 250, 0.9)');
      gradient.addColorStop(1, 'rgba(62, 232, 255, 0.0)');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.ellipse(x, y, particle.size * (1 + depth), particle.size * (1.4 + depth), particle.angle, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();
    animationFrame = requestAnimationFrame(render);
  };

  window.addEventListener('resize', resize);
  resize();
  render();

  window.addEventListener('beforeunload', () => cancelAnimationFrame(animationFrame));
}
