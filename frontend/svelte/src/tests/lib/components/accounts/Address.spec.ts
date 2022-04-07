/**
 * @jest-environment jsdom
 */

import { fireEvent, render } from "@testing-library/svelte";
import Address from "../../../../lib/components/accounts/Address.svelte";
import { ACCOUNT_ADDRESS_MIN_LENGTH } from "../../../../lib/constants/accounts.constants";
import { mockAddressInput } from "../../../mocks/accounts.store.mock";
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

  it("should render an input with a minimal length of 40", () => {
    const { container } = render(Address, props);

    const input = container.querySelector("input");
    expect(input).not.toBeNull();
    expect(input?.getAttribute("minlength")).toEqual(
      `${ACCOUNT_ADDRESS_MIN_LENGTH}`
    );
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
        value: mockAddressInput(ACCOUNT_ADDRESS_MIN_LENGTH),
      },
    });

    expect(button?.getAttribute("disabled")).toBeNull();

    await fireEvent.input(input, {
      target: {
        value: mockAddressInput(ACCOUNT_ADDRESS_MIN_LENGTH + 1),
      },
    });
    expect(button?.getAttribute("disabled")).toBeNull();

    await fireEvent.input(input, { target: { value: "" } });
    expect(button?.getAttribute("disabled")).not.toBeNull();
  });
});
