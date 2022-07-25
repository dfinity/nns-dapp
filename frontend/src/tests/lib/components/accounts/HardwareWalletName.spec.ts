/**
 * @jest-environment jsdom
 */

import { fireEvent } from "@testing-library/dom";
import { render, waitFor } from "@testing-library/svelte";
import { tick } from "svelte";
import HardwareWalletName from "../../../../lib/components/accounts/HardwareWalletName.svelte";
import { addAccountStoreMock } from "../../../mocks/add-account.store.mock";
import en from "../../../mocks/i18n.mock";
import AddAccountTest from "./AddAccountTest.svelte";

describe("HardwareWalletName", () => {
  const props = { testComponent: HardwareWalletName };

  beforeAll(() =>
    addAccountStoreMock.set({
      type: "hardwareWallet",
      hardwareWalletName: undefined,
    })
  );

  afterAll(() =>
    addAccountStoreMock.set({
      type: undefined,
      hardwareWalletName: undefined,
    })
  );

  it("should enable and disable submit according text input length", async () => {
    const { container } = render(AddAccountTest, {
      props,
    });

    const button: HTMLButtonElement = container.querySelector(
      'button[type="submit"]'
    ) as HTMLButtonElement;

    expect(button?.getAttribute("disabled")).not.toBeNull();

    const input = container.querySelector("input") as HTMLInputElement;
    await fireEvent.input(input, { target: { value: "1" } });

    await tick();

    // except to be still disabled
    expect(button?.getAttribute("disabled")).not.toBeNull();

    await fireEvent.input(input, { target: { value: "12" } });

    // should become enabled
    await waitFor(() => {
      expect(button?.getAttribute("disabled")).toBeNull();
    });

    await fireEvent.input(input, { target: { value: "1" } });

    // should be disabled again
    await waitFor(() => {
      expect(button?.getAttribute("disabled")).not.toBeNull();
    });
  });

  it("should enter a wallet name", async () => {
    const spyOnNext = jest.fn();

    const { container } = render(AddAccountTest, {
      props: {
        ...props,
        nextCallback: spyOnNext,
      },
    });

    const input = container.querySelector("input") as HTMLInputElement;
    await fireEvent.input(input, { target: { value: "test" } });

    const button: HTMLButtonElement = container.querySelector(
      'button[type="submit"]'
    ) as HTMLButtonElement;

    await waitFor(() => {
      expect(button?.getAttribute("disabled")).toBeNull();
    });

    fireEvent.click(button);

    await waitFor(() => expect(spyOnNext).toHaveBeenCalled());
  });

  it("should display an error if wallet name is too short", async () => {
    const spyOnNext = jest.fn();

    const { container, getByText } = render(AddAccountTest, {
      props: {
        ...props,
        nextCallback: spyOnNext,
      },
    });

    const input = container.querySelector("input") as HTMLInputElement;
    await fireEvent.input(input, { target: { value: "1" } });

    getByText(en.accounts.attach_hardware_enter_name).focus();

    await waitFor(() =>
      expect(getByText(en.accounts.attach_hardware_enter_name)).not.toBeNull()
    );
  });
});
