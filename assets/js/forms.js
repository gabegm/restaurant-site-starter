/**
 * Restaurant Site Forms
 * Handles mailto: link generation for booking and order forms.
 */

document.addEventListener('DOMContentLoaded', function () {
  // Dark mode toggle
  const darkModeBtn = document.getElementById('dark-mode-toggle');
  if (darkModeBtn) {
    // Check for saved preference
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme === 'true') {
      document.body.classList.add('dark-mode');
      darkModeBtn.textContent = '☀️';
    }

    darkModeBtn.addEventListener('click', function () {
      document.body.classList.toggle('dark-mode');
      const isDark = document.body.classList.contains('dark-mode');
      localStorage.setItem('darkMode', isDark);
      darkModeBtn.textContent = isDark ? '☀️' : '🌙';
    });
  }

  // Hide broken images (menu item photos that don't exist)
  document.querySelectorAll('img').forEach(function (img) {
    img.addEventListener('error', function () {
      this.style.display = 'none';
    });
    // Also hide images that fail to load initially
    if (img.complete && img.naturalWidth === 0) {
      img.style.display = 'none';
    }
  });

  // Booking form handler
  const bookingForm = document.getElementById('booking-form');
  if (bookingForm) {
    bookingForm.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validateBookingForm(this)) return;
      openBookingEmail(this);
    });
  }

  // Order form handler
  const orderForm = document.getElementById('order-form');
  if (orderForm) {
    // Toggle address field visibility
    const orderType = document.getElementById('order-type');
    const addressGroup = document.getElementById('address-group');
    if (orderType && addressGroup) {
      orderType.addEventListener('change', function () {
        addressGroup.style.display = this.value === 'delivery' ? 'block' : 'none';
      });
    }

    orderForm.addEventListener('submit', function (e) {
      e.preventDefault();
      openOrderEmail(this);
    });
  }
});

/**
 * Validate booking form: date must be in the future, time must be within opening hours.
 */
function validateBookingForm(form) {
  const dateInput = form.querySelector('#booking-date');
  const timeInput = form.querySelector('#booking-time');
  
  if (!dateInput || !timeInput) return true;
  
  const dateValue = dateInput.value;
  const timeValue = timeInput.value;
  
  if (!dateValue || !timeValue) return true;
  
  // Parse restaurant hours from frontmatter (passed via data attribute)
  const hoursStr = form.dataset.restaurantHours || '';
  const hours = parseHours(hoursStr);
  
  // Validate date is in the future
  const selectedDate = new Date(dateValue);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (selectedDate < today) {
    alert('Please select a future date.');
    dateInput.focus();
    return false;
  }
  
  // Validate time is within opening hours for that day of the week
  const dayOfWeek = selectedDate.toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase();
  const restaurantHours = hours[dayOfWeek];
  
  if (restaurantHours) {
    const [openStr, closeStr] = restaurantHours.split(' - ');
    const openTime = parseTime(openStr.trim());
    const closeTime = parseTime(closeStr.trim());
    const selectedTime = parseTime(timeValue.trim());
    
    if (selectedTime < openTime || selectedTime > closeTime) {
      alert('Sorry, we are not open at that time. Our hours for ' + dayOfWeek + ' are ' + restaurantHours + '.');
      timeInput.focus();
      return false;
    }
  }
  
  return true;
}

/**
 * Parse hours string from frontmatter (e.g., "11:00 AM - 10:00 PM").
 */
function parseHours(hoursStr) {
  if (!hoursStr) return {};
  
  const hours = {};
  const dayMatches = hoursStr.matchAll(/(\w+):\s*"([^"]+)"/g);
  
  for (const match of dayMatches) {
    hours[match[1].toLowerCase()] = match[2];
  }
  
  return hours;
}

/**
 * Parse time string to minutes since midnight (e.g., "18:30" → 1110).
 */
function parseTime(timeStr) {
  const parts = timeStr.split(':');
  let hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  
  // Handle 12-hour format with AM/PM
  if (timeStr.toUpperCase().includes('PM') && hours < 12) {
    hours += 12;
  } else if (timeStr.toUpperCase().includes('AM') && hours === 12) {
    hours = 0;
  }
  
  return hours * 60 + minutes;
}

/**
 * Open booking email with pre-filled content.
 */
function openBookingEmail(form) {
  const data = getFormData(form);
  const restaurantEmail = form.dataset.restaurantEmail || '';
  const restaurantName = form.dataset.restaurantName || 'Restaurant';

  const subject = encodeURIComponent(`Booking Request — ${restaurantName}`);
  const body = encodeURIComponent(
    `Booking Request\n` +
    `===============\n\n` +
    `Name: ${data.name}\n` +
    `Email: ${data.email}\n` +
    `Phone: ${data.phone}\n` +
    `Date: ${data.date}\n` +
    `Time: ${data.time}\n` +
    `Party Size: ${data.partySize}\n` +
    `Notes: ${data.notes || 'None'}`
  );

  window.location.href = `mailto:${restaurantEmail}?subject=${subject}&body=${body}`;
}

/**
 * Open order email with pre-filled content.
 */
function openOrderEmail(form) {
  const data = getFormData(form);
  const restaurantEmail = form.dataset.restaurantEmail || '';
  const restaurantName = form.dataset.restaurantName || 'Restaurant';

  // Build order items string
  const orderItems = getOrderItems(form);

  const subject = encodeURIComponent(`Order — ${restaurantName}`);
  const body = encodeURIComponent(
    `Order\n` +
    `=====\n\n` +
    `Name: ${data.name}\n` +
    `Phone: ${data.phone}\n` +
    `Order Type: ${data.orderType}\n` +
    `${data.orderType === 'delivery' ? `Delivery Address: ${data.address}\n` : ''}` +
    `Items:\n${orderItems}\n` +
    `Notes: ${data.notes || 'None'}`
  );

  window.location.href = `mailto:${restaurantEmail}?subject=${subject}&body=${body}`;
}

/**
 * Get form data as an object.
 */
function getFormData(form) {
  const data = {};
  const inputs = form.querySelectorAll('input, select, textarea');
  inputs.forEach(input => {
    data[input.name] = input.value;
  });
  return data;
}

/**
 * Get selected order items from the form.
 */
function getOrderItems(form) {
  const checkboxes = form.querySelectorAll('input[name^="item_"]:checked');
  let items = '';
  checkboxes.forEach(checkbox => {
    const quantity = form.querySelector(`input[name="${checkbox.name}_qty"]`)?.value || '1';
    const name = checkbox.value;
    const price = checkbox.dataset.price || '';
    items += `  ${quantity}x ${name} (${price})\n`;
  });
  return items || '  (No items selected)';
}
