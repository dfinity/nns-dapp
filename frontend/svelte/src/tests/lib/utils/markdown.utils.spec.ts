import {
  imageToLinkRenderer,
  targetBlankLinkRenderer,
} from "../../../lib/utils/markdown.utils";

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

    it("should render href of title if no text", () => {
      expect(targetBlankLinkRenderer("/", "title", "")).toEqual(
        `<a target="_blank" rel="noopener noreferrer" href="/" title="title">/</a>`
      );
      expect(targetBlankLinkRenderer(null, "title", "")).toEqual(
        `<a title="title">title</a>`
      );
    });
  });

  describe("imageToLinkRenderer", () => {
    it("should render link instead of image", () => {
      expect(imageToLinkRenderer("image.png", "title", "alt")).toEqual(
        `<a href="image.png" target="_blank" rel="noopener noreferrer" type="image/png" title="title">alt</a>`
      );
    });

    it("should render link without alt", () => {
      expect(imageToLinkRenderer("image.png", "title", "")).toEqual(
        `<a href="image.png" target="_blank" rel="noopener noreferrer" type="image/png" title="title">title</a>`
      );
    });

    it("should render link without title", () => {
      expect(imageToLinkRenderer("image.png", undefined, "alt")).toEqual(
        `<a href="image.png" target="_blank" rel="noopener noreferrer" type="image/png">alt</a>`
      );
      expect(imageToLinkRenderer("image.png", null, "alt")).toEqual(
        `<a href="image.png" target="_blank" rel="noopener noreferrer" type="image/png">alt</a>`
      );
    });

    it("should render link without alt and title", () => {
      expect(imageToLinkRenderer("image.png", undefined, "")).toEqual(
        `<a href="image.png" target="_blank" rel="noopener noreferrer" type="image/png">image.png</a>`
      );
      expect(imageToLinkRenderer("image.png", null, "")).toEqual(
        `<a href="image.png" target="_blank" rel="noopener noreferrer" type="image/png">image.png</a>`
      );
    });

    it("should not render mime type withoug file extention", () => {
      expect(imageToLinkRenderer("/image", undefined, "")).toEqual(
        `<a href="/image" target="_blank" rel="noopener noreferrer">/image</a>`
      );
    });

    it("should render empty string w/o href", () => {
      expect(imageToLinkRenderer("", undefined, "")).toEqual(``);
      expect(imageToLinkRenderer(null, null, "")).toEqual(``);
      expect(imageToLinkRenderer("", "title", "")).toEqual(``);
      expect(imageToLinkRenderer(undefined, "title", "")).toEqual(``);
    });

    it("should render alt w/o href", () => {
      expect(imageToLinkRenderer("", undefined, "alt")).toEqual(`alt`);
      expect(imageToLinkRenderer(undefined, null, "alt")).toEqual(`alt`);
      expect(imageToLinkRenderer(null, null, "alt")).toEqual(`alt`);
      expect(imageToLinkRenderer("", "", "alt")).toEqual(`alt`);
    });
  });
});
