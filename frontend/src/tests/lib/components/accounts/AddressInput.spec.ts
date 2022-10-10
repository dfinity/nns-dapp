/**
 * @jest-environment jsdom
 */

import AddressInput from "$lib/components/accounts/AddressInput.svelte";
import { ACCOUNT_ADDRESS_MIN_LENGTH } from "$lib/constants/accounts.constants";
import { fireEvent, render } from "@testing-library/svelte";

describe("AddressInput", () => {
  const props = { props: { address: undefined } };

  it("should render an input with a minimal length of 40", () => {
    const { container } = render(AddressInput, props);

    const input = container.querySelector("input");
    expect(input).not.toBeNull();
    expect(input?.getAttribute("minlength")).toEqual(
      `${ACCOUNT_ADDRESS_MIN_LENGTH}`
    );
  });

  it("should show error message on blur when invalid address", async () => {
    const { container, queryByTestId } = render(AddressInput, props);

    const input = container.querySelector("input") as HTMLInputElement;

    await fireEvent.input(input, { target: { value: "invalid-address" } });
    await fireEvent.blur(input);
    expect(queryByTestId("input-error-message")).toBeInTheDocument();
  });
});
