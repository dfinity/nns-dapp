/**
 * @jest-environment jsdom
 */

import * as minterApi from "$lib/api/ckbtc-minter.api";
import { CKTESTBTC_UNIVERSE_CANISTER_ID } from "$lib/constants/ckbtc-canister-ids.constants";
import { E8S_PER_ICP } from "$lib/constants/icp.constants";
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
import { page } from "$mocks/$app/stores";
import { mockAuthStoreSubscribe } from "$tests/mocks/auth.store.mock";
import { mockCkBTCAdditionalCanisters } from "$tests/mocks/canisters.mock";
import {
  mockBTCAddressTestnet,
  mockCkBTCMainAccount,
  mockCkBTCToken,
  mockCkBTCWithdrawalAccount,
  mockCkBTCWithdrawalIdentifier,
} from "$tests/mocks/ckbtc-accounts.mock";
import { mockCkBTCMinterInfo } from "$tests/mocks/ckbtc-minter.mock";
import en from "$tests/mocks/i18n.mock";
import { renderModal } from "$tests/mocks/modal.mock";
import {
  testTransferFormTokens,
  testTransferReviewTokens,
  testTransferTokens,
} from "$tests/utils/transaction-modal.test.utils";
import { toastsStore } from "@dfinity/gix-components";
import { TokenAmount } from "@dfinity/nns";
import { fireEvent, waitFor, type RenderResult } from "@testing-library/svelte";
import { SvelteComponent, tick } from "svelte";
import { get } from "svelte/store";

jest.mock("$lib/services/ckbtc-accounts.services", () => {
  return {
    ckBTCTransferTokens: jest.fn().mockResolvedValue({ success: true }),
  };
});

jest.mock("$lib/services/ckbtc-convert.services");

describe("CkBTCTransactionModal", () => {
  const renderTransactionModal = (selectedAccount?: Account) =>
    renderModal({
      component: CkBTCTransactionModal,
      props: {
        selectedAccount,
        token: mockCkBTCToken,
        transactionFee: TokenAmount.fromE8s({
          amount: mockCkBTCToken.fee,
          token: mockCkBTCToken,
        }),
        canisters: mockCkBTCAdditionalCanisters,
        universeId: CKTESTBTC_UNIVERSE_CANISTER_ID,
      },
    });

  beforeAll(() => {
    jest
      .spyOn(authStore, "subscribe")
      .mockImplementation(mockAuthStoreSubscribe);

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
        retrieve_btc_min_amount: 100_000n,
      },
      certified: true,
    });

    page.mock({
      data: { universe: CKTESTBTC_UNIVERSE_CANISTER_ID.toText() },
      routeId: AppPath.Accounts,
    });

    jest
      .spyOn(minterApi, "estimateFee")
      .mockResolvedValue({ minter_fee: 123n, bitcoin_fee: 456n });

    jest.spyOn(minterApi, "depositFee").mockResolvedValue(789n);
  });

  it("should transfer tokens", async () => {
    const result = await renderTransactionModal();

    await testTransferTokens({
      result,
      selectedNetwork: TransactionNetwork.ICP,
    });

    await waitFor(() => expect(ckBTCTransferTokens).toBeCalled());
  });

  const testConvertCkBTCToBTC = async ({
    success,
    eventName,
  }: {
    success: boolean;
    eventName: "nnsClose" | "nnsTransfer";
  }) => {
    const spy = jest
      .spyOn(services, "convertCkBTCToBtc")
      .mockResolvedValue({ success });

    await testTransfer({
      eventName,
      selectedNetwork: TransactionNetwork.BTC_TESTNET,
    });

    await waitFor(() => expect(spy).toBeCalled());
  };

  const testRetrieveBTC = async ({
    success,
    eventName,
  }: {
    success: boolean;
    eventName: "nnsClose" | "nnsTransfer";
  }) => {
    const spy = jest
      .spyOn(services, "retrieveBtc")
      .mockResolvedValue({ success });

    await testTransfer({
      eventName,
      selectedAccount: mockCkBTCWithdrawalAccount,
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

    const onEnd = jest.fn();
    result.component.$on(eventName, onEnd);

    await testTransferTokens({
      result,
      destinationAddress: mockBTCAddressTestnet,
      selectedNetwork,
    });

    await waitFor(() => expect(onEnd).toBeCalled());
  };

  it("should convert ckBTC to Bitcoin", async () => {
    await testConvertCkBTCToBTC({ success: true, eventName: "nnsTransfer" });
  });

  it("should close modal on ckBTC to Bitcoin error", async () => {
    await testConvertCkBTCToBTC({ success: false, eventName: "nnsClose" });
  });

  it("should render progress when converting ckBTC to Bitcoin", async () => {
    jest
      .spyOn(services, "convertCkBTCToBtc")
      .mockResolvedValue({ success: true });

    const result = await renderTransactionModal();

    await testTransferTokens({
      result,
      selectedNetwork: TransactionNetwork.BTC_TESTNET,
      destinationAddress: mockBTCAddressTestnet,
    });

    await waitFor(
      expect(result.getByTestId("in-progress-warning")).not.toBeNull
    );

    // In progress + transfer to ledger + sending BTC + reload
    expect(result.container.querySelectorAll("div.step").length).toEqual(4);
  });

  it("should not render progress when transferring ckBTC", async () => {
    const result = await renderTransactionModal();

    await testTransferTokens({
      result,
      selectedNetwork: TransactionNetwork.ICP,
    });

    await waitFor(
      expect(() => result.getByTestId("in-progress-warning")).toThrow
    );
  });

  it("should not render the select account dropdown if selected account is passed", async () => {
    const { queryByTestId } = await renderTransactionModal(
      mockCkBTCMainAccount
    );

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

  it("should display estimated time in modal", async () => {
    toastsStore.reset();

    await testConvertCkBTCToBTC({ success: true, eventName: "nnsTransfer" });

    const toastData = get(toastsStore);
    expect(toastData[0].text).toEqual(
      en.ckbtc.transaction_success_about_thirty_minutes
    );
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
      `${
        Number(mockCkBTCMainAccount.balanceE8s - mockCkBTCToken.fee) /
        E8S_PER_ICP
      }`
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

  describe("withdrawal account", () => {
    it("should not render ledger fee on first step", async () => {
      const result = await renderTransactionModal(mockCkBTCWithdrawalAccount);

      await testTransferFormTokens({
        result,
        destinationAddress: mockBTCAddressTestnet,
        amount: "0.002",
      });

      expect(() => result.getByTestId("transaction-form-fee")).toThrow();
    });

    it("should not render ledger fee on review step", async () => {
      const result = await renderTransactionModal(mockCkBTCWithdrawalAccount);

      await testTransferReviewTokens({
        result,
        destinationAddress: mockBTCAddressTestnet,
        amount: "0.002",
      });

      expect(() => result.getByTestId("transaction-summary-fee")).toThrow();
    });

    it("should render static btc network", async () => {
      const result = await renderTransactionModal(mockCkBTCWithdrawalAccount);

      await testTransferFormTokens({
        result,
        destinationAddress: mockBTCAddressTestnet,
        amount: "0.002",
      });

      await waitFor(() =>
        expect(result.getByTestId("readonly-network")?.textContent).toEqual(
          en.accounts.network_btc_testnet
        )
      );
    });

    it("should not render select account dropdown", async () => {
      const result = await renderTransactionModal(mockCkBTCWithdrawalAccount);

      await testTransferFormTokens({
        result,
        destinationAddress: mockBTCAddressTestnet,
        amount: "0.002",
      });

      expect(() => result.getByTestId("select-account-dropdown")).toThrow();
    });

    it("should render withdrawal account source", async () => {
      const result = await renderTransactionModal(mockCkBTCWithdrawalAccount);

      await testTransferFormTokens({
        result,
        destinationAddress: mockBTCAddressTestnet,
        amount: "0.002",
      });

      await waitFor(() =>
        expect(
          result
            .getByTestId("transaction-from-account")
            ?.textContent.includes(en.accounts.source)
        ).toBeTruthy()
      );

      expect(
        result
          .getByTestId("transaction-from-account")
          ?.textContent.includes(mockCkBTCWithdrawalIdentifier)
      ).toBeTruthy();
    });

    it("should retrieve BTC", async () => {
      await testRetrieveBTC({ success: true, eventName: "nnsTransfer" });
    });

    it("should close modal on retrieve BTC error", async () => {
      await testRetrieveBTC({ success: false, eventName: "nnsClose" });
    });

    it("should render progress without step transfer", async () => {
      jest
        .spyOn(services, "convertCkBTCToBtc")
        .mockResolvedValue({ success: true });

      const result = await renderTransactionModal(mockCkBTCWithdrawalAccount);

      await testTransferTokens({
        result,
        destinationAddress: mockBTCAddressTestnet,
      });

      await waitFor(
        expect(result.getByTestId("in-progress-warning")).not.toBeNull
      );

      // In progress + sending BTC + reload
      expect(result.container.querySelectorAll("div.step").length).toEqual(3);
    });

    it("should apply max without deducting fee", async () => {
      const result = await renderTransactionModal(mockCkBTCWithdrawalAccount);

      await testTransferFormTokens({
        result,
        destinationAddress: mockBTCAddressTestnet,
        amount: "0.002",
      });

      const max = result.getByTestId("max-button");
      max && fireEvent.click(max);

      await tick();

      const input: HTMLInputElement = result.container.querySelector(
        "input[name='amount']"
      );
      expect(input?.value).toEqual(
        `${Number(mockCkBTCWithdrawalAccount.balanceE8s) / E8S_PER_ICP}`
      );
    });
  });
});
