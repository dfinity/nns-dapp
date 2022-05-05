/**
 * @jest-environment jsdom
 */

import { fireEvent } from "@testing-library/dom";
import { render } from "@testing-library/svelte";
import Json from "../../../../lib/components/common/Json.svelte";
import { stringifyJson } from "../../../../lib/utils/utils";
import { mockPrincipal } from "../../../mocks/auth.store.mock";

// remove (array-index:|spaces|")
const simplify = (json: string | null) =>
  json?.replace(/(\d+\s*:\s*)(\w+|"|{|}|\[|])/g, "$2").replace(/"| |,/g, "");

const testJsonRender = (json: unknown, result?: string) => {
  const { container } = render(Json, {
    props: { json },
  });
  expect(simplify(container.textContent)).toBe(
    result ?? simplify(stringifyJson(json))
  );
};

describe("Json", () => {
  it("should render empty object", () => testJsonRender({}));

  it("should render empty array", () => {
    const json = [];
    const { container } = render(Json, {
      props: { json },
    });
    expect(simplify(container.textContent)).toBe(simplify(stringifyJson(json)));
  });

  it("should render simple types", () =>
    testJsonRender({
      string: "value",
      number: 123,
      n: null,
    }));

  it("should render undefined", () =>
    testJsonRender(
      {
        u: undefined,
      },
      "{u:undefined}"
    ));

  it("should render object", () =>
    testJsonRender({
      string: "value",
      number: 123,
      list: [0, 1, 2, "end", { hello: "world" }, [13]],
    }));

  it("should render bigint", () =>
    testJsonRender({
      bigint: BigInt(123),
    }));

  it("should render principal", () =>
    testJsonRender({
      principal: mockPrincipal,
    }));

  it("should collaps and expand", async () => {
    const json = {
      obj: {
        first: 1,
        second: 2,
      },
    };
    const { container, getByText } = render(Json, {
      props: { json },
    });
    console.log("container", container.innerHTML);

    expect(simplify(container.textContent)).toBe(simplify(stringifyJson(json)));
    await fireEvent.click(getByText("obj:"));
    expect(simplify(container.textContent)).toBe("{obj:{...}}");
    await fireEvent.click(getByText("obj:"));
    expect(simplify(container.textContent)).toBe(simplify(stringifyJson(json)));
  });
});
