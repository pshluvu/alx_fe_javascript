// Array to store quotes
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

  // Update quote display using innerHTML
  document.getElementById("quoteDisplay").innerHTML = `
    <p id="quoteText">"${randomQuote.text}"</p>
    <p id="quoteCategory">— Category: ${randomQuote.category}</p>
  `;
}

// Function to dynamically create the "Add Quote" form
function createAddQuoteForm() {
  const formContainer = document.createElement("div");
  formContainer.id = "addQuoteContainer";
  formContainer.innerHTML = `
    <h3>Add a New Quote</h3>
    <input id="newQuoteText" type="text" placeholder="Enter a new quote" />
    <input id="newQuoteCategory" type="text" placeholder="Enter quote category" />
    <button id="addQuoteBtn">Add Quote</button>
  `;

  document.body.appendChild(formContainer);

  // Attach event listener to the new button
  document.getElementById("addQuoteBtn").addEventListener("click", addQuote);
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

  // Add new quote to the array
  quotes.push({ text, category });

  // Update the DOM to confirm addition
  document.getElementById("quoteDisplay").innerHTML = `
    <p id="quoteText">New quote added successfully!</p>
    <p id="quoteCategory">"${text}" — ${category}</p>
  `;

  // Clear input fields
  textInput.value = "";
  categoryInput.value = "";
}

// Initialize app
document.getElementById("newQuote").addEventListener("click", showRandomQuote);
createAddQuoteForm(); // Dynamically create the add-quote form


