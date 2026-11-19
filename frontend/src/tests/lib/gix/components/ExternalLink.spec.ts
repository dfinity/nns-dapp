import ExternalLink from "$lib/gix/components/ExternalLink.svelte";
import { render } from "@testing-library/svelte";

describe("ExternalLink", () => {
  it("should render a link", () => {
    const { container } = render(ExternalLink, {
      props: {
        href: "https://internetcomputer.org",
      },
    });
    const a = container.querySelector("a");

    expect(a).not.toBeNull();
  });

  it("should target external", () => {
    const { container } = render(ExternalLink, {
      props: {
        href: "https://internetcomputer.org",
      },
    });
    const a = container.querySelector("a") as unknown as HTMLLinkElement;

    expect(a.getAttribute("rel")).toEqual("external noopener noreferrer");
    expect(a.getAttribute("target")).toEqual("_blank");
  });

  it("should best accessible", () => {
    const alt = "Test test test";

    const { container } = render(ExternalLink, {
      props: {
        href: "https://internetcomputer.org",
        alt,
      },
    });
    const a = container.querySelector("a") as unknown as HTMLLinkElement;

    expect(a.getAttribute("title")).toEqual(alt);
  });
});
