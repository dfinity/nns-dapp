import { targetBlankLinkRenderer } from "../../../lib/utils/markdown.utils";

describe("markdown.utils", () => {
  describe("targetBlankLinkRenderer", () => {
    it("should return rendered a tag", () => {
      expect(targetBlankLinkRenderer("/", "title", "text")).toEqual(
        `<a target="_blank" rel="noopener noreferrer" href="/" title="title">text</a>`
      );
    });

    it("should skip title if not provided", () => {
      expect(targetBlankLinkRenderer("/", null, "text")).toEqual(
        `<a target="_blank" rel="noopener noreferrer" href="/">text</a>`
      );
      expect(targetBlankLinkRenderer("/", undefined, "text")).toEqual(
        `<a target="_blank" rel="noopener noreferrer" href="/">text</a>`
      );
    });

    it("should skip href if not provided", () => {
      expect(targetBlankLinkRenderer(null, "title", "text")).toEqual(
        `<a title="title">text</a>`
      );
      expect(targetBlankLinkRenderer(undefined, "title", "text")).toEqual(
        `<a title="title">text</a>`
      );
    });
  });
});
