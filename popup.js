document.addEventListener('DOMContentLoaded', function() {
  const startButton = document.getElementById('start');
  const stopButton = document.getElementById('stop');

  function sendMessageToContentScript(message) {
    console.log('Sending message to content script:', message);
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (tabs.length === 0) {
        console.error('No active tabs.');
        return;
      }
      chrome.tabs.sendMessage(tabs[0].id, {message: message}, function(response) {
        if (chrome.runtime.lastError) {
          console.error('Error sending message:', chrome.runtime.lastError.message);
        } else if (response) {
          console.log('Response from content script:', response.status);
        }
      });
    });
  }

  startButton.addEventListener('click', function() {
    sendMessageToContentScript('start_observing');
  });

  stopButton.addEventListener('click', function() {
    sendMessageToContentScript('stop_observing');
  });
});
