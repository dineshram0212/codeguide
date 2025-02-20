function formatExplanation(text) {
    // Replace headings
    text = text.replace(/^### (.*?)$/gm, "<h3>$1</h3>");
    text = text.replace(/^## (.*?)$/gm, "<h2>$1</h2>");
    
    // Handle paragraphs and line breaks
    text = text.replace(/\n\n/g, "</p><p>");
    text = text.replace(/\n/g, "<br>");
    
    // Simple inline code formatting
    text = text.replace(/`(.*?)`/g, '<code class="inline-code">$1</code>');
    
    // Bold text
    text = text.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");
    
    return `<p>${text}</p>`;
}


// content.js
let observedElements = new Set(); // Keep track of processed elements

function addExplainButtons() {
  const codeBlocks = document.querySelectorAll("pre code");

  codeBlocks.forEach((codeBlock) => {
    const preContainer = codeBlock.closest("pre");

    // ✅ Skip if the button was already added
    if (!preContainer || observedElements.has(preContainer)) {
      return;
    }

    // ✅ Mark this <pre> as processed
    observedElements.add(preContainer);

    // Create button container
    const buttonContainer = document.createElement("div");
    buttonContainer.className = "code-helper-container";

    // Create button
    const button = document.createElement("button");
    button.textContent = "Explain Code";
    button.className = "code-helper-btn";
    buttonContainer.appendChild(button);

    // ✅ Place button *below* the <pre> block
    preContainer.parentNode.insertBefore(buttonContainer, preContainer.nextSibling);

    button.addEventListener("click", async () => {
      const code = codeBlock.textContent;

      // Get settings from storage
      const settings = await chrome.storage.sync.get(["model", "apiKey"]);
      if (!settings.apiKey) {
        alert("Please set your API key in the extension popup");
        return;
      }

      button.disabled = true;
      button.textContent = "Explaining...";

      try {
        const response = await fetch("http://localhost:8000/explain", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            code: code,
            model: settings.model,
            api_key: settings.apiKey,
          }),
        });

        const data = await response.json();

        // Remove existing explanation if it exists
        const existingExplanation = buttonContainer.querySelector(".code-helper-explanation");
        if (existingExplanation) {
          existingExplanation.remove();
        }

        // Create new explanation
        const explanation = document.createElement("div");
        explanation.className = "code-helper-explanation";
        explanation.innerHTML = formatExplanation(data.explanation);

        buttonContainer.appendChild(explanation);
      } catch (error) {
        alert("Error getting explanation. Please check your settings and try again.");
      } finally {
        button.disabled = false;
        button.textContent = "Explain Code";
      }
    });
  });
}

// Run on page load
addExplainButtons();

let observerTimeout;

const observer = new MutationObserver(() => {
  clearTimeout(observerTimeout); // Prevent multiple calls in quick succession
  observerTimeout = setTimeout(addExplainButtons, 500); // ✅ Debounce execution (500ms delay)
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});
