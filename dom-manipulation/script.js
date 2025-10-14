// Array to store quotes and their categories
let quotes = [
  { text: "The only way to do great work is to love what you do.", category: "Inspiration" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "Success is not final; failure is not fatal: it is the courage to continue that counts.", category: "Motivation" }
];

// Function to display a random quote
function showRandomQuote() {
  if (quotes.length === 0) return;

  const randomIndex = Math.floor(Math.random() * quotes.length);
  const randomQuote = quotes[randomIndex];

  // Update DOM dynamically using innerHTML
  document.getElementById("quoteDisplay").innerHTML = `
    <p id="quoteText">"${randomQuote.text}"</p>
    <p id="quoteCategory">— Category: ${randomQuote.category}</p>
  `;
}

// Function to add a new quote dynamically
function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");

  const text = textInput.value.trim();
  const category = categoryInput.value.trim();

  if (text === "" || category === "") {
    alert("Please enter both a quote and a category.");
    return;
  }

  // Add new quote to array
  quotes.push({ text, category });

  // Show confirmation dynamically
  document.getElementById("quoteDisplay").innerHTML = `
    <p id="quoteText">New quote added successfully!</p>
    <p id="quoteCategory">"${text}" — ${category}</p>
  `;

  // Clear inputs
  textInput.value = "";
  categoryInput.value = "";
}

// Event listeners for buttons
document.getElementById("newQuote").addEventListener("click", showRandomQuote);
document.getElementById("addQuoteBtn").addEventListener("click", addQuote);

