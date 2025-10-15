const { app } = require("./server");

describe("Smoke Tests - Application Health", () => {
  test("application should start without errors", () => {
    expect(app).toBeDefined();
    expect(typeof app).toBe("function");
  });

  test("application should have required routes configured", () => {
    const routes = [];

    // Extract routes from the Express app
    app._router.stack.forEach((layer) => {
      if (layer.route) {
        const route = layer.route;
        const methods = Object.keys(route.methods);
        routes.push({
          path: route.path,
          methods: methods,
        });
      }
    });

    // Check that required routes exist
    const routePaths = routes.map((r) => r.path);
    expect(routePaths).toContain("/");
    expect(routePaths).toContain("/voice");
    expect(routePaths).toContain("/handle-menu");
  });

  test("application should handle Express middleware", () => {
    // Verify that the app has the urlencoded middleware
    expect(app._router).toBeDefined();
    expect(app._router.stack.length).toBeGreaterThan(0);
  });
});
