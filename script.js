// 🚀 Function to Save Notifications
function saveNotification(message) {
    console.log("🔔 Saving Notification:", message);

    let notifications = JSON.parse(localStorage.getItem("notifications")) || [];

    // Add new notification at the top
    notifications.unshift({ message, time: new Date().toLocaleTimeString() });

    // Limit to last 10 notifications
    if (notifications.length > 10) {
        notifications.pop();
    }

    localStorage.setItem("notifications", JSON.stringify(notifications));

    // Update UI notifications
    displayNotifications();
}

// 🚀 Function to Display Notifications in Dropdown
function displayNotifications() {
    console.log("🔔 Displaying Notifications...");

    const notificationList = document.getElementById("notificationList");
    const notificationCount = document.getElementById("notificationCount");

    if (!notificationList || !notificationCount) {
        console.error("❌ Notification elements missing in HTML.");
        return;
    }

    const notifications = JSON.parse(localStorage.getItem("notifications")) || [];

    if (notifications.length === 0) {
        notificationList.innerHTML = `<li class="dropdown-item text-center">No new notifications</li>`;
        notificationCount.textContent = "0";
        notificationCount.classList.add("d-none");
    } else {
        notificationCount.textContent = notifications.length;
        notificationCount.classList.remove("d-none");

        notificationList.innerHTML = notifications
            .map(notif => `<li class="dropdown-item">${notif.message} <small class="text-muted">${notif.time}</small></li>`)
            .join("");
    }
}

// 🚀 Function to Show Browser Notifications
function showBrowserNotification(title, message) {
    if (!("Notification" in window)) {
        console.error("❌ Browser does not support notifications.");
        return;
    }

    if (Notification.permission === "granted") {
        new Notification(title, { body: message });
    } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then(permission => {
            if (permission === "granted") {
                new Notification(title, { body: message });
            }
        });
    }
}

// 🚀 Function to Check Budget and Alert User
function checkBudgetExceed() {
    console.log("🚀 Checking if expenses exceed budget...");

    const budgetInput = document.getElementById("monthlyBudget");
    if (!budgetInput) {
        console.error("❌ Budget input field not found.");
        return;
    }

    const budget = Number(budgetInput.value);
    if (isNaN(budget) || budget <= 0) {
        console.warn("⚠️ Invalid budget value.");
        return;
    }

    const expensesData = localStorage.getItem("expenses");
    if (!expensesData) {
        console.warn("⚠️ No expenses found in localStorage.");
        return;
    }

    const userEmail = localStorage.getItem("currentUserEmail");
    if (!userEmail) {
        console.warn("⚠️ No logged-in user found.");
        return;
    }

    const expenses = JSON.parse(expensesData);
    const userExpenses = expenses[userEmail] || [];
    const totalExpense = userExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0);

    console.log("📊 Total Expense:", totalExpense, "Budget:", budget);

    if (totalExpense > budget) {
        console.warn("🚨 Budget Exceeded Warning Triggered!");
        saveNotification("🚨 Warning: You've exceeded your budget!");
        showBrowserNotification("🚨 Budget Exceeded", "You have spent more than your allocated budget!");
        displayNotifications();
    }
}

// 🚀 Function to Warn About Impulse Buying
function warnImpulseBuying() {
    console.log("🚀 Checking for impulse buying...");

    const expensesData = localStorage.getItem("expenses");
    if (!expensesData) {
        console.warn("⚠️ No expenses found in localStorage.");
        return;
    }

    const expenses = JSON.parse(expensesData);
    const userEmail = localStorage.getItem("currentUserEmail");

    if (!userEmail || !expenses[userEmail]) {
        console.warn("⚠️ No expenses found for the current user.");
        return;
    }

    const userExpenses = expenses[userEmail];

    let discretionarySpending = 0;
    userExpenses.forEach(expense => {
        if (["Entertainment", "Luxury", "Shopping"].includes(expense.category)) {
            discretionarySpending += Number(expense.amount);
        }
    });

    console.log("📊 Total Discretionary Spending:", discretionarySpending);

    const budgetElement = document.getElementById("monthlyBudget");
    if (!budgetElement) {
        console.error("❌ Budget input field not found.");
        return;
    }

    const budget = Number(budgetElement.value);
    console.log("💰 User Budget:", budget);

    if (discretionarySpending > budget * 0.3) {
        console.warn("🚨 Impulse Buying Warning Triggered!");
        saveNotification("🚨 Warning: You're spending too much on non-essentials!");
        showBrowserNotification("🚨 Impulse Buying Alert", "You're spending too much on non-essentials!");
        displayNotifications();
    }
}

// 🚀 Function to Add Expenses & Trigger Warnings
function addExpense(amount, category) {
    let expenses = JSON.parse(localStorage.getItem("expenses")) || {};
    let userEmail = localStorage.getItem("currentUserEmail");

    if (!expenses[userEmail]) {
        expenses[userEmail] = [];
    }

    expenses[userEmail].push({ amount, category });
    localStorage.setItem("expenses", JSON.stringify(expenses));

    console.log("✅ Expense added:", { amount, category });

    // Check for impulse buying
    warnImpulseBuying();

    // Check if expenses exceed budget
    checkBudgetExceed();
}

// 🚀 Initialize Notifications on Page Load
document.addEventListener("DOMContentLoaded", () => {
    displayNotifications();
});

const currentUserEmail = localStorage.getItem("currentUserEmail");

function getUserExpenses() {
    return JSON.parse(localStorage.getItem("expenses"))?.[currentUserEmail] || [];
}

function saveUserExpenses(expenses) {
    let allExpenses = JSON.parse(localStorage.getItem("expenses")) || {};
    allExpenses[currentUserEmail] = expenses;
    localStorage.setItem("expenses", JSON.stringify(allExpenses));
}

function getUserBudget() {
    return Number(localStorage.getItem("userBudget")) || 0;
}

function getTotalExpenses() {
    return getUserExpenses().reduce((sum, expense) => sum + Number(expense.amount), 0);
}

function updateBudgetDisplay() {
    document.getElementById("budgetAmount").textContent = getUserBudget();
    document.getElementById("totalSpent").textContent = getTotalExpenses();
}

function renderExpenses() {
    const userExpenses = getUserExpenses();
    const expenseTable = document.getElementById("expenseTable");
    expenseTable.innerHTML = "";
    userExpenses.forEach((expense, index) => {
        const row = `<tr>
            <td>${expense.category}</td>
            <td>${expense.amount}</td>
            <td>${expense.date}</td>
            <td>${expense.type}</td>
            <td><button class='btn btn-danger btn-sm' onclick='deleteExpense(${index})'>Delete</button></td>
        </tr>`;
        expenseTable.innerHTML += row;
    });
    updateBudgetDisplay();
}

function deleteExpense(index) {
    let userExpenses = getUserExpenses();
    userExpenses.splice(index, 1);
    saveUserExpenses(userExpenses);
    renderExpenses();
}

document.getElementById("expenseForm").addEventListener("submit", function (e) {
    e.preventDefault();
    
    const expense = {
        category: document.getElementById("expenseCategory").value,
        amount: document.getElementById("expenseAmount").value,
        date: document.getElementById("expenseDate").value,
        type: document.getElementById("expenseType").value,
    };

    let userExpenses = getUserExpenses();
    userExpenses.push(expense);
    saveUserExpenses(userExpenses);
    renderExpenses();
    checkBudgetWarnings(expense.amount);
    this.reset();
});

function checkBudgetWarnings(amount) {
    let budget = getUserBudget();
    let totalExpenses = getTotalExpenses();

    if (totalExpenses > budget) {
        saveNotification("🚨 Warning: You've exceeded your budget!");
    } else if (amount > budget * 0.3) {
        saveNotification(`⚠️ High Expense: ₹${amount} spent on non-essentials.`);
    }
}

function saveNotification(message) {
    let notifications = JSON.parse(localStorage.getItem("notifications")) || [];
    notifications.unshift({ message, time: new Date().toLocaleTimeString() });
    if (notifications.length > 10) notifications.pop();
    localStorage.setItem("notifications", JSON.stringify(notifications));
    displayNotifications();
}

function displayNotifications() {
    let notifications = JSON.parse(localStorage.getItem("notifications")) || [];
    document.getElementById("notificationList").innerHTML = notifications.length === 0 
        ? `<li class="list-group-item text-center">No new notifications</li>` 
        : notifications.map(notif => `<li class="list-group-item">${notif.message} <small>${notif.time}</small></li>`).join("");
}

function logout() {
    localStorage.clear();
    window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", () => {
    renderExpenses();
    displayNotifications();
});

// ✅ Toast Notification System
function showToast(message) {
    const toastContainer = document.getElementById("toastContainer");

    const toast = document.createElement("div");
    toast.className = "toast align-items-center text-white bg-danger border-0 show mb-2";
    toast.setAttribute("role", "alert");
    toast.setAttribute("aria-live", "assertive");
    toast.setAttribute("aria-atomic", "true");

    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">${message}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;

    toastContainer.appendChild(toast);

    // Auto-dismiss after 5 seconds
    setTimeout(() => toast.remove(), 5000);
}

// ✅ Save Notification to LocalStorage and Show Toast
function saveNotification(message) {
    let notifications = JSON.parse(localStorage.getItem("notifications")) || [];
    notifications.unshift({ message, time: new Date().toLocaleTimeString() });
    if (notifications.length > 10) notifications.pop();
    localStorage.setItem("notifications", JSON.stringify(notifications));
    displayNotifications();
    showToast(message); // Show as Toast
}

// ✅ Display Notification History (Optional Dropdown/List)
function displayNotifications() {
    const notificationList = document.getElementById("notificationList");
    if (!notificationList) return;

    const notifications = JSON.parse(localStorage.getItem("notifications")) || [];

    notificationList.innerHTML = notifications.length === 0
        ? `<li class="list-group-item text-center">No new notifications</li>`
        : notifications.map(notif =>
            `<li class="list-group-item">${notif.message} <small>${notif.time}</small></li>`
        ).join("");
}

// ✅ Get/Save User Data Helpers
function getUserExpenses() {
    const email = localStorage.getItem("currentUserEmail");
    return JSON.parse(localStorage.getItem("expenses"))?.[email] || [];
}

function saveUserExpenses(expenses) {
    const email = localStorage.getItem("currentUserEmail");
    let allExpenses = JSON.parse(localStorage.getItem("expenses")) || {};
    allExpenses[email] = expenses;
    localStorage.setItem("expenses", JSON.stringify(allExpenses));
}

function getUserBudget() {
    return Number(localStorage.getItem("userBudget")) || 0;
}

function getTotalExpenses() {
    return getUserExpenses().reduce((sum, expense) => sum + Number(expense.amount), 0);
}

// ✅ Check if User Exceeded Budget
function checkBudgetExceed() {
    const total = getTotalExpenses();
    const budget = getUserBudget();
    if (total > budget) {
        saveNotification("🚨 You've exceeded your budget!");
    }
}

// ✅ Impulse Buying Alert
function warnImpulseBuying() {
    const budget = getUserBudget();
    const expenses = getUserExpenses();
    const discretionary = expenses.reduce((sum, e) => {
        return ["Entertainment", "Luxury", "Shopping"].includes(e.category) ? sum + Number(e.amount) : sum;
    }, 0);

    if (discretionary > budget * 0.3) {
        saveNotification("⚠️ You're spending a lot on non-essentials!");
    }
}

// ✅ Add Expense
function addExpense(amount, category, date, type) {
    let userExpenses = getUserExpenses();
    userExpenses.push({ amount, category, date, type });
    saveUserExpenses(userExpenses);
    renderExpenses();
    warnImpulseBuying();
    checkBudgetExceed();
}

// ✅ Render Table of Expenses
function renderExpenses() {
    const table = document.getElementById("expenseTable");
    const expenses = getUserExpenses();
    table.innerHTML = "";
    expenses.forEach((e, index) => {
        table.innerHTML += `
        <tr>
            <td>${e.category}</td>
            <td>${e.amount}</td>
            <td>${e.date}</td>
            <td>${e.type}</td>
            <td><button class="btn btn-danger btn-sm" onclick="deleteExpense(${index})">Delete</button></td>
        </tr>`;
    });
    updateBudgetDisplay();
}

// ✅ Delete Expense
function deleteExpense(index) {
    let expenses = getUserExpenses();
    expenses.splice(index, 1);
    saveUserExpenses(expenses);
    renderExpenses();
}

// ✅ Update Budget UI
function updateBudgetDisplay() {
    document.getElementById("budgetAmount").textContent = getUserBudget();
    document.getElementById("totalSpent").textContent = getTotalExpenses();
}

// ✅ Handle Expense Form Submission
document.getElementById("expenseForm").addEventListener("submit", function (e) {
    e.preventDefault();
    const category = document.getElementById("expenseCategory").value;
    const amount = Number(document.getElementById("expenseAmount").value);
    const date = document.getElementById("expenseDate").value;
    const type = document.getElementById("expenseType").value;

    addExpense(amount, category, date, type);
    this.reset();
});

// ✅ Logout
function logout() {
    localStorage.clear();
    window.location.href = "login.html";
}

// ✅ Init
document.addEventListener("DOMContentLoaded", () => {
    displayNotifications();
    renderExpenses();
});
