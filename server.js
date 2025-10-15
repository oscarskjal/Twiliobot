const express = require("express");

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse URL-encoded bodies
app.use(express.urlencoded({ extended: false }));

// Chicken jokes
const chickenJokes = [
  "Why did the chicken cross the road? To get to the other side! 🐔",
  "Why did the chicken cross the road? Because it was free-range! 🐔",
  "Why did the chicken cross the road? To prove it wasn't chicken! 🐔",
  "Why did the chicken cross the road? Because the road crossed the chicken first! 🐔",
  "Why did the rubber chicken cross the road? She wanted to stretch her legs! 🐔",
  "Why did the chicken cross the playground? To get to the other slide! 🐔",
  "Why did the chicken cross the road twice? Because it was a double-crosser! 🐔",
  "Why did the chicken cross the road? To escape the Colonel! 🐔",
];

// Function to get a random chicken joke
function getRandomChickenJoke() {
  return chickenJokes[Math.floor(Math.random() * chickenJokes.length)];
}

// Webhook endpoint for incoming voice calls
app.post("/voice", (req, res) => {
  console.log("Incoming voice call");

  // Initial greeting and menu
  const twimlXml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="alice">You are calling to twilio joke center. Press 1 for chicken joke, press 2 for nothing.</Say>
    <Gather action="/handle-menu" method="POST" numDigits="1" timeout="10">
        <Say voice="alice">Please make your selection now.</Say>
    </Gather>
    <Say voice="alice">Sorry, I didn't receive your selection. Goodbye!</Say>
    <Hangup/>
</Response>`;

  res.type("text/xml").send(twimlXml);
});

// Handle menu selection
app.post("/handle-menu", (req, res) => {
  const digit = req.body.Digits;
  console.log(`User pressed: ${digit}`);

  let twimlXml;

  if (digit === "1") {
    // Tell a chicken joke
    const joke = getRandomChickenJoke();
    // Remove emoji for voice synthesis
    const voiceJoke = joke.replace(/🐔/g, "");

    twimlXml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="alice">${voiceJoke}</Say>
    <Say voice="alice">Thank you for calling the twilio joke center. Goodbye!</Say>
    <Hangup/>
</Response>`;
  } else if (digit === "2") {
    // Do nothing option
    twimlXml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="alice">You selected nothing. So here's nothing... Thank you for calling. Goodbye!</Say>
    <Hangup/>
</Response>`;
  } else {
    // Invalid selection
    twimlXml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="alice">Sorry, that's not a valid option. Please call back and press 1 or 2. Goodbye!</Say>
    <Hangup/>
</Response>`;
  }

  res.type("text/xml").send(twimlXml);
});

// Endpoint for checking server status
app.get("/", (req, res) => {
  res.send(
    "🐔 Twilio Chicken Joke Bot is running! Call the number to hear jokes."
  );
});

// Start the server only if this file is run directly
if (require.main === module) {
  app.listen(port, () => {
    console.log(`🐔 Chicken Joke Bot listening at http://localhost:${port}`);
    console.log("Voice Webhook URL: http://localhost:" + port + "/voice");
  });
}

// Export the app and functions for testing
module.exports = { app, getRandomChickenJoke };
