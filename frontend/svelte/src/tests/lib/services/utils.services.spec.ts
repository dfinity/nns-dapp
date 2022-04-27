import { markdownToSanitizedHTML } from "../../../lib/services/utils.services";
jest.mock("../../../lib/utils/markdown.utils", () => ({
  markdownToHTML: () => Promise.resolve((text) => `${text}-pong`),
}));
jest.mock("../../../lib/utils/security.utils", () => ({
  sanitize: () => Promise.resolve((text) => `${text}-pong`),
}));

describe("utils.services", () => {
  describe("markdownToSanitizedHTML", () => {
    it("should sanitize and convert to HTML", async () => {
      expect(await markdownToSanitizedHTML("ping")).toBe("ping-pong-pong");
    });
  });
});
