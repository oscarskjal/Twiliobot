const request = require("supertest");
const { app } = require("./server");

describe("Integration Tests - API Endpoints", () => {
  describe("GET /", () => {
    test("should return status page with chicken emoji", async () => {
      const response = await request(app).get("/").expect(200);

      expect(response.text).toContain("🐔");
      expect(response.text).toContain("Twilio Chicken Joke Bot is running");
    });

    test("should return HTML content type", async () => {
      const response = await request(app).get("/").expect(200);

      expect(response.header["content-type"]).toMatch(/text\/html/);
    });
  });

  describe("POST /voice", () => {
    test("should return valid TwiML response", async () => {
      const response = await request(app).post("/voice").expect(200);

      expect(response.header["content-type"]).toContain("text/xml");
      expect(response.text).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(response.text).toContain("<Response>");
      expect(response.text).toContain("</Response>");
    });

    test("should contain initial greeting message", async () => {
      const response = await request(app).post("/voice").expect(200);

      expect(response.text).toContain("twilio joke center");
      expect(response.text).toContain("Press 1 for chicken joke");
      expect(response.text).toContain("press 2 for nothing");
    });

    test("should contain Gather element for user input", async () => {
      const response = await request(app).post("/voice").expect(200);

      expect(response.text).toContain("<Gather");
      expect(response.text).toContain('action="/handle-menu"');
      expect(response.text).toContain('method="POST"');
      expect(response.text).toContain('numDigits="1"');
    });

    test("should contain Say elements with alice voice", async () => {
      const response = await request(app).post("/voice").expect(200);

      expect(response.text).toContain('voice="alice"');
      expect(response.text).toContain("<Say");
      expect(response.text).toContain("</Say>");
    });

    test("should contain fallback message and hangup", async () => {
      const response = await request(app).post("/voice").expect(200);

      expect(response.text).toContain("Sorry, I didn't receive your selection");
      expect(response.text).toContain("<Hangup/>");
    });
  });

  describe("POST /handle-menu", () => {
    test('should handle digit "1" (chicken joke option)', async () => {
      const response = await request(app)
        .post("/handle-menu")
        .type("form")
        .send("Digits=1")
        .expect(200);

      expect(response.header["content-type"]).toContain("text/xml");
      expect(response.text).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(response.text).toContain("<Response>");
      expect(response.text).toContain("</Response>");
      expect(response.text).toContain("<Hangup/>");
      expect(response.text).toContain(
        "Thank you for calling the twilio joke center"
      );
    });

    test('should handle digit "2" (nothing option)', async () => {
      const response = await request(app)
        .post("/handle-menu")
        .type("form")
        .send("Digits=2")
        .expect(200);

      expect(response.header["content-type"]).toContain("text/xml");
      expect(response.text).toContain("You selected nothing");
      expect(response.text).toContain("So here's nothing");
      expect(response.text).toContain("<Hangup/>");
    });

    test("should handle invalid digit selections", async () => {
      const invalidDigits = ["0", "3", "4", "5", "9", "#", "*"];

      for (const digit of invalidDigits) {
        const response = await request(app)
          .post("/handle-menu")
          .type("form")
          .send(`Digits=${digit}`)
          .expect(200);

        expect(response.header["content-type"]).toContain("text/xml");
        expect(response.text).toContain("Sorry, that's not a valid option");
        expect(response.text).toContain("Please call back and press 1 or 2");
        expect(response.text).toContain("<Hangup/>");
      }
    });

    test("should handle empty or missing Digits parameter", async () => {
      const response = await request(app)
        .post("/handle-menu")
        .type("form")
        .send("")
        .expect(200);

      expect(response.header["content-type"]).toContain("text/xml");
      expect(response.text).toContain("Sorry, that's not a valid option");
    });

    test("should return well-formed XML for all responses", async () => {
      const testCases = ["Digits=1", "Digits=2", "Digits=9", ""];

      for (const testCase of testCases) {
        const response = await request(app)
          .post("/handle-menu")
          .type("form")
          .send(testCase)
          .expect(200);

        // Check for proper XML structure
        expect(response.text).toMatch(
          /^<\?xml version="1\.0" encoding="UTF-8"\?>/
        );
        expect(response.text).toContain("<Response>");
        expect(response.text).toContain("</Response>");
        expect(response.text).toContain('<Say voice="alice">');
        expect(response.text).toContain("</Say>");
        expect(response.text).toContain("<Hangup/>");
      }
    });

    test("should remove emoji from voice jokes", async () => {
      const response = await request(app)
        .post("/handle-menu")
        .type("form")
        .send("Digits=1")
        .expect(200);

      // The response should not contain chicken emojis since they're removed for voice
      expect(response.text).not.toContain("🐔");

      // But should still contain chicken joke content
      expect(response.text.toLowerCase()).toMatch(/(chicken|road|cross)/);
    });

    test("should handle URL-encoded form data", async () => {
      const response = await request(app)
        .post("/handle-menu")
        .type("form")
        .send("Digits=1")
        .expect(200);

      expect(response.header["content-type"]).toContain("text/xml");
      expect(response.text).toContain("<Response>");
    });
  });

  describe("Error Handling", () => {
    test("should handle non-existent routes", async () => {
      await request(app).get("/nonexistent").expect(404);
    });

    test("should handle GET requests to POST-only endpoints", async () => {
      await request(app).get("/voice").expect(404);

      await request(app).get("/handle-menu").expect(404);
    });

    test("should handle malformed POST data gracefully", async () => {
      const response = await request(app)
        .post("/handle-menu")
        .type("form")
        .send("invalid=data")
        .expect(200);

      // Should still return valid TwiML even with bad input
      expect(response.text).toContain("<Response>");
      expect(response.text).toContain("Sorry, that's not a valid option");
    });
  });

  describe("Content Security", () => {
    test("should not expose sensitive information in responses", async () => {
      const routes = ["/", "/voice"];

      for (const route of routes) {
        const method = route === "/" ? "get" : "post";
        const response = await request(app)[method](route);

        // Check that response doesn't contain common sensitive patterns
        expect(response.text.toLowerCase()).not.toMatch(
          /(password|secret|key|token|api)/
        );
      }
    });

    test("should return appropriate content types", async () => {
      const response1 = await request(app).get("/");
      expect(response1.header["content-type"]).toMatch(/text\/html/);

      const response2 = await request(app).post("/voice");
      expect(response2.header["content-type"]).toContain("text/xml");

      const response3 = await request(app)
        .post("/handle-menu")
        .send({ Digits: "1" });
      expect(response3.header["content-type"]).toContain("text/xml");
    });
  });
});
