import { LedgerConnectionState } from "$lib/constants/ledger.constants";
import AddAccountModal from "$lib/modals/accounts/AddAccountModal.svelte";
import * as icpLedgerServicesProxy from "$lib/proxy/icp-ledger.services.proxy";
import * as icpAccountsServices from "$lib/services/icp-accounts.services";
import { addSubAccount } from "$lib/services/icp-accounts.services";
import en from "$tests/mocks/i18n.mock";
import { MockLedgerIdentity } from "$tests/mocks/ledger.identity.mock";
import { renderModal } from "$tests/mocks/modal.mock";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import { fireEvent } from "@testing-library/dom";
import { render, waitFor, type RenderResult } from "@testing-library/svelte";
import { tick, type Component } from "svelte";

describe("AddAccountModal", () => {
  const mockLedgerIdentity = new MockLedgerIdentity();

  beforeEach(() => {
    vi.spyOn(icpAccountsServices, "addSubAccount").mockResolvedValue(undefined);
    vi.spyOn(
      icpLedgerServicesProxy,
      "connectToHardwareWalletProxy"
    ).mockImplementation(async (callback) =>
      callback({
        connectionState: LedgerConnectionState.CONNECTED,
        ledgerIdentity: mockLedgerIdentity,
      })
    );
    vi.spyOn(
      icpLedgerServicesProxy,
      "registerHardwareWalletProxy"
    ).mockResolvedValue(undefined);
  });

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
  }: RenderResult<Component>) => {
    const accountCard = queryByText(en.accounts.new_account_title);
    expect(accountCard).not.toBeNull();

    accountCard &&
      accountCard.parentElement &&
      (await fireEvent.click(accountCard.parentElement));

    expect(queryByText(en.accounts.new_account_title)).not.toBeNull();
  };

  it("should be able to select new subaccount ", async () => {
    const renderResult = await renderModal({ component: AddAccountModal });
    await shouldNavigateSubaccountStep(renderResult);
  });

  const shouldNavigateHardwareWalletStep = async ({
    queryByText,
  }: RenderResult<Component>) => {
    const accountCard = queryByText(en.accounts.attach_hardware_title);
    expect(accountCard).not.toBeNull();

    accountCard?.parentElement &&
      (await fireEvent.click(accountCard.parentElement));

    await tick();
    expect(queryByText(en.accounts.attach_hardware_enter_name)).not.toBeNull();
  };

  it("should be able to select new Ledger device ", async () => {
    const renderResult = await renderModal({ component: AddAccountModal });
    await shouldNavigateHardwareWalletStep(renderResult);
  });

  it("should have disabled Add Account button", async () => {
    const { container, queryByText } = await renderModal({
      component: AddAccountModal,
    });

    const accountCard = queryByText(en.accounts.new_account_title);
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

    accountCard?.parentElement &&
      (await fireEvent.click(accountCard.parentElement));
    await tick();

    const input = container.querySelector('input[name="add-text-input"]');
    // Svelte generates code for listening to the `input` event
    // https://github.com/testing-library/svelte-testing-library/issues/29#issuecomment-498055823
    input && (await fireEvent.input(input, { target: { value: "test name" } }));

    // Wait for busy animation
    await tick();

    const createButton = container.querySelector('button[type="submit"]');
    expect(createButton?.getAttribute("disabled")).toBeNull();
  });

  const testSubaccount = async (
    extraChecks?: (container: HTMLElement) => void
  ): Promise<void> => {
    const { container, queryByText } = await renderModal({
      component: AddAccountModal,
    });

    const accountCard = queryByText(en.accounts.new_linked_subtitle);
    expect(accountCard).not.toBeNull();

    accountCard?.parentElement &&
      (await fireEvent.click(accountCard.parentElement));
    await tick();

    const input = container.querySelector('input[name="add-text-input"]');
    // Svelte generates code for listening to the `input` event
    // https://github.com/testing-library/svelte-testing-library/issues/29#issuecomment-498055823
    input && (await fireEvent.input(input, { target: { value: "test name" } }));

    const createButton = container.querySelector('button[type="submit"]');

    createButton && fireEvent.click(createButton);

    expect(addSubAccount).toBeCalled();
    extraChecks?.(container);
  };

  it("should create a subaccount", async () => await testSubaccount());

  it("should disable input and button when creating a subaccount", async () => {
    const extraChecks = (container: HTMLElement) => {
      const input = container.querySelector('input[name="add-text-input"]');
      expect(input?.hasAttribute("disabled")).toBeTruthy();

      const createButton = container.querySelector('button[type="submit"]');
      expect(createButton?.hasAttribute("disabled")).toBeTruthy();
    };

    await testSubaccount(extraChecks);
  });

  const goBack = async ({ getByTestId, getByText, title, testId = "back" }) => {
    const back = getByTestId(testId) as HTMLButtonElement;
    fireEvent.click(back);

    await waitFor(() =>
      expect(getByText(title, { exact: false })).toBeInTheDocument()
    );
  };

  const shouldNavigateHardwareWalletConnect = async ({
    container,
    queryByText,
  }: RenderResult<Component>) => {
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
    // Wait for the step content to be fully rendered
    await runResolvedPromises();
    await tick();

    const { getByTestId, getByText } = renderResult;
    await goBack({
      getByTestId,
      getByText,
      title: en.accounts.add_account,
      testId: "cancel",
    });

    await shouldNavigateHardwareWalletStep(renderResult);

    await goBack({ getByTestId, getByText, title: en.accounts.add_account });

    await shouldNavigateHardwareWalletStep(renderResult);

    await shouldNavigateHardwareWalletConnect(renderResult);
  });

  const shouldAttachWallet = async ({
    getByTestId,
  }: RenderResult<Component>) => {
    const connect = getByTestId("ledger-connect-button") as HTMLButtonElement;

    fireEvent.click(connect);

    await waitFor(() => {
      const button = getByTestId("ledger-attach-button") as HTMLButtonElement;

      expect(button.getAttribute("disabled")).toBeNull();
    });

    const attach = getByTestId("ledger-attach-button") as HTMLButtonElement;

    fireEvent.click(attach);
  };

  it("should attach wallet to new account ", async () => {
    const onClose = vi.fn();

    const renderResult = await renderModal({
      component: AddAccountModal,
      events: {
        nnsClose: onClose,
      },
    });

    await shouldNavigateHardwareWalletStep(renderResult);

    await shouldNavigateHardwareWalletConnect(renderResult);

    await shouldAttachWallet(renderResult);

    await waitFor(() => expect(onClose).toBeCalled());
  });
});
