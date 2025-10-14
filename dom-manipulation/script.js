let quotes = JSON.parse(localStorage.getItem("quotes")) || [];
let lastSelectedCategory = localStorage.getItem("selectedCategory") || "all";

// Save quotes to local storage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Fetch quotes from JSONPlaceholder
async function fetchQuotesFromServer() {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts");
    if (!response.ok) throw new Error("Network response was not ok");
    const data = await response.json();

    // Map posts to quote objects: text = title, author = userId, category = "Fetched"
    const serverQuotes = data.map(post => ({
      text: post.title,
      author: `User ${post.userId}`,
      category: "Fetched"
    }));

    // Merge without duplicates
    const existingTexts = new Set(quotes.map(q => q.text));
    const newQuotes = serverQuotes.filter(q => !existingTexts.has(q.text));
    quotes.push(...newQuotes);

    saveQuotes();
    populateCategories();
    console.log("Fetched quotes from JSONPlaceholder API successfully.");
  } catch (err) {
    console.error("Error fetching quotes from server:", err);
  }
}

// Generate random quote
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

// Add new quote
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

// Populate categories dynamically
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

// Filter quotes by selected category
function getFilteredQuotes() {
  const selectedCategory = document.getElementById("categoryFilter").value;
  if (selectedCategory === "all") return quotes;
  return quotes.filter(q => q.category === selectedCategory);
}

function filterQuotes() {
  const selectedCategory = document.getElementById("categoryFilter").value;
  localStorage.setItem("selectedCategory", selectedCategory);
  lastSelectedCategory = selectedCategory;
  generateQuote();
}

// Export quotes as JSON file
function exportToJsonFile() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

// Import quotes from JSON file
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(e) {
    const importedQuotes = JSON.parse(e.target.result);
    quotes.push(...importedQuotes);
    saveQuotes();
    populateCategories();
    alert("Quotes imported successfully!");
  };
  fileReader.readAsText(event.target.files[0]);
}

// Initialize app
window.onload = async function() {
  if (quotes.length === 0) {
    await fetchQuotesFromServer(); // Fetch from JSONPlaceholder if localStorage empty
  } else {
    populateCategories();
  }

  const lastQuote = JSON.parse(sessionStorage.getItem("lastQuote"));
  if (lastQuote) {
    document.getElementById("quoteDisplay").innerText = `"${lastQuote.text}" — ${lastQuote.author} [${lastQuote.category}]`;
  } else {
    generateQuote();
  }
};


