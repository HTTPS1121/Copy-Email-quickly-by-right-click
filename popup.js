document.addEventListener('DOMContentLoaded', function() {
  const powerIcon = document.getElementById('powerIcon');
  const statusText = document.getElementById('statusText');

  // Load initial state
  chrome.storage.local.get(['isActive'], function(result) {
    const isActive = result.isActive === undefined ? true : result.isActive;
    updateUI(isActive);
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

  function updateUI(isActive) {
    if (isActive) {
      powerIcon.classList.add('active');
      powerIcon.classList.remove('inactive');
      statusText.textContent = 'active';
    } else {
      powerIcon.classList.add('inactive');
      powerIcon.classList.remove('active');
      statusText.textContent = 'inactive';
    }
  }
});
