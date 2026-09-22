document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector("[data-header]");
  const menuToggle = document.querySelector("[data-menu-toggle]");
  const navigation = document.querySelector("[data-navigation]");

  /* --------------------------------
     NAVBAR
  -------------------------------- */

  const updateHeader = () => {
    header?.classList.toggle("is-scrolled", window.scrollY > 20);
  };

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });


  /* --------------------------------
   MOBILE MENU
-------------------------------- */

if (menuToggle && navigation) {
  const closeMenu = () => {
    navigation.classList.remove("is-open");
    menuToggle.classList.remove("is-open");

    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Apri menu");

    document.body.classList.remove("menu-open");
  };

  const openMenu = () => {
    navigation.classList.add("is-open");
    menuToggle.classList.add("is-open");

    menuToggle.setAttribute("aria-expanded", "true");
    menuToggle.setAttribute("aria-label", "Chiudi menu");

    document.body.classList.add("menu-open");
  };

  menuToggle.addEventListener("click", () => {
    const isOpen = navigation.classList.contains("is-open");

    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  navigation.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 760) {
      closeMenu();
    }
  });
}


  /* --------------------------------
     MENU FILTER
  -------------------------------- */

  const filters = document.querySelectorAll("[data-filter]");
  const menuCards = document.querySelectorAll("[data-category]");

  filters.forEach((filterButton) => {
    filterButton.addEventListener("click", () => {
      const selectedCategory = filterButton.dataset.filter;

      filters.forEach((button) => {
        button.classList.toggle(
          "is-active",
          button === filterButton
        );
      });

      menuCards.forEach((card) => {
        const shouldShow =
          selectedCategory === "all" ||
          card.dataset.category === selectedCategory;

        card.classList.toggle("is-hidden", !shouldShow);
      });
    });
  });


  /* --------------------------------
     DRAGGABLE PHOTO SLIDER
  -------------------------------- */

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
    let hasMoved = false;
    let pointerId = null;

    const getMaxTranslate = () => {
      return Math.max(
        0,
        track.scrollWidth - slider.clientWidth
      );
    };

    const getStep = () => {
      if (slides.length < 2) return slider.clientWidth;

      const first = slides[0];
      const second = slides[1];

      return second.offsetLeft - first.offsetLeft;
    };

    const clamp = (value, min, max) => {
      return Math.min(Math.max(value, min), max);
    };

    const setTranslate = (value, animate = true) => {
      currentTranslate = clamp(
        value,
        -getMaxTranslate(),
        0
      );

      track.style.transition = animate
        ? "transform 450ms cubic-bezier(.22,1,.36,1)"
        : "none";

      track.style.transform =
        `translate3d(${currentTranslate}px, 0, 0)`;

      updateProgress();
    };

    const updateIndex = () => {
      const step = getStep();

      if (!step) {
        currentIndex = 0;
        return;
      }

      currentIndex = Math.round(
        Math.abs(currentTranslate) / step
      );

      currentIndex = clamp(
        currentIndex,
        0,
        slides.length - 1
      );
    };

    const updateProgress = () => {
      if (!progress) return;

      const max = getMaxTranslate();

      if (!max) {
        progress.style.width = "100%";
        return;
      }

      const percentage =
        Math.abs(currentTranslate) / max * 100;

      progress.style.width =
        `${clamp(percentage, 0, 100)}%`;
    };

    const moveToIndex = (index) => {
      const step = getStep();
      const max = getMaxTranslate();

      const target = clamp(
        -(index * step),
        -max,
        0
      );

      currentIndex = index;
      setTranslate(target);
    };

    const next = () => {
      updateIndex();

      if (currentIndex >= slides.length - 1) {
        moveToIndex(0);
        return;
      }

      moveToIndex(currentIndex + 1);
    };

    const previous = () => {
      updateIndex();

      if (currentIndex <= 0) {
        moveToIndex(slides.length - 1);
        return;
      }

      moveToIndex(currentIndex - 1);
    };

    nextButton?.addEventListener("click", next);
    prevButton?.addEventListener("click", previous);


    /* POINTER DOWN */

    slider.addEventListener("pointerdown", (event) => {
      if (event.pointerType === "mouse" && event.button !== 0) {
        return;
      }

      pointerId = event.pointerId;
      isDragging = true;
      hasMoved = false;

      startX = event.clientX;
      startTranslate = currentTranslate;

      slider.classList.add("is-dragging");

      slider.setPointerCapture(pointerId);

      track.style.transition = "none";
    });


    /* POINTER MOVE */

    slider.addEventListener("pointermove", (event) => {
      if (!isDragging || event.pointerId !== pointerId) {
        return;
      }

      const delta = event.clientX - startX;

      if (Math.abs(delta) > 5) {
        hasMoved = true;
      }

      const resistance =
        delta > 0 && startTranslate === 0 ||
        delta < 0 && startTranslate <= -getMaxTranslate()
          ? .25
          : 1;

      setTranslate(
        startTranslate + delta * resistance,
        false
      );
    });


    /* POINTER UP */

    const finishDrag = (event) => {
      if (!isDragging || event.pointerId !== pointerId) {
        return;
      }

      isDragging = false;
      slider.classList.remove("is-dragging");

      if (slider.hasPointerCapture(pointerId)) {
        slider.releasePointerCapture(pointerId);
      }

      const delta = event.clientX - startX;
      const threshold = Math.min(
        100,
        slider.clientWidth * .18
      );

      updateIndex();

      if (Math.abs(delta) > threshold) {
        if (delta < 0) {
          moveToIndex(
            Math.min(currentIndex + 1, slides.length - 1)
          );
        } else {
          moveToIndex(
            Math.max(currentIndex - 1, 0)
          );
        }
      } else {
        moveToIndex(currentIndex);
      }

      pointerId = null;
    };

    slider.addEventListener("pointerup", finishDrag);
    slider.addEventListener("pointercancel", finishDrag);


    /* PREVENT LINK/CLICK AFTER DRAG */

    slider.addEventListener(
      "click",
      (event) => {
        if (hasMoved) {
          event.preventDefault();
          event.stopPropagation();
        }
      },
      true
    );


    /* RESIZE */

    let resizeTimer;

    window.addEventListener("resize", () => {
      window.clearTimeout(resizeTimer);

      resizeTimer = window.setTimeout(() => {
        moveToIndex(currentIndex);
      }, 100);
    });

    updateProgress();
  }


  /* --------------------------------
     NEWSLETTER DEMO
  -------------------------------- */

  const newsletter = document.querySelector("[data-newsletter]");
  const newsletterMessage = document.querySelector(
    "[data-newsletter-message]"
  );

  newsletter?.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!newsletterMessage) return;

    newsletterMessage.textContent =
      "Grazie! Ti aspettiamo al banco.";

    newsletter.reset();
  });


  /* --------------------------------
     INTERNAL LINKS
  -------------------------------- */

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href");

      if (!targetId || targetId === "#") {
        return;
      }

      const target = document.querySelector(targetId);

      if (!target) {
        return;
      }

      event.preventDefault();

      const headerHeight =
        document.querySelector(".site-header")
          ?.offsetHeight || 0;

      const targetTop =
        target.getBoundingClientRect().top +
        window.scrollY -
        headerHeight;

      window.scrollTo({
        top: targetTop,
        behavior: "smooth"
      });
    });
  });
});