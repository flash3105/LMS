function searchCourses() {
  const input = document.getElementById("searchInput").value.toLowerCase();
  console.log("Search Input: ", input);

  const cards = document.querySelectorAll(".course-card");
  console.log("Found cards: ", cards);

  cards.forEach(card => {
      const title = card.querySelector("h5").innerText.toLowerCase();
      console.log("Card Title: ", title);

      card.style.display = title.includes(input) ? "block" : "none"; 
  });
}

document.getElementById("searchInput").addEventListener("keyup", searchCourses);

