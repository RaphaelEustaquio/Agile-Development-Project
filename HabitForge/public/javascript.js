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