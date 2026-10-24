"use strict";

/*
 * SevaGuide AI — Frontend Prototype
 *
 * This version uses local keyword matching.
 * It is NOT connected to an AI model or government database.
 *
 * Replace the sample records with verified official information
 * before presenting the application as a real service directory.
 */

const services = [
  {
    id: 1,
    name: "Education Scholarship Discovery",
    category: "Education",
    icon: "🎓",
    description:
      "Explore scholarship programmes that may help eligible students with education expenses.",
    keywords: [
      "student",
      "scholarship",
      "college",
      "education",
      "fees",
      "tuition",
      "school",
      "study",
      "financial assistance"
    ],
    eligibility:
      "Eligibility depends on the specific scholarship. Check its official rules for education level, income limits, academic requirements and any applicable category criteria.",
    documents: [
      "Identity proof, if required",
      "Educational records",
      "Income certificate, if required",
      "Bank account details, if required",
      "Any additional documents specified by the scheme"
    ],
    steps: [
      "Identify a suitable scholarship programme.",
      "Read its official eligibility requirements.",
      "Prepare the documents specified by the programme.",
      "Open the official application portal.",
      "Submit the application and save the acknowledgement, if provided."
    ],
    officialUrl: "https://scholarships.gov.in/"
  },
  {
    id: 2,
    name: "Senior Citizen Pension Discovery",
    category: "Social Welfare",
    icon: "👴",
    description:
      "Explore pension and welfare programmes for which senior citizens may qualify.",
    keywords: [
      "senior",
      "elderly",
      "old age",
      "pension",
      "retired",
      "senior citizen",
      "monthly assistance",
      "welfare"
    ],
    eligibility:
      "Age, income, residence, pension status and other eligibility conditions depend on the particular government programme.",
    documents: [
      "Age or identity proof, as required",
      "Residence proof, if required",
      "Income-related documents, if required",
      "Bank account details, if required",
      "Additional documents specified by the programme"
    ],
    steps: [
      "Identify the applicable central or state pension programme.",
      "Review the official eligibility conditions.",
      "Check the application method for your location.",
      "Prepare the required documents.",
      "Apply through the designated official channel."
    ],
    officialUrl: "https://www.pib.gov.in/PressReleasePage.aspx?PRID=2323266&lang=1&reg=3"
  },
  {
    id: 3,
    name: "Income Certificate Information",
    category: "Citizen Services",
    icon: "📄",
    description:
      "Learn how to find the relevant income certificate service for your state or jurisdiction.",
    keywords: [
      "income",
      "certificate",
      "income certificate",
      "salary proof",
      "family income",
      "income proof",
      "revenue department"
    ],
    eligibility:
      "Application conditions, issuing authority and acceptable evidence depend on the state or jurisdiction.",
    documents: [
      "Identity proof, as required",
      "Residence proof, if required",
      "Income evidence specified by the issuing authority",
      "Application form and supporting records, if required"
    ],
    steps: [
      "Identify the issuing authority for your state or jurisdiction.",
      "Read the official document requirements.",
      "Complete the designated application form.",
      "Submit the supporting documents through the permitted channel.",
      "Follow the official instructions for checking application status."
    ],
    officialUrl: "https://serviceonline.gov.in/"
  },
  {
    id: 4,
    name: "Agricultural Assistance Discovery",
    category: "Agriculture",
    icon: "🌾",
    description:
      "Explore government agricultural schemes and assistance programmes that may be relevant to farmers.",
    keywords: [
      "farmer",
      "farming",
      "agriculture",
      "agricultural",
      "crop",
      "subsidy",
      "farm",
      "irrigation",
      "fertilizer"
    ],
    eligibility:
      "Requirements vary by programme and may depend on land records, farming activity, location and other specified conditions.",
    documents: [
      "Identity proof, if required",
      "Land or cultivation records, if required",
      "Bank account details, if required",
      "Other scheme-specific supporting documents"
    ],
    steps: [
      "Identify the agricultural assistance programme.",
      "Check the programme's official eligibility rules.",
      "Confirm the application method for your location.",
      "Prepare the required supporting records.",
      "Apply through the designated official channel."
    ],
    officialUrl: "https://agriwelfare.gov.in/"
  },
  {
    id: 5,
    name: "Employment Service Discovery",
    category: "Employment",
    icon: "💼",
    description:
      "Explore employment services, skill development opportunities and government employment programmes.",
    keywords: [
      "job",
      "employment",
      "unemployed",
      "career",
      "skill",
      "training",
      "work",
      "job seeker",
      "vocational"
    ],
    eligibility:
      "Eligibility depends on the selected employment or training programme, including any age, qualification, residence or other requirements.",
    documents: [
      "Identity proof, if required",
      "Educational certificates, if required",
      "Resume or employment details, if required",
      "Residence proof, if required",
      "Any other documents specified by the programme"
    ],
    steps: [
      "Identify a suitable employment or training programme.",
      "Read the official eligibility requirements.",
      "Prepare the specified documents.",
      "Register through the designated official channel.",
      "Follow the programme's application or enrolment instructions."
    ],
    officialUrl: "https://www.ncs.gov.in/"
  },
  {
    id: 6,
    name: "Public Health Service Discovery",
    category: "Healthcare",
    icon: "🏥",
    description:
      "Find information about government healthcare programmes and services that may be relevant to your needs.",
    keywords: [
      "health",
      "healthcare",
      "hospital",
      "medical",
      "treatment",
      "health insurance",
      "health scheme",
      "doctor",
      "medicine"
    ],
    eligibility:
      "Healthcare programme eligibility depends on the specific service and its official rules.",
    documents: [
      "Identity proof, if required",
      "Relevant health or beneficiary records, if required",
      "Residence or eligibility evidence, if required",
      "Any other documents specified by the programme"
    ],
    steps: [
      "Identify the relevant public healthcare programme.",
      "Check its official eligibility conditions.",
      "Review the available service locations and access method.",
      "Prepare any required supporting records.",
      "Follow the official programme instructions."
    ],
    officialUrl: "https://beneficiary.nha.gov.in/"
  }
];

let currentResults = services;

/* DOM elements */

const userQuery = document.getElementById("userQuery");
const searchButton = document.getElementById("searchButton");
const errorMessage = document.getElementById("errorMessage");

const resultsSection = document.getElementById("services");
const resultsContainer = document.getElementById("resultsContainer");
const resultDescription = document.getElementById("resultDescription");

const startButton = document.getElementById("startButton");
const serviceModal = document.getElementById("serviceModal");
const closeModalButton = document.getElementById("closeModal");

/* Utility: escape text before placing it in HTML */

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };

    return entities[character];
  });
}

/* Normalize the citizen's query */

function normalizeText(text) {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/*
 * Basic keyword search.
 *
 * This is not semantic AI.
 * It matches words and phrases against our local dataset.
 */

function findMatchingServices(query) {
  const normalizedQuery = normalizeText(query);
  const queryWords = normalizedQuery
    .split(" ")
    .filter((word) => word.length > 1);

  const scoredServices = services.map((service) => {
    let score = 0;

    const normalizedName = normalizeText(service.name);
    const normalizedCategory = normalizeText(service.category);

    if (normalizedQuery.length > 0 && normalizedName.includes(normalizedQuery)) {
      score += 10;
    }

    if (normalizedQuery.length > 0 && normalizedCategory.includes(normalizedQuery)) {
      score += 6;
    }

    service.keywords.forEach((keyword) => {
      const normalizedKeyword = normalizeText(keyword);

      if (
        normalizedKeyword.length > 0 &&
        normalizedQuery.includes(normalizedKeyword)
      ) {
        score += normalizedKeyword.includes(" ") ? 5 : 3;
      }
    });

    queryWords.forEach((word) => {
      const matched = service.keywords.some((keyword) => {
        const normalizedKeyword = normalizeText(keyword);

        return (
          normalizedKeyword === word ||
          normalizedKeyword.split(" ").includes(word)
        );
      });

      if (matched) {
        score += 1;
      }
    });

    return { service, score };
  });

  return scoredServices
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((item) => item.service);
}

/* Search event */

function handleSearch() {
  const query = userQuery.value.trim();

  hideLiveSuggestions();
  errorMessage.textContent = "";

  if (query.length < 3) {
    errorMessage.textContent = "Please describe what you need in a few words.";
    userQuery.focus();
    return;
  }

  searchButton.disabled = true;
  searchButton.innerHTML = "Finding services...";
  fetch("/api/search", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query }) })
    .then((response) => { if (!response.ok) throw new Error("Search unavailable"); return response.json(); })
    .then(({ services: matches }) => {
      displayResults(matches, query);
      resultsSection.hidden = false;
      resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
    })
    .catch((error) => {
      console.error("Search error:", error);
      errorMessage.textContent = "We couldn't reach the service guide. Please start the Python server and try again.";
    })
    .finally(() => { searchButton.disabled = false; searchButton.innerHTML = 'Find Services <span>→</span>'; });
}

/* Render service cards */

const departmentLinks = {
  1: { url: "https://scholarships.gov.in/Students", title: "National Scholarship Portal — Students" },
  2: { url: "https://www.pib.gov.in/PressReleasePage.aspx?PRID=2323266&lang=1&reg=3", title: "Pension programme update — Press Information Bureau" },
  3: { url: "https://serviceonline.gov.in/", title: "ServicePlus — state and local services" },
  4: { url: "https://pmkisan.gov.in/", title: "PM-KISAN — Agriculture Department" },
  5: { url: "https://www.ncs.gov.in/", title: "National Career Service" },
  6: { url: "https://beneficiary.nha.gov.in/", title: "PM-JAY beneficiary portal — National Health Authority" },
  7: { url: "https://voters.eci.gov.in/home/forms", title: "ECI Voters’ Services Portal and forms" },
  8: { url: "https://www.passportindia.gov.in/psp/Apply", title: "Passport Seva application process" },
  9: { url: "https://myaadhaar.uidai.gov.in/", title: "MyAadhaar online services" },
  10: { url: "https://sarathi.parivahan.gov.in/", title: "Sarathi driving licence services" },
};

function normalizeDepartmentService(service) {
  const primary = departmentLinks[service.id];
  const sources = (service.officialSources || []).filter((source) => {
    try {
      const host = new URL(source.url).hostname.toLowerCase();
      return host !== "india.gov.in" && !host.endsWith(".india.gov.in") && host !== "nsap.nic.in";
    } catch {
      return false;
    }
  });
  if (primary) service = { ...service, officialUrl: primary.url };
  if (primary && !sources.some((source) => source.url === primary.url)) {
    sources.unshift(primary);
  }
  return { ...service, officialSources: sources };
}

function displayResults(matches, query) {
  currentResults = matches.map(normalizeDepartmentService);
  resultsContainer.replaceChildren();
  resultDescription.textContent = `Results for: "${query}"`;

  if (matches.length === 0) {
    resultsContainer.innerHTML = `
      <div class="no-results">
        <h3>We couldn't find a clear match.</h3>
        <p>
        Try describing the service you need using related words, such as voter ID,
          electoral roll, passport, Aadhaar, driving licence, scholarship or pension.
        </p>
        <p>
          Try another phrase, or search the website of the ministry or department responsible for that service.
        </p>
      </div>
    `;
    return;
  }

  currentResults.forEach((service) => {
    const card = document.createElement("article");
    card.className = "service-card";

    card.innerHTML = `
      <div class="service-card-top">
        <div class="service-icon">${escapeHTML(service.icon)}</div>
        <span class="category-badge">${escapeHTML(service.category)}</span>
      </div>

      <h3>${escapeHTML(service.name)}</h3>
      <p>${escapeHTML(service.description)}</p>

      <div class="service-meta">
        <span class="meta-tag">Eligibility guidance</span>
        <span class="meta-tag">Document checklist</span>
      </div>

      <div class="service-card-actions">
        <button class="details-button" data-service-id="${service.id}">
          View Details →
        </button>

        <button class="source-button" data-service-id="${service.id}">
          Official Source ↗
        </button>
      </div>
    `;

    resultsContainer.appendChild(card);
  });
}

/* Find a service by ID */

function getServiceById(id) {
  return currentResults.find((service) => service.id === Number(id)) ||
    services.find((service) => service.id === Number(id));
}

/* Open the details modal */

function openServiceDetails(serviceId) {
  const service = getServiceById(serviceId);

  if (!service) {
    return;
  }

  document.getElementById("modalTitle").textContent = service.name;
  document.getElementById("modalDescription").textContent = service.description;
  document.getElementById("modalEligibility").textContent = service.eligibility;

  const documentList = document.getElementById("modalDocuments");
  documentList.replaceChildren();

  service.documents.forEach((documentName) => {
    const item = document.createElement("li");
    item.textContent = documentName;
    documentList.appendChild(item);
  });

  const stepList = document.getElementById("modalSteps");
  stepList.replaceChildren();

  service.steps.forEach((step) => {
    const item = document.createElement("li");
    item.textContent = step;
    stepList.appendChild(item);
  });

  const officialLink = document.getElementById("officialLink");

  if (isValidOfficialUrl(service.officialUrl)) {
    officialLink.href = service.officialUrl;
    officialLink.hidden = false;
    officialLink.classList.remove("disabled");
    officialLink.removeAttribute("aria-disabled");
    officialLink.textContent = "Visit Official Department Website ↗";
  } else {
    officialLink.removeAttribute("href");
    officialLink.hidden = false;
    officialLink.classList.add("disabled");
    officialLink.setAttribute("aria-disabled", "true");
    officialLink.textContent = "Official link not configured — verify before applying";
  }

  const sourceSection = document.getElementById("additionalSources");
  const sourceList = document.getElementById("officialSourcesList");
  sourceList.replaceChildren();
  const sources = Array.isArray(service.officialSources) ? service.officialSources : [];
  sources.filter((source) => isValidOfficialUrl(source.url)).forEach((source) => {
    const item = document.createElement("li");
    const link = document.createElement("a");
    link.href = source.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = `${source.title} ↗`;
    item.appendChild(link);
    sourceList.appendChild(item);
  });
  sourceSection.hidden = sourceList.children.length === 0;

  serviceModal.hidden = false;
  document.body.style.overflow = "hidden";
  closeModalButton.focus();
}

/* Allow only HTTPS links to configured official websites */

function isValidOfficialUrl(value) {
  if (typeof value !== "string" || !value.trim()) {
    return false;
  }

  try {
    const url = new URL(value);
    return url.protocol === "https:";
  } catch {
    return false;
  }
}

/* Close the modal */

function closeServiceModal() {
  serviceModal.hidden = true;
  document.body.style.overflow = "";
}

/* Search button */

searchButton.addEventListener("click", handleSearch);

/* Allow Ctrl+Enter or Command+Enter to search */

userQuery.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
    event.preventDefault();
    handleSearch();
  }
});

/* Suggested search buttons */

document.querySelectorAll(".suggestion").forEach((button) => {
  button.addEventListener("click", () => {
    userQuery.value = button.dataset.query;

    document.getElementById("searchSection").scrollIntoView({
      behavior: "smooth",
      block: "center"
    });

    handleSearch();
  });
});

/* Get Started button */

startButton.addEventListener("click", () => {
  document.getElementById("searchSection").scrollIntoView({
    behavior: "smooth",
    block: "center"
  });

  window.setTimeout(() => userQuery.focus(), 350);
});

/* Handle service card buttons using event delegation */

resultsContainer.addEventListener("click", (event) => {
  const detailsButton = event.target.closest(".details-button");
  const sourceButton = event.target.closest(".source-button");

  if (detailsButton) {
    openServiceDetails(detailsButton.dataset.serviceId);
  }

  if (sourceButton) {
    const service = getServiceById(sourceButton.dataset.serviceId);

    if (!service) {
      return;
    }

    openServiceDetails(service.id);
  }
});

/* Modal close button */

closeModalButton.addEventListener("click", closeServiceModal);

/* Close when clicking the dark overlay */

serviceModal.addEventListener("click", (event) => {
  if (event.target === serviceModal) {
    closeServiceModal();
  }
});

/* Close modal with Escape */

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !serviceModal.hidden) {
    closeServiceModal();
  }
});

/* Initial focus and interface setup */

userQuery.setAttribute("maxlength", "500");

/* Live related-service suggestions while the citizen types. */
const liveSuggestions = document.getElementById("liveSuggestions");
const suggestionOptions = document.getElementById("suggestionOptions");
let suggestionTimer = null;
let suggestionRequest = null;

function hideLiveSuggestions() {
  liveSuggestions.hidden = true;
  userQuery.setAttribute("aria-expanded", "false");
}

function showLiveSuggestions(suggestions) {
  suggestionOptions.replaceChildren();
  if (!suggestions.length) {
    hideLiveSuggestions();
    return;
  }
  suggestions.forEach((suggestion) => {
    const option = document.createElement("button");
    option.type = "button";
    option.className = "autocomplete-option";
    option.setAttribute("role", "option");
    option.innerHTML = `<span>${escapeHTML(suggestion.label)}</span><small>${escapeHTML(suggestion.service)}</small>`;
    option.addEventListener("click", () => {
      userQuery.value = suggestion.query;
      hideLiveSuggestions();
      handleSearch();
    });
    suggestionOptions.appendChild(option);
  });
  liveSuggestions.hidden = false;
  userQuery.setAttribute("aria-expanded", "true");
}

userQuery.addEventListener("input", () => {
  window.clearTimeout(suggestionTimer);
  if (suggestionRequest) suggestionRequest.abort();
  const query = userQuery.value.trim();
  if (query.length < 2) {
    hideLiveSuggestions();
    return;
  }
  suggestionTimer = window.setTimeout(async () => {
    suggestionRequest = new AbortController();
    try {
      const response = await fetch(`/api/suggest?q=${encodeURIComponent(query)}`, { signal: suggestionRequest.signal });
      if (!response.ok) throw new Error("Suggestions unavailable");
      const data = await response.json();
      if (userQuery.value.trim() === query) showLiveSuggestions(data.suggestions || []);
    } catch (error) {
      if (error.name !== "AbortError") hideLiveSuggestions();
    }
  }, 160);
});

userQuery.addEventListener("keydown", (event) => {
  if (event.key === "ArrowDown" && !liveSuggestions.hidden) {
    event.preventDefault();
    suggestionOptions.querySelector("button")?.focus();
  } else if (event.key === "Escape" && !liveSuggestions.hidden) {
    hideLiveSuggestions();
  }
});

document.addEventListener("click", (event) => {
  if (!document.getElementById("searchSection").contains(event.target)) hideLiveSuggestions();
});

/* Conversational service discovery */
const chatPanel = document.getElementById("chatPanel");
const chatMessages = document.getElementById("chatMessages");
const chatInput = document.getElementById("chatInput");
document.getElementById("chatLauncher").addEventListener("click", () => { chatPanel.hidden = false; chatInput.focus(); });
document.getElementById("chatClose").addEventListener("click", () => { chatPanel.hidden = true; });
function addChatMessage(text, role, links = []) {
  const bubble = document.createElement("div"); bubble.className = `chat-message ${role}`; bubble.textContent = text;
  chatMessages.appendChild(bubble);
  links.forEach((link) => {
    const a = document.createElement("a"); a.className = "chat-link"; a.href = link.url; a.target = "_blank"; a.rel = "noopener noreferrer"; a.textContent = `${link.title} ↗`; chatMessages.appendChild(a);
  });
  chatMessages.scrollTop = chatMessages.scrollHeight;
}
document.getElementById("chatForm").addEventListener("submit", async (event) => {
  event.preventDefault(); const message = chatInput.value.trim(); if (!message) return;
  addChatMessage(message, "user"); chatInput.value = "";
  const pending = document.createElement("div"); pending.className = "chat-message assistant typing"; pending.textContent = "Looking for helpful services…"; chatMessages.appendChild(pending);
  try {
    const response = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message }) });
    if (!response.ok) throw new Error("Chat unavailable");
    const data = await response.json();
    pending.remove();
    const matches = (data.matches || []).map(normalizeDepartmentService);
    const links = (data.links || []).filter((link) => {
      try {
        const host = new URL(link.url).hostname.toLowerCase();
        return host !== "india.gov.in" && !host.endsWith(".india.gov.in") && host !== "nsap.nic.in";
      } catch {
        return false;
      }
    });
    matches.slice(0, 3).forEach((service) => {
      (service.officialSources || []).slice(0, 2).forEach((source) => {
        if (!links.some((link) => link.url === source.url)) links.push(source);
      });
    });
    addChatMessage(data.reply, "assistant", links);
  } catch { pending.remove(); addChatMessage("I can’t reach the service guide right now. Please try again shortly, or use the service search on this page.", "assistant"); }
});
console.log("SevaGuide AI frontend loaded successfully.");
