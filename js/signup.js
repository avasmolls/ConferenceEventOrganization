/* ==========================================================================
   CONVERGE '26 — js/signup.js
   Attendee registration: validation, JSON storage, and CRUD rendering.
   --------------------------------------------------------------------------
   NOTE ON OWNERSHIP
   This file is the integration layer written alongside the CSS so the styled
   validation states on signup.html are demonstrable. The JavaScript owner
   should treat it as a working baseline to review and extend.

   Preserved from the original "signup Test" commit:
     - field ids  tbEmail / tbName / tbAge / tbAddress
     - the global function validateData(), still the submit entry point

   Known issue fixed here, flagged for the JS owner:
     the original age check used /\d{1,3}/ unanchored, so "abc5" and "5xyz"
     both passed. It is now an anchored integer test with a 16-120 range.

   Validation states are applied with Bootstrap's standard classes
   (.is-invalid / .is-valid) which css/styles.css styles.
   ========================================================================== */
(function () {
  'use strict';

  var STORAGE_KEY = 'converge-attendees';

  /* ------------------------------------------------------------------ DOM */
  var form          = document.getElementById('registerForm');
  if (!form) return;

  var elName        = document.getElementById('tbName');
  var elEmail       = document.getElementById('tbEmail');
  var elPhone       = document.getElementById('tbPhone');
  var elAge         = document.getElementById('tbAge');
  var elCompany     = document.getElementById('tbCompany');
  var elAddress     = document.getElementById('tbAddress');
  var elTrack       = document.getElementById('selTrack');
  var elTerms       = document.getElementById('cbTerms');
  var elUpdates     = document.getElementById('cbUpdates');

  var rosterBody    = document.getElementById('rosterBody');
  var rosterWrap    = document.getElementById('rosterWrap');
  var rosterEmpty   = document.getElementById('rosterEmpty');
  var rosterCount   = document.getElementById('rosterCount');
  var jsonOut       = document.getElementById('jsonOut');

  var errorSummary  = document.getElementById('errorSummary');
  var errorList     = document.getElementById('errorSummaryList');
  var successBanner = document.getElementById('successBanner');
  var successTitle  = document.getElementById('successTitle');
  var successBody   = document.getElementById('successBody');

  var meterFill     = document.getElementById('meterFill');
  var meterValue    = document.getElementById('meterValue');
  var btnSubmitLbl  = document.getElementById('btnSubmitLabel');
  var editingNote   = document.getElementById('editingNote');

  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------- STATE */
  var attendees = [];     /* the JSON register */
  var editingId = null;   /* non-null while updating an existing record */

  /* =========================================================== VALIDATION
     One rule object per field. Each returns an error string, or '' if valid.
     Keeping them in a table means the summary, the inline messages and the
     completion meter all read from a single source of truth.
  ========================================================================= */
  var RULES = {
    tbName: {
      el: elName,
      label: 'Full name',
      required: true,
      test: function (v) {
        if (!v) return 'Enter the full name that should appear on the badge.';
        if (v.length < 2) return 'Name must be at least 2 characters.';
        if (v.length > 80) return 'Name must be 80 characters or fewer.';
        /* Letters, spaces, hyphens, apostrophes and periods only. */
        if (!/^[A-Za-zÀ-ÖØ-öø-ÿ'’.\-\s]+$/.test(v)) {
          return 'Use letters, spaces, hyphens and apostrophes only.';
        }
        /* The team's label asks for "First and Last Name", so require both.
           Unlike /^[a-zA-Z]+\s[a-zA-Z]+$/ this still accepts middle names,
           hyphens, apostrophes and accented characters. */
        if (v.split(/\s+/).filter(Boolean).length < 2) {
          return 'Enter both a first and a last name.';
        }
        return '';
      }
    },
    tbEmail: {
      el: elEmail,
      label: 'Email address',
      required: true,
      test: function (v) {
        if (!v) return 'Enter an email address so we can send your confirmation.';
        /* Deliberately pragmatic: one @, a dot in the domain, no spaces. */
        if (!/^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/.test(v)) {
          return 'Enter a valid email address, for example you@organisation.com.';
        }
        if (v.length > 120) return 'Email must be 120 characters or fewer.';
        /* Duplicate guard — one record per email, ignoring the row being edited. */
        var clash = attendees.some(function (a) {
          return a.email.toLowerCase() === v.toLowerCase() && a.id !== editingId;
        });
        if (clash) return 'This email is already on the attendee register.';
        return '';
      }
    },
    tbPhone: {
      el: elPhone,
      label: 'Contact phone',
      required: false,          /* optional per the brief */
      test: function (v) {
        if (!v) return '';      /* empty is allowed */
        var digits = v.replace(/\D/g, '');
        if (digits.length !== 10) {
          return 'Enter a 10-digit US phone number, or leave this blank.';
        }
        return '';
      }
    },
    tbAge: {
      el: elAge,
      label: 'Age',
      required: true,
      test: function (v) {
        if (!v) return 'Enter your age.';
        /* Anchored: the original unanchored /\d{1,3}/ let "abc5" through. */
        if (!/^\d{1,3}$/.test(v)) return 'Age must be a whole number, digits only.';
        var n = parseInt(v, 10);
        if (n < 16) return 'Attendees must be 16 or over.';
        if (n > 120) return 'Enter an age of 120 or below.';
        return '';
      }
    },
    tbCompany: {
      el: elCompany,
      label: 'Company / organisation',
      required: true,
      test: function (v) {
        if (!v) return 'Enter the company or organisation on your badge.';
        if (v.length < 2) return 'Company name must be at least 2 characters.';
        if (v.length > 120) return 'Company name must be 120 characters or fewer.';
        return '';
      }
    },
    tbAddress: {
      el: elAddress,
      label: 'Mailing address',
      required: true,
      test: function (v) {
        if (!v) return 'Enter the mailing address for your receipt.';
        if (v.length < 5) return 'Please give a little more detail (5 characters minimum).';
        if (v.length > 240) return 'Keep this to 240 characters or fewer.';
        return '';
      }
    },
    cbTerms: {
      el: elTerms,
      label: 'Code of conduct',
      required: true,
      isCheckbox: true,
      test: function (_v, checked) {
        return checked ? '' : 'You must agree to the code of conduct to register.';
      }
    }
  };

  function valueOf(rule) {
    if (!rule.el) return '';
    return rule.isCheckbox ? '' : String(rule.el.value || '').trim();
  }

  /* Apply or clear the visual state for one field. */
  function setFieldState(key, message, touched) {
    var rule = RULES[key];
    if (!rule || !rule.el) return;

    var el = rule.el;
    var errEl = document.getElementById(
      'err' + key.replace(/^tb/, '').replace(/^cb/, '')
    );

    /* Fallback for browsers without :has() — the phone input and the consent
       checkbox are wrapped, so their message is not a DOM sibling. */
    var fieldWrap = el.closest('.field');

    if (message) {
      el.classList.add('is-invalid');
      el.classList.remove('is-valid');
      el.setAttribute('aria-invalid', 'true');
      if (fieldWrap) fieldWrap.classList.add('has-error');
      if (errEl) errEl.textContent = message;
    } else {
      el.classList.remove('is-invalid');
      el.removeAttribute('aria-invalid');
      if (fieldWrap) fieldWrap.classList.remove('has-error');
      if (errEl) errEl.textContent = '';
      /* Only show the green state once the user has actually filled it in. */
      var filled = rule.isCheckbox ? el.checked : valueOf(rule).length > 0;
      el.classList.toggle('is-valid', Boolean(touched && filled));
    }
  }

  /* Validate one field; returns the error string. */
  function validateField(key, touched) {
    var rule = RULES[key];
    if (!rule || !rule.el) return '';
    var msg = rule.test(valueOf(rule), rule.el.checked);
    setFieldState(key, msg, touched);
    return msg;
  }

  /* Validate everything; returns an array of {key, label, message}. */
  function validateAll(touched) {
    var errors = [];
    Object.keys(RULES).forEach(function (key) {
      var msg = validateField(key, touched);
      if (msg) errors.push({ key: key, label: RULES[key].label, message: msg });
    });
    return errors;
  }

  /* --------------------------------------------------- COMPLETION METER */
  function updateMeter() {
    var required = Object.keys(RULES).filter(function (k) { return RULES[k].required; });
    var done = required.filter(function (k) {
      return RULES[k].test(valueOf(RULES[k]), RULES[k].el && RULES[k].el.checked) === '';
    }).length;

    var pct = required.length ? Math.round((done / required.length) * 100) : 0;
    if (meterFill) meterFill.style.width = pct + '%';
    if (meterValue) meterValue.textContent = pct + '%';
  }

  /* ============================================== PUBLIC ENTRY POINT
     Kept as a global for backwards compatibility with the original sketch,
     which called it from the button's onclick attribute.
  ================================================================= */
  window.validateData = function validateData() {
    var errors = validateAll(true);

    if (errors.length) {
      if (errorList) {
        errorList.innerHTML = '';
        errors.forEach(function (e) {
          var li = document.createElement('li');
          li.textContent = e.label + ' — ' + e.message;
          errorList.appendChild(li);
        });
      }
      if (errorSummary) {
        errorSummary.hidden = false;
        if (!prefersReduced) {
          errorSummary.classList.remove('shake');
          void errorSummary.offsetWidth;          /* force reflow to replay */
          errorSummary.classList.add('shake');
        }
        errorSummary.focus();
      }
      if (successBanner) successBanner.hidden = true;

      /* Move focus to the first offending control for keyboard users. */
      var first = RULES[errors[0].key].el;
      if (first) first.focus({ preventScroll: false });
      return false;
    }

    if (errorSummary) errorSummary.hidden = true;
    return true;
  };

  /* ==================================================== JSON PERSISTENCE */
  function load() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      var parsed = raw ? JSON.parse(raw) : [];
      attendees = Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      attendees = [];     /* corrupt or blocked storage — start clean */
    }
  }

  function save() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(attendees));
    } catch (err) {
      /* Private mode or blocked site data: the in-memory register still works. */
    }
  }

  function nextId() {
    var max = attendees.reduce(function (acc, a) {
      var n = parseInt(String(a.id).replace(/\D/g, ''), 10);
      return isNaN(n) ? acc : Math.max(acc, n);
    }, 0);
    return 'ATT-' + String(max + 1).padStart(4, '0');
  }

  /* ========================================================== RENDERING */
  function escapeHTML(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function initialsOf(name) {
    var parts = String(name).trim().split(/\s+/);
    var a = parts[0] ? parts[0][0] : '?';
    var b = parts.length > 1 ? parts[parts.length - 1][0] : '';
    return (a + b).toUpperCase();
  }

  /* Deterministic hue from the name, so an avatar colour never changes. */
  function hueOf(str) {
    var h = 0;
    for (var i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) % 360;
    return h;
  }

  var TIER_LABELS = { full: 'Full pass', single: 'Single day', student: 'Student' };

  function renderRoster() {
    if (!rosterBody) return;

    rosterBody.innerHTML = '';

    var has = attendees.length > 0;
    if (rosterWrap) rosterWrap.hidden = !has;
    if (rosterEmpty) rosterEmpty.hidden = has;
    if (rosterCount) rosterCount.textContent = String(attendees.length);

    attendees.forEach(function (a) {
      var tr = document.createElement('tr');
      if (a.id === editingId) tr.classList.add('is-editing');

      tr.innerHTML =
        '<td class="cell-person" data-label="Attendee">' +
          '<span class="avatar" aria-hidden="true" style="--h: ' + hueOf(a.fullName) + ';">' +
            escapeHTML(initialsOf(a.fullName)) +
          '</span>' +
          '<span>' +
            '<span class="cell-name d-block">' + escapeHTML(a.fullName) + '</span>' +
            '<span class="u-mono u-faint" style="font-size:0.625rem;">' + escapeHTML(a.id) + '</span>' +
          '</span>' +
        '</td>' +
        '<td data-label="Email"><a class="u-link" href="mailto:' + escapeHTML(a.email) + '">' +
          escapeHTML(a.email) + '</a></td>' +
        '<td class="cell-mono" data-label="Phone">' + escapeHTML(a.phone || '—') + '</td>' +
        '<td class="cell-mono" data-label="Age">' + escapeHTML(a.age) + '</td>' +
        '<td data-label="Company">' + escapeHTML(a.company || '—') + '</td>' +
        '<td data-label="Address">' + escapeHTML(String(a.affiliation || '').split('\n')[0] || '—') + '</td>' +
        '<td data-label="Tier"><span class="chip">' +
          escapeHTML(TIER_LABELS[a.tier] || a.tier) + '</span></td>' +
        '<td class="cell-actions" data-label="Actions">' +
          '<button class="btn-icon" type="button" data-edit="' + escapeHTML(a.id) + '" ' +
            'aria-label="Edit ' + escapeHTML(a.fullName) + '" title="Edit">' +
            '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
              'stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
              '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>' +
            '</svg>' +
          '</button> ' +
          '<button class="btn-icon btn-icon--danger" type="button" data-del="' + escapeHTML(a.id) + '" ' +
            'aria-label="Remove ' + escapeHTML(a.fullName) + '" title="Remove">' +
            '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
              'stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
              '<path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/>' +
            '</svg>' +
          '</button>' +
        '</td>';

      rosterBody.appendChild(tr);
    });

    renderJSON();
  }

  /* Minimal JSON syntax highlighter, so the stored data reads clearly.
     Tokenising happens BEFORE escaping: escaping first would turn every quote
     into &quot; and the token patterns would stop matching. Each token escapes
     its own contents, and the structural characters left between tokens
     (braces, brackets, commas, whitespace) need no escaping. */
  function renderJSON() {
    if (!jsonOut) return;

    var text = JSON.stringify(attendees, null, 2);
    var TOKEN = /("(?:\\u[\da-fA-F]{4}|\\[^u]|[^\\"])*")(\s*:)?|\b(?:true|false)\b|\bnull\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?/g;

    var html = text.replace(TOKEN, function (match, quoted, colon) {
      if (quoted) {
        if (colon) {
          /* A quoted string followed by a colon is an object key. */
          return '<span class="tok-key">' + escapeHTML(quoted) + '</span>' +
                 '<span class="tok-punct">' + colon + '</span>';
        }
        return '<span class="tok-str">' + escapeHTML(quoted) + '</span>';
      }
      if (match === 'true' || match === 'false') {
        return '<span class="tok-bool">' + match + '</span>';
      }
      if (match === 'null') {
        return '<span class="tok-null">' + match + '</span>';
      }
      return '<span class="tok-num">' + match + '</span>';
    });

    jsonOut.innerHTML = html || '[]';
  }

  /* ============================================================= ACTIONS */
  function readForm() {
    var tier = form.querySelector('input[name="tier"]:checked');
    return {
      id: editingId || nextId(),
      fullName: elName.value.trim(),
      email: elEmail.value.trim(),
      phone: elPhone && elPhone.value.trim() ? formatPhone(elPhone.value) : '',
      age: parseInt(elAge.value, 10),
      company: elCompany ? elCompany.value.trim() : '',
      affiliation: elAddress.value.trim(),
      track: elTrack ? elTrack.value : '',
      tier: tier ? tier.value : 'full',
      wantsUpdates: Boolean(elUpdates && elUpdates.checked),
      checkedIn: false,
      registeredAt: new Date().toISOString()
    };
  }

  function formatPhone(raw) {
    var d = String(raw).replace(/\D/g, '');
    if (d.length !== 10) return String(raw).trim();
    return '(' + d.slice(0, 3) + ') ' + d.slice(3, 6) + '-' + d.slice(6);
  }

  function resetEditing() {
    editingId = null;
    if (btnSubmitLbl) btnSubmitLbl.textContent = 'Complete registration';
    if (editingNote) editingNote.hidden = true;
  }

  function clearStates() {
    Object.keys(RULES).forEach(function (key) {
      var el = RULES[key].el;
      if (!el) return;
      el.classList.remove('is-invalid', 'is-valid');
      el.removeAttribute('aria-invalid');
      var wrap = el.closest('.field');
      if (wrap) wrap.classList.remove('has-error');
      var errEl = document.getElementById('err' + key.replace(/^tb/, '').replace(/^cb/, ''));
      if (errEl) errEl.textContent = '';
    });
    if (errorSummary) errorSummary.hidden = true;
  }

  /* ------------------------------------------------------------- SUBMIT */
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    if (!window.validateData()) return;

    var record = readForm();
    var isUpdate = Boolean(editingId);

    if (isUpdate) {
      var i = attendees.findIndex(function (a) { return a.id === editingId; });
      if (i > -1) {
        /* Preserve the original registration timestamp on an update. */
        record.registeredAt = attendees[i].registeredAt;
        record.updatedAt = new Date().toISOString();
        attendees[i] = record;
      }
    } else {
      attendees.push(record);
    }

    save();
    resetEditing();
    renderRoster();

    form.reset();
    clearStates();
    updateMeter();

    if (successBanner) {
      successBanner.hidden = false;
      if (successTitle) {
        successTitle.textContent = isUpdate
          ? 'Attendee record updated'
          : 'Registration confirmed — ' + record.id;
      }
      if (successBody) {
        successBody.textContent = isUpdate
          ? record.fullName + '’s details have been updated on the register.'
          : 'A confirmation has been sent to ' + record.email +
            '. Your badge will be waiting at the registration desk.';
      }
    }

    if (window.Converge && window.Converge.toast) {
      window.Converge.toast(
        isUpdate ? 'Record updated: ' + record.fullName
                 : 'Registered: ' + record.fullName + ' (' + record.id + ')',
        isUpdate ? 'info' : undefined
      );
    }

    var roster = document.getElementById('roster');
    if (roster && !isUpdate) {
      roster.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'start' });
    }
  });

  /* ------------------------------------------- LIVE VALIDATION FEEDBACK
     Validate on blur (not on every keystroke — that punishes mid-typing),
     but clear an existing error as soon as the user starts fixing it.    */
  Object.keys(RULES).forEach(function (key) {
    var el = RULES[key].el;
    if (!el) return;

    el.addEventListener('blur', function () {
      validateField(key, true);
      updateMeter();
    });

    el.addEventListener('input', function () {
      if (el.classList.contains('is-invalid')) validateField(key, true);
      updateMeter();
    });

    if (RULES[key].isCheckbox) {
      el.addEventListener('change', function () {
        validateField(key, true);
        updateMeter();
      });
    }
  });

  form.addEventListener('reset', function () {
    window.setTimeout(function () {
      clearStates();
      resetEditing();
      updateMeter();
      if (successBanner) successBanner.hidden = true;
    }, 0);
  });

  /* --------------------------------------------------- EDIT + DELETE (CRUD) */
  if (rosterBody) {
    rosterBody.addEventListener('click', function (e) {
      var editBtn = e.target.closest('[data-edit]');
      var delBtn = e.target.closest('[data-del]');

      if (editBtn) {
        var rec = attendees.find(function (a) { return a.id === editBtn.getAttribute('data-edit'); });
        if (!rec) return;

        editingId = rec.id;
        elName.value = rec.fullName;
        elEmail.value = rec.email;
        if (elPhone) elPhone.value = rec.phone || '';
        elAge.value = rec.age;
        if (elCompany) elCompany.value = rec.company || '';
        elAddress.value = rec.affiliation;
        if (elTrack) elTrack.value = rec.track || '';
        if (elUpdates) elUpdates.checked = Boolean(rec.wantsUpdates);
        if (elTerms) elTerms.checked = true;

        var tierInput = form.querySelector('input[name="tier"][value="' + rec.tier + '"]');
        if (tierInput) tierInput.checked = true;

        clearStates();
        updateMeter();

        if (btnSubmitLbl) btnSubmitLbl.textContent = 'Save changes';
        if (editingNote) editingNote.hidden = false;
        if (successBanner) successBanner.hidden = true;

        renderRoster();

        document.getElementById('register')
          .scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'start' });
        elName.focus();
        return;
      }

      if (delBtn) {
        var id = delBtn.getAttribute('data-del');
        var victim = attendees.find(function (a) { return a.id === id; });
        if (!victim) return;

        if (!window.confirm('Remove ' + victim.fullName + ' from the attendee register?')) return;

        attendees = attendees.filter(function (a) { return a.id !== id; });
        if (editingId === id) { resetEditing(); form.reset(); clearStates(); }
        save();
        renderRoster();
        updateMeter();

        if (window.Converge && window.Converge.toast) {
          window.Converge.toast('Removed: ' + victim.fullName, 'danger');
        }
      }
    });
  }

  /* -------------------------------------------- REGISTER-LEVEL CONTROLS */
  var btnDownload = document.getElementById('btnDownload');
  if (btnDownload) {
    btnDownload.addEventListener('click', function () {
      var blob = new Blob([JSON.stringify(attendees, null, 2)], { type: 'application/json' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'attendees.json';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      if (window.Converge && window.Converge.toast) {
        window.Converge.toast('attendees.json downloaded (' + attendees.length + ' records)', 'info');
      }
    });
  }

  function copyJSON() {
    var text = JSON.stringify(attendees, null, 2);

    function done() {
      if (window.Converge && window.Converge.toast) {
        window.Converge.toast('JSON copied to clipboard', 'info');
      }
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(fallback);
    } else {
      fallback();
    }

    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:absolute;left:-9999px;';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); done(); } catch (err) { /* nothing to do */ }
      ta.remove();
    }
  }

  var btnCopy = document.getElementById('btnCopy');
  var btnCopyInline = document.getElementById('btnCopyInline');
  if (btnCopy) btnCopy.addEventListener('click', copyJSON);
  if (btnCopyInline) btnCopyInline.addEventListener('click', copyJSON);

  var btnClearAll = document.getElementById('btnClearAll');
  if (btnClearAll) {
    btnClearAll.addEventListener('click', function () {
      if (!attendees.length) {
        if (window.Converge && window.Converge.toast) {
          window.Converge.toast('The register is already empty', 'info');
        }
        return;
      }
      if (!window.confirm('Clear all ' + attendees.length + ' attendee records? This cannot be undone.')) return;

      attendees = [];
      resetEditing();
      save();
      renderRoster();
      if (window.Converge && window.Converge.toast) {
        window.Converge.toast('Attendee register cleared', 'danger');
      }
    });
  }

  /* Sample data — makes the table and JSON viewer screenshot-ready instantly. */
  var SEED = [
    {
      id: 'ATT-0001', fullName: 'Ava Delgado', email: 'ava.delgado@northwind.io',
      phone: '(415) 555-0142', age: 34,
      company: 'Northwind Events',
      affiliation: '1200 Market Street\nSan Francisco, CA 94102',
      track: 'registration', tier: 'full', wantsUpdates: true, checkedIn: false,
      registeredAt: '2026-10-08T14:02:11.000Z'
    },
    {
      id: 'ATT-0002', fullName: 'Daniel Okonkwo', email: 'd.okonkwo@hemlockconf.org',
      phone: '(312) 555-0188', age: 41,
      company: 'Hemlock Conference Group',
      affiliation: '88 North Wacker Drive\nChicago, IL 60606',
      track: 'badging', tier: 'full', wantsUpdates: false, checkedIn: false,
      registeredAt: '2026-10-08T15:19:48.000Z'
    },
    {
      id: 'ATT-0003', fullName: 'Mara Lindqvist', email: 'mara@civicexpo.se',
      phone: '', age: 29,
      company: 'Civic Expo AB',
      affiliation: 'Sveavägen 44\n111 34 Stockholm, Sweden',
      track: 'data', tier: 'single', wantsUpdates: true, checkedIn: false,
      registeredAt: '2026-10-08T16:40:02.000Z'
    },
    {
      id: 'ATT-0004', fullName: 'Chetan Konathala', email: 'chetan.k@psu.edu',
      phone: '(814) 555-0219', age: 21,
      company: 'Penn State University — IST 256',
      affiliation: 'University Park, PA 16802',
      track: 'leadership', tier: 'student', wantsUpdates: true, checkedIn: false,
      registeredAt: '2026-10-08T17:05:30.000Z'
    }
  ];

  var btnSeed = document.getElementById('btnSeed');
  if (btnSeed) {
    btnSeed.addEventListener('click', function () {
      var added = 0;
      SEED.forEach(function (s) {
        var exists = attendees.some(function (a) {
          return a.email.toLowerCase() === s.email.toLowerCase();
        });
        if (!exists) {
          /* Clone so repeated clicks never mutate the seed itself. */
          attendees.push(JSON.parse(JSON.stringify(s)));
          added++;
        }
      });
      save();
      renderRoster();
      if (window.Converge && window.Converge.toast) {
        window.Converge.toast(
          added ? 'Loaded ' + added + ' sample attendee records' : 'Sample records are already loaded',
          'info'
        );
      }
    });
  }

  /* ---------------------------------------------------------------- BOOT */
  load();
  renderRoster();
  updateMeter();
})();
