/**
 * Campus Notifications - Priority Inbox Algorithm
 * Stage 1: Fetch notifications and rank top-N by weight + recency
 */

const API_URL = "http://4.224.186.213/evaluation-service/notifications";
const ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiIyM2JxMWE0MjY2QHZ2aXQubmV0IiwiZXhwIjoxNzgwNjM4MDA2LCJpYXQiOjE3ODA2MzcxMDYsImlzcyI6IkFmZm9yZCBNZWRpY2FsIFRlY2hub2xvZ2llcyBQcml2YXRlIExpbWl0ZWQiLCJqdGkiOiIyY2JjMjUyZi1iZDU2LTRkZDMtYTc4Ny0zNDcwMmRjYmE0YjUiLCJsb2NhbGUiOiJlbi1JTiIsIm5hbWUiOiJqaWxsZWxsYSBzdXNtaXRoYSIsInN1YiI6ImEzODkzYzg2LWVlZjItNGNhYy04ZmQ2LTM1OTM5NDJmYjVhOCJ9LCJlbWFpbCI6IjIzYnExYTQyNjZAdnZpdC5uZXQiLCJuYW1lIjoiamlsbGVsbGEgc3VzbWl0aGEiLCJyb2xsTm8iOiIyM2JxMWE0MjY2IiwiYWNjZXNzQ29kZSI6IlFRZEVZeSIsImNsaWVudElEIjoiYTM4OTNjODYtZWVmMi00Y2FjLThmZDYtMzU5Mzk0MmZiNWE4IiwiY2xpZW50U2VjcmV0IjoiV0pTcmVEUkdIYUthYWVGZSJ9.ATHTGj_kYBNeqjim1CTUju0Ujfn0-TdWzlQlmC_OGpA";

// --- Weight Configuration ---
// Priority: Placement > Result > Event
const TYPE_WEIGHTS = {
  Placement: 3,
  Result: 2,
  Event: 1,
};

/**
 * Fetches all notifications from the API.
 * @returns {Promise<Array>} Array of notification objects
 */
async function fetchNotifications() {
  const response = await fetch(API_URL, {
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
    },
  });

  if (!response.ok) {
    throw new Error(`API request failed with status: ${response.status}`);
  }

  const data = await response.json();
  return data.notifications;
}

/**
 * Calculates a priority score for a single notification.
 *
 * Score formula:
 *   score = TYPE_WEIGHT * W_type + RECENCY_SCORE * W_recency
 *
 * Recency score = 1 / (1 + ageInMinutes)
 *   - A notification from NOW gets score ~1.0
 *   - A notification from 60 mins ago gets score ~0.016
 *   - This ensures fresher notifications rank higher within the same type
 *
 * Weights: type importance contributes 70%, recency contributes 30%
 *
 * @param {Object} notification
 * @returns {number} Priority score
 */
function calculatePriorityScore(notification) {
  const W_TYPE = 0.7;
  const W_RECENCY = 0.3;
  const MAX_TYPE_WEIGHT = Math.max(...Object.values(TYPE_WEIGHTS)); // normalize

  const typeWeight = (TYPE_WEIGHTS[notification.Type] || 0) / MAX_TYPE_WEIGHT;

  const timestamp = new Date(notification.Timestamp);
  const now = new Date();
  const ageInMinutes = (now - timestamp) / (1000 * 60);
  const recencyScore = 1 / (1 + ageInMinutes);

  return W_TYPE * typeWeight + W_RECENCY * recencyScore;
}

/**
 * Returns the top N priority notifications from the list.
 * @param {Array} notifications - All fetched notifications
 * @param {number} n - How many top notifications to return
 * @returns {Array} Top N notifications with score attached
 */
function getTopNPriorityNotifications(notifications, n = 10) {
  const scored = notifications.map((notification) => ({
    ...notification,
    priorityScore: calculatePriorityScore(notification),
  }));

  // Sort descending by score
  scored.sort((a, b) => b.priorityScore - a.priorityScore);

  return scored.slice(0, n);
}

/**
 * Displays the priority inbox in a readable table format.
 * @param {Array} topNotifications
 */
function displayPriorityInbox(topNotifications) {
  console.log("\n========================================");
  console.log("       CAMPUS NOTIFICATIONS - TOP 10    ");
  console.log("        Priority Inbox (Stage 1)        ");
  console.log("========================================\n");

  topNotifications.forEach((n, index) => {
    console.log(`Rank #${index + 1}`);
    console.log(`  ID        : ${n.ID}`);
    console.log(`  Type      : ${n.Type}`);
    console.log(`  Message   : ${n.Message}`);
    console.log(`  Timestamp : ${n.Timestamp}`);
    console.log(`  Score     : ${n.priorityScore.toFixed(6)}`);
    console.log("----------------------------------------");
  });

  console.log(`\nTotal notifications fetched and ranked successfully.`);
}

/**
 * Main entry point
 */
async function main() {
  try {
    const N = 10; // Number of top notifications to display (configurable: 10, 15, 20, etc.)

    console.log(`Fetching notifications from API...`);
    const notifications = await fetchNotifications();
    console.log(`Fetched ${notifications.length} notifications.`);

    console.log(`\nCalculating priority scores...`);
    const topNotifications = getTopNPriorityNotifications(notifications, N);

    displayPriorityInbox(topNotifications);
  } catch (error) {
    console.error("Error running priority inbox:", error.message);
    process.exit(1);
  }
}

main();