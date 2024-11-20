document.addEventListener('DOMContentLoaded', function() {
  const powerIcon = document.getElementById('powerIcon');
  const statusText = document.getElementById('statusText');
  const showNotificationCheckbox = document.getElementById('showNotification');
  const notificationWrapper = document.getElementById('notificationWrapper');

  // Load initial states
  chrome.storage.local.get(['isActive', 'showNotification'], function(result) {
    const isActive = result.isActive === undefined ? true : result.isActive;
    const showNotification = result.showNotification === undefined ? true : result.showNotification;
    
    updateUI(isActive);
    showNotificationCheckbox.checked = showNotification;
  });

  powerIcon.addEventListener('click', function() {
    chrome.storage.local.get(['isActive'], function(result) {
      const currentState = result.isActive === undefined ? true : result.isActive;
      const newState = !currentState;
      
      chrome.storage.local.set({ isActive: newState }, function() {
        updateUI(newState);
      });
    });
  });

  showNotificationCheckbox.addEventListener('change', function() {
    chrome.storage.local.set({ showNotification: this.checked });
  });

  function updateUI(isActive) {
    if (isActive) {
      powerIcon.classList.add('active');
      powerIcon.classList.remove('inactive');
      statusText.textContent = 'active';
      notificationWrapper.classList.remove('disabled');
    } else {
      powerIcon.classList.add('inactive');
      powerIcon.classList.remove('active');
      statusText.textContent = 'inactive';
      notificationWrapper.classList.add('disabled');
    }
  }
});
