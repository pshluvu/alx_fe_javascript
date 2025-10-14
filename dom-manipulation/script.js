// --- Persistent storage keys ---
const LOCAL_STORAGE_KEY = "dynamicQuoteGenerator.quotes";
const SESSION_STORAGE_KEY_LAST = "dynamicQuoteGenerator.lastQuote";

// --- Default quotes (used only if no saved quotes) ---
let quotes = [
  { text: "The only way to do great work is to love what you do.", category: "Inspiration" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "Success is not final; failure is not fatal: it is the courage to continue that counts.", category: "Motivation" }
];

// --- Save quotes array to localStorage ---
function saveQuotes() {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(quotes));
  } catch (err) {
    console.error("Failed to save quotes to localStorage:", err);
    alert("Could not save quotes to local storage. See console for details.");
  }
}

// --- Load quotes array from localStorage (if present) ---
function loadQuotes() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return; // nothing saved
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      // basic validation: ensure each item has text & category
      const valid = parsed.filter(q => q && typeof q.text === "string" && typeof q.category === "string");
      if (valid.length) quotes = valid;
    }
  } catch (err) {
    console.error("Failed to load quotes from localStorage:", err);
    // If parsing fails, keep defaults and inform user
    alert("Could not load saved quotes (invalid data). Using built-in defaults.");
  }
}

// --- Show a random quote and save last shown to sessionStorage ---
function showRandomQuote() {
  if (!quotes || quotes.length === 0) {
    document.getElementById("quoteDisplay").innerHTML = `<p id="quoteText">No quotes available.</p>`;
    return;
  }

  const randomIndex = Math.floor(Math.random() * quotes.length);
  const randomQuote = quotes[randomIndex];

  document.getElementById("quoteDisplay").innerHTML = `
    <p id="quoteText">"${escapeHtml(randomQuote.text)}"</p>
    <p id="quoteCategory">— Category: ${escapeHtml(randomQuote.category)}</p>
  `;

  // Save last viewed quote to sessionStorage (session-only)
  try {
    sessionStorage.setItem(SESSION_STORAGE_KEY_LAST, JSON.stringify(randomQuote));
  } catch (err) {
    console.warn("Could not save last quote in sessionStorage:", err);
  }
}

// --- Add a new quote (called by form) ---
function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");

  if (!textInput || !categoryInput) {
    alert("Form elements not found.");
    return;
  }

  const text = textInput.value.trim();
  const category = categoryInput.value.trim();

  if (text === "" || category === "") {
    alert("Please enter both a quote and a category.");
    return;
  }

  // Add to quotes array and persist
  quotes.push({ text, category });
  saveQuotes();

  // Feedback: show added quote
  document.getElementById("quoteDisplay").innerHTML = `
    <p id="quoteText">New quote added successfully!</p>
    <p id="quoteCategory">"${escapeHtml(text)}" — ${escapeHtml(category)}</p>
  `;

  // Clear inputs
  textInput.value = "";
  categoryInput.value = "";
}

// --- Export quotes as JSON file ---
function exportQuotesAsJson() {
  try {
    const dataStr = JSON.stringify(quotes, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const filename = `quotes_${new Date().toISOString().slice(0,19).replace(/[:T]/g, "-")}.json`;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Export failed:", err);
    alert("Failed to export quotes. See console for details.");
  }
}

// --- Import quotes from JSON file event handler ---
function importFromJsonFile(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const parsed = JSON.parse(e.target.result);

      if (!Array.isArray(parsed)) {
        alert("Imported JSON must be an array of quote objects.");
        return;
      }

      // Validate items and prepare to merge
      const items = parsed.filter(item =>
        item && typeof item.text === "string" && typeof item.category === "string"
      );

      if (items.length === 0) {
        alert("No valid quotes found in the imported file.");
        return;
      }

      // Optionally deduplicate: avoid adding exact duplicates (text + category)
      const existingSet = new Set(quotes.map(q => `${q.text}|||${q.category}`));
      let addedCount = 0;
      for (const it of items) {
        const key = `${it.text}|||${it.category}`;
        if (!existingSet.has(key)) {
          quotes.push({ text: it.text, category: it.category });
          existingSet.add(key);
          addedCount++;
        }
      }

      saveQuotes();

      alert(`Imported successfully. ${addedCount} new quote(s) added.`);
      // reset file input so same file can be imported again if desired
      event.target.value = "";
    } catch (err) {
      console.error("Import failed:", err);
      alert("Failed to import JSON file (invalid JSON).");
    }
  };
  reader.readAsText(file);
}

// --- Utility: clear all saved quotes (resets to defaults) ---
function clearSavedQuotes() {
  if (!confirm("This will clear saved quotes and restore defaults. Continue?")) return;
  localStorage.removeItem(LOCAL_STORAGE_KEY);
  // Reset in-memory quotes to defaults and save
  quotes = [
    { text: "The only way to do great work is to love what you do.", category: "Inspiration" },
    { text: "Life is what happens when you're busy making other plans.", category: "Life" },
    { text: "Success is not final; failure is not fatal: it is the courage to continue that counts.", category: "Motivation" }
  ];
  saveQuotes();
  document.getElementById("quoteDisplay").innerHTML = `<p id="quoteText">Quotes reset to defaults.</p>`;
}

// --- Create the Add Quote form (and import/export controls) dynamically ---
function createAddQuoteForm() {
  const formContainer = document.createElement("div");
  formContainer.id = "addQuoteContainer";

  // Use innerHTML to assemble controls
  formContainer.innerHTML = `
    <h3>Add a New Quote</h3>
    <input id="newQuoteText" type="text" placeholder="Enter a new quote" />
    <input id="newQuoteCategory" type="text" placeholder="Enter quote category" />
    <button id="addQuoteBtn">Add Quote</button>

    <div style="margin-top:14px;">
      <button id="exportBtn" class="secondary">Export Quotes (JSON)</button>
      <input id="importFile" type="file" accept=".json" style="margin-left:8px;" />
      <button id="clearSaved" class="secondary" style="margin-left:8px;">Reset to Defaults</button>
    </div>

    <small>Session: last viewed quote is stored for this tab only (sessionStorage).</small>
  `;

  document.body.appendChild(formContainer);

  // Hook event listeners
  document.getElementById("addQuoteBtn").addEventListener("click", addQuote);
  document.getElementById("exportBtn").addEventListener("click", exportQuotesAsJson);
  document.getElementById("importFile").addEventListener("change", importFromJsonFile);
  document.getElementById("clearSaved").addEventListener("click", clearSavedQuotes);
}

// --- On init: load saved quotes, create form, wire up main button, restore last session quote if present ---
function initApp() {
  loadQuotes();               // populate `quotes` from localStorage if saved
  createAddQuoteForm();       // build add/import/export UI
  document.getElementById("newQuote").addEventListener("click", showRandomQuote);

  // If there's a last viewed quote in sessionStorage, show it (session-only)
  try {
    const raw = sessionStorage.getItem(SESSION_STORAGE_KEY_LAST);
    if (raw) {
      const last = JSON.parse(raw);
      if (last && typeof last.text === "string") {
        document.getElementById("quoteDisplay").innerHTML = `
          <p id="quoteText">"${escapeHtml(last.text)}"</p>
          <p id="quoteCategory">— Category: ${escapeHtml(last.category || "Unknown")}</p>
          <small>Last viewed in this session</small>
        `;
        return; // done
      }
    }
  } catch (err) {
    console.warn("Could not restore last session quote:", err);
  }

  // Otherwise leave default message in the display
}

// --- Very small utility to prevent raw HTML injection in displayed text ---
function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// --- Start the app ---
initApp();



