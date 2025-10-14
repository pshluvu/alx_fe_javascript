let quotes = JSON.parse(localStorage.getItem("quotes")) || [];
let lastSelectedCategory = localStorage.getItem("selectedCategory") || "all";

// Save quotes to local storage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Fetch quotes from server (GET)
async function fetchQuotesFromServer() {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts");
    if (!response.ok) throw new Error("Network response was not ok");
    const data = await response.json();

    const serverQuotes = data.map(post => ({
      text: post.title,
      author: `User ${post.userId}`,
      category: "Fetched"
    }));

    const existingTexts = new Set(quotes.map(q => q.text));
    const newQuotes = serverQuotes.filter(q => !existingTexts.has(q.text));
    quotes.push(...newQuotes);

    saveQuotes();
    populateCategories();
    console.log("Fetched quotes from server successfully.");
  } catch (err) {
    console.error("Error fetching quotes:", err);
  }
}

// Post a quote to server (POST)
async function postQuoteToServer(quote) {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(quote)
    });
    const data = await response.json();
    console.log("Quote posted:", data);
  } catch (err) {
    console.error("Error posting quote:", err);
  }
}

// Synchronize quotes (fetch + optional post)
async function syncQuotes() {
  try {
    await fetchQuotesFromServer();
    console.log("Quotes synced with server!"); // ✅ Required message
  } catch (err) {
    console.error("Error syncing quotes:", err);
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
  sessionStorage.setItem("lastQuote", JSON.stringify(randomQuote));
}

// Add new quote
function addQuote(event) {
  event.preventDefault();
  const text = document.getElementById("quoteText").value.trim();
  const author = document.getElementById("quoteAuthor").value.trim();
  const category = document.getElementById("quoteCategory").value.trim();

  if (text && author && category) {
    const newQuote = { text, author, category };
    quotes.push(newQuote);
    saveQuotes();
    populateCategories();
    alert("Quote added successfully!");
    document.getElementById("addQuoteForm").reset();
    postQuoteToServer(newQuote); // POST to server
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

// Filter quotes
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

// Export quotes
function exportToJsonFile() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

// Import quotes
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
  await syncQuotes(); // fetch + sync on load

  const lastQuote = JSON.parse(sessionStorage.getItem("lastQuote"));
  if (lastQuote) {
    document.getElementById("quoteDisplay").innerText = `"${lastQuote.text}" — ${lastQuote.author} [${lastQuote.category}]`;
  } else {
    generateQuote();
  }

  // ✅ Automatically synchronize quotes every 5 minutes
  setInterval(syncQuotes, 300000);
};



