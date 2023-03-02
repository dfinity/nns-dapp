/**
 * @jest-environment jsdom
 */

import * as ledgerApi from "$lib/api/ledger.api";
import * as nnsDappApi from "$lib/api/nns-dapp.api";
import ParticipateSwapModal from "$lib/modals/sns/sale/ParticipateSwapModal.svelte";
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
import { AccountIdentifier } from "@dfinity/nns";
import { fireEvent, waitFor, type RenderResult } from "@testing-library/svelte";
import type { SvelteComponent } from "svelte";
import { writable } from "svelte/store";
import {
  mockAccountDetails,
  mockAccountsStoreData,
  mockMainAccount,
} from "../../../mocks/accounts.store.mock";
import {
  mockAuthStoreSubscribe,
  mockIdentity,
} from "../../../mocks/auth.store.mock";
import { renderModalContextWrapper } from "../../../mocks/modal.mock";
import { mockSnsFullProject } from "../../../mocks/sns-projects.mock";
import { rootCanisterIdMock } from "../../../mocks/sns.api.mock";

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
  beforeAll(() =>
    jest
      .spyOn(authStore, "subscribe")
      .mockImplementation(mockAuthStoreSubscribe)
  );

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

    const { queryByText, getByTestId, container } = result;

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
    expect(queryByText(icpAmount, { exact: false })).toBeInTheDocument();

    return result;
  };

  describe("when accounts are available", () => {
    beforeEach(() => {
      accountsStore.reset();
      accountsStore.set(mockAccountsStoreData);
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
        expect(result.getByTestId("sale-in-progress-warning")).not.toBeNull
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
      accountsStore.reset();
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
});
