let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
let filteredExpenses = [];
let selectedCategory = "";
let sortBy = "date-desc";
let categoryFilter = "";
let minAmount = 0;
let maxAmount = 10000;

document.addEventListener("DOMContentLoaded", () => {
  const expenseForm = document.getElementById("expense-form");
  const expenseNameInput = document.getElementById("expense-name");
  const expenseAmountInput = document.getElementById("expense-amount");
  const expenseList = document.getElementById("expense-list");
  const totalAmountDisplay = document.getElementById("total-amount");

  const categoryIcons = {
    essentials: "home",
    food: "dinner_dining",
    lifestyle: "attractions",
    health: "exercise",
    education: "work",
    financial: "attach_money",
    travel: "beach_access",
    others: "alt_route",
  };

  const categoryNames = {
    essentials: "Essentials",
    food: "Food & Dining",
    lifestyle: "Lifestyle & Entertainment",
    health: "Health & Fitness",
    education: "Education & Work",
    financial: "Financial",
    travel: "Travel",
    others: "Others",
  };

  // Custom Select Handler
  function setupCustomSelect(displayId, optionsId, onSelect) {
    const display = document.getElementById(displayId);
    const options = document.getElementById(optionsId);
    const optionElements = options.querySelectorAll(".select-option");

    display.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = options.classList.contains("open");

      // Close all other dropdowns
      document.querySelectorAll(".select-options").forEach((opt) => {
        opt.classList.remove("open");
      });
      document.querySelectorAll(".select-display").forEach((disp) => {
        disp.classList.remove("open");
      });

      if (!isOpen) {
        options.classList.add("open");
        display.classList.add("open");
      }
    });

    optionElements.forEach((option) => {
      option.addEventListener("click", (e) => {
        e.stopPropagation();
        const value = option.dataset.value;

        // Update selected state
        optionElements.forEach((opt) => opt.classList.remove("selected"));
        option.classList.add("selected");

        // Close dropdown
        options.classList.remove("open");
        display.classList.remove("open");

        onSelect(value, option);
      });
    });
  }

  // Setup category select
  setupCustomSelect(
    "category-select-display",
    "category-select-options",
    (value, option) => {
      selectedCategory = value;
      const textElement = document.getElementById("category-selected-text");
      if (value === "") {
        textElement.textContent = "Select Category";
      } else {
        const categoryTag = option.querySelector(".category-tag");
        textElement.innerHTML = categoryTag.outerHTML;
      }
    }
  );

  // Setup sort select
  setupCustomSelect(
    "sort-select-display",
    "sort-select-options",
    (value, option) => {
      sortBy = value;
      document.getElementById("sort-selected-text").textContent =
        option.textContent;
      applyFiltersAndSort();
    }
  );

  // Setup filter select
  setupCustomSelect(
    "filter-select-display",
    "filter-select-options",
    (value, option) => {
      categoryFilter = value;
      const textElement = document.getElementById("filter-selected-text");
      if (value === "") {
        textElement.textContent = "All Categories";
      } else {
        const categoryTag = option.querySelector(".category-tag");
        textElement.innerHTML = categoryTag.outerHTML;
      }
      applyFiltersAndSort();
    }
  );

  // Range sliders
  const minAmountSlider = document.getElementById("min-amount");
  const maxAmountSlider = document.getElementById("max-amount");
  const minValueDisplay = document.getElementById("min-value");
  const maxValueDisplay = document.getElementById("max-value");

  minAmountSlider.addEventListener("input", (e) => {
    minAmount = parseInt(e.target.value);
    minValueDisplay.textContent = `₹${minAmount}`;
    if (minAmount > maxAmount) {
      maxAmount = minAmount;
      maxAmountSlider.value = maxAmount;
      maxValueDisplay.textContent =
        maxAmount >= 10000 ? "₹10000+" : `₹${maxAmount}`;
    }
    applyFiltersAndSort();
  });

  maxAmountSlider.addEventListener("input", (e) => {
    maxAmount = parseInt(e.target.value);
    maxValueDisplay.textContent =
      maxAmount >= 10000 ? "₹10000+" : `₹${maxAmount}`;
    if (maxAmount < minAmount) {
      minAmount = maxAmount;
      minAmountSlider.value = minAmount;
      minValueDisplay.textContent = `₹${minAmount}`;
    }
    applyFiltersAndSort();
  });

  // Close dropdowns when clicking outside
  document.addEventListener("click", () => {
    document.querySelectorAll(".select-options").forEach((opt) => {
      opt.classList.remove("open");
    });
    document.querySelectorAll(".select-display").forEach((disp) => {
      disp.classList.remove("open");
    });
  });

  // Initialize page
  applyFiltersAndSort();

  expenseForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = expenseNameInput.value.trim();
    const amount = parseFloat(expenseAmountInput.value.trim());
    const category = selectedCategory;

    if (name !== "" && !isNaN(amount) && amount > 0 && category) {
      const newExpense = {
        id: Date.now(),
        name: name,
        amount: amount,
        category: category,
        date: new Date().toISOString(),
      };
      expenses.push(newExpense);
      localStorage.setItem("expenses", JSON.stringify(expenses)); // Save to localStorage
      applyFiltersAndSort();

      // Reset form
      expenseNameInput.value = "";
      expenseAmountInput.value = "";
      selectedCategory = "";
      document.getElementById("category-selected-text").textContent =
        "Select Category";

      // Reset category select display
      const categoryOptions = document.querySelectorAll(
        "#category-select-options .select-option"
      );
      categoryOptions.forEach((opt) => opt.classList.remove("selected"));
      categoryOptions[0].classList.add("selected");
    }
  });

  function renderExpenses() {
    expenseList.innerHTML = "";
    if (filteredExpenses.length === 0) {
      expenseList.innerHTML = `
          <div class="empty-state">
            <span class="material-symbols-outlined">add_circle</span>
            <h3>ADD EXPENSE</h3>
            <p>Start tracking your expenses by adding your first entry above</p>
          </div>
        `;
      return;
    }
    filteredExpenses.forEach((expense) => {
      const li = document.createElement("li");
      li.innerHTML = `
          <div class="expense-info">
            <div class="expense-category ${expense.category}">
              <span class="material-symbols-outlined">${
                categoryIcons[expense.category]
              }</span>
              ${categoryNames[expense.category]}
            </div>
            <span class="expense-name">${expense.name}</span>
          </div>
          <span class="expense-amount">₹${expense.amount.toFixed(2)}</span>
          <button class="delete-btn" data-id="${expense.id}">
            <span class="material-symbols-outlined">delete</span>
            Delete
          </button>
        `;
      expenseList.appendChild(li);
    });
  }

  function calculateTotal() {
    return filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  }

  function updateTotal() {
    const totalAmount = calculateTotal();
    totalAmountDisplay.textContent = totalAmount.toFixed(2);
  }

  function applyFiltersAndSort() {
    let filtered = [...expenses];

    // Apply category filter
    if (categoryFilter) {
      filtered = filtered.filter(
        (expense) => expense.category === categoryFilter
      );
    }

    // Apply amount range filter
    const minAmountValue = minAmount;
    const maxAmountValue = maxAmount >= 10000 ? Infinity : maxAmount;
    filtered = filtered.filter(
      (expense) =>
        expense.amount >= minAmountValue && expense.amount <= maxAmountValue
    );

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return new Date(b.date) - new Date(a.date);
        case "date-asc":
          return new Date(a.date) - new Date(b.date);
        case "amount-desc":
          return b.amount - a.amount;
        case "amount-asc":
          return a.amount - b.amount;
        case "category":
          return a.category.localeCompare(b.category);
        default:
          return 0;
      }
    });

    filteredExpenses = filtered;
    renderExpenses();
    updateTotal();
  }

  expenseList.addEventListener("click", (e) => {
    if (e.target.closest(".delete-btn")) {
      const expenseId = parseInt(
        e.target.closest(".delete-btn").getAttribute("data-id")
      );
      expenses = expenses.filter((expense) => expense.id !== expenseId);
      localStorage.setItem("expenses", JSON.stringify(expenses)); // Save to localStorage
      applyFiltersAndSort();
    }
  });

  // View Analysis Button Handler
  const viewAnalysisBtn = document.getElementById("view-analysis-btn");
  viewAnalysisBtn.addEventListener("click", () => {
    // Pass data to analysis page via sessionStorage
    sessionStorage.setItem("expenseData", JSON.stringify(expenses));
    window.location.href = "analysis.html";
  });
});
