import { API_BASE_URL } from "./config.js"; 

function formatExplanation(text) {
  // Replace headings
  text = text.replace(/^### (.*?)$/gm, "<h3>$1</h3>");
  text = text.replace(/^## (.*?)$/gm, "<h2>$1</h2>");
  text = text.replace(/^# (.*?)$/gm, "<h1>$1</h1>");

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
let observedElements = new Set();

function addExplainButtons() {
  const codeBlocks = document.querySelectorAll("pre code");

  codeBlocks.forEach((codeBlock) => {
    const preContainer = codeBlock.closest("pre");

    if (!preContainer || observedElements.has(preContainer)) {
      return;
    }

    observedElements.add(preContainer);

    const buttonContainer = document.createElement("div");
    buttonContainer.className = "code-helper-container";

    const buttonGroup = document.createElement("div");
    buttonGroup.style.display = "flex";
    buttonGroup.style.gap = "10px";
    buttonGroup.style.alignItems = "center";
    buttonContainer.appendChild(buttonGroup);

    const explainButton = document.createElement("button");
    explainButton.textContent = "Explain Code";
    explainButton.className = "code-helper-btn";
    buttonGroup.appendChild(explainButton);

    // Create toggle button with icon
    const toggleButton = document.createElement("button");
    toggleButton.className = "code-helper-toggle-btn";
    toggleButton.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 15l-6-6-6 6"/>
          </svg>
      `;
    toggleButton.style.display = "none";
    buttonGroup.appendChild(toggleButton);

    preContainer.parentNode.insertBefore(
      buttonContainer,
      preContainer.nextSibling
    );

    explainButton.addEventListener("click", async () => {
      const code = codeBlock.textContent;

      const settings = await chrome.storage.sync.get(["model", "apiKey"]);
      if (!settings.apiKey) {
        alert("Please set your API key in the extension popup");
        return;
      }

      explainButton.disabled = true;
      explainButton.textContent = "Explaining...";

      chrome.runtime.sendMessage({ type: "get_tab_id" }, async (response) => {
        if (!response || !response.tabId) {
          alert("Failed to get tab ID.");
          explainButton.disabled = false;
          explainButton.textContent = "Explain Code";
          return;
        }

        const tabId = response.tabId;

        try {
          const apiResponse = await fetch(`${API_BASE_URL}/explain`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              code: code,
              model: settings.model,
              api_key: settings.apiKey,
              tab_id: '' + tabId,
            }),
          });

          const data = await apiResponse.json();

          const existingExplanation = buttonContainer.querySelector(
            ".code-helper-explanation"
          );
          if (existingExplanation) {
            existingExplanation.remove();
          }

          const explanation = document.createElement("div");
          explanation.className = "code-helper-explanation";
          explanation.innerHTML = formatExplanation(data.explanation);
          buttonContainer.appendChild(explanation);

          toggleButton.style.display = "flex";
          toggleButton.setAttribute("data-expanded", "true");
        } catch (error) {
          alert(
            "Error getting explanation. Please check your settings and try again."
          );
        } finally {
          explainButton.disabled = false;
          explainButton.textContent = "Explain Code";
        }
      });
    });

    toggleButton.addEventListener("click", () => {
      const explanation = buttonContainer.querySelector(
        ".code-helper-explanation"
      );
      const isExpanded = toggleButton.getAttribute("data-expanded") === "true";

      if (explanation) {
        if (isExpanded) {
          explanation.style.display = "none";
          toggleButton.style.transform = "rotate(180deg)";
          toggleButton.setAttribute("data-expanded", "false");
        } else {
          explanation.style.display = "block";
          toggleButton.style.transform = "rotate(0deg)";
          toggleButton.setAttribute("data-expanded", "true");
        }
      }
    });
  });
}

// Run on page load
addExplainButtons();

let observerTimeout;

const observer = new MutationObserver(() => {
  clearTimeout(observerTimeout);
  observerTimeout = setTimeout(addExplainButtons, 500);
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});
