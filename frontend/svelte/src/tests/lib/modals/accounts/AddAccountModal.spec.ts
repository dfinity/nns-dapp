/**
 * @jest-environment jsdom
 */
import { fireEvent } from "@testing-library/dom";
import { render, waitFor, type RenderResult } from "@testing-library/svelte";
import { LedgerConnectionState } from "../../../../lib/constants/ledger.constants";
import AddAccountModal from "../../../../lib/modals/accounts/AddAccountModal.svelte";
import { addSubAccount } from "../../../../lib/services/accounts.services";
import { mockIdentity } from "../../../mocks/auth.store.mock";
import en from "../../../mocks/i18n.mock";
import { renderModal } from "../../../mocks/modal.mock";

// This is the way to mock when we import in a destructured manner
// and we want to mock the imported function
jest.mock("../../../../lib/services/accounts.services", () => {
  return {
    addSubAccount: jest.fn().mockResolvedValue(undefined),
  };
});

jest.mock("../../../../lib/proxy/ledger.services.proxy", () => {
  return {
    connectToHardwareWalletProxy: jest
      .fn()
      .mockImplementation(async (callback) =>
        callback({
          connectionState: LedgerConnectionState.CONNECTED,
          ledgerIdentity: mockIdentity,
        })
      ),
    registerHardwareWalletProxy: jest.fn().mockResolvedValue(undefined),
  };
});

describe("AddAccountModal", () => {
  it("should display modal", () => {
    const { container } = render(AddAccountModal);

    expect(container.querySelector("div.modal")).not.toBeNull();
  });

  it("should display two button cards", async () => {
    const { container } = await renderModal({ component: AddAccountModal });

    const buttons = container.querySelectorAll('article[role="button"]');
    expect(buttons.length).toEqual(2);
  });

  const shouldNavigateSubaccountStep = async ({
    queryByText,
  }: RenderResult) => {
    const accountCard = queryByText(en.accounts.new_linked_title);
    expect(accountCard).not.toBeNull();

    accountCard &&
      accountCard.parentElement &&
      (await fireEvent.click(accountCard.parentElement));

    expect(queryByText(en.accounts.new_linked_title)).not.toBeNull();
  };

  it("should be able to select new subaccount ", async () => {
    const renderResult = await renderModal({ component: AddAccountModal });
    await shouldNavigateSubaccountStep(renderResult);
  });

  const shouldNavigateHardwareWalletStep = async ({
    queryByText,
  }: RenderResult) => {
    const accountCard = queryByText(en.accounts.attach_hardware_title);
    expect(accountCard).not.toBeNull();

    accountCard &&
      accountCard.parentElement &&
      (await fireEvent.click(accountCard.parentElement));

    await waitFor(() =>
      expect(queryByText(en.accounts.attach_hardware_enter_name)).not.toBeNull()
    );
  };

  it("should be able to select new hardware wallet ", async () => {
    const renderResult = await renderModal({ component: AddAccountModal });
    await shouldNavigateHardwareWalletStep(renderResult);
  });

  it("should have disabled Add Account button", async () => {
    const { container, queryByText } = await renderModal({
      component: AddAccountModal,
    });

    const accountCard = queryByText(en.accounts.new_linked_title);
    expect(accountCard).not.toBeNull();

    accountCard &&
      accountCard.parentElement &&
      (await fireEvent.click(accountCard.parentElement));

    const createButton = container.querySelector('button[type="submit"]');
    expect(createButton?.getAttribute("disabled")).not.toBeNull();
  });

  it("should have enabled Add Account button when entering name", async () => {
    const { container, queryByText } = await renderModal({
      component: AddAccountModal,
    });

    const accountCard = queryByText(en.accounts.new_linked_subtitle);
    expect(accountCard).not.toBeNull();

    accountCard &&
      accountCard.parentElement &&
      (await fireEvent.click(accountCard.parentElement));

    await waitFor(async () => {
      const input = container.querySelector('input[name="newAccount"]');
      // Svelte generates code for listening to the `input` event
      // https://github.com/testing-library/svelte-testing-library/issues/29#issuecomment-498055823
      input &&
        (await fireEvent.input(input, { target: { value: "test name" } }));

      const createButton = container.querySelector('button[type="submit"]');
      expect(createButton?.getAttribute("disabled")).toBeNull();
    });
  });

  const testSubaccount = async (
    extraChecks?: (container: HTMLElement) => void
  ): Promise<void> => {
    const { container, queryByText } = await renderModal({
      component: AddAccountModal,
    });

    const accountCard = queryByText(en.accounts.new_linked_subtitle);
    expect(accountCard).not.toBeNull();

    accountCard &&
      accountCard.parentElement &&
      (await fireEvent.click(accountCard.parentElement));

    await waitFor(async () => {
      const input = container.querySelector('input[name="newAccount"]');
      // Svelte generates code for listening to the `input` event
      // https://github.com/testing-library/svelte-testing-library/issues/29#issuecomment-498055823
      input &&
        (await fireEvent.input(input, { target: { value: "test name" } }));

      const createButton = container.querySelector('button[type="submit"]');

      createButton && (await fireEvent.click(createButton));

      expect(addSubAccount).toBeCalled();

      extraChecks?.(container);
    });
  };

  it("should create a subaccount", async () => await testSubaccount());

  it("should disable input and button when creating a subaccount", async () => {
    const extraChecks = (container: HTMLElement) => {
      const input = container.querySelector('input[name="newAccount"]');
      expect(input?.hasAttribute("disabled")).toBeTruthy();

      const createButton = container.querySelector('button[type="submit"]');
      expect(createButton?.hasAttribute("disabled")).toBeTruthy();
    };

    await testSubaccount(extraChecks);
  });

  const goBack = async ({ container, getByText, title }) => {
    const back = container.querySelector("button.back") as HTMLButtonElement;
    fireEvent.click(back);

    await waitFor(() =>
      expect(getByText(title, { exact: false })).toBeInTheDocument()
    );
  };

  const shouldNavigateHardwareWalletConnect = async ({
    container,
    queryByText,
  }: RenderResult) => {
    const input = container.querySelector("input") as HTMLInputElement;
    await fireEvent.input(input, { target: { value: "test" } });

    const button: HTMLButtonElement = container.querySelector(
      'button[type="submit"]'
    ) as HTMLButtonElement;

    await waitFor(() => {
      expect(button?.getAttribute("disabled")).toBeNull();
    });

    fireEvent.click(button);

    await waitFor(() =>
      expect(
        queryByText(en.accounts.connect_hardware_wallet, { exact: false })
      ).not.toBeNull()
    );
  };

  it("should navigate back and forth between steps", async () => {
    const renderResult = await renderModal({ component: AddAccountModal });
    await shouldNavigateSubaccountStep(renderResult);

    const { container, getByText } = renderResult;
    await goBack({ container, getByText, title: en.accounts.add_account });

    await shouldNavigateHardwareWalletStep(renderResult);

    await goBack({ container, getByText, title: en.accounts.add_account });

    await shouldNavigateHardwareWalletStep(renderResult);

    await shouldNavigateHardwareWalletConnect(renderResult);
  });

  const shouldAttachWallet = async ({
    getByTestId,
    component,
  }: RenderResult) => {
    const connect = getByTestId("ledger-connect-button") as HTMLButtonElement;

    fireEvent.click(connect);

    await waitFor(() => {
      const button = getByTestId("ledger-attach-button") as HTMLButtonElement;

      expect(button.getAttribute("disabled")).toBeNull();
    });

    const attach = getByTestId("ledger-attach-button") as HTMLButtonElement;

    const onClose = jest.fn();
    component.$on("nnsClose", onClose);

    fireEvent.click(attach);

    await waitFor(() => expect(onClose).toBeCalled());
  };

  it("should attach wallet to new account ", async () => {
    const renderResult = await renderModal({ component: AddAccountModal });

    await shouldNavigateHardwareWalletStep(renderResult);

    await shouldNavigateHardwareWalletConnect(renderResult);

    await shouldAttachWallet(renderResult);
  });
});
