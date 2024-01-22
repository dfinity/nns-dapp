import * as minterApi from "$lib/api/ckbtc-minter.api";
import { CKTESTBTC_UNIVERSE_CANISTER_ID } from "$lib/constants/ckbtc-canister-ids.constants";
import { AppPath } from "$lib/constants/routes.constants";
import CkBTCTransactionModal from "$lib/modals/accounts/CkBTCTransactionModal.svelte";
import { ckBTCTransferTokens } from "$lib/services/ckbtc-accounts.services";
import * as services from "$lib/services/ckbtc-convert.services";
import { authStore } from "$lib/stores/auth.store";
import { ckBTCInfoStore } from "$lib/stores/ckbtc-info.store";
import { icrcAccountsStore } from "$lib/stores/icrc-accounts.store";
import type { Account } from "$lib/types/account";
import { TransactionNetwork } from "$lib/types/transaction";
import { replacePlaceholders } from "$lib/utils/i18n.utils";
import { ulpsToNumber } from "$lib/utils/token.utils";
import { page } from "$mocks/$app/stores";
import { mockAuthStoreSubscribe } from "$tests/mocks/auth.store.mock";
import { mockCkBTCAdditionalCanisters } from "$tests/mocks/canisters.mock";
import {
  mockBTCAddressTestnet,
  mockCkBTCMainAccount,
  mockCkBTCToken,
} from "$tests/mocks/ckbtc-accounts.mock";
import { mockCkBTCMinterInfo } from "$tests/mocks/ckbtc-minter.mock";
import en from "$tests/mocks/i18n.mock";
import { renderModal } from "$tests/mocks/modal.mock";
import {
  testTransferFormTokens,
  testTransferReviewTokens,
  testTransferTokens,
} from "$tests/utils/transaction-modal.test-utils";
import { toastsStore } from "@dfinity/gix-components";
import { TokenAmountV2 } from "@dfinity/utils";
import { fireEvent, waitFor, type RenderResult } from "@testing-library/svelte";
import { SvelteComponent, tick } from "svelte";
import { get } from "svelte/store";

vi.mock("$lib/services/ckbtc-accounts.services");
vi.mock("$lib/services/wallet-accounts.services");
vi.mock("$lib/services/ckbtc-convert.services");

describe("CkBTCTransactionModal", () => {
  const renderTransactionModal = (selectedAccount?: Account) =>
    renderModal({
      component: CkBTCTransactionModal,
      props: {
        selectedAccount,
        token: mockCkBTCToken,
        transactionFee: TokenAmountV2.fromUlps({
          amount: mockCkBTCToken.fee,
          token: mockCkBTCToken,
        }),
        canisters: mockCkBTCAdditionalCanisters,
        universeId: CKTESTBTC_UNIVERSE_CANISTER_ID,
      },
    });

  beforeEach(() => {
    vi.restoreAllMocks();

    vi.mocked(ckBTCTransferTokens).mockResolvedValue({ blockIndex: undefined });
    vi.spyOn(authStore, "subscribe").mockImplementation(mockAuthStoreSubscribe);

    icrcAccountsStore.set({
      accounts: {
        accounts: [mockCkBTCMainAccount],
        certified: true,
      },
      universeId: CKTESTBTC_UNIVERSE_CANISTER_ID,
    });

    ckBTCInfoStore.setInfo({
      canisterId: CKTESTBTC_UNIVERSE_CANISTER_ID,
      info: {
        ...mockCkBTCMinterInfo,
        kyt_fee: 789n,
        retrieve_btc_min_amount: 100_000n,
      },
      certified: true,
    });

    page.mock({
      data: { universe: CKTESTBTC_UNIVERSE_CANISTER_ID.toText() },
      routeId: AppPath.Accounts,
    });

    vi.spyOn(minterApi, "estimateFee").mockResolvedValue({
      minter_fee: 123n,
      bitcoin_fee: 456n,
    });
  });

  it("should transfer tokens", async () => {
    const result = await renderTransactionModal();

    await testTransferTokens({
      result,
      selectedNetwork: TransactionNetwork.ICP,
    });

    await waitFor(() => expect(ckBTCTransferTokens).toBeCalled());
  });

  const testConvertCkBTCToBTCWithIcrc2 = async ({
    success,
    eventName,
  }: {
    success: boolean;
    eventName: "nnsClose" | "nnsTransfer";
  }) => {
    const spy = vi
      .spyOn(services, "convertCkBTCToBtcIcrc2")
      .mockResolvedValue({ success });

    await testTransfer({
      eventName,
      selectedNetwork: TransactionNetwork.BTC_TESTNET,
    });

    await waitFor(() => expect(spy).toBeCalled());
  };

  const testTransfer = async ({
    eventName,
    selectedAccount,
    selectedNetwork,
  }: {
    eventName: "nnsClose" | "nnsTransfer";
    selectedNetwork?: TransactionNetwork;
    selectedAccount?: Account;
  }) => {
    const result = await renderTransactionModal(selectedAccount);

    const onEnd = vi.fn();
    result.component.$on(eventName, onEnd);

    await testTransferTokens({
      result,
      destinationAddress: mockBTCAddressTestnet,
      selectedNetwork,
    });

    await waitFor(() => expect(onEnd).toBeCalled());
  };

  describe("convert BTC to ckBTC with ICRC-2", () => {
    it("should convert ckBTC to Bitcoin", async () => {
      await testConvertCkBTCToBTCWithIcrc2({
        success: true,
        eventName: "nnsTransfer",
      });
    });

    it("should close modal on ckBTC to Bitcoin error", async () => {
      await testConvertCkBTCToBTCWithIcrc2({
        success: false,
        eventName: "nnsClose",
      });
    });

    it("should render progress when converting ckBTC to Bitcoin", async () => {
      vi.spyOn(services, "convertCkBTCToBtcIcrc2").mockResolvedValue({
        success: true,
      });

      const result = await renderTransactionModal();

      await testTransferTokens({
        result,
        selectedNetwork: TransactionNetwork.BTC_TESTNET,
        destinationAddress: mockBTCAddressTestnet,
      });

      await waitFor(() =>
        expect(result.getByTestId("in-progress-warning")).not.toBeNull()
      );

      // Approve transfer + sending BTC + reload
      expect(result.container.querySelectorAll("div.step").length).toEqual(3);
    });

    it("should display estimated time in modal", async () => {
      toastsStore.reset();

      await testConvertCkBTCToBTCWithIcrc2({
        success: true,
        eventName: "nnsTransfer",
      });

      const toastData = get(toastsStore);
      expect(toastData[0].text).toEqual(
        en.ckbtc.transaction_success_about_thirty_minutes
      );
    });
  });

  it("should not render progress when transferring ckBTC", async () => {
    const result = await renderTransactionModal();

    await testTransferTokens({
      result,
      selectedNetwork: TransactionNetwork.ICP,
    });

    await waitFor(() =>
      expect(() => result.getByTestId("in-progress-warning")).toThrow()
    );
  });

  it("should not render the select account dropdown if selected account is passed", async () => {
    const { queryByTestId } =
      await renderTransactionModal(mockCkBTCMainAccount);

    await waitFor(() =>
      expect(queryByTestId("transaction-step-1")).toBeInTheDocument()
    );
    expect(queryByTestId("select-account-dropdown")).not.toBeInTheDocument();
  });

  it("should render ckBTC transaction description", async () => {
    const result = await renderTransactionModal();

    await testTransferReviewTokens({
      result,
      selectedNetwork: TransactionNetwork.ICP,
    });

    const description = replacePlaceholders(
      en.accounts.ckbtc_transaction_description,
      {
        $token: mockCkBTCToken.symbol,
      }
    );

    expect(result.getByText(description)).toBeInTheDocument();
  });

  it("should render BTC transaction description", async () => {
    const result = await renderTransactionModal();

    await testTransferReviewTokens({
      result,
      selectedNetwork: TransactionNetwork.BTC_TESTNET,
      destinationAddress: mockBTCAddressTestnet,
    });

    expect(
      result.getByText(en.accounts.ckbtc_to_btc_transaction_description)
    ).toBeInTheDocument();
  });

  it("should not be able to continue as amount is lower than fee", async () => {
    const result = await renderTransactionModal();

    await testTransferFormTokens({
      result,
      selectedNetwork: TransactionNetwork.BTC_TESTNET,
      destinationAddress: mockBTCAddressTestnet,
      amount: "0.00001",
    });

    expect(() => result.getByTestId("transaction-step-2")).toThrow();

    const participateButton = result.getByTestId("transaction-button-next");

    expect(participateButton?.hasAttribute("disabled")).toBeTruthy();
  });

  it("should render BTC estimated time", async () => {
    const result = await renderTransactionModal();

    await testTransferReviewTokens({
      result,
      selectedNetwork: TransactionNetwork.BTC_TESTNET,
      destinationAddress: mockBTCAddressTestnet,
    });

    expect(result.getByText(en.accounts.transaction_time)).toBeInTheDocument();

    expect(result.getByText(en.ckbtc.about_thirty_minutes)).toBeInTheDocument();
  });

  it("should render btc estimated fee on first step", async () => {
    const result = await renderTransactionModal();

    await testTransferFormTokens({
      result,
      selectedNetwork: TransactionNetwork.BTC_TESTNET,
      destinationAddress: mockBTCAddressTestnet,
      amount: "0.002",
    });

    await waitFor(() =>
      expect(result.getByTestId("bitcoin-estimated-fee")).not.toBeNull()
    );
  });

  it("should render kyt estimated fee on first step", async () => {
    const result = await renderTransactionModal();

    await testTransferFormTokens({
      result,
      selectedNetwork: TransactionNetwork.BTC_TESTNET,
      destinationAddress: mockBTCAddressTestnet,
      amount: "0.002",
    });

    await waitFor(() =>
      expect(result.getByTestId("kyt-estimated-fee")).not.toBeNull()
    );
  });

  it("should not render btc estimation info on first step", async () => {
    const result = await renderTransactionModal();

    await testTransferFormTokens({
      result,
      selectedNetwork: TransactionNetwork.ICP,
      destinationAddress: mockCkBTCMainAccount.identifier,
      amount: "0.002",
    });

    expect(() => result.getByTestId("bitcoin-estimated-fee")).toThrow();
    expect(() => result.getByTestId("kyt-estimated-fee")).toThrow();
  });

  it("should render estimated fee info on review step", async () => {
    const result = await renderTransactionModal();

    await testTransferReviewTokens({
      result,
      selectedNetwork: TransactionNetwork.BTC_TESTNET,
      destinationAddress: mockBTCAddressTestnet,
    });

    await waitFor(() => {
      expect(
        result.getByTestId("transaction-summary-total-deducted")
      ).not.toBeNull();

      expect(
        result.getByTestId("bitcoin-estimated-fee-display")
      ).not.toBeNull();
      expect(result.getByTestId("kyt-estimated-fee-display")).not.toBeNull();
    });
  });

  const testMax = async (result: RenderResult<SvelteComponent>) => {
    const max = result.getByTestId("max-button");
    max && fireEvent.click(max);

    await tick();

    const input: HTMLInputElement = result.container.querySelector(
      "input[name='amount']"
    );
    expect(input?.value).toEqual(
      `${ulpsToNumber({
        ulps: mockCkBTCMainAccount.balanceUlps - mockCkBTCToken.fee,
        token: mockCkBTCToken,
      })}`
    );
  };

  it("should apply max minus fee for ckBTC transfer", async () => {
    const result = await renderTransactionModal();

    await testTransferFormTokens({
      result,
      selectedNetwork: TransactionNetwork.ICP,
      destinationAddress: mockCkBTCMainAccount.identifier,
      amount: "0.002",
    });

    await testMax(result);
  });

  it("should apply max minus fee for ckBTC to BTC conversion", async () => {
    const result = await renderTransactionModal();

    await testTransferFormTokens({
      result,
      selectedNetwork: TransactionNetwork.BTC_TESTNET,
      destinationAddress: mockBTCAddressTestnet,
      amount: "0.002",
    });

    await testMax(result);
  });
});
