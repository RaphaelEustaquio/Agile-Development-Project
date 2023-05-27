const checkIn = (habitId, button) => {
    $.post(`/userhome/check-in/${habitId}`, function (data) {
      // Update the points and level display
      $('.points-display').html(`Level ${data.level} ${data.points}/${data.level * 100 * 1.25}`);
  
      // Update the button to show "Checked-In ✓"
      $(button).replaceWith('<span class="checked-in">Checked-In ✓</span>');
    });
  }
  
const initLoginPage = () => {
  const errorMessage = document.getElementById('error-message');
  if (errorMessage) {
    sessionStorage.setItem('errorShown', 'true');
    setTimeout(() => {
      errorMessage.style.display = 'none';
    }, 10000);
  } else {
    sessionStorage.removeItem('errorShown');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const loginPage = document.getElementById('login-page');
  if (loginPage) {
    initLoginPage();
  }
});

function sentRequest() {
  alert("Friend request sent!");
}

function validateForm() {
  const checkboxes = document.querySelectorAll('input[type="checkbox"][name="logDays[]"]');
  const checked = Array.from(checkboxes).some(checkbox => checkbox.checked);
  
  if (!checked) {
      alert('Please select at least one log day.');
      return false;
  }
  
  return true;
}

function markTrophySeen(trophyId) {
  fetch(`/achievements/trophy/${trophyId}/mark-seen`, { method: 'POST' });
}

window.addEventListener('DOMContentLoaded', function() {
  const habitContainer = document.querySelector('.habit-container');
  const scrollMessage = document.querySelector('.scroll-message');

  function updateScrollMessage() {
    if (habitContainer.scrollHeight > habitContainer.clientHeight) {
      scrollMessage.style.display = 'block'; // Show the scroll message
    } else {
      scrollMessage.style.display = 'none'; // Hide the scroll message
    }

    if (habitContainer.scrollHeight - habitContainer.scrollTop < habitContainer.clientHeight+40) {
      scrollMessage.style.display = 'none'; // Hide the scroll message at the bottom
    }
  }

  habitContainer.addEventListener('scroll', updateScrollMessage);
  updateScrollMessage(); // Check initial scroll position
});

window.addEventListener('DOMContentLoaded', function() {
  const friendsContainer = document.querySelector('.friends-container');
  const scrollMessage = document.querySelector('.friends-scroll-message');

  function updateScrollMessage() {
    if (friendsContainer.scrollHeight > friendsContainer.clientHeight) {
      scrollMessage.style.display = 'block'; // Show the scroll message
    } else {
      scrollMessage.style.display = 'none'; // Hide the scroll message
    }

    if (friendsContainer.scrollHeight - friendsContainer.scrollTop < friendsContainer.clientHeight+40) {
      scrollMessage.style.display = 'none'; // Hide the scroll message at the bottom
    }
  }

  friendsContainer.addEventListener('scroll', updateScrollMessage);
  updateScrollMessage(); // Check initial scroll position
});


window.addEventListener('DOMContentLoaded', function() {
  const feedContainer = document.querySelector('.feed-container');
  const scrollMessage = document.querySelector('.feed-scroll-message');

  function updateScrollMessage() {
    if (feedContainer.scrollHeight > feedContainer.clientHeight) {
      scrollMessage.style.display = 'block'; // Show the scroll message
    } else {
      scrollMessage.style.display = 'none'; // Hide the scroll message
    }

    if (feedContainer.scrollHeight - feedContainer.scrollTop < feedContainer.clientHeight+80) {
      scrollMessage.style.display = 'none'; // Hide the scroll message at the bottom
    }
  }

  feedContainer.addEventListener('scroll', updateScrollMessage);
  updateScrollMessage(); // Check initial scroll position
});
