/**
 * @jest-environment jsdom
 */

import { fireEvent } from "@testing-library/dom";
import { render } from "@testing-library/svelte";
import Json from "../../../../lib/components/common/Json.svelte";
import { bytesToHexString, stringifyJson } from "../../../../lib/utils/utils";
import { mockPrincipal } from "../../../mocks/auth.store.mock";
import en from "../../../mocks/i18n.mock";

// remove (array-index:|spaces|")
export const simplifyJson = (json: string | null) =>
  json?.replace(/(\d+\s*:\s*)(\w+|"|{|}|\[|])/g, "$2").replace(/"| |,|\\/g, "");

const testJsonRender = (json: unknown, result?: string) => {
  const { container } = render(Json, {
    props: { json },
  });
  expect(simplifyJson(container.textContent)).toBe(
    result ?? simplifyJson(stringifyJson(json))
  );
};

describe("Json", () => {
  it("should render empty object", () => testJsonRender({}));

  it("should render empty array", () => testJsonRender([]));

  it("should render null", () => testJsonRender(null));

  it("should render undefined", () => testJsonRender(undefined, "undefined"));

  it("should render simple types", () =>
    testJsonRender({
      string: "value",
      number: 123,
      n: null,
      t: true,
      f: false,
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

  it("should render deep structures", () =>
    testJsonRender([
      [
        {
          obj: { test: null },
          list: [
            0,
            1,
            2,
            "end",
            { hello: [{ test: ["world", 13, null] }] },
            [13],
          ],
        },
      ],
    ]));

  it("should render bigint", () =>
    testJsonRender({
      bigint: BigInt("12345678901234567890123456789012345678901234567890"),
    }));

  it("should render function", () =>
    testJsonRender(
      {
        func: () => null,
      },
      "{func:f(){...}}"
    ));

  it("should render symbol", () =>
    testJsonRender(
      {
        sym: Symbol("test"),
      },
      "{sym:Symbol(test)}"
    ));

  it("should render principal", () =>
    testJsonRender({
      principal: mockPrincipal,
    }));

  it("should render hash like objects", () => {
    const hash = Array(32).fill(0);
    testJsonRender(hash, bytesToHexString(hash));
  });

  it("should render title with original value for hash like objects", () => {
    const hash = Array(32).fill(0);
    const { getByTitle } = render(Json, {
      props: { json: hash },
    });
    expect(getByTitle(hash.join())).toBeInTheDocument();
  });

  it("should collaps and expand", async () => {
    const json = {
      obj: {
        first: 1,
        second: 2,
      },
    };
    const { container, getAllByRole } = render(Json, {
      props: { json },
    });
    const obj = () => getAllByRole("button")[1];

    expect(simplifyJson(container.textContent)).toBe(
      simplifyJson(stringifyJson(json))
    );

    await fireEvent.click(obj());
    expect(simplifyJson(container.textContent)).toBe("{obj:{...}}");

    await fireEvent.click(obj());
    expect(simplifyJson(container.textContent)).toBe(
      simplifyJson(stringifyJson(json))
    );
  });

  it("should render role=button", async () => {
    const json = {
      obj: {
        first: 1,
        second: 2,
      },
    };
    const { getAllByRole } = render(Json, {
      props: { json },
    });
    expect(getAllByRole("button").length).toBe(2);
  });

  it("should render aria-label for role=button", async () => {
    const json = {
      obj: {
        first: 1,
        second: 2,
      },
    };
    const { getAllByRole } = render(Json, {
      props: { json },
    });
    const buttons = getAllByRole("button");

    expect(buttons.length).toBe(2);

    buttons.forEach((button) =>
      expect(button.getAttribute("aria-label")).toBe(en.core.toggle)
    );
  });
});
