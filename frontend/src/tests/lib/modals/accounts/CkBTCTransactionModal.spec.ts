import * as minterApi from "$lib/api/ckbtc-minter.api";
import {
  CKTESTBTC_LEDGER_CANISTER_ID,
  CKTESTBTC_UNIVERSE_CANISTER_ID,
} from "$lib/constants/ckbtc-canister-ids.constants";
import { AppPath } from "$lib/constants/routes.constants";
import CkBTCTransactionModal from "$lib/modals/accounts/CkBTCTransactionModal.svelte";
import * as services from "$lib/services/ckbtc-convert.services";
import { convertCkBTCToBtcIcrc2 } from "$lib/services/ckbtc-convert.services";
import { transferTokens } from "$lib/services/icrc-accounts.services";
import { ckBTCInfoStore } from "$lib/stores/ckbtc-info.store";
import { icrcAccountsStore } from "$lib/stores/icrc-accounts.store";
import type { Account } from "$lib/types/account";
import { TransactionNetwork } from "$lib/types/transaction";
import { ulpsToNumber } from "$lib/utils/token.utils";
import { page } from "$mocks/$app/stores";
import { mockIdentity, resetIdentity } from "$tests/mocks/auth.store.mock";
import { mockCkBTCAdditionalCanisters } from "$tests/mocks/canisters.mock";
import {
  mockBTCAddressTestnet,
  mockCkBTCMainAccount,
  mockCkBTCToken,
} from "$tests/mocks/ckbtc-accounts.mock";
import { mockCkBTCMinterInfo } from "$tests/mocks/ckbtc-minter.mock";
import en from "$tests/mocks/i18n.mock";
import { renderModal } from "$tests/mocks/modal.mock";
import { CkBTCTransactionModalPo } from "$tests/page-objects/CkBTCTransactionModal.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { advanceTime } from "$tests/utils/timers.test-utils";
import { toastsStore } from "@dfinity/gix-components";
import { TokenAmountV2 } from "@dfinity/utils";
import { waitFor } from "@testing-library/svelte";
import { get } from "svelte/store";

vi.mock("$lib/api/ckbtc-minter.api");
vi.mock("$lib/services/ckbtc-accounts.services");
vi.mock("$lib/services/icrc-accounts.services");
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

  const renderModalToPo = async (params?: {
    selectedAccount?: Account;
    nnsClose?: () => void;
    nnsTransfer?: () => void;
  }): Promise<CkBTCTransactionModalPo> => {
    const { container, component } = await renderTransactionModal(
      params?.selectedAccount
    );
    if (params?.nnsClose) {
      component.$on("nnsClose", params?.nnsClose);
    }
    if (params?.nnsTransfer) {
      component.$on("nnsTransfer", params?.nnsTransfer);
    }
    return CkBTCTransactionModalPo.under(new JestPageObjectElement(container));
  };

  const setKytFee = (kytFee: bigint) => {
    ckBTCInfoStore.setInfo({
      canisterId: CKTESTBTC_UNIVERSE_CANISTER_ID,
      info: {
        ...mockCkBTCMinterInfo,
        kyt_fee: kytFee,
        retrieve_btc_min_amount: 100_000n,
      },
      certified: true,
    });
  };

  beforeEach(() => {
    vi.useFakeTimers();
    ckBTCInfoStore.reset();

    vi.mocked(transferTokens).mockResolvedValue({ blockIndex: undefined });
    resetIdentity();

    icrcAccountsStore.set({
      accounts: {
        accounts: [mockCkBTCMainAccount],
        certified: true,
      },
      ledgerCanisterId: CKTESTBTC_LEDGER_CANISTER_ID,
    });

    setKytFee(789n);

    page.mock({
      data: { universe: CKTESTBTC_UNIVERSE_CANISTER_ID.toText() },
      routeId: AppPath.Accounts,
    });

    vi.spyOn(minterApi, "estimateFee").mockResolvedValue({
      minter_fee: 123n,
      bitcoin_fee: 456n,
    });
  });

  it("should show ckBTC label in modal title", async () => {
    const po = await renderModalToPo();

    expect(await po.getModalTitle()).toBe("Send ckBTC");
  });

  it("should transfer tokens", async () => {
    const amount = 10;
    const amountE8s = BigInt(amount * 10 ** 8);
    const destinationAddress = mockCkBTCMainAccount.identifier;
    const po = await renderModalToPo();

    expect(transferTokens).not.toBeCalled();
    await po.transferToAddress({
      destinationAddress,
      amount,
    });

    expect(transferTokens).toBeCalledTimes(1);
    expect(transferTokens).toBeCalledWith({
      amountUlps: amountE8s,
      destinationAddress,
      fee: mockCkBTCToken.fee,
      ledgerCanisterId: CKTESTBTC_UNIVERSE_CANISTER_ID,
      source: mockCkBTCMainAccount,
    });
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
    selectedNetwork,
  }: {
    eventName: "nnsClose" | "nnsTransfer";
    selectedNetwork?: TransactionNetwork;
  }) => {
    const onEnd = vi.fn();
    const po = await renderModalToPo({ [eventName]: onEnd });

    const amount = 10;
    const destinationAddress = mockBTCAddressTestnet;

    await po.selectNetwork(selectedNetwork);
    await po.transferToAddress({
      destinationAddress,
      amount,
    });

    await waitFor(() => expect(onEnd).toBeCalled());
  };

  describe("convert BTC to ckBTC with ICRC-2", () => {
    it("should show Bitcoin label in modal title", async () => {
      const po = await renderModalToPo();

      await po.selectNetwork(TransactionNetwork.BTC_TESTNET);

      expect(await po.getModalTitle()).toBe("Send BTC");
    });

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
      vi.mocked(convertCkBTCToBtcIcrc2).mockResolvedValue({ success: true });

      const amount = 10;
      const destinationAddress = mockBTCAddressTestnet;

      const po = await renderModalToPo();

      await po.transferToAddress({
        destinationAddress,
        amount,
      });

      expect(await po.getInProgressPo().isPresent()).toBe(true);

      // Approve transfer + sending BTC + reload
      expect(await po.getInProgressPo().getStepCount()).toBe(3);
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
    const amount = 10;
    const destinationAddress = mockCkBTCMainAccount.identifier;
    const po = await renderModalToPo();

    expect(transferTokens).not.toBeCalled();
    await po.transferToAddress({
      destinationAddress,
      amount,
    });

    expect(await po.getInProgressPo().isPresent()).toBe(false);
  });

  it("should not render the select account dropdown if selected account is passed", async () => {
    const po = await renderModalToPo({
      selectedAccount: mockCkBTCMainAccount,
    });

    expect(await po.getTransactionFormPo().isPresent()).toBe(true);
    const fromAccountPo = po
      .getTransactionFormPo()
      .getTransactionFromAccountPo();
    expect(await fromAccountPo.isPresent()).toBe(true);
    expect(await fromAccountPo.getSelectAccountDropdownPo().isPresent()).toBe(
      false
    );
  });

  it("should render ckBTC transaction description", async () => {
    const amount = 10;
    const destinationAddress = mockCkBTCMainAccount.identifier;

    const po = await renderModalToPo();

    await po.getTransactionFormPo().transferToAddress({
      amount,
      destinationAddress,
    });
    const reviewPo = po.getTransactionReviewPo();
    expect(await reviewPo.getTransactionDescription()).toBe(
      "ckBTC Transaction"
    );
  });

  it("should render BTC transaction description", async () => {
    const amount = 10;
    const destinationAddress = mockBTCAddressTestnet;

    const po = await renderModalToPo();

    await po.getTransactionFormPo().transferToAddress({
      amount,
      destinationAddress,
    });
    const reviewPo = po.getTransactionReviewPo();
    expect(await reviewPo.getTransactionDescription()).toBe(
      "ckBTC —> BTC Transaction"
    );
  });

  it("should not be able to continue as amount is lower than min withdrawal amount", async () => {
    const retreiveBtcMinAmount = 85_000n;

    ckBTCInfoStore.setInfo({
      canisterId: CKTESTBTC_UNIVERSE_CANISTER_ID,
      info: {
        ...mockCkBTCMinterInfo,
        kyt_fee: 1234n,
        retrieve_btc_min_amount: retreiveBtcMinAmount,
      },
      certified: true,
    });

    const amount = 0.00001;
    const destinationAddress = mockBTCAddressTestnet;

    const po = await renderModalToPo();

    await po.selectNetwork(TransactionNetwork.BTC_TESTNET);
    const formPo = po.getTransactionFormPo();
    await formPo.enterAddress(destinationAddress);
    await formPo.enterAmount(amount);
    expect(await formPo.isContinueButtonEnabled()).toBe(false);
    expect(await formPo.getAmountInputPo().getErrorMessage()).toBe(
      "The amount falls below the minimum of 0.00085 ckBTC required for converting to BTC."
    );

    expect(minterApi.minterInfo).not.toBeCalled();
  });

  it("should load ckBTC info if not available", async () => {
    const retreiveBtcMinAmount = 85_000n;

    ckBTCInfoStore.reset();
    vi.mocked(minterApi.minterInfo).mockResolvedValue({
      retrieve_btc_min_amount: retreiveBtcMinAmount,
      min_confirmations: 12,
      kyt_fee: 1234n,
    });

    const amount = 0.00001;
    const destinationAddress = mockBTCAddressTestnet;

    const po = await renderModalToPo();

    await po.selectNetwork(TransactionNetwork.BTC_TESTNET);
    const formPo = po.getTransactionFormPo();
    await formPo.enterAddress(destinationAddress);
    await formPo.enterAmount(amount);
    expect(await formPo.isContinueButtonEnabled()).toBe(false);
    expect(await formPo.getAmountInputPo().getErrorMessage()).toBe(
      "The amount falls below the minimum of 0.00085 ckBTC required for converting to BTC."
    );

    expect(minterApi.minterInfo).toBeCalledTimes(2);
    const expectedParams = {
      canisterId: mockCkBTCAdditionalCanisters.minterCanisterId,
      identity: mockIdentity,
    };
    expect(minterApi.minterInfo).toBeCalledWith({
      ...expectedParams,
      certified: true,
    });
    expect(minterApi.minterInfo).toBeCalledWith({
      ...expectedParams,
      certified: false,
    });
  });

  it("should render BTC estimated time", async () => {
    const amount = 10;
    const destinationAddress = mockBTCAddressTestnet;

    const po = await renderModalToPo();

    await po.getTransactionFormPo().transferToAddress({
      amount,
      destinationAddress,
    });
    const reviewPo = po.getTransactionReviewPo();
    expect(await reviewPo.getTransactionTimeDescription()).toBe(
      "Typically 30-60min"
    );
  });

  it("should render btc estimated fee on first step", async () => {
    const combinedFee = 1234n;
    const minterFee = 555n;
    const bitcoinFee = combinedFee - minterFee;

    vi.spyOn(minterApi, "estimateFee").mockResolvedValue({
      minter_fee: minterFee,
      bitcoin_fee: bitcoinFee,
    });

    const amount = 0.002;
    const destinationAddress = mockBTCAddressTestnet;

    const po = await renderModalToPo();

    await po.selectNetwork(TransactionNetwork.BTC_TESTNET);
    const formPo = po.getTransactionFormPo();
    await formPo.enterAddress(destinationAddress);
    await formPo.enterAmount(amount);

    // Requesting the fee info is debounced.
    await advanceTime();

    expect(await po.getEstimatedFee()).toBe("0.00001234 BTC");
  });

  it("should render kyt estimated fee on first step", async () => {
    const kytFee = 2233n;
    setKytFee(kytFee);

    const amount = 0.002;
    const destinationAddress = mockBTCAddressTestnet;

    const po = await renderModalToPo();

    await po.selectNetwork(TransactionNetwork.BTC_TESTNET);
    const formPo = po.getTransactionFormPo();
    await formPo.enterAddress(destinationAddress);
    await formPo.enterAmount(amount);

    expect(await po.getEstimatedKytFee()).toBe("0.00002233 BTC");
  });

  it("should not render btc estimation info on first step", async () => {
    const amount = 0.002;
    const destinationAddress = mockCkBTCMainAccount.identifier;

    const po = await renderModalToPo();

    await po.selectNetwork(TransactionNetwork.ICP);
    const formPo = po.getTransactionFormPo();
    await formPo.enterAddress(destinationAddress);
    await formPo.enterAmount(amount);

    expect(await po.getEstimatedFee()).toBe(null);
    expect(await po.getEstimatedKytFee()).toBe(null);
  });

  it("should render estimated fee info on review step", async () => {
    const minterAndBitcoinFee = 3512n;
    const minterFee = 678n;
    const bitcoinFee = minterAndBitcoinFee - minterFee;

    vi.spyOn(minterApi, "estimateFee").mockResolvedValue({
      minter_fee: minterFee,
      bitcoin_fee: bitcoinFee,
    });

    const kytFee = 2199n;
    setKytFee(kytFee);

    const amount = 10;
    const destinationAddress = mockBTCAddressTestnet;

    const po = await renderModalToPo();

    await po.getTransactionFormPo().transferToAddress({
      amount,
      destinationAddress,
    });
    const reviewPo = po.getTransactionReviewPo();
    expect(await reviewPo.getTotalDeducted()).toBe(
      "Total Deducted 10.00000001 ckBTC"
    );

    await advanceTime();
    expect(await po.getEstimatedFeeDisplay()).toBe(
      "BTC Network Fee * 0.00003512 BTC"
    );
    expect(await po.getEstimatedKytFeeDisplay()).toBe(
      "Inter-network Fee * 0.00002199 BTC"
    );
  });

  const testMax = async (po: CkBTCTransactionModalPo) => {
    await po.getTransactionFormPo().getAmountInputPo().clickMaxButton();
    expect(await po.getTransactionFormPo().getAmountInputPo().getAmount()).toBe(
      `${ulpsToNumber({
        ulps: mockCkBTCMainAccount.balanceUlps - mockCkBTCToken.fee,
        token: mockCkBTCToken,
      })}`
    );
  };

  it("should apply max minus fee for ckBTC transfer", async () => {
    const po = await renderModalToPo();

    await po.selectNetwork(TransactionNetwork.ICP);
    await po
      .getTransactionFormPo()
      .enterAddress(mockCkBTCMainAccount.identifier);

    await testMax(po);
  });

  it("should apply max minus fee for ckBTC to BTC conversion", async () => {
    const po = await renderModalToPo();

    await po.selectNetwork(TransactionNetwork.BTC_TESTNET);
    await po.getTransactionFormPo().enterAddress(mockBTCAddressTestnet);

    await testMax(po);
  });
});
