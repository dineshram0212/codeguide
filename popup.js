document.getElementById('saveButton').addEventListener('click', () => {
    const model = document.getElementById('modelSelect').value;
    const apiKey = document.getElementById('apiKey').value;
    
    chrome.storage.sync.set({
      model: model,
      apiKey: apiKey
    }, () => {
      const status = document.createElement('div');
      status.textContent = 'Settings saved!';
      status.classList.add('status-message'); 
      document.body.appendChild(status);
      setTimeout(() => status.remove(), 1500);
    });
  });
  
  