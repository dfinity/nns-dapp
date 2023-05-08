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
import {
  advanceTime,
  runResolvedPromises,
} from "$tests/utils/timers.test-utils";
import { AccountIdentifier } from "@dfinity/nns";
import { fireEvent, waitFor, type RenderResult } from "@testing-library/svelte";
import type { SvelteComponent } from "svelte";
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
  ): Promise<RenderResult<SvelteComponent>> => {
    const result = await renderSwapModal(swapCommitment);

    const { getByTestId, container } = result;

    await waitFor(() =>
      expect(getByTestId("transaction-step-1")).toBeInTheDocument()
    );
    const participateButton = getByTestId("transaction-button-next");
    expect(participateButton?.hasAttribute("disabled")).toBeTruthy();

    const icpAmount = "10";
    const input = container.querySelector("input[name='amount']");
    input && fireEvent.input(input, { target: { value: icpAmount } });
    await waitFor(() =>
      expect(participateButton?.hasAttribute("disabled")).toBeFalsy()
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

  describe("when accounts are available", () => {
    beforeEach(() => {
      accountsStore.resetForTesting();
      accountsStore.setForTesting(mockAccountsStoreData);
    });

    const participate = async ({
      getByTestId,
      container,
    }: RenderResult<SvelteComponent>) => {
      const confirmButton = getByTestId("transaction-button-execute");
      expect(confirmButton?.hasAttribute("disabled")).toBeTruthy();

      const acceptInput = container.querySelector("[type='checkbox']");
      acceptInput && (await fireEvent.click(acceptInput));
      await waitFor(() =>
        expect(confirmButton?.hasAttribute("disabled")).toBeFalsy()
      );

      fireEvent.click(confirmButton);
    };

    it("should move to the last step, enable button when accepting terms and call participate in swap service", async () => {
      snsTicketsStore.setNoTicket(rootCanisterIdMock);
      const result = await renderEnter10ICPAndNext();

      await participate(result);

      await waitFor(() => expect(initiateSnsSaleParticipation).toBeCalled());
    });

    it("should render progress when participating", async () => {
      snsTicketsStore.setNoTicket(rootCanisterIdMock);
      const result = await renderEnter10ICPAndNext();

      await participate(result);

      await waitFor(
        expect(result.getByTestId("in-progress-warning")).not.toBeNull
      );
    });
  });

  describe("when user has participated", () => {
    it("should move to the last step, enable button when accepting terms and call participate in swap service", async () => {
      snsTicketsStore.setNoTicket(rootCanisterIdMock);

      const { getByTestId, container } = await renderEnter10ICPAndNext(
        mockSnsFullProject.swapCommitment
      );

      const confirmButton = getByTestId("transaction-button-execute");
      expect(confirmButton?.hasAttribute("disabled")).toBeTruthy();

      const acceptInput = container.querySelector("[type='checkbox']");
      acceptInput && (await fireEvent.click(acceptInput));
      await waitFor(() =>
        expect(confirmButton?.hasAttribute("disabled")).toBeFalsy()
      );

      fireEvent.click(confirmButton);

      await waitFor(() => expect(initiateSnsSaleParticipation).toBeCalled());
    });
  });

  describe("when swapCommitment is empty", () => {
    describe("when user has not participated", () => {
      it("should move to the last step with ICP and disabled button", async () => {
        const { getByTestId } = await renderEnter10ICPAndNext();

        const confirmButton = getByTestId("transaction-button-execute");
        expect(confirmButton?.hasAttribute("disabled")).toBeTruthy();
      });

      it("should move to the last step, enable button when accepting terms and call participate in swap service", async () => {
        snsTicketsStore.setNoTicket(rootCanisterIdMock);
        const { getByTestId, container } = await renderEnter10ICPAndNext();

        const confirmButton = getByTestId("transaction-button-execute");
        expect(confirmButton?.hasAttribute("disabled")).toBeTruthy();

        const acceptInput = container.querySelector("[type='checkbox']");
        acceptInput && (await fireEvent.click(acceptInput));
        await waitFor(() =>
          expect(confirmButton?.hasAttribute("disabled")).toBeFalsy()
        );

        fireEvent.click(confirmButton);

        await waitFor(() => expect(initiateSnsSaleParticipation).toBeCalled());
      });
    });

    describe("when user has participated", () => {
      it("should move to the last step, enable button when accepting terms and call participate in swap service", async () => {
        snsTicketsStore.setNoTicket(rootCanisterIdMock);

        const { getByTestId, container } = await renderEnter10ICPAndNext(
          mockSnsFullProject.swapCommitment
        );

        const confirmButton = getByTestId("transaction-button-execute");
        expect(confirmButton?.hasAttribute("disabled")).toBeTruthy();

        const acceptInput = container.querySelector("[type='checkbox']");
        acceptInput && (await fireEvent.click(acceptInput));
        await waitFor(() =>
          expect(confirmButton?.hasAttribute("disabled")).toBeFalsy()
        );

        fireEvent.click(confirmButton);

        await waitFor(() => expect(initiateSnsSaleParticipation).toBeCalled());
      });

      it("should have disabled button if no swap commitment is present", async () => {
        const { getByTestId, container } = await renderSwapModal();

        await waitFor(() =>
          expect(getByTestId("transaction-step-1")).toBeInTheDocument()
        );

        const participateButton = getByTestId("transaction-button-next");

        const input = container.querySelector("input[name='amount']");
        input && (await fireEvent.input(input, { target: { value: "10" } }));

        expect(participateButton?.hasAttribute("disabled")).toBeFalsy();
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
      const { queryByTestId } = await renderSwapModal();

      expect(queryByTestId("select-account-dropdown")).not.toBeInTheDocument();

      // Component is rendered after the accounts are loaded
      await waitFor(() =>
        expect(queryByTestId("select-account-dropdown")).toBeInTheDocument()
      );
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
