/* Valley Village Oral Surgery Associates
 * Three behaviours only: nav, scroll reveal, appointment form.
 * No dependencies, no build step.
 */

(function () {
  'use strict';

  /* ------------------------------------------------------------------
   * CONFIG
   *
   * FORM_ENDPOINT: the URL the appointment request POSTs to.
   * Leave it empty and the form validates, then tells the visitor to
   * call instead of silently pretending the request was sent.
   * See README.md for the two ways to wire this up.
   * ------------------------------------------------------------------ */
  var FORM_ENDPOINT = '';
  var PRACTICE_PHONE = '(410) 581-9008';
  var PRACTICE_PHONE_HREF = 'tel:+14105819008';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ==================================================================
   * 1 · NAV
   * ================================================================== */

  var nav = document.getElementById('siteNav');
  var toggle = document.getElementById('navToggle');
  var overlay = document.getElementById('navOverlay');

  if (nav) {
    // Sentinel at the top of the document. When it scrolls out of view the
    // pill deepens its shadow. Using IntersectionObserver rather than a
    // scroll listener keeps the main thread free.
    var sentinel = document.createElement('div');
    sentinel.setAttribute('aria-hidden', 'true');
    sentinel.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:1px;';
    document.body.prepend(sentinel);

    new IntersectionObserver(function (entries) {
      nav.setAttribute('data-scrolled', String(!entries[0].isIntersecting));
    }).observe(sentinel);
  }

  function setNav(open) {
    if (!toggle || !overlay) return;
    toggle.setAttribute('aria-expanded', String(open));
    overlay.setAttribute('data-open', String(open));
    document.body.setAttribute('data-nav-open', String(open));
    if (open) {
      // The overlay is still visibility:hidden on this tick, and focus() is
      // ignored on a hidden element. Wait for the style recalc to land.
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          var first = overlay.querySelector('a');
          if (first) first.focus({ preventScroll: true });
        });
      });
    } else {
      toggle.focus({ preventScroll: true });
    }
  }

  if (toggle && overlay) {
    toggle.addEventListener('click', function () {
      setNav(toggle.getAttribute('aria-expanded') !== 'true');
    });

    overlay.addEventListener('click', function (event) {
      if (event.target.tagName === 'A') setNav(false);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && overlay.getAttribute('data-open') === 'true') {
        setNav(false);
      }
    });

    // If the viewport grows past the breakpoint while the overlay is open,
    // close it so focus is not trapped behind a hidden element.
    window.matchMedia('(min-width: 60.0625rem)').addEventListener('change', function (event) {
      if (event.matches) setNav(false);
    });
  }

  /* ==================================================================
   * 2 · SCROLL REVEAL
   * ================================================================== */

  var revealTargets = document.querySelectorAll('[data-reveal]');

  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealTargets.forEach(function (el) { el.setAttribute('data-revealed', 'true'); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.setAttribute('data-revealed', 'true');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.05 });

    revealTargets.forEach(function (el) { revealObserver.observe(el); });

    // Anything already on screen at load reveals immediately, so the hero
    // never sits blank waiting for a scroll that may not come.
    requestAnimationFrame(function () {
      revealTargets.forEach(function (el) {
        if (el.getBoundingClientRect().top < window.innerHeight) {
          el.setAttribute('data-revealed', 'true');
        }
      });
    });
  }

  /* ==================================================================
   * 3 · APPOINTMENT FORM
   * States: default · hover · focus · active · disabled · loading · error · success
   * ================================================================== */

  var form = document.getElementById('requestForm');
  var status = document.getElementById('formStatus');
  var submitBtn = document.getElementById('submitBtn');

  if (form && status && submitBtn) {
    var submitLabel = submitBtn.querySelector('[data-submit-label]');
    var defaultLabel = submitLabel ? submitLabel.textContent : 'Send the request';

    function fieldOf(control) {
      return control.closest('[data-field]');
    }

    function validEmail(value) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
    }

    function validPhone(value) {
      // Ten digits, however the visitor chose to punctuate them.
      return (value.match(/\d/g) || []).length >= 10;
    }

    function checkControl(control) {
      var value = (control.value || '').trim();
      var ok = true;

      if (control.hasAttribute('required') && value === '') ok = false;
      else if (control.type === 'email' && !validEmail(value)) ok = false;
      else if (control.type === 'tel' && !validPhone(value)) ok = false;

      var wrapper = fieldOf(control);
      if (wrapper) {
        wrapper.setAttribute('data-invalid', String(!ok));
        control.setAttribute('aria-invalid', String(!ok));
      }
      return ok;
    }

    // Validate on blur, then live once a field has already been marked bad,
    // so the visitor is not scolded while still typing the first character.
    form.querySelectorAll('.input').forEach(function (control) {
      control.addEventListener('blur', function () { checkControl(control); });
      control.addEventListener('input', function () {
        var wrapper = fieldOf(control);
        if (wrapper && wrapper.getAttribute('data-invalid') === 'true') checkControl(control);
      });
      control.addEventListener('change', function () {
        if (control.tagName === 'SELECT') checkControl(control);
      });
    });

    function setStatus(state, html) {
      status.setAttribute('data-state', state);
      status.innerHTML = html;
    }

    function setLoading(on) {
      submitBtn.setAttribute('data-state', on ? 'loading' : '');
      submitBtn.disabled = on;
      if (submitLabel) submitLabel.textContent = on ? 'Sending' : defaultLabel;
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();

      var controls = Array.prototype.slice.call(form.querySelectorAll('.input'));
      var firstBad = null;

      controls.forEach(function (control) {
        var ok = checkControl(control);
        if (!ok && !firstBad) firstBad = control;
      });

      if (firstBad) {
        setStatus('error', 'A few details are missing. They are marked above.');
        firstBad.focus();
        return;
      }

      if (!FORM_ENDPOINT) {
        setStatus(
          'notice',
          'Online requests are not connected yet. Please call ' +
          '<a href="' + PRACTICE_PHONE_HREF + '">' + PRACTICE_PHONE + '</a> ' +
          'and the front desk will book you in.'
        );
        return;
      }

      setLoading(true);
      setStatus('', '');

      fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(form).entries()))
      })
        .then(function (response) {
          if (!response.ok) throw new Error('Request failed with status ' + response.status);
          form.reset();
          form.querySelectorAll('[data-field]').forEach(function (wrapper) {
            wrapper.setAttribute('data-invalid', 'false');
          });
          setStatus(
            'success',
            '&#10003; Request received. The front desk will call you back to schedule. ' +
            'If it is urgent, call <a href="' + PRACTICE_PHONE_HREF + '">' + PRACTICE_PHONE + '</a>.'
          );
        })
        .catch(function () {
          setStatus(
            'error',
            'That did not go through. Please call ' +
            '<a href="' + PRACTICE_PHONE_HREF + '">' + PRACTICE_PHONE + '</a> ' +
            'and we will get you booked.'
          );
        })
        .then(function () { setLoading(false); });
    });
  }

  /* ==================================================================
   * 4 · FOOTER YEAR
   * ================================================================== */

  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());

}());
