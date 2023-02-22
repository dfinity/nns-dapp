/**
 * @jest-environment jsdom
 */

import Address from "$lib/components/accounts/Address.svelte";
import { fireEvent, render } from "@testing-library/svelte";
import { mockAddressInputValid } from "../../../mocks/accounts.store.mock";
import en from "../../../mocks/i18n.mock";

describe("Address", () => {
  const props = { props: { address: undefined } };

  it("should render a form to enter an address", () => {
    const { container } = render(Address, props);

    expect(container.querySelector("input")).not.toBeNull();
    expect(container.querySelector("form")).not.toBeNull();

    const button = container.querySelector('button[type="submit"]');
    expect(button).not.toBeNull();
    expect(button?.innerHTML).toEqual(en.core.continue);
  });

  it("should show error message on blur when invalid address", async () => {
    const { container, queryByTestId } = render(Address, props);

    const input = container.querySelector("input") as HTMLInputElement;

    await fireEvent.input(input, { target: { value: "invalid-address" } });
    await fireEvent.blur(input);
    expect(queryByTestId("input-error-message")).toBeInTheDocument();
  });

  it("should enable and disable action according input", async () => {
    const { container } = render(Address, props);

    const input = container.querySelector("input") as HTMLInputElement;

    const button = container.querySelector("button");
    expect(button?.getAttribute("disabled")).not.toBeNull();

    await fireEvent.input(input, { target: { value: "test" } });
    expect(button?.getAttribute("disabled")).not.toBeNull();

    await fireEvent.input(input, {
      target: {
        value: mockAddressInputValid,
      },
    });

    expect(button?.getAttribute("disabled")).toBeNull();

    await fireEvent.input(input, {
      target: {
        value: mockAddressInputValid,
      },
    });
    expect(button?.getAttribute("disabled")).toBeNull();

    await fireEvent.input(input, { target: { value: "" } });
    expect(button?.getAttribute("disabled")).not.toBeNull();
  });
});
