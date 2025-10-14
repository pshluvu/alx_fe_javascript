let quotes = JSON.parse(localStorage.getItem("quotes")) || [];

let lastSelectedCategory = localStorage.getItem("selectedCategory") || "all";

// ✅ Save quotes to local storage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// ✅ Fetch quotes from server or local JSON file
async function fetchQuotesFromServer() {
  try {
    const response = await fetch("quotes.json"); // Replace with your API endpoint if needed
    if (!response.ok) throw new Error("Network response was not ok");
    const serverQuotes = await response.json();

    // Merge new quotes, avoiding duplicates
    const existingTexts = new Set(quotes.map(q => q.text));
    const newQuotes = serverQuotes.filter(q => !existingTexts.has(q.text));
    quotes.push(...newQuotes);

    saveQuotes();
    populateCategories();
    console.log("Quotes fetched and saved successfully from server.");
  } catch (error) {
    console.error("Error fetching quotes:", error);
  }
}

// ✅ Generate random quote
function generateQuote() {
  const filteredQuotes = getFilteredQuotes();
  if (filteredQuotes.length === 0) {
    document.getElementById("quoteDisplay").innerText = "No quotes available for this category.";
    return;
  }
  const randomQuote = filteredQuotes[Math.floor(Math.random() * filteredQuotes.length)];
  document.getElementById("quoteDisplay").innerText = `"${randomQuote.text}" — ${randomQuote.author} [${randomQuote.category}]`;

  // Store last viewed quote in session storage
  sessionStorage.setItem("lastQuote", JSON.stringify(randomQuote));
}

// ✅ Add new quote
function addQuote(event) {
  event.preventDefault();
  const text = document.getElementById("quoteText").value.trim();
  const author = document.getElementById("quoteAuthor").value.trim();
  const category = document.getElementById("quoteCategory").value.trim();

  if (text && author && category) {
    quotes.push({ text, author, category });
    saveQuotes();
    populateCategories();
    alert("Quote added successfully!");
    document.getElementById("addQuoteForm").reset();
  }
}

// ✅ Populate categories dynamically
function populateCategories() {
  const categories = [...new Set(quotes.map(q => q.category))];
  const categoryFilter = document.getElementById("categoryFilter");
  categoryFilter.innerHTML = `<option value="all">All Categories</option>`;
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    if (cat === lastSelectedCategory) option.selected = true;
    categoryFilter.appendChild(option);
  });
}

// ✅ Filter quotes by selected category
function getFilteredQuotes() {
  const selectedCategory = document.getElementById("categoryFilter").value;
  if (selectedCategory === "all") return quotes;
  return quotes.filter(q => q.category === selectedCategory);
}

function filterQuotes() {
  const selectedCategory = document.getElementById("categoryFilter").value;
  localStorage.setItem("selectedCategory", selecte

