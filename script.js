/* ============================================================
   BALASUBRAMANI B — PORTFOLIO SCRIPT
   Handles: cursor, nav scroll, IntersectionObserver reveals,
            count-up stats, mobile nav, skills glass effect
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── 1. CUSTOM CURSOR ── */
  const dot   = document.createElement('div');
  const trail = document.createElement('div');
  dot.className   = 'cursor-dot';
  trail.className = 'cursor-trail';
  document.body.append(dot, trail);

  let mx = 0, my = 0, tx = 0, ty = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
  });

  // Trail lags behind with rAF lerp
  (function animateTrail() {
    tx += (mx - tx) * 0.13;
    ty += (my - ty) * 0.13;
    trail.style.left = tx + 'px';
    trail.style.top  = ty + 'px';
    requestAnimationFrame(animateTrail);
  })();

  /* ── 2. NAV — hide on scroll down, show on scroll up ── */
  const nav = document.querySelector('nav');
  let lastY = 0;

  window.addEventListener('scroll', () => {
    const y = window.scrollY;

    if (y > 80) {
      nav.classList.add('nav--scrolled');
    } else {
      nav.classList.remove('nav--scrolled');
    }

    if (y > lastY && y > 120) {
      nav.classList.add('nav--hidden');
    } else {
      nav.classList.remove('nav--hidden');
    }

    lastY = y;
  }, { passive: true });

  /* ── 3. MOBILE HAMBURGER ── */
  const hamburger  = document.createElement('button');
  hamburger.className = 'nav-hamburger';
  hamburger.setAttribute('aria-label', 'Open navigation menu');
  hamburger.setAttribute('aria-expanded', 'false');
  hamburger.setAttribute('aria-controls', 'mobile-navigation');
  hamburger.innerHTML = '<span></span><span></span><span></span>';
  nav.appendChild(hamburger);

  const mobileMenu = document.createElement('div');
  mobileMenu.className = 'nav-mobile-menu';
  mobileMenu.id = 'mobile-navigation';

  const mobileNavItems = [
    { label: 'About', href: '#about' },
    { label: 'Skills', href: '#skills' },
    { label: 'Projects', href: '#projects' },
    { label: 'Experience', href: '#experience' },
    { label: 'Resume', href: '#resume' },
    { label: 'Contact', href: '#contact' },
    { label: 'Get in touch ↗', href: 'mailto:bala026b@gmail.com', className: 'nav-mobile-cta' },
  ];

  mobileNavItems.forEach(({ label, href, className }) => {
    const a = document.createElement('a');
    a.href = href;
    a.textContent = label;
    if (className) a.className = className;
    mobileMenu.appendChild(a);
  });
  document.body.appendChild(mobileMenu);

   const setMobileMenuOpen = isOpen => {
    hamburger.classList.toggle('open', isOpen);
    mobileMenu.classList.toggle('open', isOpen);
    document.body.classList.toggle('mobile-menu-open', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
    hamburger.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
  };

  hamburger.addEventListener('click', () => {
    setMobileMenuOpen(!mobileMenu.classList.contains('open'));
  });

  mobileMenu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      setMobileMenuOpen(false);
    });
  });

   document.addEventListener('keydown', e => {
    if (e.key === 'Escape') setMobileMenuOpen(false);
  });

  /* ── 4. HERO IMAGE — load from data attr or localStorage ── */
  // The HTML sets <img id="heroImg"> — src should be set by the user
  // We mirror heroImg src to resumeImg automatically
  const heroImg   = document.getElementById('heroImg');
  const resumeImg = document.getElementById('resumeImg');
  if (heroImg) {
    heroImg.src = 'data:image/png;base64,' + b64;
  }

  if (heroImg && resumeImg) {
     resumeImg.src = 'data:image/png;base64,' + b64;
    const syncSrc = () => {
      if (heroImg.src) resumeImg.src = heroImg.src;
    };
    heroImg.addEventListener('load', syncSrc);
    // Also try immediately in case already set
    if (heroImg.src) syncSrc();

    // MutationObserver in case src is set dynamically
    new MutationObserver(syncSrc).observe(heroImg, { attributes: true, attributeFilter: ['src'] });
  }

  /* ── 5. COUNT-UP ANIMATION (hero stats) ── */
  const countEls = document.querySelectorAll('.stat-num');

  countEls.forEach(el => {
    const raw    = el.textContent.trim();          // e.g. "5+", "8.5", "2"
    const suffix = raw.replace(/[\d.]/g, '');      // "+", "", ""
    const target = parseFloat(raw);
    const isFloat = raw.includes('.');
    const duration = 1200;
    const start  = performance.now();

    const tick = now => {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased    = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
      const value    = eased * target;

      el.textContent = (isFloat ? value.toFixed(1) : Math.floor(value)) + suffix;

      if (progress < 1) requestAnimationFrame(tick);
    };

    // Delay slightly to sync with CSS fade-in
    setTimeout(() => requestAnimationFrame(tick), 400);
  });

  /* ── 6. INTERSECTION OBSERVER — scroll reveal ── */
  const revealObserver = new IntersectionObserver(
    entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          // Don't un-reveal on scroll back up
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
  );

  document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => {
    revealObserver.observe(el);
  });

  /* ── 7. PROJECT ITEMS — slide in from left ── */
  document.querySelectorAll('.project-item').forEach((item, i) => {
    item.classList.add('reveal-left');
    item.style.transitionDelay = (i * 0.08) + 's';
    revealObserver.observe(item);
  });

  /* ── 8. GLASSMORPHISM — brief blur on skill cards as section enters/exits ── */
  const skillsSection = document.getElementById('skills');
  const skillCards    = document.querySelectorAll('.skill-card');

  if (skillsSection) {
    const glassObserver = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          if (e.isIntersecting && e.intersectionRatio > 0.1) {
            // Section scrolling into view — trigger frosted glass flash
            skillsSection.classList.add('skills-in-view');
            skillsSection.classList.remove('skills-gone');
          } else if (!e.isIntersecting) {
            // Section fully scrolled past — dissolve blur
            skillsSection.classList.remove('skills-in-view');
            skillsSection.classList.add('skills-gone');
          }
        });
      },
      { threshold: [0, 0.1, 0.5, 1.0] }
    );

    glassObserver.observe(skillsSection);
  }

  /* ── 9. RESUME SECTION — staggered reveal ── */
  const resumeContent = document.querySelector('.resume-content');
  const resumePhoto   = document.querySelector('.resume-photo');

  if (resumeContent) resumeContent.classList.add('reveal');
  if (resumePhoto)   resumePhoto.classList.add('reveal-right');

  if (resumeContent) revealObserver.observe(resumeContent);
  if (resumePhoto)   revealObserver.observe(resumePhoto);

  /* ── 10. STAGGER SKILL CARDS ── */
  skillCards.forEach((card, i) => {
    card.classList.add('reveal');
    card.style.transitionDelay = (i * 0.06) + 's';
    revealObserver.observe(card);
  });

});
