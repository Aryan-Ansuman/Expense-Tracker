let expenseData = null;
let pieChart = null;

document.addEventListener("DOMContentLoaded", () => {
  const totalAmountDisplay = document.getElementById("totalAmount");
  const categoryList = document.getElementById("categoryList");
  const statsGrid = document.getElementById("statsGrid");
  const analyticsContent = document.getElementById("analyticsContent");

  // Get expenses from sessionStorage or localStorage
  let expenses =
    JSON.parse(sessionStorage.getItem("expenseData")) ||
    JSON.parse(localStorage.getItem("expenses")) ||
    [];

  // Clear sessionStorage after reading
  sessionStorage.removeItem("expenseData");

  const categoryColors = {
    essentials: "#fca5a5",
    food: "#fbbf24",
    lifestyle: "#c084fc",
    health: "#6ee7b7",
    education: "#93c5fd",
    financial: "#6ee7b7",
    travel: "#7dd3fc",
    others: "#d1d5db",
  };

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

  function processExpenseData() {
    if (expenses.length === 0) {
      showEmptyState();
      return null;
    }

    const categoryTotals = {};
    let totalAmount = 0;

    expenses.forEach((expense) => {
      const category = expense.category;
      if (!categoryTotals[category]) {
        categoryTotals[category] = 0;
      }
      categoryTotals[category] += expense.amount;
      totalAmount += expense.amount;
    });

    const chartData = Object.entries(categoryTotals)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: (amount / totalAmount) * 100,
        color: categoryColors[category],
        name: categoryNames[category],
      }))
      .sort((a, b) => b.amount - a.amount);

    return {
      chartData,
      totalAmount,
      totalTransactions: expenses.length,
      averageTransaction: totalAmount / expenses.length,
      topCategory: chartData[0]?.name || "None",
      categoriesUsed: chartData.length,
    };
  }

  function showEmptyState() {
    analyticsContent.innerHTML = `
            <div class="empty-state">
              <span class="material-symbols-outlined">pie_chart</span>
              <h3>No Expense Data</h3>
              <p>Start adding expenses in your tracker to view analytics and insights here</p>
            </div>
          `;
    statsGrid.innerHTML = "";
    if (pieChart) {
      pieChart.destroy();
      pieChart = null;
    }
  }

  function updateCategoryBreakdown(data) {
    categoryList.innerHTML = data.chartData
      .map(
        (item) => `
            <div class="category-item">
              <div class="category-info">
                <div class="category-color" style="background-color: ${
                  item.color
                }"></div>
                <div class="category-details">
                  <div class="category-name">
                    <span class="material-symbols-outlined">${
                      categoryIcons[item.category]
                    }</span>
                    ${item.name}
                  </div>
                  <div class="category-percentage">${item.percentage.toFixed(
                    1
                  )}%</div>
                </div>
              </div>
              <div class="category-amount">₹${item.amount.toFixed(2)}</div>
            </div>
          `
      )
      .join("");
  }

  function updateStats(data) {
    statsGrid.innerHTML = `
            <div class="stat-card">
              <div class="stat-icon">
                <span class="material-symbols-outlined">category</span>
              </div>
              <div class="stat-value">${data.categoriesUsed}</div>
              <div class="stat-label">Categories Used</div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">
                <span class="material-symbols-outlined">receipt_long</span>
              </div>
              <div class="stat-value">${data.totalTransactions}</div>
              <div class="stat-label">Total Transactions</div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">
                <span class="material-symbols-outlined">trending_up</span>
              </div>
              <div class="stat-value">₹${data.averageTransaction.toFixed(
                0
              )}</div>
              <div class="stat-label">Average per Transaction</div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">
                <span class="material-symbols-outlined">star</span>
              </div>
              <div class="stat-value">${data.topCategory}</div>
              <div class="stat-label">Top Category</div>
            </div>
          `;
  }

  function renderChart(data) {
    if (pieChart) {
      pieChart.destroy();
    }
    const ctx = document.getElementById("pieChart").getContext("2d");
    pieChart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: data.chartData.map((item) => item.name),
        datasets: [
          {
            data: data.chartData.map((item) => item.amount),
            backgroundColor: data.chartData.map((item) => item.color),
            borderColor: "#1f1f1f",
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: "rgba(30, 30, 30, 0.95)",
            borderColor: "rgba(255, 255, 255, 0.1)",
            borderWidth: 1,
            padding: 12,
            titleFont: { size: 14, weight: "600" },
            bodyFont: { size: 12 },
            callbacks: {
              label: function (context) {
                const value = context.raw;
                const total = context.dataset.data.reduce(
                  (sum, val) => sum + val,
                  0
                );
                const percentage = ((value / total) * 100).toFixed(1);
                return `₹${value.toFixed(2)} (${percentage}%)`;
              },
            },
          },
        },
        cutout: "60%",
      },
    });
  }

  function initAnalytics() {
    expenseData = processExpenseData();
    if (expenseData) {
      totalAmountDisplay.textContent = expenseData.totalAmount.toFixed(2);
      updateCategoryBreakdown(expenseData);
      updateStats(expenseData);
      renderChart(expenseData);
    }
  }

  // Back button functionality
  document.getElementById("backBtn").addEventListener("click", (e) => {
    e.preventDefault();
    window.location.href = "index.html";
  });

  // Initialize the page
  initAnalytics();
});
