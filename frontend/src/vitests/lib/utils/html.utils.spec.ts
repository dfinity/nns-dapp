import {
  htmlRenderer,
  imageToLinkRenderer,
  markdownToHTML,
  targetBlankLinkRenderer,
} from "$lib/utils/html.utils";

describe("markdown.utils", () => {
  describe("targetBlankLinkRenderer", () => {
    it("should return rendered a tag", () => {
      expect(targetBlankLinkRenderer("/", "title", "text")).toEqual(
        `<a target="_blank" rel="noopener noreferrer" href="/frontend/static" title="title">text</a>`
      );
    });

    it("should skip title if not provided", () => {
      expect(targetBlankLinkRenderer("/", null, "text")).toEqual(
        `<a target="_blank" rel="noopener noreferrer" href="/frontend/static">text</a>`
      );
      expect(targetBlankLinkRenderer("/", undefined, "text")).toEqual(
        `<a target="_blank" rel="noopener noreferrer" href="/frontend/static">text</a>`
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
        `<a target="_blank" rel="noopener noreferrer" href="/frontend/static" title="title">/</a>`
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

  describe("htmlRenderer", () => {
    it("should apply imageToLinkRenderer to img tag", () => {
      const src = "image.png";
      const title = "title";
      const alt = "alt";
      const expectation = imageToLinkRenderer(src, title, alt);
      expect(
        htmlRenderer(`<img src="${src}" alt="${alt}" title="${title}" />`)
      ).toEqual(expectation);
      expect(
        htmlRenderer(`<img src="${src}" alt="${alt}" title="${title}">...`)
      ).toEqual(expectation);
      expect(
        htmlRenderer(
          `<img data-test="123" src="${src}" alt="${alt}" title="${title}" />`
        )
      ).toEqual(expectation);
    });

    it("should escape img tag with data src", () => {
      expect(htmlRenderer(`<img src=""data:image/...">`)).toEqual(
        `&lt;img src=""data:image/..."&gt;`
      );
    });
  });

  describe("markdown", () => {
    let renderer: unknown;

    beforeEach(() => {
      renderer = undefined;

      function marked(...args) {
        renderer = args[1];
        return args[0] + "-markdown";
      }
      marked.Renderer = function () {
        return {};
      };
      vi.mock(
        "/assets/libs/marked.min.js",
        () => ({
          marked,
        }),
        { virtual: true }
      );
    });

    it("should call markedjs/marked", async () => {
      expect(await markdownToHTML("test")).toBe("test-markdown");
    });

    it("should call markedjs/marked with custom renderers", async () => {
      await markdownToHTML("test");

      expect(renderer).toEqual({
        renderer: {
          link: targetBlankLinkRenderer,
          image: imageToLinkRenderer,
          html: htmlRenderer,
        },
      });
    });

    it("should escape all SVGs", async () => {
      expect(await markdownToHTML("<h1><svg>...</svg></h1>")).toBe(
        "<h1>&lt;svg&gt;...&lt;/svg&gt;</h1>-markdown"
      );
    });
  });
});
