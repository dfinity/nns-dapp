/**
 * @jest-environment jsdom
 */

import * as ledgerApi from "$lib/api/ledger.api";
import * as nnsDappApi from "$lib/api/nns-dapp.api";
import { SYNC_ACCOUNTS_RETRY_SECONDS } from "$lib/constants/accounts.constants";
import ParticipateSwapModal from "$lib/modals/sns/sale/ParticipateSwapModal.svelte";
import { cancelPollAccounts } from "$lib/services/accounts.services";
import { initiateSnsSaleParticipation } from "$lib/services/sns-sale.services";
import { accountsStore } from "$lib/stores/accounts.store";
import { authStore } from "$lib/stores/auth.store";
import { snsTicketsStore } from "$lib/stores/sns-tickets.store";
import {
  PROJECT_DETAIL_CONTEXT_KEY,
  type ProjectDetailContext,
  type ProjectDetailStore,
} from "$lib/types/project-detail.context";
import type { SnsSwapCommitment } from "$lib/types/sns";
import {
  mockAccountDetails,
  mockAccountsStoreData,
  mockMainAccount,
} from "$tests/mocks/accounts.store.mock";
import {
  mockAuthStoreSubscribe,
  mockIdentity,
} from "$tests/mocks/auth.store.mock";
import { renderModalContextWrapper } from "$tests/mocks/modal.mock";
import { mockSnsFullProject } from "$tests/mocks/sns-projects.mock";
import { rootCanisterIdMock } from "$tests/mocks/sns.api.mock";
import { ParticipateSwapModalPo } from "$tests/page-objects/ParticipateSwapModal.page-object";
import type { TransactionReviewPo } from "$tests/page-objects/TransactionReview.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import {
  advanceTime,
  runResolvedPromises,
} from "$tests/utils/timers.test-utils";
import { AccountIdentifier } from "@dfinity/nns";
import { writable } from "svelte/store";

jest.mock("$lib/api/nns-dapp.api");
jest.mock("$lib/api/ledger.api");
jest.mock("$lib/services/sns.services", () => {
  return {
    initiateSnsSaleParticipation: jest
      .fn()
      .mockResolvedValue({ success: true }),
    getSwapAccount: jest
      .fn()
      .mockImplementation(() =>
        Promise.resolve(AccountIdentifier.fromHex(mockMainAccount.identifier))
      ),
  };
});

jest.mock("$lib/services/sns-sale.services", () => ({
  initiateSnsSaleParticipation: jest.fn().mockResolvedValue({ success: true }),
}));

describe("ParticipateSwapModal", () => {
  beforeEach(() => {
    cancelPollAccounts();
    jest
      .spyOn(authStore, "subscribe")
      .mockImplementation(mockAuthStoreSubscribe);
    jest.mocked(initiateSnsSaleParticipation).mockClear();
  });

  const reload = jest.fn();
  const renderSwapModal = (
    swapCommitment: SnsSwapCommitment | undefined = undefined
  ) =>
    renderModalContextWrapper({
      Component: ParticipateSwapModal,
      contextKey: PROJECT_DETAIL_CONTEXT_KEY,
      contextValue: {
        store: writable<ProjectDetailStore>({
          summary: mockSnsFullProject.summary,
          swapCommitment,
        }),
        reload,
      } as ProjectDetailContext,
    });

  const renderEnter10ICPAndNext = async (
    swapCommitment: SnsSwapCommitment | undefined = undefined
  ): Promise<ParticipateSwapModalPo> => {
    const { container } = await renderSwapModal(swapCommitment);
    const po = new ParticipateSwapModalPo(new JestPageObjectElement(container));

    const form = po.getTransactionFormPo();
    expect(await form.isPresent()).toBe(true);
    expect(await form.isContinueButtonEnabled()).toBe(false);

    const icpAmount = 10;
    const icpAmountFormatted = "10.0000";
    await form.enterAmount(icpAmount);
    expect(await form.isContinueButtonEnabled()).toBe(true);

    await form.clickContinue();

    const review = po.getTransactionReviewPo();
    await review.waitFor();

    expect(await review.getSendingAmount()).toContain(icpAmountFormatted);
    expect(await review.getReceivedAmount()).toContain(icpAmountFormatted);

    return po;
  };

  const sendAndExpectParticipation = async (reviewPo: TransactionReviewPo) => {
    expect(initiateSnsSaleParticipation).not.toBeCalled();
    await reviewPo.clickSend();
    expect(initiateSnsSaleParticipation).toBeCalledTimes(1);
  };

  describe("when accounts are available", () => {
    beforeEach(() => {
      accountsStore.resetForTesting();
      accountsStore.setForTesting(mockAccountsStoreData);
    });

    const participate = async (po: ParticipateSwapModalPo) => {
      const review = po.getTransactionReviewPo();
      expect(await review.isSendButtonEnabled()).toBe(false);

      await review.clickCheckbox();
      expect(await review.isSendButtonEnabled()).toBe(true);

      await sendAndExpectParticipation(review);
    };

    it("should move to the last step, enable button when accepting terms and call participate in swap service", async () => {
      snsTicketsStore.setNoTicket(rootCanisterIdMock);
      const po = await renderEnter10ICPAndNext();
      await participate(po);
    });

    it("should render progress when participating", async () => {
      snsTicketsStore.setNoTicket(rootCanisterIdMock);
      const po = await renderEnter10ICPAndNext();

      expect(await po.isSaleInProgress()).toBe(false);
      await participate(po);

      expect(await po.isSaleInProgress()).toBe(true);
    });
  });

  describe("when user has participated", () => {
    it("should move to the last step, enable button when accepting terms and call participate in swap service", async () => {
      snsTicketsStore.setNoTicket(rootCanisterIdMock);

      const po = await renderEnter10ICPAndNext(
        mockSnsFullProject.swapCommitment
      );

      const review = po.getTransactionReviewPo();
      expect(await review.isSendButtonEnabled()).toBe(false);

      await review.clickCheckbox();
      expect(await review.isSendButtonEnabled()).toBe(true);

      await sendAndExpectParticipation(review);
    });
  });

  describe("when swapCommitment is empty", () => {
    describe("when user has not participated", () => {
      it("should move to the last step with ICP and disabled button", async () => {
        const po = await renderEnter10ICPAndNext();
        const review = po.getTransactionReviewPo();
        expect(await review.isSendButtonEnabled()).toBe(false);
      });

      it("should move to the last step, enable button when accepting terms and call participate in swap service", async () => {
        snsTicketsStore.setNoTicket(rootCanisterIdMock);

        const po = await renderEnter10ICPAndNext();

        const review = po.getTransactionReviewPo();
        expect(await review.isSendButtonEnabled()).toBe(false);

        await review.clickCheckbox();
        expect(await review.isSendButtonEnabled()).toBe(true);

        await sendAndExpectParticipation(review);
      });
    });

    describe("when user has participated", () => {
      it("should move to the last step, enable button when accepting terms and call participate in swap service", async () => {
        snsTicketsStore.setNoTicket(rootCanisterIdMock);

        const po = await renderEnter10ICPAndNext(
          mockSnsFullProject.swapCommitment
        );

        const review = po.getTransactionReviewPo();
        expect(await review.isSendButtonEnabled()).toBe(false);

        await review.clickCheckbox();
        expect(await review.isSendButtonEnabled()).toBe(true);

        await sendAndExpectParticipation(review);
      });

      it("should have disabled button if no swap commitment is present", async () => {
        const { container } = await renderSwapModal();
        const po = new ParticipateSwapModalPo(
          new JestPageObjectElement(container)
        );
        const form = po.getTransactionFormPo();

        expect(await form.isPresent()).toBe(true);

        await form.enterAmount(10);

        // This seems wrong. The test description says the button should be
        // disabled but then the test checks that the button is not disabled.
        expect(await form.isContinueButtonEnabled()).toBe(true);
      });
    });
  });

  describe("when accounts are not available", () => {
    const mainBalanceE8s = BigInt(10_000_000);
    let queryAccountSpy: jest.SpyInstance;
    let queryAccountBalanceSpy: jest.SpyInstance;
    beforeEach(() => {
      accountsStore.resetForTesting();
      queryAccountBalanceSpy = jest
        .spyOn(ledgerApi, "queryAccountBalance")
        .mockResolvedValue(mainBalanceE8s);
      queryAccountSpy = jest
        .spyOn(nnsDappApi, "queryAccount")
        .mockResolvedValue(mockAccountDetails);
    });
    it("loads accounts and renders account selector", async () => {
      const { container } = await renderSwapModal();
      const po = new ParticipateSwapModalPo(
        new JestPageObjectElement(container)
      );

      const fromAccount = po
        .getTransactionFormPo()
        .getTransactionFromAccountPo();

      // TODO: Relying on the accounts getting loaded async in between these
      // expectations is brittle. We should load them explicitly within this
      // test.
      expect(await fromAccount.getDropdownPo().isPresent()).toBe(false);

      // Component is rendered after the accounts are loaded
      await fromAccount.getDropdownPo().waitFor();
      expect(await fromAccount.getDropdownPo().isPresent()).toBe(true);
    });

    it("loads accounts with query only", async () => {
      await renderSwapModal();

      expect(queryAccountSpy).toBeCalledWith({
        identity: mockIdentity,
        certified: false,
      });
      expect(queryAccountBalanceSpy).toBeCalledWith({
        accountIdentifier: mockAccountDetails.account_identifier,
        identity: mockIdentity,
        certified: false,
      });
    });
  });

  describe("when no accounts and user navigates away", () => {
    let spyQueryAccount: jest.SpyInstance;
    beforeEach(() => {
      accountsStore.resetForTesting();
      jest.clearAllTimers();
      jest.clearAllMocks();
      const now = Date.now();
      jest.useFakeTimers().setSystemTime(now);
      const mainBalanceE8s = BigInt(10_000_000);
      jest
        .spyOn(ledgerApi, "queryAccountBalance")
        .mockResolvedValue(mainBalanceE8s);
      spyQueryAccount = jest
        .spyOn(nnsDappApi, "queryAccount")
        .mockRejectedValue(new Error("connection error"));
      jest.spyOn(console, "error").mockImplementation(() => undefined);
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
