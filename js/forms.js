// Language switching
const LANG_KEY = 'restaurant-lang';
const DEFAULT_LANG = 'en';
let originalTexts = new Map();

function getLanguage() {
  return localStorage.getItem(LANG_KEY) || DEFAULT_LANG;
}

function storeOriginalTexts() {
  if (originalTexts.size > 0) return; // Already stored
  
  // Store section titles
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    originalTexts.set('title:' + key, el.textContent);
  });
  
  // Store menu category labels
  document.querySelectorAll('.menu-category h3').forEach((h3, i) => {
    originalTexts.set('menu:' + i, h3.textContent);
  });
  
  // Store about text
  const aboutContent = document.querySelector('.about-content');
  if (aboutContent) {
    originalTexts.set('about', aboutContent.innerHTML);
  }
  
  // Store footer
  const footerP = document.querySelector('.site-footer p:last-of-type');
  if (footerP) {
    originalTexts.set('footer', footerP.textContent);
  }
  
  // Store day names
  document.querySelectorAll('.hour-day').forEach((el, i) => {
    originalTexts.set('day:' + i, el.textContent);
  });
  
  // Store form label text
  document.querySelectorAll('form label').forEach((label, i) => {
    originalTexts.set('label:' + i, label.textContent);
  });
  
  // Store form button text
  document.querySelectorAll('form button[type="submit"]').forEach((btn, i) => {
    originalTexts.set('button:' + i, btn.textContent);
  });
  
  // Store form select options
  document.querySelectorAll('form select option').forEach((opt, i) => {
    originalTexts.set('option:' + i, opt.textContent);
  });
  
  // Store form placeholders
  document.querySelectorAll('form input[placeholder], form textarea[placeholder]').forEach((input, i) => {
    originalTexts.set('placeholder:' + i, input.placeholder);
  });
  
  // Store time hint
  const timeHint = document.querySelector('form small');
  if (timeHint) {
    originalTexts.set('time_hint', timeHint.textContent);
  }
  
  // Store order form "Select Items" header
  const selectItemsH4 = document.querySelector('#order-form h4');
  if (selectItemsH4) {
    originalTexts.set('select_items', selectItemsH4.textContent);
  }
}

function setLanguage(lang) {
  localStorage.setItem(LANG_KEY, lang);
  applyLanguage(lang);
}

function applyLanguage(lang) {
  const btn = document.getElementById('lang-toggle');
  if (!btn) return;
  
  btn.textContent = lang === 'de' ? 'EN' : 'DE';
  btn.setAttribute('aria-label', lang === 'de' ? 'Switch to English' : 'Zur deutschen Sprache wechseln');
  
  // Store original English texts on first load
  storeOriginalTexts();
  
  if (lang === 'de') {
    fetch('_data/restaurant.de.json')
      .then(r => r.json())
      .then(translations => {
        // Section titles
        document.querySelectorAll('[data-i18n]').forEach(el => {
          const key = el.getAttribute('data-i18n');
          if (translations.section_titles && translations.section_titles[key]) {
            el.textContent = translations.section_titles[key];
          }
        });
        
        // Day of week translations
        const dayMap = {
          'mon': 'Montag',
          'tue': 'Dienstag',
          'wed': 'Mittwoch',
          'thu': 'Donnerstag',
          'fri': 'Freitag',
          'sat': 'Samstag',
          'sun': 'Sonntag'
        };
        document.querySelectorAll('.hour-day').forEach(el => {
          const day = el.textContent.toLowerCase();
          if (dayMap[day]) {
            el.textContent = dayMap[day];
          }
        });
        
        // Menu labels - match by slugified category name
        const menuLabels = translations.menu_labels || {};
        document.querySelectorAll('.menu-category h3').forEach(h3 => {
          const slug = h3.textContent.toLowerCase().replace(/\s+/g, '-');
          // Map common names to keys
          const keyMap = {
            'appetizers': 'appetizers',
            'vorspeisen': 'appetizers',
            'pizza': 'pizza',
            'pasta': 'pasta',
            'desserts': 'desserts',
            'drinks': 'drinks',
            'getranke': 'drinks',
            'getränke': 'drinks'
          };
          const key = keyMap[slug];
          if (key && menuLabels[key]) {
            h3.textContent = menuLabels[key];
          }
        });
        
        // About text
        const aboutContent = document.querySelector('.about-content');
        if (aboutContent && translations.about_text) {
          aboutContent.innerHTML = translations.about_text;
        }
        
        // Booking form
        const bookingForm = document.getElementById('booking-form');
        if (bookingForm && translations.forms && translations.forms.booking) {
          const b = translations.forms.booking;
          const labels = bookingForm.querySelectorAll('label');
          const labelsMap = ['name', 'email', 'phone', 'date', 'time', 'party_size', 'special_requests'];
          labels.forEach((label, i) => {
            if (labelsMap[i] && b[labelsMap[i]]) {
              label.textContent = b[labelsMap[i]];
            }
          });
          const submitBtn = bookingForm.querySelector('button[type="submit"]');
          if (submitBtn && b.submit) submitBtn.textContent = b.submit;
          const timeHint = bookingForm.querySelector('small');
          if (timeHint && b.time_hint) timeHint.textContent = b.time_hint;
        }
        
        // Order form
        const orderForm = document.getElementById('order-form');
        if (orderForm && translations.forms && translations.forms.order) {
          const o = translations.forms.order;
          const labels = orderForm.querySelectorAll('label');
          const labelsMap = ['name', 'phone', 'order_type', 'address', 'special_instructions'];
          labels.forEach((label, i) => {
            if (labelsMap[i] && o[labelsMap[i]]) {
              label.textContent = o[labelsMap[i]];
            }
          });
          const typeSelect = orderForm.querySelector('select[name="orderType"]');
          if (typeSelect) {
            const options = typeSelect.querySelectorAll('option');
            if (options[0]) options[0].textContent = o.pickup;
            if (options[1]) options[1].textContent = o.delivery;
          }
          const addressInput = orderForm.querySelector('input[name="address"]');
          if (addressInput && o.address_placeholder) addressInput.placeholder = o.address_placeholder;
          const selectItemsH4 = orderForm.querySelector('h4');
          if (selectItemsH4 && o.select_items) selectItemsH4.textContent = o.select_items;
          const submitBtn = orderForm.querySelector('button[type="submit"]');
          if (submitBtn && o.submit) submitBtn.textContent = o.submit;
          const notesTextarea = orderForm.querySelector('textarea[name="notes"]');
          if (notesTextarea && o.placeholder_instructions) notesTextarea.placeholder = o.placeholder_instructions;
        }
        
        // Menu items - translate within each category
        const menuItems = translations.menu_items || {};
        const categoryKeys = Object.keys(menuItems);
        document.querySelectorAll('.menu-category').forEach((catDiv, catIndex) => {
          const key = categoryKeys[catIndex];
          if (!key || !menuItems[key]) return;
          const items = catDiv.querySelectorAll('.menu-item');
          items.forEach((item, itemIndex) => {
            const menuItem = menuItems[key][itemIndex];
            if (!menuItem) return;
            const nameEl = item.querySelector('.menu-item-name');
            const descEl = item.querySelector('.menu-item-description');
            if (nameEl && menuItem.name) nameEl.textContent = menuItem.name;
            if (descEl && menuItem.description) descEl.textContent = menuItem.description;
          });
        });
        
        // Footer
        const footerP = document.querySelector('.site-footer p:last-of-type');
        if (footerP && translations.footer) {
          footerP.textContent = '© ' + document.querySelector('h1').textContent + '. ' + translations.footer;
        }
      })
      .catch(() => console.log('German translations not found, using English'));
  } else {
    // Restore English
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const original = originalTexts.get('title:' + key);
      if (original) el.textContent = original;
    });
    
    document.querySelectorAll('.menu-category h3').forEach((h3, i) => {
      const original = originalTexts.get('menu:' + i);
      if (original) h3.textContent = original;
    });
    
    // Restore about text
    const aboutContent = document.querySelector('.about-content');
    const originalAbout = originalTexts.get('about');
    if (aboutContent && originalAbout) {
      aboutContent.innerHTML = originalAbout;
    }
    
    // Restore day names
    document.querySelectorAll('.hour-day').forEach((el, i) => {
      const original = originalTexts.get('day:' + i);
      if (original) el.textContent = original;
    });
    
    // Restore form labels
    document.querySelectorAll('form label').forEach((label, i) => {
      const original = originalTexts.get('label:' + i);
      if (original) label.textContent = original;
    });
    
    // Restore form buttons
    document.querySelectorAll('form button[type="submit"]').forEach((btn, i) => {
      const original = originalTexts.get('button:' + i);
      if (original) btn.textContent = original;
    });
    
    // Restore form select options
    document.querySelectorAll('form select option').forEach((opt, i) => {
      const original = originalTexts.get('option:' + i);
      if (original) opt.textContent = original;
    });
    
    // Restore form placeholders
    document.querySelectorAll('form input[placeholder], form textarea[placeholder]').forEach((input, i) => {
      const original = originalTexts.get('placeholder:' + i);
      if (original) input.placeholder = original;
    });
    
    // Restore time hint
    const timeHint = document.querySelector('form small');
    const originalTimeHint = originalTexts.get('time_hint');
    if (timeHint && originalTimeHint) {
      timeHint.textContent = originalTimeHint;
    }
    
    // Restore order form "Select Items" header
    const selectItemsH4 = document.querySelector('#order-form h4');
    const originalSelectItems = originalTexts.get('select_items');
    if (selectItemsH4 && originalSelectItems) {
      selectItemsH4.textContent = originalSelectItems;
    }
    
    const footerP = document.querySelector('.site-footer p:last-of-type');
    const originalFooter = originalTexts.get('footer');
    if (footerP && originalFooter) {
      footerP.textContent = originalFooter;
    }
  }
}

// Initialize language
document.addEventListener('DOMContentLoaded', () => {
  const lang = getLanguage();
  applyLanguage(lang);
  
  // Language toggle button
  const langBtn = document.getElementById('lang-toggle');
  if (langBtn) {
    langBtn.addEventListener('click', () => {
      const current = getLanguage();
      setLanguage(current === 'de' ? DEFAULT_LANG : 'de');
    });
  }
  
  // Dark mode toggle
  const darkBtn = document.getElementById('dark-mode-toggle');
  if (darkBtn) {
    const isDark = localStorage.getItem('dark-mode') === 'true';
    if (isDark) {
      document.body.classList.add('dark-mode');
      darkBtn.textContent = '☀️';
    }
    
    darkBtn.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
      const dark = document.body.classList.contains('dark-mode');
      localStorage.setItem('dark-mode', dark);
      darkBtn.textContent = dark ? '☀️' : '🌙';
    });
  }
});

// Booking form handling
document.addEventListener('DOMContentLoaded', () => {
  const bookingForm = document.getElementById('booking-form');
  if (bookingForm) {
    bookingForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = bookingForm.querySelector('button[type="submit"]');
      const originalText = btn.textContent;
      btn.textContent = 'Sending...';
      btn.disabled = true;
      
      const formData = new FormData(bookingForm);
      const data = Object.fromEntries(formData.entries());
      
      try {
        const response = await fetch('https://formspree.io/f/' + bookingForm.dataset.formId, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        
        if (response.ok) {
          btn.textContent = '✓ Sent!';
          bookingForm.reset();
          setTimeout(() => {
            btn.textContent = originalText;
            btn.disabled = false;
          }, 3000);
        } else {
          throw new Error('Failed to send');
        }
      } catch (error) {
        btn.textContent = '✗ Error';
        setTimeout(() => {
          btn.textContent = originalText;
          btn.disabled = false;
        }, 3000);
      }
    });
  }
  
  // Order form handling
  const orderForm = document.getElementById('order-form');
  if (orderForm) {
    const typeSelect = orderForm.querySelector('select[name="order_type"]');
    const addressGroup = document.getElementById('address-group');
    
    if (typeSelect && addressGroup) {
      typeSelect.addEventListener('change', () => {
        addressGroup.style.display = typeSelect.value === 'delivery' ? 'block' : 'none';
      });
    }
    
    orderForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = orderForm.querySelector('button[type="submit"]');
      const originalText = btn.textContent;
      btn.textContent = 'Sending...';
      btn.disabled = true;
      
      const formData = new FormData(orderForm);
      const data = Object.fromEntries(formData.entries());
      
      // Collect selected items
      const items = {};
      orderForm.querySelectorAll('input[name^="item_"]').forEach(input => {
        const qty = input.value;
        if (qty > 0) {
          const key = input.name.replace('_qty', '');
          items[key] = qty;
        }
      });
      data.items = JSON.stringify(items);
      
      try {
        const response = await fetch('https://formspree.io/f/' + orderForm.dataset.formId, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        
        if (response.ok) {
          btn.textContent = '✓ Order sent!';
          orderForm.reset();
          updateOrderTotal();
          setTimeout(() => {
            btn.textContent = originalText;
            btn.disabled = false;
          }, 3000);
        } else {
          throw new Error('Failed to send');
        }
      } catch (error) {
        btn.textContent = '✗ Error';
        setTimeout(() => {
          btn.textContent = originalText;
          btn.disabled = false;
        }, 3000);
      }
    });
  }
});
