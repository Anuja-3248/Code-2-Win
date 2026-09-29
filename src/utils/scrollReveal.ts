/**
 * Scroll Reveal & Scroll-Driven Sliding Animation Engine
 * Automatically tracks elements with scroll-reveal classes and triggers
 * ultra-smooth 3D glass sliding animations on scroll down.
 */

export function initScrollReveal() {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    // Fallback for older environments: immediately show all
    document.querySelectorAll('.scroll-reveal, .reveal-slide-up, .reveal-slide-left, .reveal-slide-right, .reveal-slide-down, .reveal-scale, .reveal-blur').forEach((el) => {
      el.classList.add('is-revealed');
    });
    return () => {};
  }

  const observerOptions: IntersectionObserverInit = {
    root: null,
    rootMargin: '0px 0px -40px 0px', // Trigger slightly before element enters full view
    threshold: 0.08,
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        // Once revealed, unobserve to keep animation locked
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  const observeElements = () => {
    const elements = document.querySelectorAll(
      '.scroll-reveal:not(.is-revealed), .reveal-slide-up:not(.is-revealed), .reveal-slide-left:not(.is-revealed), .reveal-slide-right:not(.is-revealed), .reveal-slide-down:not(.is-revealed), .reveal-scale:not(.is-revealed), .reveal-blur:not(.is-revealed)'
    );
    elements.forEach((el) => observer.observe(el));
  };

  // Initial observe
  observeElements();

  // Watch for dynamic DOM additions (e.g. route changes, hospital search results)
  const mutationObserver = new MutationObserver(() => {
    observeElements();
  });

  mutationObserver.observe(document.body, {
    childList: true,
    subtree: true,
  });

  // Re-check on scroll or resize events
  window.addEventListener('scroll', observeElements, { passive: true });

  return () => {
    observer.disconnect();
    mutationObserver.disconnect();
    window.removeEventListener('scroll', observeElements);
  };
}
