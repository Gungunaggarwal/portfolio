/* ==========================================================================
   app.js — Gungun Aggarwal Portfolio
   - Liquid cursor follower
   - Floating project image preview (Justis Cooper-style)
   - 3D card tilt effects (Marius Ballot-style)
   - Scroll reveal observer
   - Theme toggle
   - Mobile nav
   - FormSubmit.co AJAX email handler
   ========================================================================== */

(function () {
    'use strict';

    /* ------------------------------------------------------------------
       1. LIQUID CURSOR
    ------------------------------------------------------------------ */
    const cursorDot  = document.getElementById('cursor-dot');
    const cursorRing = document.getElementById('cursor-ring');

    let mouseX = 0, mouseY = 0;
    let ringX = 0, ringY = 0;
    const RING_EASE = 0.14;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        if (cursorDot) {
            cursorDot.style.left = mouseX + 'px';
            cursorDot.style.top  = mouseY + 'px';
        }
    });

    function animateRing() {
        ringX += (mouseX - ringX) * RING_EASE;
        ringY += (mouseY - ringY) * RING_EASE;
        if (cursorRing) {
            cursorRing.style.left = ringX + 'px';
            cursorRing.style.top  = ringY + 'px';
        }
        requestAnimationFrame(animateRing);
    }
    animateRing();

    // Grow ring on hoverable elements
    const hoverables = 'a, button, .project-row, .cert-card, .exp-item, .tag, input, textarea';
    document.addEventListener('mouseover', (e) => {
        if (e.target.closest(hoverables)) {
            cursorRing && cursorRing.classList.add('hovered');
        }
    });
    document.addEventListener('mouseout', (e) => {
        if (e.target.closest(hoverables)) {
            cursorRing && cursorRing.classList.remove('hovered');
        }
    });
    document.addEventListener('mousedown', () => cursorRing && cursorRing.classList.add('clicking'));
    document.addEventListener('mouseup',   () => cursorRing && cursorRing.classList.remove('clicking'));

    /* ------------------------------------------------------------------
       2. FLOATING PROJECT IMAGE PREVIEW (follows mouse)
    ------------------------------------------------------------------ */
    const floatPreview = document.getElementById('project-float-preview');
    const floatImg     = document.getElementById('project-float-img');

    let previewX = 0, previewY = 0;
    let targetX = 0, targetY = 0;
    const PREVIEW_EASE = 0.085;
    const OFFSET_X = 28; // offset so it doesn't cover the row text
    const OFFSET_Y = -110;

    function animatePreview() {
        previewX += (targetX - previewX) * PREVIEW_EASE;
        previewY += (targetY - previewY) * PREVIEW_EASE;
        if (floatPreview) {
            floatPreview.style.left = previewX + 'px';
            floatPreview.style.top  = previewY + 'px';
        }
        requestAnimationFrame(animatePreview);
    }
    animatePreview();

    const projectRows = document.querySelectorAll('.project-row');

    projectRows.forEach((row) => {
        const imgSrc = row.getAttribute('data-img');
        const href   = row.getAttribute('data-href');

        // Clicking the whole row navigates to the project link
        row.addEventListener('click', () => {
            if (href) window.open(href, '_blank', 'noopener');
        });

        row.addEventListener('mouseenter', () => {
            if (!floatPreview || !floatImg) return;
            floatImg.src = imgSrc || '';
            floatImg.alt = row.querySelector('.project-title')?.textContent || '';
            floatPreview.classList.add('visible');
        });

        row.addEventListener('mousemove', (e) => {
            targetX = e.clientX + OFFSET_X;
            targetY = e.clientY + OFFSET_Y;
        });

        row.addEventListener('mouseleave', () => {
            if (!floatPreview) return;
            floatPreview.classList.remove('visible');
        });
    });

    /* ------------------------------------------------------------------
       3. 3D TILT CARDS (Marius Ballot-style)
    ------------------------------------------------------------------ */
    const tiltCards = document.querySelectorAll('.tilt-card');
    const TILT_STRENGTH = 8; // degrees

    tiltCards.forEach((card) => {
        card.addEventListener('mousemove', (e) => {
            const rect   = card.getBoundingClientRect();
            const cx     = rect.left + rect.width  / 2;
            const cy     = rect.top  + rect.height / 2;
            const dx     = (e.clientX - cx) / (rect.width  / 2);
            const dy     = (e.clientY - cy) / (rect.height / 2);
            const rotateX = -dy * TILT_STRENGTH;
            const rotateY =  dx * TILT_STRENGTH;
            card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.015)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) scale(1)';
        });
    });

    /* ------------------------------------------------------------------
       4. SCROLL REVEAL
    ------------------------------------------------------------------ */
    const revealEls = document.querySelectorAll('.reveal-up');

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                revealObserver.unobserve(entry.target); // once is enough
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    revealEls.forEach((el) => revealObserver.observe(el));

    /* ------------------------------------------------------------------
       5. THEME TOGGLE
    ------------------------------------------------------------------ */
    const themeBtn = document.getElementById('theme-toggle');
    const body     = document.body;
    const saved    = localStorage.getItem('ga-theme') || 'dark';

    function applyTheme(theme) {
        body.classList.remove('dark', 'light');
        body.classList.add(theme);
        localStorage.setItem('ga-theme', theme);
    }
    applyTheme(saved);

    themeBtn && themeBtn.addEventListener('click', () => {
        const next = body.classList.contains('dark') ? 'light' : 'dark';
        applyTheme(next);
    });

    /* ------------------------------------------------------------------
       6. MOBILE NAVIGATION
    ------------------------------------------------------------------ */
    const mobileToggle = document.getElementById('mobile-nav-toggle');
    const mobileDrawer = document.getElementById('mobile-drawer');
    const drawerLinks  = document.querySelectorAll('.drawer-link');

    function toggleDrawer(forceClose = false) {
        const isOpen = mobileDrawer.classList.contains('open');
        if (forceClose || isOpen) {
            mobileDrawer.classList.remove('open');
            body.style.overflow = '';
        } else {
            mobileDrawer.classList.add('open');
            body.style.overflow = 'hidden';
        }
    }

    mobileToggle && mobileToggle.addEventListener('click', () => toggleDrawer());
    drawerLinks.forEach(link => link.addEventListener('click', () => toggleDrawer(true)));

    /* ------------------------------------------------------------------
       7. ACTIVE NAV LINK ON SCROLL
    ------------------------------------------------------------------ */
    const navLinks    = document.querySelectorAll('.nav-link');
    const sections    = document.querySelectorAll('section[id]');

    const navObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
                });
            }
        });
    }, { rootMargin: '-30% 0px -60% 0px' });

    sections.forEach(s => navObserver.observe(s));

    /* ------------------------------------------------------------------
       8. CONTACT FORM — FormSubmit.co AJAX
    ------------------------------------------------------------------ */
    const contactForm   = document.getElementById('contact-form');
    const formFeedback  = document.getElementById('form-feedback');
    const formSubmitBtn = document.getElementById('form-submit-btn');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name    = document.getElementById('form-name').value.trim();
            const email   = document.getElementById('form-email').value.trim();
            const subject = document.getElementById('form-subject').value.trim();
            const message = document.getElementById('form-message').value.trim();

            if (!name || !email || !subject || !message) {
                showFeedback('Please fill in all fields.', 'error');
                return;
            }

            // Loading state
            const btnText  = formSubmitBtn.querySelector('.btn-text');
            const btnArrow = formSubmitBtn.querySelector('.btn-arrow');
            formSubmitBtn.disabled = true;
            if (btnText)  btnText.textContent = 'Sending…';
            if (btnArrow) btnArrow.textContent = '…';

            fetch('https://formsubmit.co/ajax/gungunaggarwal15@gmail.com', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ Name: name, Email: email, Subject: subject, Message: message })
            })
            .then(res => {
                if (!res.ok) throw new Error('Network error');
                return res.json();
            })
            .then(() => {
                showFeedback(`Thank you, ${name}! Your message has been sent.`, 'success');
                contactForm.reset();
            })
            .catch(() => {
                showFeedback('Something went wrong. Please try emailing directly.', 'error');
            })
            .finally(() => {
                formSubmitBtn.disabled = false;
                if (btnText)  btnText.textContent = 'Send Message';
                if (btnArrow) btnArrow.textContent = '→';
            });
        });
    }

    function showFeedback(text, type) {
        if (!formFeedback) return;
        formFeedback.textContent = text;
        formFeedback.className = `form-feedback ${type}`;
        if (type === 'success') {
            setTimeout(() => {
                formFeedback.className = 'form-feedback hidden';
            }, 6000);
        }
    }

})();
