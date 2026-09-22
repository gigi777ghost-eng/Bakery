document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector("[data-header]");
  const menuToggle = document.querySelector("[data-menu-toggle]");
  const navigation = document.querySelector("[data-navigation]");

  /* NAVBAR STICKY STATE */
  const updateHeader = () => {
    header?.classList.toggle("is-scrolled", window.scrollY > 20);
  };

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  /* MOBILE MENU TOGGLE */
  if (menuToggle && navigation) {
    const closeMenu = () => {
      navigation.classList.remove("is-open");
      menuToggle.classList.remove("is-open");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Apri menu");
      document.body.style.overflow = "";
    };

    const openMenu = () => {
      navigation.classList.add("is-open");
      menuToggle.classList.add("is-open");
      menuToggle.setAttribute("aria-expanded", "true");
      menuToggle.setAttribute("aria-label", "Chiudi menu");
      document.body.style.overflow = "hidden";
    };

    menuToggle.addEventListener("click", () => {
      const isOpen = navigation.classList.contains("is-open");
      isOpen ? closeMenu() : openMenu();
    });

    navigation.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenu();
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 768) closeMenu();
    });
  }

  /* CATEGORY FILTER SYSTEM */
  const filters = document.querySelectorAll("[data-filter]");
  const menuCards = document.querySelectorAll("[data-category]");

  filters.forEach((filterButton) => {
    filterButton.addEventListener("click", () => {
      const selectedCategory = filterButton.dataset.filter;

      filters.forEach((button) => {
        const isActive = button === filterButton;
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-selected", isActive ? "true" : "false");
      });

      menuCards.forEach((card) => {
        const shouldShow =
          selectedCategory === "all" ||
          card.dataset.category === selectedCategory;

        card.classList.toggle("is-hidden", !shouldShow);
      });
    });
  });

  /* PHOTO SLIDER DRAGGABLE & CONTROLS */
  const slider = document.querySelector("[data-slider]");
  const track = document.querySelector("[data-slider-track]");
  const prevButton = document.querySelector("[data-slider-prev]");
  const nextButton = document.querySelector("[data-slider-next]");
  const progress = document.querySelector("[data-slider-progress]");

  if (slider && track) {
    const slides = [...track.children];
    let currentIndex = 0;
    let startX = 0;
    let startTranslate = 0;
    let currentTranslate = 0;
    let isDragging = false;
    let pointerId = null;

    const getMaxTranslate = () => Math.max(0, track.scrollWidth - slider.clientWidth);

    const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

    const updateProgress = () => {
      if (!progress) return;
      const max = getMaxTranslate();
      const pct = max === 0 ? 100 : (Math.abs(currentTranslate) / max) * 100;
      progress.style.width = `${clamp(pct, 0, 100)}%`;
    };

    const setTranslate = (value, animate = true) => {
      currentTranslate = clamp(value, -getMaxTranslate(), 0);
      track.style.transition = animate ? "transform 400ms cubic-bezier(.22,1,.36,1)" : "none";
      track.style.transform = `translate3d(${currentTranslate}px, 0, 0)`;
      updateProgress();
    };

    const moveToIndex = (index) => {
      if (!slides.length) return;
      const slideWidth = slides[0].offsetWidth + 24; // Including gap
      currentIndex = clamp(index, 0, slides.length - 1);
      setTranslate(-(currentIndex * slideWidth));
    };

    nextButton?.addEventListener("click", () => moveToIndex(currentIndex + 1));
    prevButton?.addEventListener("click", () => moveToIndex(currentIndex - 1));

    slider.addEventListener("pointerdown", (e) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      pointerId = e.pointerId;
      isDragging = true;
      startX = e.clientX;
      startTranslate = currentTranslate;
      slider.classList.add("is-dragging");
      slider.setPointerCapture(pointerId);
      track.style.transition = "none";
    });

    slider.addEventListener("pointermove", (e) => {
      if (!isDragging || e.pointerId !== pointerId) return;
      const delta = e.clientX - startX;
      setTranslate(startTranslate + delta, false);
    });

    const finishDrag = (e) => {
      if (!isDragging || e.pointerId !== pointerId) return;
      isDragging = false;
      slider.classList.remove("is-dragging");
      if (slider.hasPointerCapture(pointerId)) {
        slider.releasePointerCapture(pointerId);
      }
      const delta = e.clientX - startX;
      if (Math.abs(delta) > 50) {
        delta < 0 ? moveToIndex(currentIndex + 1) : moveToIndex(currentIndex - 1);
      } else {
        moveToIndex(currentIndex);
      }
    };

    slider.addEventListener("pointerup", finishDrag);
    slider.addEventListener("pointercancel", finishDrag);

    window.addEventListener("resize", () => moveToIndex(currentIndex));
    updateProgress();
  }

  /* SMOOTH SCROLL FOR INTERNAL LINKS */
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const targetId = link.getAttribute("href");
      if (!targetId || targetId === "#") return;
      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      const headerHeight = document.querySelector(".site-header")?.offsetHeight || 0;
      const targetTop = target.getBoundingClientRect().top + window.scrollY - headerHeight;

      window.scrollTo({
        top: targetTop,
        behavior: "smooth",
      });
    });
  });
});