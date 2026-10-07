const match = {
  opponent: "Real Madrid",
  competition: "La Liga",
  date: "10/25/2026",
  day: "Sunday",
  kickoffTime: "1:00 PM",
  venue: "Mad Dog in the Fog",
};

const whatsappMessage = `
Hey everyone! Barça are playing ${match.opponent} this ${match.day} ⚽🔵🔴

🏆 ${match.competition}
📅 ${match.date}
⏰ ${match.kickoffTime}
📍 ${match.venue}

Come watch the game with SF Penya. See you there!

Visca Barça! 💙❤️
`;

console.log(whatsappMessage);