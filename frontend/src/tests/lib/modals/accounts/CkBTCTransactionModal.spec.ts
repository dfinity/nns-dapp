/**
 * @jest-environment jsdom
 */

import * as minterApi from "$lib/api/ckbtc-minter.api";
import { CKTESTBTC_UNIVERSE_CANISTER_ID } from "$lib/constants/ckbtc-canister-ids.constants";
import { AppPath } from "$lib/constants/routes.constants";
import CkBTCTransactionModal from "$lib/modals/accounts/CkBTCTransactionModal.svelte";
import { ckBTCTransferTokens } from "$lib/services/ckbtc-accounts.services";
import * as services from "$lib/services/ckbtc-convert.services";
import { authStore } from "$lib/stores/auth.store";
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
} from "$tests/mocks/ckbtc-accounts.mock";
import en from "$tests/mocks/i18n.mock";
import { renderModal } from "$tests/mocks/modal.mock";
import {
  testTransferFormTokens,
  testTransferReviewTokens,
  testTransferTokens,
} from "$tests/utils/transaction-modal.test.utils";
import { TokenAmount } from "@dfinity/nns";
import { waitFor } from "@testing-library/svelte";

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

    page.mock({
      data: { universe: CKTESTBTC_UNIVERSE_CANISTER_ID.toText() },
      routeId: AppPath.Accounts,
    });

    jest.spyOn(minterApi, "estimateFee").mockResolvedValue(123n);
  });

  it("should transfer tokens", async () => {
    const result = await renderTransactionModal();

    await testTransferTokens({
      result,
      selectedNetwork: TransactionNetwork.ICP_CKTESTBTC,
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

    const result = await renderTransactionModal();

    const onEnd = jest.fn();
    result.component.$on(eventName, onEnd);

    await testTransferTokens({
      result,
      selectedNetwork: TransactionNetwork.BTC_TESTNET,
      destinationAddress: mockBTCAddressTestnet,
    });

    await waitFor(() => expect(spy).toBeCalled());
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
  });

  it("should not render progress when transferring ckBTC", async () => {
    const result = await renderTransactionModal();

    await testTransferTokens({
      result,
      selectedNetwork: TransactionNetwork.ICP_CKTESTBTC,
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
      selectedNetwork: TransactionNetwork.ICP_CKTESTBTC,
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

  it("should not be able to continue as amount if lower than fee", async () => {
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
});
