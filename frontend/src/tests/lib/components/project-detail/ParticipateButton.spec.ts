/**
 * @jest-environment jsdom
 */

import ParticipateButton from "$lib/components/project-detail/ParticipateButton.svelte";
import {
  getOpenTicket,
  initiateSnsSwapParticipation,
  participateInSnsSwap,
} from "$lib/services/sns-sale.services";
import { authStore } from "$lib/stores/auth.store";
import type { SnsSwapCommitment, SnsTicket } from "$lib/types/sns";
import { SnsSwapLifecycle } from "@dfinity/sns";
import { waitFor } from "@testing-library/svelte";
import {
  authStoreMock,
  mockIdentity,
  mutableMockAuthStoreSubscribe,
} from "../../../mocks/auth.store.mock";
import en from "../../../mocks/i18n.mock";
import {
  createTransferableAmount,
  mockSnsFullProject,
  mockSnsParams,
  mockSnsSwapCommitment,
  principal,
  summaryForLifecycle,
} from "../../../mocks/sns-projects.mock";
import { rootCanisterIdMock } from "../../../mocks/sns.api.mock";
import { renderContextCmp, snsTicketMock } from "../../../mocks/sns.mock";
import { clickByTestId } from "../../../utils/utils.test-utils";

let getOpenTicketTicket: SnsTicket | undefined = undefined;
const initiateSnsSwapParticipationTicket: SnsTicket | undefined = snsTicketMock(
  { rootCanisterId: rootCanisterIdMock, owner: rootCanisterIdMock }
);
jest.mock("$lib/services/sns-sale.services", () => ({
  getOpenTicket: jest
    .fn()
    .mockImplementation(() => Promise.resolve(getOpenTicketTicket)),
  initiateSnsSwapParticipation: jest
    .fn()
    .mockImplementation(() =>
      Promise.resolve(initiateSnsSwapParticipationTicket)
    ),
  participateInSnsSwap: jest
    .fn()
    .mockResolvedValue({ success: true, retry: false }),
}));

describe("ParticipateButton", () => {
  jest
    .spyOn(authStore, "subscribe")
    .mockImplementation(mutableMockAuthStoreSubscribe);

  describe("signed in", () => {
    beforeAll(() => {
      authStoreMock.next({
        identity: mockIdentity,
      });
    });

    beforeEach(() => {
      (getOpenTicket as jest.MockedFn<any>).mockClear();
      (initiateSnsSwapParticipation as jest.MockedFn<any>).mockClear();
      (participateInSnsSwap as jest.MockedFn<any>).mockClear();
    });

    it("should render a text to increase participation", () => {
      const { queryByTestId } = renderContextCmp({
        summary: mockSnsFullProject.summary,
        swapCommitment: mockSnsFullProject.swapCommitment as SnsSwapCommitment,
        Component: ParticipateButton,
      });
      expect(
        (
          queryByTestId("sns-project-participate-button")?.textContent ?? ""
        ).trim()
      ).toEqual(en.sns_project_detail.increase_participation);
    });

    it("should render a text to participate", () => {
      const { queryByTestId } = renderContextCmp({
        summary: mockSnsFullProject.summary,
        swapCommitment: mockSnsSwapCommitment(
          principal(3)
        ) as SnsSwapCommitment,
        Component: ParticipateButton,
      });
      expect(
        (
          queryByTestId("sns-project-participate-button")?.textContent ?? ""
        ).trim()
      ).toEqual(en.sns_project_detail.participate);
    });

    it("should open swap participation modal on participate click", async () => {
      const { getByTestId } = renderContextCmp({
        summary: mockSnsFullProject.summary,
        swapCommitment: mockSnsFullProject.swapCommitment as SnsSwapCommitment,
        Component: ParticipateButton,
      });

      await clickByTestId(getByTestId, "sns-project-participate-button");
      await waitFor(() =>
        expect(getByTestId("transaction-step-1")).toBeInTheDocument()
      );
    });

    it("should hide button is state is not open", () => {
      const { queryByTestId } = renderContextCmp({
        summary: summaryForLifecycle(SnsSwapLifecycle.Pending),
        swapCommitment: mockSnsFullProject.swapCommitment as SnsSwapCommitment,
        Component: ParticipateButton,
      });
      expect(
        queryByTestId("sns-project-participate-button")
      ).not.toBeInTheDocument();
    });

    it("should disable the button is user has an open ticket", async () => {
      getOpenTicketTicket = snsTicketMock({
        rootCanisterId: rootCanisterIdMock,
        owner: rootCanisterIdMock,
      });

      const { queryByTestId } = renderContextCmp({
        summary: summaryForLifecycle(SnsSwapLifecycle.Open),
        swapCommitment: mockSnsFullProject.swapCommitment as SnsSwapCommitment,
        Component: ParticipateButton,
      });

      const button = queryByTestId(
        "sns-project-participate-button"
      ) as HTMLButtonElement;

      expect(getOpenTicket).toBeCalled();

      await waitFor(() =>
        expect(button.getAttribute("disabled")).not.toBeNull()
      );
      expect(participateInSnsSwap).toBeCalledWith({
        ticket: getOpenTicketTicket,
      });
    });

    it("should enable button if user has not committed max already", async () => {
      getOpenTicketTicket = {
        rootCanisterId: rootCanisterIdMock,
        ticket: undefined,
      };

      const { queryByTestId } = renderContextCmp({
        summary: summaryForLifecycle(SnsSwapLifecycle.Open),
        swapCommitment: mockSnsFullProject.swapCommitment as SnsSwapCommitment,
        Component: ParticipateButton,
      });

      const button = queryByTestId(
        "sns-project-participate-button"
      ) as HTMLButtonElement;

      await waitFor(() => expect(button.getAttribute("disabled")).toBeNull());
      expect(getOpenTicket).toBeCalled();
      expect(participateInSnsSwap).not.toBeCalled();
    });

    it("should disable button if user has committed max already", () => {
      const mock = mockSnsFullProject.swapCommitment as SnsSwapCommitment;

      const { queryByTestId } = renderContextCmp({
        summary: summaryForLifecycle(SnsSwapLifecycle.Open),
        swapCommitment: {
          rootCanisterId: mock.rootCanisterId,
          myCommitment: {
            icp: [
              createTransferableAmount(mockSnsParams.max_participant_icp_e8s),
            ],
          },
        },
        Component: ParticipateButton,
      });

      const button = queryByTestId(
        "sns-project-participate-button"
      ) as HTMLButtonElement;
      expect(button.getAttribute("disabled")).not.toBeNull();
    });
  });

  describe("not signed in", () => {
    beforeAll(() => {
      authStoreMock.next({
        identity: undefined,
      });
    });

    it("should not render participate button", () => {
      const { queryByTestId } = renderContextCmp({
        summary: summaryForLifecycle(SnsSwapLifecycle.Open),
        swapCommitment: mockSnsFullProject.swapCommitment as SnsSwapCommitment,
        Component: ParticipateButton,
      });

      expect(queryByTestId("sns-project-participate-button")).toBeNull();
    });

    it("should render a sign in button", () => {
      const { getByTestId } = renderContextCmp({
        summary: summaryForLifecycle(SnsSwapLifecycle.Open),
        swapCommitment: mockSnsFullProject.swapCommitment as SnsSwapCommitment,
        Component: ParticipateButton,
      });

      expect(getByTestId("login-button")).not.toBeNull();
    });
  });
});
