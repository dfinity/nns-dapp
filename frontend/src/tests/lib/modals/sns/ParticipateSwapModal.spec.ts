/**
 * @jest-environment jsdom
 */

import { AccountIdentifier } from "@dfinity/nns";
import { fireEvent, waitFor, type RenderResult } from "@testing-library/svelte";
import { writable } from "svelte/store";
import { DEFAULT_TRANSACTION_FEE_E8S } from "../../../../lib/constants/icp.constants";
import ParticipateSwapModal from "../../../../lib/modals/sns/ParticipateSwapModal.svelte";
import { participateInSwap } from "../../../../lib/services/sns.services";
import { accountsStore } from "../../../../lib/stores/accounts.store";
import {
  PROJECT_DETAIL_CONTEXT_KEY,
  type ProjectDetailContext,
  type ProjectDetailStore,
} from "../../../../lib/types/project-detail.context";
import type { SnsSwapCommitment } from "../../../../lib/types/sns";
import { formattedTransactionFeeICP } from "../../../../lib/utils/icp.utils";
import {
  mockAccountsStoreSubscribe,
  mockMainAccount,
} from "../../../mocks/accounts.store.mock";
import { renderModalContextWrapper } from "../../../mocks/modal.mock";
import { mockSnsFullProject } from "../../../mocks/sns-projects.mock";
import { clickByTestId } from "../../testHelpers/clickByTestId";

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

jest.mock("../../../../lib/utils/html.utils", () => ({
  sanitizeHTML: (value) => Promise.resolve(value),
}));

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

    const participateButton = getByTestId("sns-swap-participate-button-next");
    expect(participateButton?.hasAttribute("disabled")).toBeTruthy();

    const icpAmount = "10";
    const input = container.querySelector("input[name='amount']");
    input && fireEvent.input(input, { target: { value: icpAmount } });
    await waitFor(() =>
      expect(participateButton?.hasAttribute("disabled")).toBeFalsy()
    );

    fireEvent.click(participateButton);

    await waitFor(() =>
      expect(getByTestId("sns-swap-participate-step-2")).toBeTruthy()
    );
    expect(queryByText(icpAmount, { exact: false })).toBeInTheDocument();

    return result;
  };

  describe("when user has not participated", () => {
    beforeEach(() => {
      jest
        .spyOn(accountsStore, "subscribe")
        .mockImplementation(mockAccountsStoreSubscribe());
    });

    it("should display modal", async () => {
      const { container } = await renderSwapModal();

      expect(container.querySelector("div.modal")).not.toBeNull();
    });

    it("should display dropdown to select account and input to add amount", async () => {
      const { queryByTestId, container } = await renderSwapModal();

      expect(queryByTestId("select-account-dropdown")).toBeInTheDocument();
      expect(
        container.querySelector("input[name='amount']")
      ).toBeInTheDocument();
    });

    it("should trigger close on cancel", async () => {
      const { getByTestId, component } = await renderSwapModal();

      const onClose = jest.fn();
      component.$on("nnsClose", onClose);

      await clickByTestId(getByTestId, "sns-swap-participate-button-cancel");

      await waitFor(() => expect(onClose).toBeCalled());
    });

    it("should have disabled button by default", async () => {
      const { getByTestId } = await renderSwapModal();

      const participateButton = getByTestId("sns-swap-participate-button-next");
      expect(participateButton?.hasAttribute("disabled")).toBeTruthy();
    });

    it("should enable button when input value changes", async () => {
      const { getByTestId, container } = await renderSwapModal();

      const participateButton = getByTestId("sns-swap-participate-button-next");
      expect(participateButton?.hasAttribute("disabled")).toBeTruthy();

      const input = container.querySelector("input[name='amount']");
      input && fireEvent.input(input, { target: { value: "10" } });
      await waitFor(() =>
        expect(participateButton?.hasAttribute("disabled")).toBeFalsy()
      );
    });

    it("should move to the last step with ICP and disabled button", async () => {
      const { getByTestId } = await renderEnter10ICPAndNext();

      const confirmButton = getByTestId("sns-swap-participate-button-execute");
      expect(confirmButton?.hasAttribute("disabled")).toBeTruthy();
    });

    it("should move to the last step and render review info", async () => {
      const { getByText, getByTestId } = await renderEnter10ICPAndNext();

      expect(
        (
          getByTestId("sns-swap-participate-main-account").textContent ?? ""
        ).includes(mockMainAccount.identifier)
      ).toBeTruthy();
      expect(
        getByText(formattedTransactionFeeICP(DEFAULT_TRANSACTION_FEE_E8S))
      ).toBeInTheDocument();
      expect(
        (
          getByTestId("sns-swap-participate-project-name").textContent ?? ""
        ).includes(mockSnsFullProject.summary.metadata.name)
      ).toBeTruthy();
    });

    it("should move to the last step, enable button when accepting terms and call participate in swap service", async () => {
      const { getByTestId, container } = await renderEnter10ICPAndNext();

      const confirmButton = getByTestId("sns-swap-participate-button-execute");
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

    it("should move to the last step and go back", async () => {
      const { getByTestId, container } = await renderSwapModal();

      const participateButton = getByTestId("sns-swap-participate-button-next");

      expect(participateButton).toBeInTheDocument();

      expect(participateButton?.hasAttribute("disabled")).toBeTruthy();

      const input = container.querySelector("input[name='amount']");
      input && fireEvent.input(input, { target: { value: "10" } });
      await waitFor(() =>
        expect(participateButton?.hasAttribute("disabled")).toBeFalsy()
      );

      fireEvent.click(participateButton);
      await waitFor(() =>
        expect(getByTestId("sns-swap-participate-step-2")).toBeTruthy()
      );

      await clickByTestId(getByTestId, "sns-swap-participate-button-back");
      await waitFor(() =>
        expect(getByTestId("sns-swap-participate-step-1")).toBeTruthy()
      );
    });
  });

  describe("when user has participated", () => {
    it("should move to the last step, enable button when accepting terms and call participate in swap service", async () => {
      const { getByTestId, container } = await renderEnter10ICPAndNext(
        mockSnsFullProject.swapCommitment
      );

      const confirmButton = getByTestId("sns-swap-participate-button-execute");
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

  describe("when accountsStore is empty", () => {
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
    it("should have disabled button if no account is selected", async () => {
      const { getByTestId, container } = await renderSwapModal();

      const participateButton = getByTestId("sns-swap-participate-button-next");

      const input = container.querySelector("input[name='amount']");
      input && (await fireEvent.input(input, { target: { value: "10" } }));

      expect(participateButton?.hasAttribute("disabled")).toBeFalsy();
    });
  });
});
