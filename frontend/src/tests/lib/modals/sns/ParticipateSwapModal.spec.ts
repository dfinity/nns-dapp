/**
 * @jest-environment jsdom
 */

import { AccountIdentifier } from "@dfinity/nns";
import { fireEvent, waitFor, type RenderResult } from "@testing-library/svelte";
import { writable } from "svelte/store";
import ParticipateSwapModal from "../../../../lib/modals/sns/ParticipateSwapModal.svelte";
import { participateInSwap } from "../../../../lib/services/sns.services";
import { accountsStore } from "../../../../lib/stores/accounts.store";
import {
  PROJECT_DETAIL_CONTEXT_KEY,
  type ProjectDetailContext,
  type ProjectDetailStore,
} from "../../../../lib/types/project-detail.context";
import type { SnsSwapCommitment } from "../../../../lib/types/sns";
import {
  mockAccountsStoreSubscribe,
  mockMainAccount,
} from "../../../mocks/accounts.store.mock";
import { renderModalContextWrapper } from "../../../mocks/modal.mock";
import { mockSnsFullProject } from "../../../mocks/sns-projects.mock";

jest.mock("../../../../lib/services/sns.services", () => {
  return {
    participateInSwap: jest.fn().mockResolvedValue({ success: true }),
    getSwapAccount: jest
      .fn()
      .mockImplementation(() =>
        Promise.resolve(AccountIdentifier.fromHex(mockMainAccount.identifier))
      ),
  };
});

describe("ParticipateSwapModal", () => {
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
  ): Promise<RenderResult> => {
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

  beforeEach(() => {
    jest
      .spyOn(accountsStore, "subscribe")
      .mockImplementation(mockAccountsStoreSubscribe());
  });

  describe("when user has not participated", () => {
    it("should move to the last step with ICP and disabled button", async () => {
      const { getByTestId } = await renderEnter10ICPAndNext();

      const confirmButton = getByTestId("transaction-button-execute");
      expect(confirmButton?.hasAttribute("disabled")).toBeTruthy();
    });

    it("should move to the last step, enable button when accepting terms and call participate in swap service", async () => {
      const { getByTestId, container } = await renderEnter10ICPAndNext();

      const confirmButton = getByTestId("transaction-button-execute");
      expect(confirmButton?.hasAttribute("disabled")).toBeTruthy();

      const acceptInput = container.querySelector("[type='checkbox']");
      acceptInput && (await fireEvent.click(acceptInput));
      await waitFor(() =>
        expect(confirmButton?.hasAttribute("disabled")).toBeFalsy()
      );

      fireEvent.click(confirmButton);

      await waitFor(() => expect(participateInSwap).toBeCalled());
      await waitFor(() => expect(reload).toHaveBeenCalled());
    });
  });

  describe("when user has participated", () => {
    it("should move to the last step, enable button when accepting terms and call participate in swap service", async () => {
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

      await waitFor(() => expect(participateInSwap).toBeCalled());
      await waitFor(() => expect(reload).toHaveBeenCalled());
    });
  });

  describe("when swapCommitment is empty", () => {
    const renderSwapModal = () =>
      renderModalContextWrapper({
        Component: ParticipateSwapModal,
        contextKey: PROJECT_DETAIL_CONTEXT_KEY,
        contextValue: {
          store: writable<ProjectDetailStore>({
            summary: mockSnsFullProject.summary,
            swapCommitment: undefined,
          }),
          reload,
        } as ProjectDetailContext,
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
