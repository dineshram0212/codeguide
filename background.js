// Listen for tab close event
chrome.tabs.onRemoved.addListener((tabId) => {
    // Send request to backend to clear memory for this tab
    fetch("http://127.0.0.1:8000/clear_memory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tab_id: tabId })
    }).catch((err) => console.error("Error clearing memory:", err));
});


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "get_tab_id") {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs.length > 0) {
                sendResponse({ tabId: tabs[0].id });
            } else {
                sendResponse({ tabId: null });
            }
        });
        return true; 
    }
});
