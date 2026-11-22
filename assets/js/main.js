/* Rahul Farm website script: fills details from config.js, builds WhatsApp links,
   handles the retail order buttons, the wholesale enquiry form, the mobile menu
   and (when IDs are set in config.js) Meta Pixel and Google Analytics events. */
(function () {
  'use strict';

  document.documentElement.classList.add('jsm');
  var C = window.SITE || {};
  var brand = C.brand || 'Rahul Farm';
  var waNumber = String(C.whatsapp || '').replace(/\D/g, '');
  var products = {};
  (C.products || []).forEach(function (p) { products[p.id] = p; });

  function val(key) {
    var v = C[key];
    return v === undefined || v === null ? '' : String(v).trim();
  }
  function inr(n) { return '₹' + Number(n).toLocaleString('en-IN'); }
  function waLink(text) { return 'https://wa.me/' + waNumber + '?text=' + encodeURIComponent(text); }
  function each(sel, fn, root) { Array.prototype.forEach.call((root || document).querySelectorAll(sel), fn); }
  function external(a) { a.target = '_blank'; a.rel = 'noopener'; }

  /* ---------- Tracking (only runs when IDs are set) ---------- */
  var GA_NAMES = { Contact: 'contact', Lead: 'generate_lead', InitiateCheckout: 'begin_checkout', ViewContent: 'view_item',
    AddToCart: 'add_to_cart', CustomizeProduct: 'select_item' };
  var pageName = (location.pathname.replace(/\/+$/, '').split('/').pop() || 'index').replace(/\.html$/, '') || 'index';
  function tidy(params) {
    var out = {};
    Object.keys(params || {}).forEach(function (k) {
      var v = params[k];
      if (v !== undefined && v !== null && v !== '') out[k] = v;
    });
    if (out.value === undefined) delete out.currency; // Meta wants value and currency together
    return out;
  }
  // Meta standard events (PageView, ViewContent, Contact, Lead, InitiateCheckout, AddToCart, CustomizeProduct)
  function track(event, params) {
    params = tidy(params);
    try {
      if (window.fbq) window.fbq('track', event, params);
      if (window.gtag) window.gtag('event', GA_NAMES[event] || event, params);
    } catch (e) { /* tracking must never break the page */ }
  }
  // Custom events, e.g. WhatsAppClick, CallClick, ButtonClick
  function trackCustom(event, params) {
    params = tidy(params);
    try {
      if (window.fbq) window.fbq('trackCustom', event, params);
      if (window.gtag) window.gtag('event', event.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase(), params);
    } catch (e) { /* ignore */ }
  }
  var onceDone = {};
  function once(key, fn) { if (!onceDone[key]) { onceDone[key] = true; fn(); } }
  if (val('metaPixelId')) {
    /* Meta Pixel base code */
    !function (f, b, e, v, n, t, s) {
      if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
      if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = [];
      t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
    }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    window.fbq('init', val('metaPixelId'));
    window.fbq('track', 'PageView');
  }
  if (val('ga4Id')) {
    var g = document.createElement('script');
    g.async = true;
    g.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(val('ga4Id'));
    document.head.appendChild(g);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', val('ga4Id'));
  }

  /* ---------- Mobile menu: drawer that slides in from the right ---------- */
  var menuBtn = document.getElementById('menuBtn');
  var navEl = document.getElementById('nav');
  if (menuBtn && navEl) {
    var drawer = document.createElement('div');
    drawer.className = 'drawer';
    drawer.id = 'drawer';
    drawer.setAttribute('role', 'dialog');
    drawer.setAttribute('aria-modal', 'true');
    drawer.setAttribute('aria-label', 'Menu');
    drawer.setAttribute('aria-hidden', 'true');
    var logoEl = document.querySelector('.hdr .logo');
    var links = Array.prototype.filter.call(navEl.querySelectorAll('a'), function (a) { return !a.classList.contains('nav-cta'); });
    var cta = navEl.querySelector('.nav-cta');
    var arrow = '<svg aria-hidden="true"><use href="#i-arrow"/></svg>';
    drawer.innerHTML =
      '<div class="drawer-scrim" data-close></div>' +
      '<div class="drawer-panel">' +
        '<div class="drawer-head">' + (logoEl ? logoEl.outerHTML : '') +
          '<button class="drawer-x" type="button" aria-label="Close menu" data-close>' +
          '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>' +
        '</div>' +
        '<nav class="drawer-nav" aria-label="Main">' +
          links.map(function (a, i) {
            return '<a href="' + a.getAttribute('href') + '" style="--i:' + i + '"><span>' + a.textContent.trim() + '</span>' + arrow + '</a>';
          }).join('') +
        '</nav>' +
        '<div class="drawer-foot" style="--i:' + links.length + '">' +
          (cta ? '<a class="btn btn-wa" href="' + cta.getAttribute('href') + '">' + cta.textContent.trim() + '</a>' : '') +
          '<a class="btn btn-ghost" data-wa="hello" href="#"><svg aria-hidden="true"><use href="#i-wa"/></svg>Chat on WhatsApp</a>' +
          '<p class="drawer-meta">Making jaggery since 2002 · Vanskui, Surat</p>' +
        '</div>' +
      '</div>';
    document.body.appendChild(drawer);
    menuBtn.setAttribute('aria-controls', 'drawer');
    var panel = drawer.querySelector('.drawer-panel');
    var lastFocus = null;
    var setOpen = function (open) {
      drawer.classList.toggle('open', open);
      drawer.setAttribute('aria-hidden', open ? 'false' : 'true');
      document.documentElement.classList.toggle('nav-lock', open);
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open) {
        lastFocus = document.activeElement;
        setTimeout(function () { drawer.querySelector('.drawer-x').focus({ preventScroll: true }); }, 60);
      } else if (lastFocus && lastFocus.focus) {
        lastFocus.focus({ preventScroll: true });
      }
    };
    menuBtn.addEventListener('click', function () { setOpen(!drawer.classList.contains('open')); });
    each('[data-close]', function (el) { el.addEventListener('click', function () { setOpen(false); }); }, drawer);
    // close before the page scrolls to the chosen section
    each('a', function (a) { a.addEventListener('click', function () { lastFocus = null; setOpen(false); }); }, drawer);
    document.addEventListener('keydown', function (e) {
      if (!drawer.classList.contains('open')) return;
      if (e.key === 'Escape') { setOpen(false); return; }
      if (e.key === 'Tab') { // keep keyboard focus inside the open menu
        var f = panel.querySelectorAll('a[href], button');
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    // swipe right on the panel to close
    var sx = null, sy = null;
    panel.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
    panel.addEventListener('touchend', function (e) {
      if (sx === null) return;
      var dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
      if (dx > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) setOpen(false);
      sx = sy = null;
    }, { passive: true });
    // back to desktop width: make sure nothing stays locked
    window.addEventListener('resize', function () { if (window.innerWidth > 900 && drawer.classList.contains('open')) setOpen(false); });
  }

  /* ---------- Fill details from config ---------- */
  each('[data-if]', function (el) { if (!val(el.getAttribute('data-if'))) el.remove(); });
  each('[data-ifnot]', function (el) { if (val(el.getAttribute('data-ifnot'))) el.remove(); });
  each('[data-c]', function (el) {
    var v = val(el.getAttribute('data-c'));
    if (v) el.textContent = v;
  });
  each('[data-year]', function (el) { el.textContent = new Date().getFullYear(); });

  var telNumber = (val('phone') || (waNumber ? '+' + waNumber : '')).replace(/[^\d+]/g, '');
  each('[data-tel]', function (a) {
    if (!telNumber) return;
    a.href = 'tel:' + telNumber;
    a.addEventListener('click', function () { track('Contact', { content_name: 'Phone call', content_category: pageName }); });
  });
  each('[data-mail]', function (a) {
    if (!val('email')) return;
    a.href = 'mailto:' + val('email');
    a.addEventListener('click', function () { track('Contact', { content_name: 'Email', content_category: pageName }); });
  });
  each('[data-social]', function (a) {
    var url = val(a.getAttribute('data-social'));
    if (url) a.href = url; else a.remove();
  });

  each('[data-credit]', function (a) {
    var url = val('creditUrl');
    if (url) { a.href = url; external(a); } else { a.removeAttribute('href'); }
  });

  /* ---------- WhatsApp links ---------- */
  var messages = {
    main: 'Hello ' + brand + ', please share your wholesale jaggery price list.',
    hello: 'Hello ' + brand + ', I have a question about your jaggery.'
  };
  each('[data-wa]', function (a) {
    var key = a.getAttribute('data-wa');
    var p = products[key];
    var text = messages[key] || (p
      ? 'Hello ' + brand + ', I run a shop and want the wholesale rate for ' + p.name + '. Please share today’s price.'
      : messages.main);
    a.href = waLink(text);
    external(a);
    a.addEventListener('click', function () {
      track('Contact', { content_name: p ? p.name : 'WhatsApp chat', content_category: pageName });
    });
  });

  /* ---------- Wholesale price list ---------- */
  each('[data-rate]', function (el) {
    var p = products[el.getAttribute('data-rate')];
    if (p && p.wholesale) {
      el.textContent = inr(p.wholesale) + ' ';
      var unit = document.createElement('small');
      unit.textContent = '/ ' + (p.wholesaleUnit || 'kg');
      el.appendChild(unit);
      el.classList.remove('na');
    } else {
      el.textContent = 'On request';
      el.classList.add('na');
    }
  });

  /* ---------- Retail: order a single product on WhatsApp ---------- */
  each('[data-product]', function (card) {
    var p = products[card.getAttribute('data-product')];
    if (!p) return;
    var qty = 1;
    var out = card.querySelector('output');
    var btn = card.querySelector('[data-order]');
    var price = card.querySelector('[data-mrp]');
    var pack = card.querySelector('[data-pack]');
    if (pack && p.pack) pack.textContent = p.pack;
    if (price) {
      if (p.mrp) { price.textContent = inr(p.mrp); price.classList.remove('na'); }
      else { price.textContent = 'Price on WhatsApp'; price.classList.add('na'); }
    }
    function update() {
      out.textContent = qty;
      var lines = ['Hello ' + brand + ', I want to order for home:', p.name + ' (' + p.pack + ') x ' + qty];
      if (p.mrp) lines.push('Price: ' + inr(p.mrp * qty) + ' + shipping');
      lines.push('Deliver to: (your name, full address and PIN code)');
      btn.href = waLink(lines.join('\n'));
    }
    card.querySelector('[data-dec]').addEventListener('click', function () { if (qty > 1) { qty--; update(); } });
    card.querySelector('[data-inc]').addEventListener('click', function () {
      if (qty < 50) { qty++; update(); }
      once('cart-' + p.id, function () {
        track('AddToCart', { content_name: p.name, content_ids: [p.id], content_type: 'product', value: p.mrp || undefined, currency: 'INR' });
      });
    });
    external(btn);
    btn.addEventListener('click', function () {
      track('InitiateCheckout', { content_name: p.name, content_ids: [p.id], content_type: 'product', num_items: qty,
        value: p.mrp ? p.mrp * qty : undefined, currency: 'INR' });
    });
    update();
  });

  /* ---------- Wholesale enquiry form: opens WhatsApp with the details ready to send ---------- */
  var form = document.getElementById('enquiry');
  var send = document.getElementById('wsSend');
  if (form && send) {
    var picked = function (group) {
      return Array.prototype.map.call(
        form.querySelectorAll('[data-group="' + group + '"] [aria-pressed="true"]'),
        function (b) { return b.textContent.trim(); }
      );
    };
    var err = document.getElementById('wsErr');
    var build = function () {
      var name = form.elements.owner ? form.elements.owner.value.trim() : '';
      var shop = form.elements.shop.value.trim();
      var city = form.elements.city.value.trim();
      var kinds = picked('variety');
      var qty = picked('qty');
      send.href = waLink([
        'Hello ' + brand + ', I would like your wholesale price list.',
        '',
        'Name: ' + (name || '-'),
        'Shop: ' + (shop || '-'),
        'City: ' + (city || '-'),
        'Varieties: ' + (kinds.length ? kinds.join(', ') : 'All varieties'),
        'Quantity required: ' + (qty[0] || 'Not sure yet'),
        '',
        '(Sent from the Rahul Farm website)'
      ].join('\n'));
      if (shop) form.elements.shop.removeAttribute('aria-invalid');
      if (city) form.elements.city.removeAttribute('aria-invalid');
      if (err && shop && city) err.hidden = true;
    };
    var missing = function () {
      var list = [];
      if (!form.elements.shop.value.trim()) list.push(form.elements.shop);
      if (!form.elements.city.value.trim()) list.push(form.elements.city);
      return list;
    };
    each('[data-group] button', function (b) {
      b.addEventListener('click', function () {
        var group = b.closest('[data-group]');
        var on = b.getAttribute('aria-pressed') === 'true';
        if (group.hasAttribute('data-single')) {
          each('button', function (x) { x.setAttribute('aria-pressed', 'false'); }, group);
        }
        b.setAttribute('aria-pressed', on ? 'false' : 'true');
        build();
        once('customize-form', function () { track('CustomizeProduct', { content_name: 'Wholesale enquiry form' }); });
      });
    }, form);
    form.addEventListener('input', build);
    form.addEventListener('submit', function (e) { e.preventDefault(); send.click(); });
    external(send);
    send.addEventListener('click', function (e) {
      var gaps = missing();
      if (gaps.length) {
        e.preventDefault();
        gaps.forEach(function (f) { f.setAttribute('aria-invalid', 'true'); });
        if (err) err.hidden = false;
        gaps[0].focus();
        return;
      }
      build();
      track('Lead', { content_name: 'Wholesale enquiry form', content_category: picked('variety').join(', ') || 'All varieties',
        quantity: picked('qty')[0] || 'Not sure yet' });
    });
    build();
  }

  /* ---------- Reveal cards as they scroll into view ---------- */
  var reveal = document.querySelectorAll('.rv');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reveal.length && 'IntersectionObserver' in window && !reduce) {
    document.documentElement.classList.add('js');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    Array.prototype.forEach.call(reveal, function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) el.classList.add('in');
      else io.observe(el);
    });
  }

  /* ---------- Product page: photos, shop / home order box, WhatsApp message ---------- */
  var pdp = document.querySelector('[data-pdp]');
  var P = pdp ? products[pdp.getAttribute('data-pdp')] : null;
  if (pdp && P) {
    var packName = P.pack || '';
    var perPackKg = Number(P.kg) || 0;
    each('[data-pdp-pack]', function (el) { el.textContent = packName; });
    var mrpEl = pdp.querySelector('[data-pdp-mrp]');
    if (mrpEl && P.mrp) mrpEl.textContent = inr(P.mrp);
    var wsEl = pdp.querySelector('[data-pdp-ws]');
    if (wsEl && P.wholesale) {
      wsEl.textContent = 'Wholesale rate: ' + inr(P.wholesale) + ' / ' + (P.wholesaleUnit || 'kg');
      wsEl.hidden = false;
    }

    // Photos: swipe on phones, tap a thumbnail anywhere
    var stripEl = document.getElementById('pdpTrack');
    var thumbEls = pdp.querySelectorAll('.pdp-thumb');
    if (stripEl && thumbEls.length) {
      var markThumb = function () {
        var i = Math.round(stripEl.scrollLeft / Math.max(1, stripEl.clientWidth));
        Array.prototype.forEach.call(thumbEls, function (t, k) {
          if (k === i) t.setAttribute('aria-current', 'true'); else t.removeAttribute('aria-current');
        });
      };
      Array.prototype.forEach.call(thumbEls, function (t) {
        t.addEventListener('click', function () {
          var i = Number(t.getAttribute('data-i')) || 0;
          stripEl.scrollTo({ left: i * stripEl.clientWidth, behavior: reduce ? 'auto' : 'smooth' });
        });
      });
      stripEl.addEventListener('scroll', function () { requestAnimationFrame(markThumb); }, { passive: true });
      stripEl.addEventListener('keydown', function (e) {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        e.preventDefault();
        stripEl.scrollBy({ left: (e.key === 'ArrowRight' ? 1 : -1) * stripEl.clientWidth, behavior: reduce ? 'auto' : 'smooth' });
      });
    }

    // Shop / home tabs
    var tabs = pdp.querySelectorAll('[role="tab"]');
    var showTab = function (tab) {
      Array.prototype.forEach.call(tabs, function (t) {
        var on = t === tab;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
        document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
      });
    };
    Array.prototype.forEach.call(tabs, function (t, i) {
      t.addEventListener('click', function () { showTab(t); });
      t.addEventListener('keydown', function (e) {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        var next = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
        showTab(next);
        next.focus();
      });
    });

    // For my shop: pick kg, open WhatsApp
    var bulkBtn = pdp.querySelector('[data-pdp-bulk]');
    var chipBox = pdp.querySelector('[data-pdp-chips]');
    var bulkQty = '';
    var buildBulk = function () {
      bulkBtn.href = waLink([
        'Hello ' + brand + ', I run a shop and want the wholesale price for ' + P.name + ' (' + packName + ').',
        '',
        'Quantity: ' + (bulkQty || 'Not sure yet'),
        'Shop name: ',
        'City: ',
        '',
        '(Sent from the ' + P.name + ' page)'
      ].join('\n'));
    };
    if (chipBox) {
      each('button', function (b) {
        b.addEventListener('click', function () {
          var on = b.getAttribute('aria-pressed') === 'true';
          each('button', function (x) { x.setAttribute('aria-pressed', 'false'); }, chipBox);
          b.setAttribute('aria-pressed', on ? 'false' : 'true');
          bulkQty = on ? '' : b.textContent.trim();
          buildBulk();
          once('customize-pdp', function () {
            track('CustomizeProduct', { content_name: P.name, content_ids: [P.id], content_type: 'product' });
          });
        });
      }, chipBox);
    }
    if (bulkBtn) {
      external(bulkBtn);
      bulkBtn.addEventListener('click', function () {
        track('Lead', { content_name: P.name, content_ids: [P.id], content_type: 'product', content_category: 'Wholesale',
          quantity: bulkQty || 'Not sure yet' });
      });
      buildBulk();
    }

    // For home: number of packs, open WhatsApp
    var homeBtn = pdp.querySelector('[data-pdp-home]');
    var nOut = pdp.querySelector('[data-pdp-n]');
    var totalEl = pdp.querySelector('[data-pdp-total]');
    var packs = 1;
    var buildHome = function () {
      nOut.textContent = packs;
      var kgText = perPackKg ? ' = ' + (packs * perPackKg) + ' kg' : '';
      var priceText = P.mrp ? inr(P.mrp * packs) + ' + shipping' : '';
      if (totalEl) totalEl.textContent = (kgText ? kgText.slice(3) : '') + (kgText && priceText ? ' · ' : '') + priceText;
      var lines = ['Hello ' + brand + ', I want to order for home:', P.name + ' (' + packName + ') x ' + packs + kgText];
      if (P.mrp) lines.push('Price: ' + priceText);
      lines.push('Deliver to: (your name, full address and PIN code)');
      homeBtn.href = waLink(lines.join('\n'));
    };
    if (homeBtn && nOut) {
      pdp.querySelector('[data-pdp-dec]').addEventListener('click', function () { if (packs > 1) { packs--; buildHome(); } });
      pdp.querySelector('[data-pdp-inc]').addEventListener('click', function () {
        if (packs < 50) { packs++; buildHome(); }
        once('cart-pdp', function () {
          track('AddToCart', { content_name: P.name, content_ids: [P.id], content_type: 'product', value: P.mrp || undefined, currency: 'INR' });
        });
      });
      external(homeBtn);
      homeBtn.addEventListener('click', function () {
        track('InitiateCheckout', { content_name: P.name, content_ids: [P.id], content_type: 'product', num_items: packs,
          value: P.mrp ? P.mrp * packs : undefined, currency: 'INR' });
      });
      buildHome();
    }

    // Hide the floating order button while the order box itself is on screen
    var orderBox = document.getElementById('order');
    if (orderBox && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (en) {
        document.documentElement.classList.toggle('order-vis', en[0].isIntersecting);
      }).observe(orderBox);
    }

    track('ViewContent', { content_name: P.name, content_ids: [P.id], content_type: 'product', value: P.mrp || undefined, currency: 'INR' });

    // Product data for Google
    var root = val('domain') || window.location.origin;
    var heroImg = pdp.querySelector('.pdp-slide img');
    var pld = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: P.name,
      description: (document.querySelector('meta[name="description"]') || {}).content || '',
      brand: { '@type': 'Brand', name: brand },
      image: heroImg ? new URL(heroImg.getAttribute('src'), window.location.href).href.replace(window.location.origin, root) : undefined,
      url: root + '/products/' + pdp.getAttribute('data-slug') + '.html'
    };
    if (P.mrp) {
      pld.offers = { '@type': 'Offer', price: String(P.mrp), priceCurrency: 'INR', availability: 'https://schema.org/InStock' };
    }
    var pldTag = document.createElement('script');
    pldTag.type = 'application/ld+json';
    pldTag.textContent = JSON.stringify(pld);
    document.head.appendChild(pldTag);
  }

  /* ---------- Process timeline: line fills and steps light up while scrolling ---------- */
  var tl = document.getElementById('steps2');
  if (tl && !reduce) {
    var items = tl.querySelectorAll('.step2');
    tl.classList.add('live');
    var ticking = false;
    var paint = function () {
      ticking = false;
      var r = tl.getBoundingClientRect();
      var mid = window.innerHeight * 0.6;
      var p = Math.min(1, Math.max(0, (mid - r.top - 28) / Math.max(1, r.height - 56)));
      tl.style.setProperty('--p', p.toFixed(3));
      Array.prototype.forEach.call(items, function (li) {
        var mk = li.querySelector('.mk').getBoundingClientRect();
        li.classList.toggle('on', mk.top + mk.height / 2 < mid);
      });
    };
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(paint); } }, { passive: true });
    window.addEventListener('resize', paint);
    paint();
  }

  /* ---------- In-page links: land exactly below the sticky header ---------- */
  var CHIP = { normal: 'Normal', masala: 'Masala', dryfruit: 'Dry Fruit', bucket: '4 kg Bucket', jar: 'Pieces Jar', powder: 'Powder' };
  function flash(el) {
    el.classList.remove('flash');
    void el.offsetWidth;
    el.classList.add('flash');
  }
  function goTo(el) {
    var hdr = document.querySelector('.hdr');
    var offset = (hdr ? hdr.getBoundingClientRect().height : 0) + 16;
    var y = el.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({ top: Math.max(0, y), behavior: reduce ? 'auto' : 'smooth' });
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('a[href^="#"]') : null;
    if (!a) return;
    var id = a.getAttribute('href').slice(1);
    var target = id ? document.getElementById(id) : null;
    if (!target) return;
    e.preventDefault();
    if (a.hasAttribute('data-enquire') && form) {
      var pick = CHIP[a.getAttribute('data-enquire')];
      if (pick) {
        each('[data-group="variety"] button', function (b) {
          if (b.textContent.trim() === pick) b.setAttribute('aria-pressed', 'true');
        }, form);
        form.dispatchEvent(new Event('input'));
      }
    }
    goTo(target);
    if (id === 'enquiry' || id === 'order' || id.indexOf('buy-') === 0) setTimeout(function () { flash(target); }, reduce ? 0 : 650);
  });

  /* ---------- Meta Pixel: content views and click events on every page ---------- */
  if ('IntersectionObserver' in window) {
    var allIds = Object.keys(products);
    [['range', 'Our jaggery (product range)'], ['shop', 'Shop for home'], ['wholesale', 'Wholesale price list']].forEach(function (s) {
      var sec = document.getElementById(s[0]);
      if (!sec) return;
      var seenIO = new IntersectionObserver(function (en) {
        if (!en[0].isIntersecting) return;
        seenIO.disconnect();
        track('ViewContent', { content_name: s[1], content_ids: allIds, content_type: 'product_group' });
      }, { threshold: 0.25 });
      seenIO.observe(sec);
    });
  }
  // Runs after each button's own handler, so blocked clicks (e.g. form not filled) are not counted
  document.addEventListener('click', function (e) {
    if (e.defaultPrevented && !(e.target.closest && e.target.closest('a[href^="#"]'))) return;
    var a = e.target.closest ? e.target.closest('a[href], button') : null;
    if (!a) return;
    var href = a.getAttribute('href') || '';
    var nameEl = a.querySelector('.rel-name');
    var img = a.querySelector('img');
    var label = (a.getAttribute('aria-label') || (nameEl && nameEl.textContent) || (img && img.alt) || a.textContent || '')
      .replace(/\s+/g, ' ').trim().slice(0, 60);
    if (href.indexOf('wa.me/') !== -1) {
      trackCustom('WhatsAppClick', { button: label, page: pageName });
    } else if (href.indexOf('tel:') === 0) {
      trackCustom('CallClick', { button: label, page: pageName });
    } else if (a.hasAttribute('data-social')) {
      trackCustom('SocialClick', { network: a.getAttribute('data-social'), page: pageName });
    } else if (a.matches('.btn, .link, .seg-btn, .pdp-also, .rel-card, .nav a, .drawer-nav a, .menu-btn') || (a.closest('.pcard, .scard') && a.tagName === 'A')) {
      trackCustom('ButtonClick', { button: label || href, page: pageName, target: href || undefined });
    }
  });

  /* ---------- Mobile bottom bar: hidden while the main buttons, the form or the order box are on screen, and while typing ---------- */
  var mbar = document.querySelector('.mbar');
  var barWatch = document.querySelectorAll('.hero-cta, #enquiry, #order');
  if (mbar && barWatch.length && 'IntersectionObserver' in window) {
    var seen = [];
    var typing = false;
    var syncBar = function () {
      document.documentElement.classList.toggle('mbar-on', !typing && seen.indexOf(true) === -1);
    };
    Array.prototype.forEach.call(barWatch, function (el, i) { seen[i] = true; });
    var barIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var i = Array.prototype.indexOf.call(barWatch, en.target);
        seen[i] = en.isIntersecting;
      });
      syncBar();
    });
    Array.prototype.forEach.call(barWatch, function (el) { barIO.observe(el); });
    var isField = function (el) { return el && el.matches && el.matches('input, textarea, select'); };
    document.addEventListener('focusin', function (e) { if (isField(e.target)) { typing = true; syncBar(); } });
    document.addEventListener('focusout', function (e) { if (isField(e.target)) { typing = false; syncBar(); } });
  } else {
    document.documentElement.classList.add('mbar-on');
  }

  /* ---------- Product row on phones: swipe dots ---------- */
  var rowEl = document.querySelector('.range-grid');
  var dotsEl = document.getElementById('rangeDots');
  if (rowEl && dotsEl) {
    var cardsEl = rowEl.querySelectorAll('.pcard');
    Array.prototype.forEach.call(cardsEl, function () { dotsEl.appendChild(document.createElement('span')); });
    var markDot = function () {
      var w = cardsEl.length ? cardsEl[0].offsetWidth + 14 : 1;
      var i = Math.min(cardsEl.length - 1, Math.round(rowEl.scrollLeft / w));
      Array.prototype.forEach.call(dotsEl.children, function (d, k) { d.classList.toggle('on', k === i); });
    };
    rowEl.addEventListener('scroll', function () { requestAnimationFrame(markDot); }, { passive: true });
    markDot();
  }

  /* ---------- Structured data for Google ---------- */
  var site = val('domain') || window.location.origin;
  var ld = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: brand,
    foundingDate: '2002',
    description: 'Natural sugarcane jaggery made at Rahul Farm, Surat, since 2002. Wholesale for shops and retail delivery across India.',
    url: site,
    image: site + '/assets/img/og-image.jpg',
    address: {
      '@type': 'PostalAddress',
      streetAddress: val('address'),
      addressLocality: 'Surat',
      addressRegion: 'Gujarat',
      postalCode: val('pincode') || undefined,
      addressCountry: 'IN'
    }
  };
  if (val('phone')) ld.telephone = val('phone');
  if (val('email')) ld.email = val('email');
  var same = ['instagram', 'facebook', 'youtube'].map(val).filter(Boolean);
  if (same.length) ld.sameAs = same;
  var s = document.createElement('script');
  s.type = 'application/ld+json';
  s.textContent = JSON.stringify(ld);
  document.head.appendChild(s);
})();
