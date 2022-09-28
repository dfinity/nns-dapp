/**
 * @jest-environment jsdom
 */

import { fireEvent, render } from "@testing-library/svelte";
import Input from "../../../../lib/components/ui/Input.svelte";
import InputValueTest from "./InputValueTest.svelte";

describe("Input", () => {
  const props = { name: "name", placeholderLabelKey: "test.placeholder" };

  const testGetAttribute = ({
    attribute,
    expected,
    container,
  }: {
    attribute: string;
    expected: string;
    container: HTMLElement;
  }) => {
    const input: HTMLInputElement | null = container.querySelector("input");
    expect(input?.getAttribute(attribute)).toEqual(expected);
  };

  describe("inputType=icp", () => {
    it("should render an input of type icp as text", () => {
      const { container } = render(Input, {
        props: {
          ...props,
          inputType: "icp",
        },
      });

      testGetAttribute({ container, attribute: "type", expected: "text" });
    });

    it("should bind value", (done) => {
      const { container, component } = render(InputValueTest, {
        props: {
          ...props,
          inputType: "icp",
        },
      });

      const input: HTMLInputElement | null = container.querySelector("input");

      if (input === null) {
        throw new Error("No input");
      }

      fireEvent.input(input, { target: { value: "100" } });
      expect(input.value).toBe("100");

      component.$on("testAmount", ({ detail }) => {
        expect(detail.amount).toBe(100);
        done();
      });
    });

    it("should not accept not icp formatted changed", async () => {
      const { container } = render(Input, {
        props: {
          ...props,
          value: "1",
          inputType: "icp",
        },
      });

      const input: HTMLInputElement | null = container.querySelector("input");

      if (input === null) {
        throw new Error("No input");
      }

      fireEvent.input(input, { target: { value: "100" } });
      expect(input.value).toBe("100");

      fireEvent.input(input, { target: { value: "test" } });
      expect(input.value).toBe("100");

      fireEvent.input(input, { target: { value: "123" } });
      expect(input.value).toBe("123");

      fireEvent.input(input, { target: { value: ".0000001" } });
      expect(input.value).toBe(".0000001");

      fireEvent.input(input, { target: { value: ".000000001" } });
      expect(input.value).toBe(".0000001");
    });

    it('should replace "" with undefined', (done) => {
      const { container, component } = render(InputValueTest, {
        props: {
          ...props,
          value: "0",
          inputType: "icp",
        },
      });

      const input: HTMLInputElement | null = container.querySelector("input");

      if (input === null) {
        throw new Error("No input");
      }

      fireEvent.input(input, { target: { value: "" } });
      expect(input.value).toBe("");

      component.$on("testAmount", ({ detail }) => {
        expect(detail.amount).toBe(undefined);
        done();
      });
    });
  });
});
