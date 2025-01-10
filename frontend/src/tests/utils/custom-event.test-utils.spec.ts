describe("custom-event", () => {
  describe("CustomEventForTesting", () => {
    it("should consider events with different detail to be different", () => {
      // This test relies on CustomEvent being overridden with
      // CustomEventForTesting in vitest.setup.ts.
      const event1 = new CustomEvent("test", { detail: "1" });
      const event2 = new CustomEvent("test", { detail: "2" });

      expect(event1).not.toEqual(event2);
    });

    it("demonstrates the issue with standard CustomEvent", () => {
      // Restores the original CustomEvent type.
      vi.unstubAllGlobals();

      const event1 = new CustomEvent("test", { detail: "1" });
      const event2 = new CustomEvent("test", { detail: "2" });

      // The events are different but appear to be the same.
      expect(event1).toEqual(event2);
    });
  });
});
