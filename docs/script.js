"use strict";

document.addEventListener("DOMContentLoaded", () => {
  /* =========================
     MOBILE NAVIGATION
  ========================= */

  const menuToggle = document.querySelector(".menu-toggle");
  const mainNavigation = document.querySelector(".main-navigation");

  if (menuToggle && mainNavigation) {
    const closeMenu = () => {
      menuToggle.classList.remove("is-active");
      mainNavigation.classList.remove("is-open");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Apri il menu");
    };

    const openMenu = () => {
      menuToggle.classList.add("is-active");
      mainNavigation.classList.add("is-open");
      menuToggle.setAttribute("aria-expanded", "true");
      menuToggle.setAttribute("aria-label", "Chiudi il menu");
    };

    menuToggle.addEventListener("click", () => {
      const isOpen = mainNavigation.classList.contains("is-open");

      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    mainNavigation.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeMenu();
        menuToggle.focus();
      }
    });

    document.addEventListener("click", (event) => {
      const clickedInsideMenu =
        mainNavigation.contains(event.target) ||
        menuToggle.contains(event.target);

      if (!clickedInsideMenu) {
        closeMenu();
      }
    });
  }

  /* =========================
     SMOOTH SCROLL
  ========================= */

  const anchorLinks = document.querySelectorAll('a[href^="#"]');

  anchorLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href");

      if (!targetId || targetId === "#") {
        return;
      }

      const targetElement = document.querySelector(targetId);

      if (!targetElement) {
        return;
      }

      event.preventDefault();

      const header = document.querySelector(".site-header");
      const headerHeight = header ? header.offsetHeight : 0;

      const targetPosition =
        targetElement.getBoundingClientRect().top +
        window.scrollY -
        headerHeight;

      window.scrollTo({
        top: Math.max(0, targetPosition),
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
      });

      window.history.replaceState(null, "", targetId);
    });
  });

  /* =========================
     GALLERY SLIDER
  ========================= */

  const slider = document.querySelector("[data-slider]");

  if (!slider) {
    return;
  }

  const slides = Array.from(slider.querySelectorAll(".slide"));
  const dots = Array.from(document.querySelectorAll(".dot"));
  const prevButton = document.querySelector("[data-slider-prev]");
  const nextButton = document.querySelector("[data-slider-next]");

  if (!slides.length) {
    return;
  }

  let currentIndex = 0;
  let autoplayId = null;
  let touchStartX = 0;
  let touchEndX = 0;

  const AUTOPLAY_DELAY = 5000;

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  function updateSlider(index) {
    currentIndex = (index + slides.length) % slides.length;

    slides.forEach((slide, slideIndex) => {
      const isActive = slideIndex === currentIndex;

      slide.classList.toggle("is-active", isActive);
      slide.setAttribute("aria-hidden", String(!isActive));
    });

    dots.forEach((dot, dotIndex) => {
      const isActive = dotIndex === currentIndex;

      dot.classList.toggle("is-active", isActive);
      dot.setAttribute("aria-current", isActive ? "true" : "false");
    });
  }

  function nextSlide() {
    updateSlider(currentIndex + 1);
  }

  function previousSlide() {
    updateSlider(currentIndex - 1);
  }

  function stopAutoplay() {
    if (autoplayId !== null) {
      window.clearInterval(autoplayId);
      autoplayId = null;
    }
  }

  function startAutoplay() {
    if (prefersReducedMotion) {
      return;
    }

    stopAutoplay();

    autoplayId = window.setInterval(() => {
      nextSlide();
    }, AUTOPLAY_DELAY);
  }

  if (nextButton) {
    nextButton.addEventListener("click", () => {
      nextSlide();
      startAutoplay();
    });
  }

  if (prevButton) {
    prevButton.addEventListener("click", () => {
      previousSlide();
      startAutoplay();
    });
  }

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      updateSlider(index);
      startAutoplay();
    });
  });

  /* Touch / swipe support */

  slider.addEventListener(
    "touchstart",
    (event) => {
      touchStartX = event.changedTouches[0].clientX;
      stopAutoplay();
    },
    { passive: true }
  );

  slider.addEventListener(
    "touchend",
    (event) => {
      touchEndX = event.changedTouches[0].clientX;

      const swipeDistance = touchEndX - touchStartX;
      const minimumSwipe = 45;

      if (Math.abs(swipeDistance) >= minimumSwipe) {
        if (swipeDistance < 0) {
          nextSlide();
        } else {
          previousSlide();
        }
      }

      startAutoplay();
    },
    { passive: true }
  );

  /* Keyboard controls */

  slider.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      nextSlide();
      startAutoplay();
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      previousSlide();
      startAutoplay();
    }
  });

  /* Pause while hovering / focusing */

  slider.addEventListener("mouseenter", stopAutoplay);
  slider.addEventListener("mouseleave", startAutoplay);
  slider.addEventListener("focusin", stopAutoplay);
  slider.addEventListener("focusout", startAutoplay);

  /* Initial state */

  updateSlider(0);
  startAutoplay();

  /* =========================
     NEWSLETTER DEMO FEEDBACK
  ========================= */

  const newsletterForm = document.querySelector(".newsletter-form");

  if (newsletterForm) {
    newsletterForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const emailInput = newsletterForm.querySelector('input[type="email"]');

      if (!emailInput || !emailInput.value.trim()) {
        return;
      }

      const button = newsletterForm.querySelector("button");

      if (button) {
        button.textContent = "✓";
        button.setAttribute("aria-label", "Iscrizione completata");
      }

      emailInput.value = "";
      emailInput.placeholder = "Grazie per esserti iscritto";

      window.setTimeout(() => {
        if (button) {
          button.textContent = "→";
          button.setAttribute(
            "aria-label",
            "Iscriviti alla newsletter"
          );
        }

        emailInput.placeholder = "La tua email";
      }, 3500);
    });
  }
});