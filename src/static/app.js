document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";
      // Reset activity select options (keep placeholder)
      activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const participants = details.participants || [];
        const spotsLeft = details.max_participants - participants.length;

        const participantsHTML = participants.length
          ? participants
              .map(
                (p) =>
                  `<li class="participant-item" data-email="${p}"><span class="participant-email">${p}</span><button class="participant-delete" data-email="${p}" aria-label="Unregister">&times;</button></li>`
              )
              .join("")
          : `<li class="participant-muted">No participants yet</li>`;

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          <div class="participants">
            <p><strong>Participants:</strong></p>
            <ul class="participants-list">
              ${participantsHTML}
            </ul>
          </div>
        `;

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle participant delete (event delegation)
  activitiesList.addEventListener("click", async (event) => {
    const target = event.target;
    if (!target.classList.contains("participant-delete")) return;

    const email = target.dataset.email;
    const li = target.closest(".participant-item");
    const activityCard = target.closest(".activity-card");
    const activityName = activityCard.querySelector("h4").textContent;

    if (!confirm(`Unregister ${email} from ${activityName}?`)) return;

    try {
      const resp = await fetch(
        `/activities/${encodeURIComponent(activityName)}/participants?email=${encodeURIComponent(email)}`,
        { method: "DELETE" }
      );

      const result = await resp.json();
      if (resp.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        messageDiv.classList.remove("hidden");

        // Refresh activities to update counts
        fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "Failed to unregister participant.";
        messageDiv.className = "error";
        messageDiv.classList.remove("hidden");
      }

      setTimeout(() => messageDiv.classList.add("hidden"), 5000);
    } catch (err) {
      console.error("Error unregistering participant:", err);
      messageDiv.textContent = "Failed to unregister. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
    }
  });

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        // Refresh activities so the new participant appears without a page reload
        await fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
