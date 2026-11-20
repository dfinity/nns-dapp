import { nextElementId, sanitize } from "$lib/gix/utils/html.utils";
import { markdownToHTML } from "$lib/gix/utils/markdown.utils";

describe("html-utils", () => {
  it("should sanitize HTML", () => {
    // Examples from DOMPurify README - https://github.com/cure53/DOMPurify
    expect(sanitize("<img src=x onerror=alert(1)//>")).toEqual('<img src="x">');
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

  describe("styles", () => {
    it("should remove a style element after other content", () => {
      expect(sanitize("<p>text</p><style>p { color: red; }</style>")).toEqual(
        "<p>text</p>"
      );
    });

    it("should remove a style element inside an svg", () => {
      expect(
        sanitize(`<svg><style>p{color:red}</style><circle r="1"/></svg>`)
      ).toEqual(`<svg><circle r="1"></circle></svg>`);
    });

    it("should remove the style attribute and keep the element", () => {
      expect(sanitize(`<p style="color: red;">text</p>`)).toEqual(
        "<p>text</p>"
      );
    });

    it("should keep the table alignment from markdown", async () => {
      const html = await markdownToHTML(
        "| Left | Right |\n| :--- | ----: |\n| a | b |"
      );

      expect(sanitize(html)).toEqual(html);
    });
  });

  describe("target=_blank workaround", () => {
    it("should preserve the target attribute", () => {
      expect(
        sanitize(`<a target="_blank" rel="noreferrer" href="/">link</a>`)
      ).toEqual(`<a rel="noreferrer" href="/" target="_blank">link</a>`);
      expect(
        sanitize(`<a target="_blank" rel=" noreferrer " href="/">link</a>`)
      ).toEqual(`<a rel="noreferrer" href="/" target="_blank">link</a>`);
    });

    it('should add "noopener" if rel not set', () => {
      expect(sanitize(`<a target="_blank" href="/">link</a>`)).toEqual(
        `<a href="/" target="_blank" rel="noopener">link</a>`
      );
    });

    it('should replace unknown|insecure rel value with "noopener"', () => {
      expect(
        sanitize(`<a target="_blank" rel="nocloser" href="/">link</a>`)
      ).toEqual(`<a rel="noopener" href="/" target="_blank">link</a>`);
      expect(
        sanitize(
          `<a target="_blank" rel="noopenernoreferrer" href="/">link</a>`
        )
      ).toEqual(`<a rel="noopener" href="/" target="_blank">link</a>`);
    });
  });
});

describe("next element", () => {
  it("should increment per category", () => {
    expect(nextElementId("test-")).toEqual("test-1");
    expect(nextElementId("another-")).toEqual("another-1");
    expect(nextElementId("test-")).toEqual("test-2");
    expect(nextElementId("another-")).toEqual("another-2");
    expect(nextElementId("another-")).toEqual("another-3");
  });
});
