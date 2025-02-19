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
function addExplainButtons() {
  //   const codeBlocks = document.querySelectorAll("pre code");
  const codeBlocks = document.querySelectorAll(
    "pre code:not(.code-helper-explanation code)"
  );

  codeBlocks.forEach((codeBlock) => {
    const preContainer = codeBlock.closest("pre"); 

    if (preContainer.nextElementSibling?.classList.contains("code-helper-container")) {
        return;
      }
    // const container = codeBlock.parentElement;

    // // Skip if button already exists
    // if (container.querySelector(".code-helper-btn") || container.closest(".code-helper-explanation")) {
    //   return;
    // }

    // Create button container
    const buttonContainer = document.createElement("div");
    buttonContainer.className = "code-helper-container";

    // Create button
    const button = document.createElement("button");
    button.textContent = "Explain Code";
    button.className = "code-helper-btn";

    buttonContainer.appendChild(button);

    // Add container after the code block
    preContainer.parentNode.insertBefore(buttonContainer, codeBlock.nextSibling);

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
        const existingExplanation = buttonContainer.querySelector(
          ".code-helper-explanation"
        );
        if (existingExplanation) {
          existingExplanation.remove();
        }

        // Create new explanation
        const explanation = document.createElement("div");
        explanation.className = "code-helper-explanation";
        explanation.innerHTML = formatExplanation(data.explanation);

        buttonContainer.appendChild(explanation);
      } catch (error) {
        alert(
          "Error getting explanation. Please check your settings and try again."
        );
      } finally {
        button.disabled = false;
        button.textContent = "Explain Code";
      }
    });
  });
}

// Run on page load
addExplainButtons();

//   // Run when content is dynamically added
const observer = new MutationObserver(addExplainButtons);
observer.observe(document.body, {
  childList: true,
  subtree: true,
});
