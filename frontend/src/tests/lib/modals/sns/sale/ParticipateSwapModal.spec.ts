import * as ledgerApi from "$lib/api/icp-ledger.api";
import * as nnsDappApi from "$lib/api/nns-dapp.api";
import { SYNC_ACCOUNTS_RETRY_SECONDS } from "$lib/constants/accounts.constants";
import ParticipateSwapModal from "$lib/modals/sns/sale/ParticipateSwapModal.svelte";
import { cancelPollAccounts } from "$lib/services/icp-accounts.services";
import * as snsSaleServices from "$lib/services/sns-sale.services";
import { initiateSnsSaleParticipation } from "$lib/services/sns-sale.services";
import * as snsServices from "$lib/services/sns.services";
import { snsTicketsStore } from "$lib/stores/sns-tickets.store";
import {
  PROJECT_DETAIL_CONTEXT_KEY,
  type ProjectDetailContext,
  type ProjectDetailStore,
} from "$lib/types/project-detail.context";
import type { SnsSwapCommitment } from "$lib/types/sns";
import { mockIdentity, resetIdentity } from "$tests/mocks/auth.store.mock";
import {
  mockAccountDetails,
  mockAccountsStoreData,
  mockHardwareWalletAccount,
  mockMainAccount,
  mockSubAccount,
} from "$tests/mocks/icp-accounts.store.mock";
import { renderModalContextWrapper } from "$tests/mocks/modal.mock";
import {
  createBuyersState,
  createSummary,
  mockSwapCommitment,
} from "$tests/mocks/sns-projects.mock";
import { rootCanisterIdMock } from "$tests/mocks/sns.api.mock";
import { ParticipateSwapModalPo } from "$tests/page-objects/ParticipateSwapModal.page-object";
import type { TransactionReviewPo } from "$tests/page-objects/TransactionReview.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import {
  resetAccountsForTesting,
  setAccountsForTesting,
} from "$tests/utils/accounts.test-utils";
import {
  advanceTime,
  runResolvedPromises,
} from "$tests/utils/timers.test-utils";
import { AccountIdentifier } from "@dfinity/ledger-icp";
import { writable } from "svelte/store";
import type { MockInstance } from "vitest";

type SwapModalParams = {
  swapCommitment?: SnsSwapCommitment | undefined;
  confirmationText?: string | undefined;
  minParticipantCommitment?: bigint | undefined;
};

describe("ParticipateSwapModal", () => {
  beforeEach(() => {
    cancelPollAccounts();
    resetIdentity();
    resetAccountsForTesting();
    snsTicketsStore.setNoTicket(rootCanisterIdMock);

    vi.spyOn(snsServices, "getSwapAccount").mockResolvedValue(
      AccountIdentifier.fromHex(mockMainAccount.identifier)
    );

    vi.spyOn(snsSaleServices, "initiateSnsSaleParticipation").mockResolvedValue(
      { success: true }
    );
  });

  const reload = vi.fn();
  const renderSwapModal = ({
    swapCommitment,
    confirmationText,
    minParticipantCommitment,
  }: SwapModalParams = {}) =>
    renderModalContextWrapper({
      Component: ParticipateSwapModal,
      contextKey: PROJECT_DETAIL_CONTEXT_KEY,
      contextValue: {
        store: writable<ProjectDetailStore>({
          summary: createSummary({
            confirmationText,
            minParticipantCommitment,
          }),
          swapCommitment,
        }),
        reload,
      } as ProjectDetailContext,
    });

  const renderSwapModalPo = async (params: SwapModalParams = {}) => {
    const { container } = await renderSwapModal(params);
    return new ParticipateSwapModalPo(new JestPageObjectElement(container));
  };

  const renderEnter10ICPAndNext = async (
    swapCommitment: SnsSwapCommitment | undefined = undefined
  ): Promise<ParticipateSwapModalPo> => {
    const po = await renderSwapModalPo({ swapCommitment });

    const form = po.getTransactionFormPo();
    expect(await form.isPresent()).toBe(true);
    expect(await form.isContinueButtonEnabled()).toBe(false);

    const icpAmount = 10;
    const icpAmountFormatted = "10.0000";
    await form.enterAmount(icpAmount);
    expect(await form.isContinueButtonEnabled()).toBe(true);

    await form.clickContinue();

    const review = po.getTransactionReviewPo();
    expect(await review.isPresent()).toBe(true);

    expect(await review.getSendingAmount()).toContain(icpAmountFormatted);
    expect(await review.getReceivedAmount()).toContain(icpAmountFormatted);

    return po;
  };

  const sendAndExpectParticipation = async (reviewPo: TransactionReviewPo) => {
    expect(initiateSnsSaleParticipation).not.toBeCalled();
    await reviewPo.clickSend();
    expect(initiateSnsSaleParticipation).toBeCalledTimes(1);
  };

  describe("when Ledger device account is available", () => {
    beforeEach(() => {
      setAccountsForTesting({
        main: mockMainAccount,
        subAccounts: [mockSubAccount],
        hardwareWallets: [mockHardwareWalletAccount],
        certified: true,
      });
    });

    it("should not show Ledger device account as selectable", async () => {
      const po = await renderSwapModalPo();
      const form = po.getTransactionFormPo();
      expect(await form.getSourceAccounts()).toEqual([
        "Main",
        "test subaccount",
      ]);
    });
  });

  describe("when accounts are available", () => {
    beforeEach(() => {
      setAccountsForTesting(mockAccountsStoreData);
    });

    const participate = async (po: ParticipateSwapModalPo) => {
      const review = po.getTransactionReviewPo();
      expect(await review.isSendButtonEnabled()).toBe(false);

      await po.getAdditionalInfoReviewPo().clickCheckbox();
      expect(await review.isSendButtonEnabled()).toBe(true);

      await sendAndExpectParticipation(review);
    };

    it("should move to the last step, enable button when accepting terms and call participate in swap service", async () => {
      const po = await renderEnter10ICPAndNext();
      await participate(po);
    });

    it("should render progress when participating", async () => {
      const po = await renderEnter10ICPAndNext();

      expect(await po.isSaleInProgress()).toBe(false);
      await participate(po);

      expect(await po.isSaleInProgress()).toBe(true);
    });

    it("should display confirmation text when present in the summary", async () => {
      const confirmationText = "I confirm the text";
      const po = await renderSwapModalPo({ confirmationText });
      const info = po.getAdditionalInfoFormPo();
      expect(await info.hasConditions()).toBe(true);
      expect(await info.getConditions()).toBe(confirmationText);
    });

    it("should not display confirmation text when not present in the summary", async () => {
      const confirmationText = undefined;
      const po = await renderSwapModalPo({ confirmationText });
      const info = po.getAdditionalInfoFormPo();
      expect(await info.hasConditions()).toBe(false);
    });

    it("should disable continue until conditions are accepted", async () => {
      const confirmationText = "I confirm the text";
      const po = await renderSwapModalPo({ confirmationText });
      const info = po.getAdditionalInfoFormPo();
      const form = po.getTransactionFormPo();
      await form.enterAmount(10);
      expect(await form.isContinueButtonEnabled()).toBe(false);
      expect(await info.toggleConditionsAccepted());
      expect(await form.isContinueButtonEnabled()).toBe(true);
    });

    it("should not disable continue if confirmation text is absent", async () => {
      const confirmationText = undefined;
      const po = await renderSwapModalPo({ confirmationText });
      const form = po.getTransactionFormPo();
      await form.enterAmount(10);
      expect(await form.isContinueButtonEnabled()).toBe(true);
    });

    it("should not show an error when amount is not too small", async () => {
      const po = await renderSwapModalPo({
        swapCommitment: {
          ...mockSwapCommitment,
          myCommitment: createBuyersState(0n),
        },
        minParticipantCommitment: 100_000_000n,
      });
      const form = po.getTransactionFormPo();
      await form.enterAmount(1);
      expect(await form.getAmountInputPo().hasError()).toBe(false);
    });

    it("should show an error when amount is too small", async () => {
      const po = await renderSwapModalPo({
        swapCommitment: {
          ...mockSwapCommitment,
          myCommitment: createBuyersState(0n),
        },
        minParticipantCommitment: 100_000_000n,
      });
      const form = po.getTransactionFormPo();
      await form.enterAmount(0.01);
      expect(await form.getAmountInputPo().hasError()).toBe(true);
      expect(await form.getAmountInputPo().getErrorMessage()).toBe(
        "Sorry, the amount is too small. You need a minimum of 1.00 ICP to participate in this swap."
      );
    });

    it("should show an error with enough significant digits", async () => {
      const po = await renderSwapModalPo({
        swapCommitment: {
          ...mockSwapCommitment,
          myCommitment: createBuyersState(0n),
        },
        minParticipantCommitment: 100_000_278n,
      });
      const form = po.getTransactionFormPo();
      await form.enterAmount(0.01);
      expect(await form.getAmountInputPo().hasError()).toBe(true);
      expect(await form.getAmountInputPo().getErrorMessage()).toBe(
        "Sorry, the amount is too small. You need a minimum of 1.00000278 ICP to participate in this swap."
      );
    });

    describe("when user has non-zero swap commitment", () => {
      it("should move to the last step, enable button when accepting terms and call participate in swap service", async () => {
        const po = await renderEnter10ICPAndNext({
          ...mockSwapCommitment,
          myCommitment: createBuyersState(BigInt(25 * 100000000)),
        });

        const review = po.getTransactionReviewPo();
        expect(await review.isSendButtonEnabled()).toBe(false);

        await po.getAdditionalInfoReviewPo().clickCheckbox();
        expect(await review.isSendButtonEnabled()).toBe(true);

        await sendAndExpectParticipation(review);
      });
    });
  });

  describe("when accounts are not available", () => {
    const mainBalanceE8s = 10_000_000n;
    let queryAccountSpy: MockInstance;
    let queryAccountBalanceSpy: MockInstance;
    let resolveQueryAccounts;

    beforeEach(() => {
      resetAccountsForTesting();
      queryAccountBalanceSpy = vi
        .spyOn(ledgerApi, "queryAccountBalance")
        .mockResolvedValue(mainBalanceE8s);
      queryAccountSpy = vi.spyOn(nnsDappApi, "queryAccount").mockReturnValue(
        new Promise((resolve) => {
          resolveQueryAccounts = resolve;
        })
      );
    });

    it("loads accounts and renders account selector", async () => {
      const po = await renderSwapModalPo();

      const fromAccount = po
        .getTransactionFormPo()
        .getTransactionFromAccountPo();

      await runResolvedPromises();
      expect(await fromAccount.getSelectAccountDropdownPo().hasDropdown()).toBe(
        false
      );

      resolveQueryAccounts(mockAccountDetails);

      await runResolvedPromises();
      expect(await fromAccount.getSelectAccountDropdownPo().hasDropdown()).toBe(
        true
      );
    });

    const expectSpyCalledWithQueryOnly = ({
      spy,
      params,
    }: {
      spy: MockInstance;
      params: object;
    }) => {
      expect(spy).toBeCalledWith({
        ...params,
        certified: false,
      });
      expect(spy).not.toBeCalledWith({
        ...params,
        certified: true,
      });
    };

    it("loads accounts with query only", async () => {
      await renderSwapModal();
      resolveQueryAccounts(mockAccountDetails);
      await runResolvedPromises();

      expectSpyCalledWithQueryOnly({
        spy: queryAccountSpy,
        params: { identity: mockIdentity },
      });
      expectSpyCalledWithQueryOnly({
        spy: queryAccountBalanceSpy,
        params: {
          icpAccountIdentifier: mockAccountDetails.account_identifier,
          identity: mockIdentity,
        },
      });
    });
  });

  describe("when no accounts and user navigates away", () => {
    let spyQueryAccount: MockInstance;
    beforeEach(() => {
      resetAccountsForTesting();
      vi.clearAllTimers();
      const now = Date.now();
      vi.useFakeTimers().setSystemTime(now);
      const mainBalanceE8s = 10_000_000n;
      vi.spyOn(ledgerApi, "queryAccountBalance").mockResolvedValue(
        mainBalanceE8s
      );
      spyQueryAccount = vi
        .spyOn(nnsDappApi, "queryAccount")
        .mockRejectedValue(new Error("connection error"));
      vi.spyOn(console, "error").mockImplementation(() => undefined);
    });

    it("should stop polling", async () => {
      const { unmount } = await renderSwapModal();

      await runResolvedPromises();
      let expectedCalls = 1;
      expect(spyQueryAccount).toBeCalledTimes(expectedCalls);

      let retryDelay = SYNC_ACCOUNTS_RETRY_SECONDS * 1000;
      const callsBeforeLeaving = 3;
      while (expectedCalls < callsBeforeLeaving) {
        await advanceTime(retryDelay);
        retryDelay *= 2;
        expectedCalls += 1;
        expect(spyQueryAccount).toBeCalledTimes(expectedCalls);
      }
      unmount();

      // Even after waiting a long time there shouldn't be more calls.
      await advanceTime(99 * retryDelay);
      expect(spyQueryAccount).toBeCalledTimes(expectedCalls);
    });
  });
});
