import {
  htmlRenderer,
  imageToLinkRenderer,
  markdownToHTML,
  targetBlankLinkRenderer,
} from "$lib/gix/utils/markdown.utils";

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
    it("should call markedjs/marked", async () => {
      await expect(markdownToHTML("test")).resolves.toBe("<p>test</p>\n");
    });

    it("should escape all SVGs", async () => {
      await expect(markdownToHTML("<h1><svg>...</svg></h1>")).resolves.toBe(
        "<h1>&lt;svg&gt;...&lt;/svg&gt;</h1>"
      );
    });

    it("should render link with a custom renderer", async () => {
      await expect(markdownToHTML("[test](https://test.com)")).resolves.toBe(
        '<p><a target="_blank" rel="noopener noreferrer" href="https://test.com">test</a></p>\n'
      );
    });

    it("should render image link with a custom renderer", async () => {
      await expect(markdownToHTML(`![alt](image.png "title")`)).resolves.toBe(
        `<p><a href="image.png" target="_blank" rel="noopener noreferrer" type="image/png" title="title">alt</a></p>\n`
      );
    });

    it("should render image provided as html with a custom renderer", async () => {
      await expect(
        markdownToHTML(`<img src="image.png" alt="title" />`)
      ).resolves.toBe(
        `<a href="image.png" target="_blank" rel="noopener noreferrer" type="image/png">title</a>`
      );
    });

    it("should escape SVGs in regular markdown text", async () => {
      const markdown = `Here's an SVG: <svg onload="alert('xss')"><circle/></svg>`;

      const result = await markdownToHTML(markdown);

      // SVG should be escaped for security
      expect(result).toContain("&lt;svg");
      expect(result).toContain("&lt;/svg&gt;");
      expect(result).not.toContain("<svg onload=\"alert('xss')\"");
    });

    it("should escape SVGs in HTML blocks", async () => {
      const markdown = `<div>
   <svg xmlns="http://www.w3.org/2000/svg" onload="alert('xss')">
     <circle cx="50" cy="50" r="40"/>
   </svg>
   </div>`;

      const result = await markdownToHTML(markdown);

      // SVG should be escaped even in HTML blocks
      expect(result).toContain("&lt;svg");
      expect(result).toContain("&lt;circle");
    });

    it("should preserve SVGs in code blocks as escaped text", async () => {
      const markdown = `
   \`\`\`xml
   <svg onload="alert('safe-in-code')">
     <circle cx="50" cy="50" r="40"/>
   </svg>
   \`\`\``;

      const result = await markdownToHTML(markdown);

      // SVG in code should be HTML-encoded for display as text
      expect(result).toContain("&lt;svg");
      expect(result).toContain("&lt;circle");
      expect(result).toContain("&lt;/svg&gt;");

      // Should not contain executable SVG
      expect(result).not.toContain("<svg onload=\"alert('safe-in-code')\"");
    });
  });
});
