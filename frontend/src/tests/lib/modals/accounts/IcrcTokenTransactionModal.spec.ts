import * as ledgerApi from "$lib/api/icrc-ledger.api";
import { AppPath } from "$lib/constants/routes.constants";
import IcrcTokenTransactionModal from "$lib/modals/accounts/IcrcTokenTransactionModal.svelte";
import { icrcAccountsStore } from "$lib/stores/icrc-accounts.store";
import { page } from "$mocks/$app/stores";
import {
  mockIdentity,
  mockPrincipal,
  resetIdentity,
} from "$tests/mocks/auth.store.mock";
import { mockCkETHToken } from "$tests/mocks/cketh-accounts.mock";
import { mockIcrcMainAccount } from "$tests/mocks/icrc-accounts.mock";
import { renderModal } from "$tests/mocks/modal.mock";
import { principal } from "$tests/mocks/sns-projects.mock";
import { IcrcTokenTransactionModalPo } from "$tests/page-objects/IcrcTokenTransactionModal.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import { TokenAmountV2 } from "@dfinity/utils";
import { encodeIcrcAccount } from "@icp-sdk/canisters/ledger/icrc";

vi.mock("$lib/api/icrc-ledger.api");

describe("IcrcTokenTransactionModal", () => {
  const ledgerCanisterId = mockPrincipal;
  const token = mockCkETHToken;
  const transactionFee = TokenAmountV2.fromUlps({
    amount: token.fee,
    token,
  });
  const mintingAccount = { owner: principal(99) };
  const mintingAccountAddress = encodeIcrcAccount(mintingAccount);

  beforeEach(() => {
    resetIdentity();
    page.mock({
      data: { universe: ledgerCanisterId.toText() },
      routeId: AppPath.Accounts,
    });
    vi.spyOn(ledgerApi, "icrcTransfer").mockResolvedValue(1234n);
    vi.spyOn(ledgerApi, "queryIcrcMintingAccount").mockResolvedValue(undefined);
  });

  const setupAccount = () => {
    icrcAccountsStore.set({
      ledgerCanisterId,
      accounts: {
        accounts: [{ ...mockIcrcMainAccount, balanceUlps: 1000n * 10n ** 18n }],
        certified: true,
      },
    });
  };

  const renderModalComponent = async () => {
    const { container } = await renderModal({
      component: IcrcTokenTransactionModal,
      props: {
        ledgerCanisterId,
        universeId: ledgerCanisterId,
        token,
        transactionFee,
      },
    });

    await runResolvedPromises();

    return IcrcTokenTransactionModalPo.under(
      new JestPageObjectElement(container)
    );
  };

  it("should disable continue until minting account is loaded", async () => {
    setupAccount();
    let resolveMintingAccount: (value: undefined) => void;
    vi.spyOn(ledgerApi, "queryIcrcMintingAccount").mockReturnValue(
      new Promise((resolve) => {
        resolveMintingAccount = () => resolve(undefined);
      })
    );

    const { container } = await renderModal({
      component: IcrcTokenTransactionModal,
      props: {
        ledgerCanisterId,
        universeId: ledgerCanisterId,
        token,
        transactionFee,
      },
    });

    const po = IcrcTokenTransactionModalPo.under(
      new JestPageObjectElement(container)
    );

    expect(await po.getTransactionFormPo().isContinueButtonEnabled()).toBe(
      false
    );

    resolveMintingAccount(undefined);
    await runResolvedPromises();

    expect(await po.getTransactionFormPo().isContinueButtonEnabled()).toBe(
      false
    ); // still disabled without amount/destination
  });

  it("should render token in the modal title", async () => {
    const po = await renderModalComponent();

    expect(await po.getModalTitle()).toBe(`Send ${token.symbol}`);
  });

  it("should transfer tokens", async () => {
    setupAccount();

    const po = await renderModalComponent();

    const toAccount = { owner: principal(2) };
    const amount = 10;

    await po.transferToAddress({
      destinationAddress: encodeIcrcAccount(toAccount),
      amount,
    });

    expect(ledgerApi.icrcTransfer).toHaveBeenCalledTimes(1);
    expect(ledgerApi.icrcTransfer).toHaveBeenCalledWith({
      identity: mockIdentity,
      canisterId: ledgerCanisterId,
      amount: BigInt(amount) * 10n ** 18n,
      to: toAccount,
      fee: token.fee,
    });
  });

  describe("burn address", () => {
    beforeEach(() => {
      vi.spyOn(ledgerApi, "queryIcrcMintingAccount").mockResolvedValue(
        mintingAccount
      );
    });

    it("should show burn address label when destination is the minting account", async () => {
      setupAccount();
      const po = await renderModalComponent();
      const formPo = po.getTransactionFormPo();

      expect(await formPo.hasBurnAddressLabel()).toBe(false);

      await formPo.enterAddress(mintingAccountAddress);

      expect(await formPo.hasBurnAddressLabel()).toBe(true);
    });

    it("should not show burn address label for a regular address", async () => {
      setupAccount();
      const po = await renderModalComponent();
      const formPo = po.getTransactionFormPo();

      await formPo.enterAddress(encodeIcrcAccount({ owner: principal(2) }));

      expect(await formPo.hasBurnAddressLabel()).toBe(false);
    });

    it("should hide the fee when destination is the minting account", async () => {
      setupAccount();
      const po = await renderModalComponent();
      const formPo = po.getTransactionFormPo();

      expect(await formPo.hasFee()).toBe(true);

      await formPo.enterAddress(mintingAccountAddress);

      expect(await formPo.hasFee()).toBe(false);
    });

    it("should transfer with fee 0 when destination is the minting account", async () => {
      setupAccount();
      const po = await renderModalComponent();

      await po.transferToAddress({
        destinationAddress: mintingAccountAddress,
        amount: 1,
      });

      expect(ledgerApi.icrcTransfer).toHaveBeenCalledTimes(1);
      expect(ledgerApi.icrcTransfer).toHaveBeenCalledWith(
        expect.objectContaining({
          fee: 0n,
          to: mintingAccount,
        })
      );
    });

    it("should transfer with normal fee for a regular address", async () => {
      setupAccount();
      const po = await renderModalComponent();

      await po.transferToAddress({
        destinationAddress: encodeIcrcAccount({ owner: principal(2) }),
        amount: 1,
      });

      expect(ledgerApi.icrcTransfer).toHaveBeenCalledWith(
        expect.objectContaining({ fee: token.fee })
      );
    });
  });
});
