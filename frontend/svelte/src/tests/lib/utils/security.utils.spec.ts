/**
 * @jest-environment jsdom
 */

import { removeHTMLTags } from "../../../lib/utils/security.utils";

describe("security.utils", () => {
  describe("removeHTMLTags", () => {
    it("should remove tags", () =>
      expect(removeHTMLTags('Hello <script>alert("world")</script>!')).toBe(
        'Hello alert("world")!'
      ));

    it("should not change TAGless text", () =>
      expect(removeHTMLTags("Hello World! 🤞")).toBe("Hello World! 🤞"));
  });
});
