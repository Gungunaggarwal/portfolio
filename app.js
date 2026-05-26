document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Lucide Icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // 2. Light / Dark Theme Toggle
    const themeToggleBtn = document.getElementById('theme-toggle');
    const body = document.body;

    // Check saved theme or preference
    const savedTheme = localStorage.getItem('portfolio-theme') || 'dark';
    if (savedTheme === 'light') {
        body.classList.remove('dark-theme');
        body.classList.add('light-theme');
        updateThemeIcon('light');
    } else {
        body.classList.remove('light-theme');
        body.classList.add('dark-theme');
        updateThemeIcon('dark');
    }

    themeToggleBtn.addEventListener('click', () => {
        if (body.classList.contains('dark-theme')) {
            body.classList.remove('dark-theme');
            body.classList.add('light-theme');
            localStorage.setItem('portfolio-theme', 'light');
            updateThemeIcon('light');
        } else {
            body.classList.remove('light-theme');
            body.classList.add('dark-theme');
            localStorage.setItem('portfolio-theme', 'dark');
            updateThemeIcon('dark');
        }
    });

    function updateThemeIcon(theme) {
        // Redraw icons if needed (Lucide handles updating class states since they are in DOM)
        // Lucide's moon and sun are styled via CSS toggles, but we can verify accessibility here
        themeToggleBtn.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`);
    }


    // 3. Typing Animation
    const words = [
        "Software Engineer",
        "Spring Boot Specialist",
        "Machine Learning Enthusiast",
        "Problem Solver"
    ];
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    const typingSpan = document.getElementById('typing-text');
    const typingDelay = 120;
    const erasingDelay = 60;
    const newWordDelay = 2000;

    function type() {
        if (!typingSpan) return;
        const currentWord = words[wordIndex];
        
        if (isDeleting) {
            typingSpan.textContent = currentWord.substring(0, charIndex - 1);
            charIndex--;
        } else {
            typingSpan.textContent = currentWord.substring(0, charIndex + 1);
            charIndex++;
        }

        let typeSpeed = isDeleting ? erasingDelay : typingDelay;

        if (!isDeleting && charIndex === currentWord.length) {
            typeSpeed = newWordDelay;
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            wordIndex = (wordIndex + 1) % words.length;
            typeSpeed = 500; // brief pause before typing next word
        }

        setTimeout(type, typeSpeed);
    }
    
    // Start typing loop
    setTimeout(type, 1000);


    // 4. Mobile Menu Toggle
    const mobileMenuToggleBtn = document.querySelector('.mobile-menu-toggle');
    const mobileNavOverlay = document.querySelector('.mobile-nav-overlay');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-item');
    const navMenuIcon = mobileMenuToggleBtn.querySelector('.icon-menu');
    const navCloseIcon = mobileMenuToggleBtn.querySelector('.icon-close');

    function toggleMobileMenu() {
        const isOpen = mobileNavOverlay.classList.toggle('open');
        mobileMenuToggleBtn.setAttribute('aria-expanded', isOpen);
        
        if (isOpen) {
            navMenuIcon.style.display = 'none';
            navCloseIcon.style.display = 'block';
            body.style.overflow = 'hidden'; // Prevent scrolling
        } else {
            navMenuIcon.style.display = 'block';
            navCloseIcon.style.display = 'none';
            body.style.overflow = 'auto'; // Re-enable scrolling
        }
    }

    mobileMenuToggleBtn.addEventListener('click', toggleMobileMenu);

    // Close menu when link is clicked
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (mobileNavOverlay.classList.contains('open')) {
                toggleMobileMenu();
            }
        });
    });


    // 5. Scroll Spy & Active Nav Link
    const sections = document.querySelectorAll('section');
    const navItems = document.querySelectorAll('.nav-links .nav-item');

    const scrollSpyOptions = {
        root: null,
        rootMargin: '-20% 0px -60% 0px', // Trigger when section occupies mid-screen
        threshold: 0
    };

    const scrollSpyObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const sectionId = entry.target.getAttribute('id');
                
                // Highlight item in navbar
                navItems.forEach(item => {
                    item.classList.remove('active');
                    if (item.getAttribute('href') === `#${sectionId}`) {
                        item.classList.add('active');
                    }
                });
            }
        });
    }, scrollSpyOptions);

    sections.forEach(section => {
        scrollSpyObserver.observe(section);
    });


    // 6. Projects Filtering System
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Add to clicked
            button.classList.add('active');

            const filterValue = button.getAttribute('data-filter');

            projectCards.forEach(card => {
                const cardTech = card.getAttribute('data-tech');
                
                if (filterValue === 'all' || cardTech === filterValue) {
                    card.style.display = 'flex';
                    // Trigger reflow for animation
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'scale(1)';
                    }, 50);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 300); // match transition speed
                }
            });
        });
    });


    // 7. Contact Form Integration (FormSubmit.co AJAX Endpoint)
    const contactForm = document.getElementById('contact-form');
    const formFeedback = document.getElementById('form-feedback');
    const submitBtn = contactForm.querySelector('.btn-submit');

    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('form-name').value.trim();
        const email = document.getElementById('form-email').value.trim();
        const subject = document.getElementById('form-subject').value.trim();
        const message = document.getElementById('form-message').value.trim();

        if (!name || !email || !subject || !message) {
            showFeedback("Please fill in all fields.", "error");
            return;
        }

        // Visual loading state
        submitBtn.disabled = true;
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.innerHTML = `Sending... <i data-lucide="loader-2" class="animate-spin"></i>`;
        if (typeof lucide !== 'undefined') {
            lucide.createIcons(); // refresh dynamically added icon
        }

        // Send submission to Gmail via FormSubmit.co
        fetch("https://formsubmit.co/ajax/gungunaggarwal15@gmail.com", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({
                Name: name,
                Email: email,
                Subject: subject,
                Message: message
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.json();
        })
        .then(data => {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }

            // Success feedback
            showFeedback(`Thank you, ${name}! Your message has been sent to Gungun's Gmail.`, "success");
            contactForm.reset();
        })
        .catch(error => {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
            
            showFeedback("Oops! There was an issue sending your message. Please try again later.", "error");
            console.error("FormSubmit Error:", error);
        });
    });

    function showFeedback(text, type) {
        formFeedback.textContent = text;
        formFeedback.className = `form-feedback ${type}`; // resets hidden
        
        // Auto scroll feedback into view if needed
        formFeedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

        // Auto hide success feedback after 5 seconds
        if (type === 'success') {
            setTimeout(() => {
                formFeedback.className = "form-feedback hidden";
            }, 6000);
        }
    }
});
