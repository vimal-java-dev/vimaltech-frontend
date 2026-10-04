/* ===== load-header.js ===== */
//  /components/header.js
fetch("/components/header.html")
  .then((response) => {
    if (!response.ok) throw new Error("Header not found");
    return response.text();
  })
  .then((data) => {
    // 1. Inject Header HTML
    document.getElementById("header-placeholder").innerHTML = data;

    // 2. Contextual Dropdown & Main Tab Active Color
    const currentPath = window.location.pathname.toLowerCase();
    let cleanCurrent = currentPath
      .replace(/\/index\.html$/, "")
      .replace(/\/$/, "");

    const navListItems = document.querySelectorAll(".nav-links > li");

    navListItems.forEach((li) => {
      const link = li.querySelector("a");
      if (!link) return;

      const href = link.getAttribute("href");
      if (!href || href.includes("#")) return;

      let cleanHref = href
        .toLowerCase()
        .replace(/\/index\.html$/, "")
        .replace(/\/$/, "");
      let isCurrentPage = false;

      if (cleanHref === "") {
        if (
          !cleanCurrent.includes("services") &&
          !cleanCurrent.includes("portfolio") &&
          !cleanCurrent.includes("aboutus") &&
          !cleanCurrent.includes("contactus")
        ) {
          isCurrentPage = true;
        }
      } else {
        if (cleanCurrent.includes(cleanHref)) {
          isCurrentPage = true;
        }
      }

      if (isCurrentPage) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");

        // Delete dropdowns for pages you are not currently on
        if (li.classList.contains("dropdown")) {
          li.classList.remove("dropdown");
          link.classList.remove("dropdown-toggle");
          const menu = li.querySelector(".dropdown-menu");
          if (menu) menu.remove();
        }
      }
    });

    // 3. Re-query Elements
    const hamburger = document.getElementById("hamburger");
    const navLinks = document.getElementById("nav-links");
    const dropdowns = document.querySelectorAll(".dropdown");

    /* ==========================================
       DROPDOWN MENU BEHAVIOR
    ========================================== */
    dropdowns.forEach((dropdown) => {
      const toggle = dropdown.querySelector(".dropdown-toggle");
      const menu = dropdown.querySelector(".dropdown-menu");

      if (!toggle || !menu) return;

      // CLICK: Opens menu and stops navigation
      toggle.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        dropdowns.forEach((d) => {
          if (d !== dropdown) {
            d.classList.remove("open");
            const m = d.querySelector(".dropdown-menu");
            if (m) m.style.display = "none";
          }
        });

        const isOpen = dropdown.classList.toggle("open");
        menu.style.display = isOpen ? "block" : "none";
      });

      // DESKTOP HOVER
      dropdown.addEventListener("mouseenter", () => {
        if (window.innerWidth > 1024) {
          menu.style.display = "block";
          setTimeout(() => {
            menu.style.opacity = "1";
            menu.style.visibility = "visible";
            menu.style.transform = "translateX(-50%) translateY(0)";
          }, 10);
        }
      });

      dropdown.addEventListener("mouseleave", () => {
        if (window.innerWidth > 1024) {
          menu.style.opacity = "0";
          menu.style.visibility = "hidden";
          menu.style.transform = "translateX(-50%) translateY(10px)";
          setTimeout(() => {
            if (menu.style.opacity === "0") {
              menu.style.display = "none";
            }
          }, 300);
        }
      });
    });

    document.addEventListener("click", (e) => {
      if (!e.target.closest(".dropdown")) {
        dropdowns.forEach((d) => {
          d.classList.remove("open");
          const menu = d.querySelector(".dropdown-menu");
          if (menu) menu.style.display = "none";
        });
      }
    });

    /* ==========================================
       HAMBURGER MENU (MOBILE FIXES APPLIED)
    ========================================== */
    if (hamburger && navLinks) {
      // 1. Toggle menu on click
      hamburger.addEventListener("click", () => {
        navLinks.classList.toggle("active");
        hamburger.classList.toggle("active");
        navLinks.classList.toggle("open");
        hamburger.textContent = navLinks.classList.contains("active")
          ? "✕"
          : "☰";
      });

      // 2. NEW FIX: Close menu when clicking outside
      document.addEventListener("click", (e) => {
        const isClickInsideNav = navLinks.contains(e.target);
        const isClickOnHamburger = hamburger.contains(e.target);

        if (
          navLinks.classList.contains("active") &&
          !isClickInsideNav &&
          !isClickOnHamburger
        ) {
          navLinks.classList.remove("active");
          navLinks.classList.remove("open");
          hamburger.classList.remove("active");
          hamburger.textContent = "☰";
        }
      });

      // 3. NEW FIX: Close menu when any anchor link (like a #link) is clicked
      const allNavAnchors = document.querySelectorAll(".nav-links a");
      allNavAnchors.forEach((link) => {
        link.addEventListener("click", (e) => {
          // If they clicked the dropdown toggle on mobile, ignore it so the submenu can open
          if (
            e.target.classList.contains("dropdown-toggle") &&
            window.innerWidth <= 1024
          ) {
            return;
          }

          // Otherwise, close the main menu
          if (navLinks.classList.contains("active")) {
            navLinks.classList.remove("active");
            navLinks.classList.remove("open");
            hamburger.classList.remove("active");
            hamburger.textContent = "☰";
          }
        });
      });
    }

    /* ==========================================
       SCROLL SPY & DROPDOWN ACTIVE LINKS
    ========================================== */
    const sections = document.querySelectorAll("section[id]");
    const dropdownLinks = document.querySelectorAll(".dropdown-menu a");

    // A. INSTANT CLICK
    dropdownLinks.forEach((link) => {
      link.addEventListener("click", function () {
        dropdownLinks.forEach((l) => l.classList.remove("active"));
        this.classList.add("active");
      });
    });

    // B. SCROLL SPY
    if (sections.length > 0) {
      window.addEventListener("scroll", () => {
        let current = "";
        sections.forEach((section) => {
          const sectionTop = section.offsetTop - 150;
          const sectionHeight = section.clientHeight;
          if (
            window.pageYOffset >= sectionTop &&
            window.pageYOffset < sectionTop + sectionHeight
          ) {
            current = section.getAttribute("id");
          }
        });

        dropdownLinks.forEach((link) => {
          const href = link.getAttribute("href");
          if (href && href.includes("#")) {
            link.classList.remove("active");
            if (current && href.endsWith(`#${current}`)) {
              link.classList.add("active");
            }
          }
        });
      });

      const navObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const id = entry.target.getAttribute("id");
              dropdownLinks.forEach((link) => {
                link.classList.remove("active");
                if (link.getAttribute("href").endsWith(`#${id}`)) {
                  link.classList.add("active");
                }
              });
            }
          });
        },
        { threshold: 0.6 },
      );

      sections.forEach((section) => {
        navObserver.observe(section);
      });
    }
  })
  .catch((error) => console.error("Error loading header:", error));
