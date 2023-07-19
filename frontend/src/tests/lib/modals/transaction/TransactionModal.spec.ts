import { OWN_CANISTER_ID } from "$lib/constants/canister-ids.constants";
import { DEFAULT_TRANSACTION_FEE_E8S } from "$lib/constants/icp.constants";
import TransactionModal from "$lib/modals/transaction/TransactionModal.svelte";
import { authStore } from "$lib/stores/auth.store";
import { icpAccountsStore } from "$lib/stores/icp-accounts.store";
import { snsAccountsStore } from "$lib/stores/sns-accounts.store";
import type { Account } from "$lib/types/account";
import type { ValidateAmountFn } from "$lib/types/transaction";
import { formatToken } from "$lib/utils/token.utils";
import {
  mockAuthStoreSubscribe,
  mockPrincipal,
} from "$tests/mocks/auth.store.mock";
import {
  mockAccountsStoreSubscribe,
  mockMainAccount,
  mockSubAccount,
} from "$tests/mocks/icp-accounts.store.mock";
import { renderModal } from "$tests/mocks/modal.mock";
import { mockSnsAccountsStoreSubscribe } from "$tests/mocks/sns-accounts.mock";
import { queryToggleById } from "$tests/utils/toggle.test-utils";
import { clickByTestId } from "$tests/utils/utils.test-utils";
import type { Principal } from "@dfinity/principal";
import { ICPToken, TokenAmount } from "@dfinity/utils";
import {
  fireEvent,
  render,
  waitFor,
  type RenderResult,
} from "@testing-library/svelte";
import type { SvelteComponent } from "svelte";
import TransactionModalTest from "./TransactionModalTest.svelte";

describe("TransactionModal", () => {
  const renderTransactionModal = ({
    destinationAddress,
    sourceAccount,
    transactionFee = TokenAmount.fromE8s({
      amount: BigInt(DEFAULT_TRANSACTION_FEE_E8S),
      token: ICPToken,
    }),
    rootCanisterId,
    validateAmount,
    mustSelectNetwork = false,
    showLedgerFee,
  }: {
    destinationAddress?: string;
    sourceAccount?: Account;
    transactionFee?: TokenAmount;
    rootCanisterId?: Principal;
    validateAmount?: ValidateAmountFn;
    mustSelectNetwork?: boolean;
    showLedgerFee?: boolean;
  }) =>
    renderModal({
      component: TransactionModal,
      props: {
        transactionFee,
        rootCanisterId,
        validateAmount,
        transactionInit: {
          sourceAccount,
          destinationAddress,
          mustSelectNetwork,
          showLedgerFee,
        },
      },
    });

  beforeAll(() =>
    vi
      .spyOn(authStore, "subscribe")
      .mockImplementation(mockAuthStoreSubscribe)
  );

  beforeEach(() => {
    vi
      .spyOn(icpAccountsStore, "subscribe")
      .mockImplementation(mockAccountsStoreSubscribe([mockSubAccount]));

    vi
      .spyOn(snsAccountsStore, "subscribe")
      .mockImplementation(mockSnsAccountsStoreSubscribe(mockPrincipal));

    vi.spyOn(console, "error").mockImplementation(() => undefined);
  });

  const renderEnter10ICPAndNext = async ({
    destinationAddress,
    transactionFee,
    rootCanisterId,
    sourceAccount,
    mustSelectNetwork = false,
    showLedgerFee,
  }: {
    destinationAddress?: string;
    sourceAccount?: Account;
    transactionFee?: TokenAmount;
    rootCanisterId?: Principal;
    mustSelectNetwork?: boolean;
    showLedgerFee?: boolean;
  }): Promise<RenderResult<SvelteComponent>> => {
    const result = await renderTransactionModal({
      destinationAddress,
      sourceAccount,
      transactionFee,
      rootCanisterId,
      mustSelectNetwork,
      showLedgerFee,
    });

    const { getByTestId, container } = result;

    const participateButton = getByTestId("transaction-button-next");
    expect(participateButton?.hasAttribute("disabled")).toBeTruthy();

    const icpAmount = "10";
    const input = container.querySelector("input[name='amount']");
    input && fireEvent.input(input, { target: { value: icpAmount } });

    // Choose select account
    // It will choose the fist subaccount as default
    const toggle = queryToggleById(container);
    toggle && fireEvent.click(toggle);

    await waitFor(() =>
      expect(participateButton?.hasAttribute("disabled")).toBe(false)
    );

    fireEvent.click(participateButton);

    await waitFor(() => expect(getByTestId("transaction-step-2")).toBeTruthy());

    expect(
      getByTestId("transaction-summary-sending-amount")?.textContent
    ).toContain(icpAmount);
    expect(
      getByTestId("transaction-summary-total-received")?.textContent
    ).toContain(icpAmount);

    return result;
  };

  describe("when destination is not provided", () => {
    it("should display modal", async () => {
      const { container } = await renderTransactionModal({
        rootCanisterId: OWN_CANISTER_ID,
      });

      expect(container.querySelector("div.modal")).not.toBeNull();
    });

    it("should display dropdown to select account, input to add amount and select destination account", async () => {
      const { queryByTestId, container } = await renderTransactionModal({
        rootCanisterId: OWN_CANISTER_ID,
      });

      expect(queryByTestId("select-account-dropdown")).toBeInTheDocument();
      expect(
        container.querySelector("input[name='amount']")
      ).toBeInTheDocument();
    });

    it("should trigger close on cancel", async () => {
      const { getByTestId, component } = await renderTransactionModal({
        rootCanisterId: OWN_CANISTER_ID,
      });

      const onClose = vi.fn();
      component.$on("nnsClose", onClose);

      await clickByTestId(getByTestId, "transaction-button-cancel");

      await waitFor(() => expect(onClose).toBeCalled());
    });

    it("should have disabled button by default", async () => {
      const { getByTestId } = await renderTransactionModal({
        rootCanisterId: OWN_CANISTER_ID,
      });

      const participateButton = getByTestId("transaction-button-next");
      expect(participateButton?.hasAttribute("disabled")).toBeTruthy();
    });

    it("should enable button when input value and select a destination changes", async () => {
      const { getByTestId, container } = await renderTransactionModal({
        rootCanisterId: OWN_CANISTER_ID,
      });

      const participateButton = getByTestId("transaction-button-next");
      expect(participateButton?.hasAttribute("disabled")).toBeTruthy();

      const input = container.querySelector("input[name='amount']");
      input && fireEvent.input(input, { target: { value: "10" } });

      // Choose select account
      // It will choose the fist subaccount as default
      const toggle = queryToggleById(container);
      toggle && fireEvent.click(toggle);

      await waitFor(() =>
        expect(participateButton?.hasAttribute("disabled")).toBe(false)
      );
    });

    it("should not enable button when input value is not validated with the prop `validateAmount`", async () => {
      const { getByTestId, container } = await renderTransactionModal({
        rootCanisterId: OWN_CANISTER_ID,
        validateAmount: () => "error__sns.not_enough_amount",
      });

      const participateButton = getByTestId("transaction-button-next");
      expect(participateButton?.hasAttribute("disabled")).toBeTruthy();

      const input = container.querySelector("input[name='amount']");
      input && fireEvent.input(input, { target: { value: "10" } });

      // Choose select account
      // It will choose the fist subaccount as default
      const toggle = queryToggleById(container);
      toggle && fireEvent.click(toggle);

      await waitFor(() =>
        expect(participateButton?.hasAttribute("disabled")).toBeTruthy()
      );
    });

    it("should move to the last step and render review info", async () => {
      const { getByText, getByTestId } = await renderEnter10ICPAndNext({
        rootCanisterId: OWN_CANISTER_ID,
      });

      expect(
        (
          getByTestId("transaction-review-source-account").textContent ?? ""
        ).includes(mockMainAccount.identifier)
      ).toBeTruthy();
      expect(
        getByText(
          formatToken({
            value: TokenAmount.fromE8s({
              amount: BigInt(DEFAULT_TRANSACTION_FEE_E8S),
              token: ICPToken,
            }).toE8s(),
            detailed: "height_decimals",
          })
        )
      ).toBeInTheDocument();
    });

    it("should move to the last step and render passed transaction fee", async () => {
      const fee = TokenAmount.fromE8s({
        amount: BigInt(20_000),
        token: {
          symbol: "TST",
          name: "Test token",
        },
      });
      const { getByText, getByTestId } = await renderEnter10ICPAndNext({
        rootCanisterId: OWN_CANISTER_ID,
        transactionFee: fee,
      });

      expect(
        (
          getByTestId("transaction-review-source-account").textContent ?? ""
        ).includes(mockMainAccount.identifier)
      ).toBeTruthy();
      expect(
        getByText(
          formatToken({
            value: TokenAmount.fromE8s({
              amount: fee.toE8s(),
              token: ICPToken,
            }).toE8s(),
            detailed: "height_decimals",
          })
        )
      ).toBeInTheDocument();
    });

    it("should move to the last step and show ledger fees", async () => {
      const fee = TokenAmount.fromE8s({
        amount: BigInt(20_000),
        token: {
          symbol: "TST",
          name: "Test token",
        },
      });
      const { getByTestId } = await renderEnter10ICPAndNext({
        rootCanisterId: OWN_CANISTER_ID,
        transactionFee: fee,
      });

      expect(getByTestId("transaction-summary-fee")).toBeInTheDocument();
      expect(
        getByTestId("transaction-summary-total-deducted")
      ).toBeInTheDocument();
    });

    it("should move to the last step and hide ledger fees", async () => {
      const fee = TokenAmount.fromE8s({
        amount: BigInt(20_000),
        token: {
          symbol: "TST",
          name: "Test token",
        },
      });
      const { getByTestId } = await renderEnter10ICPAndNext({
        rootCanisterId: OWN_CANISTER_ID,
        transactionFee: fee,
        showLedgerFee: false,
      });

      expect(() => getByTestId("transaction-summary-fee")).toThrow();
      expect(() => getByTestId("transaction-summary-total-deducted")).toThrow();
    });

    it("should move to the last step and trigger nnsSubmit event", async () => {
      const { getByTestId, component } = await renderEnter10ICPAndNext({
        rootCanisterId: OWN_CANISTER_ID,
      });

      const onSubmit = vi.fn();
      component.$on("nnsSubmit", onSubmit);

      const confirmButton = getByTestId("transaction-button-execute");

      fireEvent.click(confirmButton);

      await waitFor(() => expect(onSubmit).toBeCalled());
    });

    it("should move to the last step and go back", async () => {
      const { getByTestId, container } = await renderTransactionModal({
        rootCanisterId: OWN_CANISTER_ID,
      });

      const participateButton = getByTestId("transaction-button-next");

      expect(participateButton).toBeInTheDocument();

      expect(participateButton?.hasAttribute("disabled")).toBeTruthy();

      const input = container.querySelector("input[name='amount']");
      input && fireEvent.input(input, { target: { value: "10" } });

      // Choose select account
      // It will choose the fist subaccount as default
      const toggle = queryToggleById(container);
      toggle && fireEvent.click(toggle);

      await waitFor(() =>
        expect(participateButton?.hasAttribute("disabled")).toBe(false)
      );

      fireEvent.click(participateButton);
      await waitFor(() =>
        expect(getByTestId("transaction-step-2")).toBeTruthy()
      );

      await clickByTestId(getByTestId, "transaction-button-back");
      await waitFor(() =>
        expect(getByTestId("transaction-step-1")).toBeTruthy()
      );
    });
  });

  describe("when destination address is provided", () => {
    it("should not show the select destination component", async () => {
      const { queryByTestId, container } = await renderTransactionModal({
        destinationAddress: mockMainAccount.identifier,
        rootCanisterId: OWN_CANISTER_ID,
      });

      expect(queryByTestId("select-account-dropdown")).toBeInTheDocument();
      expect(queryByTestId("select-destination")).not.toBeInTheDocument();
      expect(
        container.querySelector("input[name='amount']")
      ).toBeInTheDocument();
    });
  });

  describe("select network", () => {
    it("should not show the select network component", async () => {
      const { queryByTestId } = await renderTransactionModal({
        destinationAddress: mockMainAccount.identifier,
        rootCanisterId: OWN_CANISTER_ID,
      });

      expect(queryByTestId("select-network-dropdown")).not.toBeInTheDocument();
    });

    it("should show the select network component", async () => {
      const { queryByTestId } = await renderTransactionModal({
        destinationAddress: mockMainAccount.identifier,
        rootCanisterId: OWN_CANISTER_ID,
        mustSelectNetwork: true,
      });

      expect(queryByTestId("select-network-dropdown")).toBeInTheDocument();
    });

    it("should disable next button if network not selected", async () => {
      const call = async () =>
        await renderEnter10ICPAndNext({
          rootCanisterId: OWN_CANISTER_ID,
          mustSelectNetwork: true,
        });

      expect(call).rejects.toThrowError();
    });

    it("should show the ledger fee", async () => {
      const { queryByTestId } = await renderTransactionModal({
        destinationAddress: mockMainAccount.identifier,
        rootCanisterId: OWN_CANISTER_ID,
      });

      expect(queryByTestId("transaction-form-fee")).toBeInTheDocument();
    });

    it("should hide the ledger fee", async () => {
      const { queryByTestId } = await renderTransactionModal({
        destinationAddress: mockMainAccount.identifier,
        rootCanisterId: OWN_CANISTER_ID,
        showLedgerFee: false,
      });

      expect(queryByTestId("transaction-form-fee")).not.toBeInTheDocument();
    });
  });

  describe("when source account is provided", () => {
    it("should not show the select account component", async () => {
      const { queryByTestId, container } = await renderTransactionModal({
        sourceAccount: mockMainAccount,
        rootCanisterId: OWN_CANISTER_ID,
      });

      expect(queryByTestId("select-account-dropdown")).not.toBeInTheDocument();
      expect(
        container.querySelector("input[name='amount']")
      ).toBeInTheDocument();
    });
  });

  describe("with sns project id", () => {
    it("should move to the last step and trigger nnsSubmit event", async () => {
      const { getByTestId, container, component } =
        await renderTransactionModal({
          rootCanisterId: mockPrincipal,
        });

      const participateButton = getByTestId("transaction-button-next");
      expect(participateButton?.hasAttribute("disabled")).toBeTruthy();

      const icpAmount = "10";
      const input = container.querySelector("input[name='amount']");
      input && fireEvent.input(input, { target: { value: icpAmount } });

      // Enter valid destination address
      const addressInput = container.querySelector(
        "input[name='accounts-address']"
      );
      addressInput &&
        fireEvent.input(addressInput, { target: { value: "aaaaa-aa" } });

      await waitFor(() =>
        expect(participateButton?.hasAttribute("disabled")).toBe(false)
      );

      fireEvent.click(participateButton);

      await waitFor(() =>
        expect(getByTestId("transaction-step-2")).toBeTruthy()
      );
      expect(
        getByTestId("transaction-summary-sending-amount")?.textContent
      ).toContain(icpAmount);
      expect(
        getByTestId("transaction-summary-total-received")?.textContent
      ).toContain(icpAmount);

      const onSubmit = vi.fn();
      component.$on("nnsSubmit", onSubmit);

      const confirmButton = getByTestId("transaction-button-execute");

      fireEvent.click(confirmButton);

      await waitFor(() => expect(onSubmit).toBeCalled());
    });
  });

  describe("progress", () => {
    it("should got to step progress", () => {
      const { component } = render(TransactionModalTest);

      expect(component.$$.ctx[component.$$.props["currentStep"]]).toEqual({
        name: "Progress",
        title: "",
      });
    });

    it("should hide close on step progress", () => {
      const { getByTestId } = render(TransactionModalTest);

      expect(() => getByTestId("close-modal")).toThrow();
    });
  });

  describe("qr code", () => {
    it("should move to qr code step", async () => {
      const { getByTestId } = await renderTransactionModal({
        rootCanisterId: OWN_CANISTER_ID,
      });

      const button = getByTestId(
        "address-qr-code-scanner"
      ) as HTMLButtonElement;

      fireEvent.click(button);

      await waitFor(() =>
        expect(
          getByTestId("transaction-qrcode-button-cancel")
        ).toBeInTheDocument()
      );
    });

    it("should move back to first step", async () => {
      const { getByTestId } = await renderTransactionModal({
        rootCanisterId: OWN_CANISTER_ID,
      });

      const button = getByTestId(
        "address-qr-code-scanner"
      ) as HTMLButtonElement;

      fireEvent.click(button);

      await waitFor(() =>
        expect(
          getByTestId("transaction-qrcode-button-cancel")
        ).toBeInTheDocument()
      );

      fireEvent.click(getByTestId("transaction-qrcode-button-cancel"));

      await waitFor(() =>
        expect(getByTestId("transaction-step-1")).toBeTruthy()
      );
    });
  });
});
