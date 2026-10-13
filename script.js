// ==========================================================================
// PORTAVIA PORTFOLIO - SANTHOSH KUMAR J
// Interactive Scripts:
// - Multi-stage Scroll Card Travel & 3D Flip (Hero -> Services -> About)
// - 3D Coin Flip 'Hi' badge with waving hand animation
// - Bottom floating theme switch pill synchronized with navbar toggle
// - Accordion, Number counters, Contact form
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  // ------------------------------------------------------------------------
  // 1. THEME TOGGLER (SYNCHRONIZED TOP TOGGLE & BOTTOM PILL SWITCH)
  // ------------------------------------------------------------------------
  const topThemeBtn = document.getElementById('theme-toggle');
  const bottomThemeSwitch = document.getElementById('bottom-theme-switch');
  const sunIcon = document.getElementById('sun-icon');
  const moonIcon = document.getElementById('moon-icon');

  function getPreferredTheme() {
    const saved = localStorage.getItem('portavia_theme');
    if (saved) return saved;
    return 'dark'; // Always default to Portavia signature dark
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('portavia_theme', theme);

    if (theme === 'dark') {
      if (sunIcon) sunIcon.style.display = 'block';
      if (moonIcon) moonIcon.style.display = 'none';
    } else {
      if (sunIcon) sunIcon.style.display = 'none';
      if (moonIcon) moonIcon.style.display = 'block';
    }
  }

  // If previous session left a light mode flag, reset to dark
  if (localStorage.getItem('portavia_theme') === 'light') {
    localStorage.setItem('portavia_theme', 'dark');
  }

  // Initialize Theme
  applyTheme('dark');

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    applyTheme(current === 'dark' ? 'light' : 'dark');
  }

  if (topThemeBtn) topThemeBtn.addEventListener('click', toggleTheme);
  if (bottomThemeSwitch) bottomThemeSwitch.addEventListener('click', toggleTheme);

  // ------------------------------------------------------------------------
  // ------------------------------------------------------------------------
  // 2. LOTTIE HAND WAVING ANIMATION & 3D COIN FLIP 'HI' BADGE
  // ------------------------------------------------------------------------
  if (typeof lottie !== 'undefined') {
    const lottiePlayers = document.querySelectorAll('.lottie-hand-player');
    lottiePlayers.forEach(container => {
      try {
        lottie.loadAnimation({
          container: container,
          renderer: 'svg',
          loop: true,
          autoplay: true,
          path: 'assets/hand-waving.json'
        });
      } catch (err) {
        console.warn('Lottie player notice:', err);
      }
    });
  }

  const hiBadges = document.querySelectorAll('.hero-hi-badge');
  let isHoveringHi = false;

  hiBadges.forEach(badge => {
    badge.addEventListener('mouseenter', () => {
      isHoveringHi = true;
      badge.classList.add('flipped');
    });

    badge.addEventListener('mouseleave', () => {
      isHoveringHi = false;
      badge.classList.remove('flipped');
    });

    badge.addEventListener('click', () => {
      badge.classList.toggle('flipped');
    });

    badge.addEventListener('touchstart', () => {
      badge.classList.toggle('flipped');
    }, { passive: true });
  });

  // Automatic recurring flip every 5 seconds
  function triggerAutoFlip() {
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;
    if (document.hidden || scrollY > 200 || isHoveringHi) return;

    hiBadges.forEach(badge => {
      badge.classList.add('flipped');
    });

    setTimeout(() => {
      if (!isHoveringHi) {
        hiBadges.forEach(badge => {
          badge.classList.remove('flipped');
        });
      }
    }, 1800);
  }

  // Initial flip after 1.2s on page load
  setTimeout(triggerAutoFlip, 1200);

  // Periodic flip every 5 seconds
  setInterval(triggerAutoFlip, 5000);

  // ------------------------------------------------------------------------
  // 3. SCROLL-LINKED CARD TRAVEL & 3D FLIP (HERO -> SERVICES -> ABOUT)
  // ------------------------------------------------------------------------
  const travelingStage = document.getElementById('traveling-card-stage');
  const flipCard = document.getElementById('hero-flip-card');
  const heroDock = document.getElementById('hero-dock-slot');
  const serviceDock = document.getElementById('service-dock-slot');
  const aboutDock = document.getElementById('about-dock-slot');

  let ticking = false;

  function updateTravelingCard() {
    if (window.innerWidth < 992 || !heroDock || !serviceDock || !aboutDock || !travelingStage) {
      if (travelingStage) travelingStage.style.display = 'none';
      return;
    }

    travelingStage.style.display = 'block';

    const heroRect = heroDock.getBoundingClientRect();
    const serviceRect = serviceDock.getBoundingClientRect();
    const aboutRect = aboutDock.getBoundingClientRect();
    const vh = window.innerHeight;

    // If scrolled past About section, fade out cleanly so it doesn't overlap Experience
    if (aboutRect.bottom < 50) {
      travelingStage.style.opacity = '0';
      travelingStage.style.pointerEvents = 'none';
    } else {
      travelingStage.style.opacity = '1';
      travelingStage.style.pointerEvents = 'auto';
    }

    const scrollY = window.pageYOffset || document.documentElement.scrollTop;
    const heroSlotDocY = heroRect.top + scrollY;
    const serviceSlotDocY = serviceRect.top + scrollY;
    const aboutSlotDocY = aboutRect.top + scrollY;

    // Transition 1: From Hero to Services
    // Starts when scrollY > 40px, completes when the Services dock slot reaches resting position
    const t1Start = 40;
    const t1End = Math.max(t1Start + 120, serviceSlotDocY - 160);

    // Transition 2: From Services to About Me
    const t2Start = serviceSlotDocY + 80;
    const t2End = Math.max(t2Start + 120, aboutSlotDocY - 160);

    let currentX, currentY, rotY, rotZ;

    if (scrollY <= t1Start) {
      // 100% strictly docked at Hero center on initial load and top of page
      currentX = heroRect.left;
      currentY = heroRect.top;
      rotY = 0;
      rotZ = 0;
    } else if (scrollY < t1End) {
      // Traveling from Hero (center) -> Services (right column)
      const p = Math.min(1, Math.max(0, (scrollY - t1Start) / (t1End - t1Start)));
      const ease = 0.5 - 0.5 * Math.cos(p * Math.PI); // smooth cosine ease
      currentX = heroRect.left + (serviceRect.left - heroRect.left) * ease;
      currentY = heroRect.top + (serviceRect.top - heroRect.top) * ease;
      rotY = ease * 180;
      rotZ = Math.sin(p * Math.PI) * 8;
    } else if (scrollY < t2Start) {
      // Fully docked in Services right column
      currentX = serviceRect.left;
      currentY = serviceRect.top;
      rotY = 180;
      rotZ = 0;
    } else if (scrollY < t2End) {
      // Traveling from Services (right column) -> About Me (right column)
      const p = Math.min(1, Math.max(0, (scrollY - t2Start) / (t2End - t2Start)));
      const ease = 0.5 - 0.5 * Math.cos(p * Math.PI);
      currentX = serviceRect.left + (aboutRect.left - serviceRect.left) * ease;
      currentY = serviceRect.top + (aboutRect.top - serviceRect.top) * ease;
      rotY = 180 + ease * 180;
      rotZ = Math.sin(p * Math.PI) * 6;
    } else {
      // Fully docked in About Me right column
      currentX = aboutRect.left;
      currentY = aboutRect.top;
      rotY = 360;
      rotZ = 0;
    }

    travelingStage.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
    if (flipCard) {
      flipCard.style.transform = `rotateY(${rotY}deg) rotateZ(${rotZ}deg)`;
    }

    // Only show the "Hi" badge in Home (Hero); hide it as soon as the card travels to Services and About Me
    const heroHiBadge = document.getElementById('hero-hi-badge');
    if (heroHiBadge) {
      if (scrollY <= t1Start) {
        heroHiBadge.style.opacity = '1';
        heroHiBadge.style.pointerEvents = 'auto';
        heroHiBadge.style.transform = 'scale(1)';
      } else {
        heroHiBadge.style.opacity = '0';
        heroHiBadge.style.pointerEvents = 'none';
        heroHiBadge.style.transform = 'scale(0.85)';
      }
    }
  }

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(() => {
        updateTravelingCard();
        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  window.addEventListener('load', updateTravelingCard);
  updateTravelingCard();

  // ------------------------------------------------------------------------
  // 4. MOBILE NAVIGATION DRAWER
  // ------------------------------------------------------------------------
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileDrawer = document.getElementById('mobile-nav-drawer');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');

  if (mobileMenuBtn && mobileDrawer) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileDrawer.classList.toggle('open');
    });

    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileDrawer.classList.remove('open');
      });
    });
  }

  // ------------------------------------------------------------------------
  // 5. ACTIVE NAV LINK ON SCROLL
  // ------------------------------------------------------------------------
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  function highlightNavOnScroll() {
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;

    sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 160;
      const sectionId = current.getAttribute('id');

      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', highlightNavOnScroll, { passive: true });

  // ------------------------------------------------------------------------
  // 6. ACCORDION (WHAT I CAN DO FOR YOU)
  // ------------------------------------------------------------------------
  const accordionItems = document.querySelectorAll('.accordion-item');

  accordionItems.forEach(item => {
    const trigger = item.querySelector('.accordion-trigger');
    if (trigger) {
      trigger.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        
        // Close other accordion items
        accordionItems.forEach(i => i.classList.remove('active'));

        // If it wasn't active, open it
        if (!isActive) {
          item.classList.add('active');
        }

        // Smoothly adjust traveling card anchor if accordion height shifts
        setTimeout(updateTravelingCard, 150);
        setTimeout(updateTravelingCard, 450);
      });
    }
  });

  // ------------------------------------------------------------------------
  // 7. ANIMATED NUMBER COUNTERS (ABOUT ME STATS - SLOW SMOOTH SPRING REPLAY)
  // ------------------------------------------------------------------------
  const statsContainer = document.querySelector('.stats-counter-row');
  const statNumbers = document.querySelectorAll('.stat-number');
  let animationFrameId = null;

  function runCounters() {
    const startTime = performance.now();
    const duration = 2200; // 2.2 seconds - smooth, clearly visible pace

    function updateCounters(now) {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      // Gentle ease-out cubic curve so numbers roll up gracefully
      const ease = 1 - Math.pow(1 - progress, 3);

      statNumbers.forEach(stat => {
        const target = parseFloat(stat.getAttribute('data-target')) || 0;
        const suffix = stat.getAttribute('data-suffix') || '';
        const currentVal = Math.round(target * ease);
        stat.textContent = currentVal + suffix;
      });

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(updateCounters);
      } else {
        statNumbers.forEach(stat => {
          const target = parseFloat(stat.getAttribute('data-target')) || 0;
          const suffix = stat.getAttribute('data-suffix') || '';
          stat.textContent = target + suffix;
        });
      }
    }

    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    animationFrameId = requestAnimationFrame(updateCounters);
  }

  function resetCounters() {
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    statNumbers.forEach(stat => {
      const suffix = stat.getAttribute('data-suffix') || '';
      stat.textContent = '0' + suffix;
    });
  }

  if (statsContainer) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          runCounters();
        } else {
          // Replay on re-entry matching Framer Portavia's layerInView + replay: true
          resetCounters();
        }
      });
    }, { threshold: 0.35 });

    observer.observe(statsContainer);
  }

  // ------------------------------------------------------------------------
  // 8. CONTACT FORM SUBMISSION TO RESUME EMAIL
  // ------------------------------------------------------------------------
  // 8. CONTACT FORM SUBMISSION TO GMAIL SMTP INBOX (santhoshkumar.j7373@gmail.com)
  // ------------------------------------------------------------------------
  const contactForm = document.getElementById('contact-form');
  const formAlert = document.getElementById('form-status-alert');
  const submitBtn = contactForm ? contactForm.querySelector('.form-submit-btn') : null;

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = document.getElementById('contact-name').value.trim();
      const email = document.getElementById('contact-email').value.trim();
      const message = document.getElementById('contact-message').value.trim();

      if (!name || !email || !message) return;

      // Loading State
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
          <span>Sending...</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="animation: spin 1s linear infinite;">
            <line x1="12" y1="2" x2="12" y2="6"></line>
            <line x1="12" y1="18" x2="12" y2="22"></line>
            <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
            <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
            <line x1="2" y1="12" x2="6" y2="12"></line>
            <line x1="18" y1="12" x2="22" y2="12"></line>
            <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
            <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
          </svg>
        `;
      }

      if (formAlert) {
        formAlert.style.display = 'none';
        formAlert.className = 'form-status-alert';
      }

      const formspreeEndpoint = contactForm.getAttribute('action') || 'https://formspree.io/f/xnpnzkdb';

      // Check if Formspree ID is still the placeholder
      if (formspreeEndpoint.includes('YOUR_FORM_ID')) {
        if (formAlert) {
          formAlert.className = 'form-status-alert error';
          formAlert.innerHTML = `<strong>Formspree Setup Required:</strong> Please replace <code>YOUR_FORM_ID</code> in <code>index.html</code> (line 668: <code>action="https://formspree.io/f/YOUR_FORM_ID"</code>) with your Formspree form ID to receive messages.`;
          formAlert.style.display = 'block';
        }
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = `
            <span>Submit Message</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          `;
        }
        return;
      }

      try {
        const formData = new FormData();
        formData.append('name', name);
        formData.append('email', email);
        formData.append('message', message);
        formData.append('_replyto', email);

        const response = await fetch(formspreeEndpoint, {
          method: 'POST',
          headers: { 'Accept': 'application/json' },
          body: formData
        });

        const data = await response.json();

        if (response.ok) {
          if (formAlert) {
            formAlert.className = 'form-status-alert success';
            formAlert.innerHTML = `<strong>Message Sent!</strong> Thank you, ${name}. Your message has been delivered directly to Santhosh's inbox.`;
            formAlert.style.display = 'block';
          }
          contactForm.reset();
        } else {
          let errorMsg = 'Failed to send message via Formspree.';
          if (data && data.errors && data.errors.length > 0) {
            errorMsg = data.errors.map(err => err.message).join(', ');
          } else if (data && data.error) {
            errorMsg = data.error;
          }
          throw new Error(errorMsg);
        }
      } catch (err) {
        console.error('Contact form error:', err);
        if (formAlert) {
          formAlert.className = 'form-status-alert error';
          formAlert.innerHTML = `<strong>Delivery Notice:</strong> ${err.message || 'Unable to send message via Formspree right now.'}`;
          formAlert.style.display = 'block';
        }
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = `
            <span>Submit Message</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          `;
        }
      }
    });

    // Check URL parameters for fallback redirect feedback
    const urlParams = new URLSearchParams(window.location.search);
    const contactStatus = urlParams.get('contact_status');
    if (contactStatus && formAlert) {
      if (contactStatus === 'sent') {
        formAlert.className = 'form-status-alert success';
        formAlert.innerHTML = '<strong>Message Sent!</strong> Your message has been delivered successfully.';
        formAlert.style.display = 'block';
      }
    }
  }

  // ------------------------------------------------------------------------
  // 9. BACK TO TOP
  // ------------------------------------------------------------------------
  const backToTopBtn = document.getElementById('back-to-top');
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ------------------------------------------------------------------------
  // 10. RESUME MODAL PREVIEW
  // ------------------------------------------------------------------------
  const resumeModal = document.getElementById('resume-modal');
  const resumeModalClose = document.getElementById('resume-modal-close');
  const resumeModalCloseBg = document.getElementById('resume-modal-close-bg');
  const resumeIframe = document.getElementById('resume-pdf-frame');
  const resumeTriggers = document.querySelectorAll('.view-resume-trigger');

  function openResumeModal(e) {
    if (window.innerWidth >= 768 && resumeModal) {
      if (e) e.preventDefault();
      if (resumeIframe && !resumeIframe.src.includes('#view=FitH')) {
        resumeIframe.src = 'assets/Santhosh_Kumar_J_Resume.pdf#view=FitH&toolbar=1';
      }
      resumeModal.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeResumeModal() {
    if (resumeModal) {
      resumeModal.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  resumeTriggers.forEach(trigger => {
    trigger.addEventListener('click', openResumeModal);
  });

  if (resumeModalClose) resumeModalClose.addEventListener('click', closeResumeModal);
  if (resumeModalCloseBg) resumeModalCloseBg.addEventListener('click', closeResumeModal);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && resumeModal && resumeModal.classList.contains('open')) {
      closeResumeModal();
    }
  });
});
