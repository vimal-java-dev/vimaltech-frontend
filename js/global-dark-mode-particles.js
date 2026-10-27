// ===================================================
// ===== 1. PARTICLES INITIALIZATION =====
// ===================================================
function initParticles() {
  const isDark = document.body.classList.contains("dark");

  particlesJS("particles-js", {
    particles: {
      number: { value: 70, density: { enable: true, value_area: 900 } },
      color: { value: isDark ? "#00e5ff" : "#ff9800" },
      shape: { type: "circle" },
      opacity: {
        value: 0.6,
        random: true,
        anim: { enable: true, speed: 0.5, opacity_min: 0.1, sync: false },
      },
      size: { value: 3, random: true },
      line_linked: {
        enable: true,
        distance: 120,
        color: isDark ? "#00bcd4" : "#ffb74d",
        opacity: isDark ? 0.4 : 0.35,
        width: 1,
      },
      move: {
        enable: true,
        speed: 2,
        direction: "none",
        random: true,
        straight: false,
        bounce: false,
      },
    },
    interactivity: {
      detect_on: "canvas",
      events: {
        onhover: { enable: true, mode: "grab" },
        onclick: { enable: false },
        resize: true,
      },
      modes: {
        grab: { distance: 200, line_linked: { opacity: 0.8 } },
      },
    },
    retina_detect: true,
  });
}

function reloadParticles() {
  if (window.pJSDom && window.pJSDom.length > 0) {
    window.pJSDom[0].pJS.fn.vendors.destroypJS();
    window.pJSDom = [];
  }
  const container = document.getElementById("particles-js");
  if (container) container.innerHTML = "";
  initParticles();
}

// ===================================================
// ===== 2. CUSTOM PHYSICS (IDLE TIMER + EXPLOSION) ==
// ===================================================
let mouseX = -9999;
let mouseY = -9999;
let isMousePresent = false;
let hasActuallyMoved = false;

// THE FIX: Idle Timer variables
let isMouseActive = false;
let idleTimeout = null;
let initialX = null;
let initialY = null;

document.addEventListener("mousemove", (e) => {
  // 25-Pixel Deadzone Lock
  if (!hasActuallyMoved) {
    if (initialX === null && initialY === null) {
      initialX = e.clientX;
      initialY = e.clientY;
      return;
    }
    const dx = e.clientX - initialX;
    const dy = e.clientY - initialY;
    if (Math.sqrt(dx * dx + dy * dy) < 25) return;
    hasActuallyMoved = true;
  }

  // Update coordinates
  mouseX = e.clientX;
  mouseY = e.clientY;
  isMousePresent = true;

  // Turn the magnet ON because the mouse is currently moving
  isMouseActive = true;

  // Reset the Idle Timer every time the mouse moves
  clearTimeout(idleTimeout);
  idleTimeout = setTimeout(() => {
    // If the mouse stops moving for 1 second, turn the magnet OFF
    isMouseActive = false;
  }, 1000);
});

document.addEventListener("mouseleave", () => {
  isMousePresent = false;
  isMouseActive = false; // Turn off magnet if mouse leaves window
});

// Click to Explode (Now uses exact click coordinates)
document.addEventListener("click", (e) => {
  if (!window.pJSDom || window.pJSDom.length === 0) return;

  const clickX = e.clientX;
  const clickY = e.clientY;
  const particles = window.pJSDom[0].pJS.particles.array;

  particles.forEach((p) => {
    const dx = p.x - clickX;
    const dy = p.y - clickY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 400 && dist > 0) {
      const force = (400 - dist) / 400;
      p.vx += (dx / dist) * force * 35;
      p.vy += (dy / dist) * force * 35;
    }
  });
});

// The Physics Engine Loop
function applyCustomPhysics() {
  if (window.pJSDom && window.pJSDom.length > 0) {
    const pJS = window.pJSDom[0].pJS;
    const particles = pJS.particles.array;

    // Hide native library cursor tracking if idle or deadzone locked
    if (!hasActuallyMoved || !isMouseActive) {
      pJS.interactivity.mouse.pos_x = null;
      pJS.interactivity.mouse.pos_y = null;
    } else {
      pJS.interactivity.mouse.pos_x = mouseX;
      pJS.interactivity.mouse.pos_y = mouseY;
    }

    particles.forEach((p) => {
      // Air Resistance (Slows them down after explosion)
      if (Math.abs(p.vx) > 1.0 || Math.abs(p.vy) > 1.0) {
        p.vx *= 0.88;
        p.vy *= 0.88;
      }

      // Magnetic Pull (ONLY runs if the mouse is actively moving)
      if (isMouseActive && isMousePresent) {
        const dx = mouseX - p.x;
        const dy = mouseY - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 250 && dist > 0) {
          p.x += dx * 0.015;
          p.y += dy * 0.015;
        }
      }
    });
  }
  requestAnimationFrame(applyCustomPhysics);
}

applyCustomPhysics();

// ===================================================
// ===== 3. UI, THEME =====
// ===================================================
function updateOverlayGradient() {
  const overlay = document.querySelector(".gradient-overlay");
  if (!overlay) return;
  if (document.body.classList.contains("dark")) {
    overlay.style.background =
      "linear-gradient(45deg, rgba(0,150,255,0.25), rgba(0,0,0,0.3), rgba(0,200,255,0.25))";
  } else {
    overlay.style.background =
      "linear-gradient(45deg, rgba(255,140,0,0.25), rgba(255,255,255,0.15), rgba(255,215,64,0.25))";
  }
}

function updateToggleIcon() {
  const darkModeToggle = document.getElementById("darkModeToggle");
  if (!darkModeToggle) return;

  if (document.body.classList.contains("dark")) {
    darkModeToggle.innerHTML = '<i class="far fa-sun"></i>';
    darkModeToggle.title = "Switch Theme";
    darkModeToggle.style.background = "transparent";
    darkModeToggle.style.color = "#ffffffff";
    darkModeToggle.style.border = "none";
  } else {
    darkModeToggle.innerHTML = '<i class="far fa-moon"></i>';
    darkModeToggle.title = "Switch Theme";
    darkModeToggle.style.background = "#000000ff";
    darkModeToggle.style.color = "#ffffffff";
    darkModeToggle.style.border = "none";
  }
}

// --- 1. THE MASTER LOGO FUNCTION ---
// This handles everything: Scroll position + Dark/Light mode

/* ===== Navbar Scroll and Logo Controller ===== */
function updateNavbarAndLogo() {
  const navbar = document.querySelector(".navbar");
  const hero = document.querySelector(".hero");
  const logo = document.getElementById("site-logo");

  if (!navbar || !hero || !logo) return;

  const scrollY = window.scrollY;
  const isDarkMode = document.body.classList.contains("dark");

  // State 1: At the top of the page
  const isAtTop = scrollY <= 50;

  // State 2: Scrolled, but still inside the hero section
  const isHeroScrolled = !isAtTop && hero.getBoundingClientRect().bottom > 0;

  // State 3: Scrolled beyond the hero section
  const isPastHero = !isAtTop && hero.getBoundingClientRect().bottom <= 0;

  // Apply the appropriate navbar state
  navbar.classList.toggle("hero-scrolled", isHeroScrolled);
  navbar.classList.toggle("scrolled", isPastHero);

  // Keep the logo white until the hero section ends
  if (!isPastHero || isDarkMode) {
    logo.src = "/images/logo-white.png";
  } else {
    logo.src = "/images/logo-black.png";
  }
}

// --- 2. THE THEME TOGGLE BUTTON ---
const darkModeToggleBtn = document.getElementById("darkModeToggle");
if (darkModeToggleBtn) {
  darkModeToggleBtn.addEventListener("click", () => {
    const isDark = document.body.classList.toggle("dark");
    localStorage.setItem("theme", isDark ? "dark" : "light");

    // Call all UI updates
    updateOverlayGradient();
    updateToggleIcon();

    // IMPORTANT: Update the logo right when they click the button!
    updateNavbarAndLogo();

    // Checking if reloadParticles exists before calling it to prevent crashes
    if (typeof reloadParticles === "function") {
      reloadParticles();
    }
  });
}

// --- 3. PAGE LOAD & SCROLL LISTENER ---
document.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
    document.documentElement.classList.add("dark");
  }

  // Call all UI updates on page load
  updateOverlayGradient();
  updateToggleIcon();

  // Set the correct logo and navbar state immediately on page load
  updateNavbarAndLogo();

  // Listen for scrolling and update the logo/navbar dynamically
  // Update the navbar and logo while scrolling
  window.addEventListener("scroll", updateNavbarAndLogo, {
    passive: true,
  });

  // Checking if initParticles exists before calling it
  if (typeof initParticles === "function") {
    initParticles();
  }
});
