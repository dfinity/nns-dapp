import {
  imageToLinkRenderer,
  markdownToHTML,
  markdownToSanitizedHTML,
  sanitize,
  targetBlankLinkRenderer,
} from "../../../lib/utils/html.utils";

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

  describe("sanitize and markdown", () => {
    let renderer: unknown;
    beforeAll(() => {
      function marked(...args) {
        renderer = args[1];
        return args[0] + "-markdown";
      }
      marked.Renderer = function () {
        return {};
      };
      jest.mock(
        "/assets/libs/marked.min.js",
        () => ({
          marked,
        }),
        { virtual: true }
      );
    });

    it("should sanitize HTML", () => {
      // Examples from DOMPurify README - https://github.com/cure53/DOMPurify
      expect(sanitize("<img src=x onerror=alert(1)//>")).toEqual(
        '<img src="x">'
      );
      expect(sanitize("<svg><g/onload=alert(2)//<p>")).toEqual(
        "<svg><g></g></svg>"
      );
      expect(
        sanitize("<p>abc<iframe//src=jAva&Tab;script:alert(3)>def</p>")
      ).toEqual("<p>abc</p>");
      expect(
        sanitize('<math><mi//xlink:href="data:x,<script>alert(4)</script>">')
      ).toEqual("<math><mi></mi></math>");
      expect(sanitize("<TABLE><tr><td>HELLO</tr></TABL>")).toEqual(
        "<table><tbody><tr><td>HELLO</td></tr></tbody></table>"
      );
      expect(sanitize("<UL><li><A HREF=//google.com>click</UL>")).toEqual(
        '<ul><li><a href="//google.com">click</a></li></ul>'
      );
    });

    it("should call markedjs/marked", async () => {
      expect((await markdownToHTML())("test")).toBe("test-markdown");
    });

    it("should call markedjs/marked with custom renderers", async () => {
      expect(renderer).toEqual({
        renderer: {
          link: targetBlankLinkRenderer,
          image: imageToLinkRenderer,
        },
      });
    });

    it("should sanitize and convert to HTML", async () => {
      expect(
        await markdownToSanitizedHTML("<p onerror=alert(1)>something</p>text")
      ).toBe("<p>something</p>text-markdown");
    });
  });
});
