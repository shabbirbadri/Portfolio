// assets/security-features.js

const SecuritySystem = {
    init() {
        this.bindAuthEvents();
        this.initElementProtection();
        this.initTimeDisplay();
        this.logSystemBoot();
    },

    bindAuthEvents() {
        const authBtns = document.querySelectorAll('.auth-btn');
        const authGate = document.getElementById('authGate');
        const hiddenElements = document.querySelectorAll('.hidden-until-auth');
        const body = document.body;
        const clearanceBadge = document.getElementById('clearanceLevelDisplay');

        authBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Rate Limiting simulation: Prevent double clicks
                if(btn.disabled) return;
                authBtns.forEach(b => b.disabled = true);
                
                const clearance = btn.dataset.clearance;
                
                // Simulated Verification Process
                btn.classList.add('verifying');
                const btnText = btn.querySelector('strong');
                const originalText = btnText.innerText;
                btnText.innerText = 'VERIFYING CREDENTIALS...';

                setTimeout(() => {
                    // Auth Success
                    authGate.style.opacity = '0';
                    authGate.style.pointerEvents = 'none';
                    
                    setTimeout(() => {
                        body.classList.remove('is-locked');
                        authGate.remove();
                        
                        hiddenElements.forEach(el => {
                            el.classList.remove('hidden-until-auth');
                            el.style.opacity = '0';
                            setTimeout(() => {
                                el.style.transition = 'opacity 1.5s ease';
                                el.style.opacity = '1';
                            }, 50);
                        });

                        // Set state
                        clearanceBadge.innerText = clearance.toUpperCase();
                        if(clearance === 'professional') {
                            clearanceBadge.style.color = '#64ffda';
                            clearanceBadge.style.borderColor = '#64ffda';
                            this.enableProfessionalView();
                        }

                        // Update 3D Scene if exists
                        if(window.thkScene && window.updateSceneForClearance) {
                            window.updateSceneForClearance(clearance);
                        }

                    }, 1000); // Wait for auth gate fade out
                    
                }, 1500); // Simulated network delay
            });
        });
    },

    enableProfessionalView() {
        // Unhide professional data blocks
        document.querySelectorAll('.professional-data').forEach(el => {
            el.classList.remove('hidden');
        });
        // Add tech grid overlay
        const grid = document.createElement('div');
        grid.className = 'tech-grid-overlay';
        document.body.appendChild(grid);
    },

    initElementProtection() {
        const overlay = document.getElementById('secWarningOverlay');
        let warningTimeout;

        const showWarning = () => {
            overlay.classList.add('active');
            clearTimeout(warningTimeout);
            warningTimeout = setTimeout(() => {
                overlay.classList.remove('active');
            }, 3000);
        };

        // Disable Context Menu
        document.addEventListener('contextmenu', (e) => {
            if(e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
                e.preventDefault();
                showWarning();
            }
        });

        // Disable specific key combinations (F12, Ctrl+Shift+I, Ctrl+U, etc)
        document.addEventListener('keydown', (e) => {
            if (
                e.key === 'F12' ||
                (e.ctrlKey && e.shiftKey && e.key === 'I') ||
                (e.ctrlKey && e.shiftKey && e.key === 'C') ||
                (e.ctrlKey && e.shiftKey && e.key === 'J') ||
                (e.ctrlKey && e.key === 'U') ||
                (e.ctrlKey && e.key === 'S')
            ) {
                e.preventDefault();
                showWarning();
            }
        });

        // Prevent dragging of images/links
        document.addEventListener('dragstart', (e) => {
            if(e.target.tagName === 'IMG' || e.target.tagName === 'A') {
                e.preventDefault();
            }
        });
    },

    initTimeDisplay() {
        const timeEl = document.getElementById('sysTime');
        if(!timeEl) return;
        
        setInterval(() => {
            const now = new Date();
            timeEl.innerText = now.toISOString().split('T')[1].split('.')[0] + ' UTC';
        }, 1000);
    },

    logSystemBoot() {
        console.log("%c SYSTEM INITIALIZATION SEQUENCE STARTED", "color: #00ff00; font-weight: bold; background: #000; padding: 2px 5px;");
        console.log("%c Checking dependencies... OK", "color: #00ff00;");
        console.log("%c Verifying cryptographic signatures... [SIMULATED OK]", "color: #00ff00;");
        console.log("%c Establishing secure connection to WebGL context... OK", "color: #00ff00;");
        console.log("%c Awaiting user clearance...", "color: #ffaa00;");
    }
};

document.addEventListener('DOMContentLoaded', () => {
    SecuritySystem.init();
});