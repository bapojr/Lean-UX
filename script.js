const promptInput = document.querySelector("#prompt-input");
const greeting = document.querySelector("#greeting");
const inputFocusTarget = document.querySelector("#input-focus-target");
const chatCard = document.querySelector(".chat-card");
const sendCta = document.querySelector("#send-cta");
const illustrateTools = document.querySelector("#illustrate-tools");
const tabButtons = Array.from(document.querySelectorAll(".tab-button"));
const panelViews = Array.from(document.querySelectorAll(".panel-view"));
const sheetOverlay = document.querySelector("#sheet-overlay");
const moreSheet = document.querySelector("#more-sheet");
const closeMoreButton = document.querySelector("#close-more");
const checksUploadCard = document.querySelector("#checks-upload-card");
const checksContainer = document.querySelector("#checks-pills");
const checksCta = document.querySelector("#checks-cta");
const checksNote = document.querySelector("#checks-note");
const inlineSuggestionCard = document.querySelector("#inline-suggestion-card");
const inlineSuggestionTitle = document.querySelector("#inline-suggestion-title");
const inlineSuggestionList = document.querySelector("#inline-suggestion-list");
const inlineSuggestionClose = document.querySelector("#inline-suggestion-close");

const chatOptions = {
  Rewrite: [
    "Rewrite this paragraph for a journal introduction",
    "Make this sentence more formal",
    "Rewrite for a non-expert audience",
    "Improve clarity without changing meaning",
    "Rewrite in active voice",
  ],
  Paraphrase: [
    "Paraphrase this to avoid repetition",
    "Paraphrase and simplify technical jargon",
    "Make this more formal and academic",
    "Trim this paragraph to 50 words",
    "Reword this passage to sound more original",
    "Paraphrase without losing key citations",
  ],
  Research: [
    "Summarise the key findings from this research abstract",
    "Help me identify the research gap in this introduction",
    "Turn these notes into a literature review outline",
    "Extract the main methodology steps from this section",
    "List the core limitations and future research directions",
  ],
};

const illustrateOptions = {
  Posters: [
    "Create a conference poster for my research",
    "Design a poster summarising my methodology",
    "Generate a poster for a public science event",
    "Make a minimalist academic poster from this abstract",
    "Create a bilingual research poster",
  ],
  Infographics: [
    "Visualise my research timeline as an infographic",
    "Create an infographic comparing two methodologies",
    "Turn my key findings into a shareable infographic",
    "Generate a step-by-step process infographic",
    "Make an infographic showing sample size distribution",
  ],
  "Graphical Abstract": [
    "Create a graphical abstract from my abstract",
    "Design a simple visual summary of my paper",
    "Generate a graphical abstract for a Nature-style journal",
    "Make a graphical abstract with key data points highlighted",
    "Create a graphical abstract explaining my experimental flow",
  ],
};

const checksOptions = [
  "Plagiarism",
  "AI Detection",
  "Grammar",
  "References",
  "Submission",
];

let activeTab = "chat";
let selectedChecks = new Set(checksOptions);

function updateSendCtaState() {
  const hasText = promptInput.value.trim().length > 0;
  const alwaysActive = activeTab === "chat" || activeTab === "illustrate";
  sendCta.classList.toggle("active", alwaysActive || hasText);
}

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

function createCheckPill(label, isSelected, onClick) {
  const button = document.createElement("button");
  const marker = document.createElement("span");
  const text = document.createElement("span");

  button.type = "button";
  button.className = `feature-pill check-pill ${isSelected ? "selected" : ""}`.trim();
  marker.className = "check-pill-box";
  marker.setAttribute("aria-hidden", "true");
  if (isSelected) {
    marker.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="11" height="12" viewBox="0 0 11 12" fill="none">
        <g clip-path="url(#clip0_336_8964)">
          <path d="M10.1905 1.64316C10.5257 1.88691 10.6007 2.35566 10.3569 2.69082L4.35693 10.9408C4.22803 11.1189 4.02881 11.2291 3.8085 11.2478C3.58818 11.2666 3.3749 11.1846 3.22022 11.0299L0.220215 8.02988C-0.0727539 7.73691 -0.0727539 7.26113 0.220215 6.96816C0.513184 6.67519 0.988965 6.67519 1.28193 6.96816L3.66084 9.34707L9.14522 1.80722C9.38897 1.47207 9.85772 1.39707 10.1929 1.64082L10.1905 1.64316Z" fill="white"/>
        </g>
        <defs>
          <clipPath id="clip0_336_8964">
            <rect width="10.5" height="12" fill="white"/>
          </clipPath>
        </defs>
      </svg>
    `;
  }
  text.className = "check-pill-label";
  text.textContent = label;

  button.append(marker, text);
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
    const pill = createCheckPill(
      label,
      isSelected,
      () => {
        if (selectedChecks.has(label)) {
          selectedChecks.delete(label);
        } else {
          selectedChecks.add(label);
        }

        renderChecks();
      }
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
  const moreOpen = moreSheet.classList.contains("open");

  if (!moreOpen) {
    sheetOverlay.classList.add("hidden");
  }
}

function openSuggestionSheet(title, options) {
  inlineSuggestionTitle.textContent = title;
  inlineSuggestionList.innerHTML = "";

  options.forEach((option) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "suggestion-option";
    button.textContent = option;
    button.addEventListener("click", () => {
      promptInput.value = option;
      updateSendCtaState();
      closeSuggestionSheet();
      promptInput.focus();
    });
    inlineSuggestionList.appendChild(button);
  });

  inlineSuggestionCard.classList.remove("hidden");
  inlineSuggestionCard.setAttribute("aria-hidden", "false");
}

function closeSuggestionSheet() {
  inlineSuggestionCard.classList.add("hidden");
  inlineSuggestionCard.setAttribute("aria-hidden", "true");

  document
    .querySelectorAll(".single-select .feature-pill")
    .forEach((item) => item.classList.remove("active"));
}

function openMoreSheet() {
  openOverlay();
  closeSuggestionSheet();

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
  closeSuggestionSheet();
  chatCard.classList.toggle("mode-checks", nextTab === "checks");
  chatCard.classList.toggle("mode-illustrate", nextTab === "illustrate");
  checksUploadCard.setAttribute("aria-hidden", nextTab === "checks" ? "false" : "true");
  illustrateTools.setAttribute("aria-hidden", nextTab === "illustrate" ? "false" : "true");
  updateSendCtaState();

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

promptInput.addEventListener("input", updateSendCtaState);

tabButtons.forEach((button) => {
  button.addEventListener("click", () => switchTab(button.dataset.tab));
});

sheetOverlay.addEventListener("click", () => {
  closeMoreSheet();
});

closeMoreButton.addEventListener("click", closeMoreSheet);
inlineSuggestionClose.addEventListener("click", closeSuggestionSheet);

checksCta.addEventListener("click", () => {
  if (!checksCta.disabled) {
    promptInput.value = `Run these checks: ${Array.from(selectedChecks).join(", ")}`;
    updateSendCtaState();
    promptInput.focus();
  }
});

setGreeting();
populateSingleSelectPills("#chat-pills", chatOptions);
populateSingleSelectPills("#illustrate-pills", illustrateOptions);
renderChecks();
updateSendCtaState();
