function checkIn(habitId, button) {
    $.post(`/userhome/check-in/${habitId}`, function (data) {
      // Update the points and level display
      $('.points-display').html(`Level ${data.level} ${data.points}/${data.level * 100 * 1.25}`);
  
      // Update the button to show "Checked-In ✓"
      $(button).replaceWith('<span class="checked-in">Checked-In ✓</span>');
    });
  }
  