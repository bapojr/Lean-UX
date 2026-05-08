const promptInput = document.querySelector("#prompt-input");
const greeting = document.querySelector("#greeting");
const inputFocusTarget = document.querySelector("#input-focus-target");
const tabButtons = Array.from(document.querySelectorAll(".tab-button"));
const panelViews = Array.from(document.querySelectorAll(".panel-view"));
const sheetOverlay = document.querySelector("#sheet-overlay");
const suggestionSheet = document.querySelector("#suggestion-sheet");
const moreSheet = document.querySelector("#more-sheet");
const sheetTitle = document.querySelector("#sheet-title");
const sheetList = document.querySelector("#sheet-list");
const closeSheetButton = document.querySelector("#close-sheet");
const closeMoreButton = document.querySelector("#close-more");
const checksContainer = document.querySelector("#checks-pills");
const checksCta = document.querySelector("#checks-cta");
const checksNote = document.querySelector("#checks-note");

const chatOptions = {
  "✏️ Rewrite": [
    "Rewrite this paragraph for a journal introduction",
    "Make this sentence more formal",
    "Rewrite for a non-expert audience",
    "Improve clarity without changing meaning",
    "Rewrite in active voice",
  ],
  "🔄 Paraphrase": [
    "Paraphrase this to avoid repetition",
    "Paraphrase and simplify technical jargon",
    "Paraphrase for a literature review",
    "Reword this passage to sound more original",
    "Paraphrase without losing key citations",
  ],
  "🎭 Tone": [
    "Make this more formal and academic",
    "Adjust tone to sound less aggressive",
    "Make this persuasive for a grant proposal",
    "Soften the tone of this critique",
    "Match the tone of the abstract to the conclusion",
  ],
  "✂️ Trim": [
    "Trim this paragraph to 50 words",
    "Remove redundant phrases from this section",
    "Shorten this conclusion without losing key findings",
    "Make this abstract more concise",
    "Cut filler words from this passage",
  ],
  "🌐 Translate": [
    "Translate this abstract to Spanish",
    "Translate and preserve academic terminology",
    "Translate this section to French for a co-author",
    "Convert British English to American English",
    "Translate and simplify for a wider audience",
  ],
};

const illustrateOptions = {
  "🪧 Posters": [
    "Create a conference poster for my research",
    "Design a poster summarising my methodology",
    "Generate a poster for a public science event",
    "Make a minimalist academic poster from this abstract",
    "Create a bilingual research poster",
  ],
  "📊 Infographics": [
    "Visualise my research timeline as an infographic",
    "Create an infographic comparing two methodologies",
    "Turn my key findings into a shareable infographic",
    "Generate a step-by-step process infographic",
    "Make an infographic showing sample size distribution",
  ],
  "🔬 Graphical Abstract": [
    "Create a graphical abstract from my abstract",
    "Design a simple visual summary of my paper",
    "Generate a graphical abstract for a Nature-style journal",
    "Make a graphical abstract with key data points highlighted",
    "Create a graphical abstract explaining my experimental flow",
  ],
};

const checksOptions = [
  "🔍 Plagiarism",
  "🤖 AI Detection",
  "📝 Grammar",
  "📚 References",
  "📤 Submission",
];

let activeTab = "chat";
let selectedChecks = new Set(checksOptions);

function setGreeting() {
  const hours = new Date().getHours();
  let timeOfDay = "evening";

  if (hours >= 5 && hours < 12) {
    timeOfDay = "morning";
  } else if (hours >= 12 && hours < 17) {
    timeOfDay = "afternoon";
  }

  greeting.textContent = `Good ${timeOfDay}, Sushrut`;
}

function createPill(label, onClick, className = "") {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `feature-pill ${className}`.trim();
  button.textContent = label;
  button.addEventListener("click", onClick);
  return button;
}

function populateSingleSelectPills(containerId, optionsMap) {
  const container = document.querySelector(containerId);
  const labels = Object.keys(optionsMap);

  labels.forEach((label) => {
    const pill = createPill(label, () => {
      container.querySelectorAll(".feature-pill").forEach((item) => item.classList.remove("active"));
      pill.classList.add("active");
      openSuggestionSheet(label, optionsMap[label]);
    });
    container.appendChild(pill);
  });
}

function renderChecks() {
  checksContainer.innerHTML = "";

  checksOptions.forEach((label) => {
    const isSelected = selectedChecks.has(label);
    const pill = createPill(
      label,
      () => {
        if (selectedChecks.has(label)) {
          selectedChecks.delete(label);
        } else {
          selectedChecks.add(label);
        }

        renderChecks();
      },
      isSelected ? "selected" : ""
    );

    checksContainer.appendChild(pill);
  });

  const hasSelection = selectedChecks.size > 0;
  checksCta.disabled = !hasSelection;
  checksNote.classList.toggle("hidden", hasSelection);
}

function openOverlay() {
  sheetOverlay.classList.remove("hidden");
}

function closeOverlayIfNeeded() {
  const suggestionOpen = suggestionSheet.classList.contains("open");
  const moreOpen = moreSheet.classList.contains("open");

  if (!suggestionOpen && !moreOpen) {
    sheetOverlay.classList.add("hidden");
  }
}

function openSuggestionSheet(title, options) {
  openOverlay();
  moreSheet.classList.add("hidden");
  moreSheet.classList.remove("open");
  moreSheet.setAttribute("aria-hidden", "true");

  sheetTitle.textContent = title;
  sheetList.innerHTML = "";

  options.forEach((option) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "sheet-option";
    button.textContent = option;
    button.addEventListener("click", () => {
      promptInput.value = option;
      closeSuggestionSheet();
      promptInput.focus();
    });
    sheetList.appendChild(button);
  });

  suggestionSheet.classList.remove("hidden");
  requestAnimationFrame(() => suggestionSheet.classList.add("open"));
  suggestionSheet.setAttribute("aria-hidden", "false");
}

function closeSuggestionSheet() {
  suggestionSheet.classList.remove("open");
  suggestionSheet.setAttribute("aria-hidden", "true");
  window.setTimeout(() => {
    suggestionSheet.classList.add("hidden");
    closeOverlayIfNeeded();
  }, 220);
}

function openMoreSheet() {
  openOverlay();
  suggestionSheet.classList.add("hidden");
  suggestionSheet.classList.remove("open");
  suggestionSheet.setAttribute("aria-hidden", "true");

  moreSheet.classList.remove("hidden");
  requestAnimationFrame(() => moreSheet.classList.add("open"));
  moreSheet.setAttribute("aria-hidden", "false");
}

function closeMoreSheet() {
  moreSheet.classList.remove("open");
  moreSheet.setAttribute("aria-hidden", "true");
  window.setTimeout(() => {
    moreSheet.classList.add("hidden");
    closeOverlayIfNeeded();
  }, 220);
}

function switchTab(nextTab) {
  if (nextTab === "more") {
    tabButtons.forEach((button) => button.classList.toggle("active", button.dataset.tab === activeTab));
    openMoreSheet();
    return;
  }

  activeTab = nextTab;
  closeMoreSheet();

  tabButtons.forEach((button) => button.classList.toggle("active", button.dataset.tab === nextTab));

  panelViews.forEach((panel) => {
    panel.classList.toggle("active", panel.dataset.panel === nextTab);
  });
}

inputFocusTarget.addEventListener("click", (event) => {
  if (event.target !== promptInput) {
    promptInput.focus();
  }
});

tabButtons.forEach((button) => {
  button.addEventListener("click", () => switchTab(button.dataset.tab));
});

sheetOverlay.addEventListener("click", () => {
  closeSuggestionSheet();
  closeMoreSheet();
});

closeSheetButton.addEventListener("click", closeSuggestionSheet);
closeMoreButton.addEventListener("click", closeMoreSheet);

checksCta.addEventListener("click", () => {
  if (!checksCta.disabled) {
    promptInput.value = `Run these checks: ${Array.from(selectedChecks).join(", ")}`;
    promptInput.focus();
  }
});

setGreeting();
populateSingleSelectPills("#chat-pills", chatOptions);
populateSingleSelectPills("#illustrate-pills", illustrateOptions);
renderChecks();
