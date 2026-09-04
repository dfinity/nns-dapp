import {
  observeRenderedMarkdown,
  sanitizeRenderedMarkdown,
} from "$lib/utils/html.utils";

describe("html.utils", () => {
  const sanitize = (html: string): string => {
    const root = document.createElement("div");
    root.innerHTML = html;
    sanitizeRenderedMarkdown(root);
    return root.innerHTML;
  };

  describe("sanitizeRenderedMarkdown", () => {
    it("should keep the tags that markdown produces", () => {
      expect(
        sanitize(
          "<h1>Title</h1><p>Text with <strong>bold</strong> and <em>italic</em>.</p>"
        )
      ).toBe(
        "<h1>Title</h1><p>Text with <strong>bold</strong> and <em>italic</em>.</p>"
      );
      expect(sanitize("<ul><li>one</li><li>two</li></ul>")).toBe(
        "<ul><li>one</li><li>two</li></ul>"
      );
      expect(sanitize("<blockquote><p>quote</p></blockquote>")).toBe(
        "<blockquote><p>quote</p></blockquote>"
      );
      expect(sanitize("<pre><code>let a = 1;</code></pre>")).toBe(
        "<pre><code>let a = 1;</code></pre>"
      );
      expect(sanitize("<p>a<br>b</p><hr>")).toBe("<p>a<br>b</p><hr>");
      expect(sanitize("<p><u>underlined</u> and <del>removed</del></p>")).toBe(
        "<p><u>underlined</u> and <del>removed</del></p>"
      );
    });

    it("should keep a table with its cell attributes", () => {
      expect(
        sanitize(
          '<table><thead><tr><th align="center">h</th></tr></thead>' +
            '<tbody><tr><td colspan="2" rowspan="3">c</td></tr></tbody></table>'
        )
      ).toBe(
        '<table><thead><tr><th align="center">h</th></tr></thead>' +
          '<tbody><tr><td colspan="2" rowspan="3">c</td></tr></tbody></table>'
      );
    });

    it("should keep the language class of a code block", () => {
      expect(sanitize('<code class="language-candid">x</code>')).toBe(
        '<code class="language-candid">x</code>'
      );
    });

    it("should keep the start of an ordered list", () => {
      expect(sanitize('<ol start="2"><li>two</li></ol>')).toBe(
        '<ol start="2"><li>two</li></ol>'
      );
    });

    it("should keep a link and force rel on a new tab", () => {
      expect(sanitize('<a href="https://internetcomputer.org/">link</a>')).toBe(
        '<a href="https://internetcomputer.org/">link</a>'
      );
      expect(
        sanitize(
          '<a href="https://internetcomputer.org/" target="_blank">link</a>'
        )
      ).toBe(
        '<a href="https://internetcomputer.org/" target="_blank" rel="noopener noreferrer">link</a>'
      );
    });

    it("should replace a rel that opens the tab", () => {
      expect(
        sanitize(
          '<a href="https://evil.example/" target="_blank" rel="opener">l</a>'
        )
      ).toBe(
        '<a href="https://evil.example/" target="_blank" rel="noopener noreferrer">l</a>'
      );
    });

    it("should drop a style element and its content", () => {
      expect(
        sanitize("<div><style>body{display:none}</style>Hello</div>")
      ).toBe("Hello");
      expect(
        sanitize("<p>a</p><style>:root{--primary:red}</style><p>b</p>")
      ).toBe("<p>a</p><p>b</p>");
    });

    it("should drop the style attribute", () => {
      expect(
        sanitize(
          '<p style="position:fixed;top:0;left:0;width:100vw;height:100vh;background:red">x</p>'
        )
      ).toBe("<p>x</p>");
      expect(
        sanitize('<table style="min-width: 50px"><tr><td>c</td></tr></table>')
      ).toBe("<table><tbody><tr><td>c</td></tr></tbody></table>");
    });

    it("should drop a form and its input fields", () => {
      expect(
        sanitize(
          '<form action="https://evil.example/"><input name="seed"><button>Claim</button></form>'
        )
      ).toBe("Claim");
    });

    it("should drop an svg", () => {
      expect(
        sanitize(
          '<p>before</p><svg width="100" height="100"><rect width="100" height="100" fill="red"></rect></svg><p>after</p>'
        )
      ).toBe("<p>before</p><p>after</p>");
    });

    it("should drop an image with a data url", () => {
      expect(
        sanitize(
          '<img src="data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=" alt="a">'
        )
      ).toBe("");
      expect(sanitize('<p>a<img src="https://evil.example/x.png">b</p>')).toBe(
        "<p>ab</p>"
      );
    });

    it("should drop a link with an unsafe scheme", () => {
      expect(sanitize('<a href="javascript:alert(1)">x</a>')).toBe("<a>x</a>");
      expect(
        sanitize('<a href="data:text/html;base64,PHA+eDwvcD4=">x</a>')
      ).toBe("<a>x</a>");
      expect(sanitize('<a href="/proposal/1">x</a>')).toBe(
        '<a href="/proposal/1">x</a>'
      );
    });

    it("should drop the attributes that imitate the app", () => {
      expect(
        sanitize(
          '<p id="app" class="content-cell-island" data-tid="proposal-summary-component">x</p>'
        )
      ).toBe("<p>x</p>");
    });

    it("should drop embedded and interactive elements", () => {
      expect(sanitize('<iframe src="https://evil.example/"></iframe>')).toBe(
        ""
      );
      expect(sanitize('<object data="https://evil.example/"></object>')).toBe(
        ""
      );
      expect(sanitize("<dialog open>fake modal</dialog>")).toBe("fake modal");
      expect(sanitize("<textarea>x</textarea>")).toBe("x");
      expect(sanitize("<select><option>x</option></select>")).toBe("x");
      expect(sanitize('<video src="x" controls></video>')).toBe("");
      expect(sanitize("<marquee>x</marquee>")).toBe("x");
    });

    it("should keep the text of an unknown element", () => {
      expect(sanitize("<div>kept text</div>")).toBe("kept text");
      expect(sanitize('<span class="x">kept <b>text</b></span>')).toBe(
        "kept <b>text</b>"
      );
    });

    it("should drop an attribute named after a property of Object", () => {
      expect(
        sanitize('<p constructor="x" __proto__="y" hasOwnProperty="z">t</p>')
      ).toBe("<p>t</p>");
    });

    it("should not change an already sanitized tree", () => {
      const html =
        '<p>a <a href="https://internetcomputer.org/" target="_blank" rel="noopener noreferrer">l</a></p>';
      expect(sanitize(html)).toBe(html);
    });
  });

  describe("observeRenderedMarkdown", () => {
    it("should sanitize content that is added later", async () => {
      const root = document.createElement("div");
      document.body.appendChild(root);
      const disconnect = observeRenderedMarkdown(root);

      root.innerHTML = "<div><style>body{display:none}</style>Hello</div>";
      await Promise.resolve();

      expect(root.innerHTML).toBe("Hello");

      disconnect();
    });

    it("should stop sanitizing once disconnected", async () => {
      const root = document.createElement("div");
      document.body.appendChild(root);
      const disconnect = observeRenderedMarkdown(root);
      disconnect();

      root.innerHTML = "<form>Claim</form>";
      await Promise.resolve();

      expect(root.innerHTML).toBe("<form>Claim</form>");
    });
  });
});
