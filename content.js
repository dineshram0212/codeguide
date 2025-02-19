// content.js
function addExplainButtons() {
  const codeBlocks = document.querySelectorAll("pre code");

  codeBlocks.forEach((codeBlock) => {
    const container = codeBlock.parentElement;

    // Skip if button already exists
    if (container.querySelector(".code-helper-btn")) {
      return;
    }

    // Create button container
    const buttonContainer = document.createElement("div");
    buttonContainer.className = "code-helper-container";

    // Create button
    const button = document.createElement("button");
    button.textContent = "Explain Code";
    button.className = "code-helper-btn";

    buttonContainer.appendChild(button);

    // Add container after the code block
    codeBlock.parentNode.insertBefore(buttonContainer, codeBlock.nextSibling);

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
        console.log(data)

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
        explanation.textContent = data.explanation;

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
