function searchCourses() {
    const input = document.getElementById("searchInput").value.toLowerCase();
    const cards = document.querySelectorAll(".course-card");
  
    cards.forEach(card => {
      const title = card.querySelector("h5").innerText.toLowerCase();
      card.style.display = title.includes(input) ? "block" : "none";
    });
  }
  