/**
 * @jest-environment jsdom
 */

import ParticipateButton from "$lib/components/project-detail/ParticipateButton.svelte";
import { NOT_LOADED } from "$lib/constants/stores.constants";
import { authStore } from "$lib/stores/auth.store";
import { icpAccountsStore } from "$lib/stores/icp-accounts.store";
import { snsTicketsStore } from "$lib/stores/sns-tickets.store";
import { userCountryStore } from "$lib/stores/user-country.store";
import type { SnsSwapCommitment } from "$lib/types/sns";
import {
  authStoreMock,
  mockIdentity,
  mutableMockAuthStoreSubscribe,
} from "$tests/mocks/auth.store.mock";
import en from "$tests/mocks/i18n.mock";
import { mockAccountsStoreData } from "$tests/mocks/icp-accounts.store.mock";
import {
  createSummary,
  createTransferableAmount,
  mockSnsFullProject,
  mockSnsParams,
  mockSnsSwapCommitment,
  principal,
  summaryForLifecycle,
} from "$tests/mocks/sns-projects.mock";
import { rootCanisterIdMock } from "$tests/mocks/sns.api.mock";
import { renderContextCmp, snsTicketMock } from "$tests/mocks/sns.mock";
import { TooltipPo } from "$tests/page-objects/Tooltip.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { clickByTestId } from "$tests/utils/utils.test-utils";
import { SnsSwapLifecycle } from "@dfinity/sns";
import { waitFor } from "@testing-library/svelte";

describe("ParticipateButton", () => {
  const { ticket: testTicket } = snsTicketMock({
    rootCanisterId: rootCanisterIdMock,
    owner: rootCanisterIdMock,
  });

  jest
    .spyOn(authStore, "subscribe")
    .mockImplementation(mutableMockAuthStoreSubscribe);

  describe("signed in", () => {
    beforeEach(() => {
      authStoreMock.next({
        identity: mockIdentity,
      });
      snsTicketsStore.reset();
      jest.clearAllMocks();
      userCountryStore.set(NOT_LOADED);
    });

    it("should render a text to increase participation", () => {
      snsTicketsStore.setNoTicket(rootCanisterIdMock);

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

    it("should render a text to participate", async () => {
      snsTicketsStore.setNoTicket(rootCanisterIdMock);

      const { queryByTestId } = renderContextCmp({
        summary: mockSnsFullProject.summary,
        swapCommitment: mockSnsSwapCommitment(
          principal(3)
        ) as SnsSwapCommitment,
        Component: ParticipateButton,
      });
      await waitFor(() =>
        expect(
          (
            queryByTestId("sns-project-participate-button")?.textContent ?? ""
          ).trim()
        ).toEqual(en.sns_project_detail.participate)
      );
    });

    // TODO: Disable button until we have the commitment of the user
    it("should show button when user has no commitment", () => {
      snsTicketsStore.setNoTicket(rootCanisterIdMock);

      const { queryByTestId } = renderContextCmp({
        summary: summaryForLifecycle(SnsSwapLifecycle.Open),
        swapCommitment: {
          rootCanisterId: mockSnsFullProject.rootCanisterId,
          myCommitment: undefined,
        },
        Component: ParticipateButton,
      });
      expect(
        queryByTestId("sns-project-participate-button")
      ).toBeInTheDocument();
    });

    it("should open swap participation modal on participate click", async () => {
      snsTicketsStore.setNoTicket(rootCanisterIdMock);

      // When the modal appears, it will trigger `pollAccounts`
      // which trigger api calls if accounts are not loaded.
      icpAccountsStore.setForTesting(mockAccountsStoreData);

      const { getByTestId } = renderContextCmp({
        summary: mockSnsFullProject.summary,
        swapCommitment: mockSnsFullProject.swapCommitment as SnsSwapCommitment,
        Component: ParticipateButton,
      });

      await waitFor(() =>
        expect(getByTestId("sns-project-participate-button")).not.toBeNull()
      );

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

    it("should display a spinner if user has an open ticket", async () => {
      snsTicketsStore.setTicket({
        rootCanisterId: rootCanisterIdMock,
        ticket: testTicket,
      });

      const { queryByTestId, getByTestId } = renderContextCmp({
        summary: summaryForLifecycle(SnsSwapLifecycle.Open),
        swapCommitment: mockSnsFullProject.swapCommitment as SnsSwapCommitment,
        Component: ParticipateButton,
      });

      await waitFor(() =>
        expect(getByTestId("connecting_sale_canister")).not.toBeNull()
      );

      expect(queryByTestId("sns-project-participate-button")).toBeNull();
    });

    it("should display a spinner while fetching user commitment", async () => {
      snsTicketsStore.setNoTicket(rootCanisterIdMock);

      const { queryByTestId, getByTestId } = renderContextCmp({
        summary: summaryForLifecycle(SnsSwapLifecycle.Open),
        swapCommitment: undefined,
        Component: ParticipateButton,
      });

      await waitFor(() =>
        expect(getByTestId("connecting_sale_canister")).not.toBeNull()
      );

      expect(queryByTestId("sns-project-participate-button")).toBeNull();
    });

    it("should display spinner and hide button when there is loading ticket", async () => {
      const { queryByTestId, getByTestId, container } = renderContextCmp({
        summary: summaryForLifecycle(SnsSwapLifecycle.Open),
        swapCommitment: mockSnsFullProject.swapCommitment as SnsSwapCommitment,
        Component: ParticipateButton,
      });

      expect(container.querySelector("svg.small")).toBeInTheDocument();
      expect(getByTestId("connecting_sale_canister")).not.toBeNull();
      expect(queryByTestId("sns-project-participate-button")).toBeNull();
    });

    it("should display spinner while loading location if project has restricted countries and user has no ticket", async () => {
      const summary = createSummary({
        lifecycle: SnsSwapLifecycle.Open,
        restrictedCountries: ["US"],
      });
      snsTicketsStore.setNoTicket(rootCanisterIdMock);
      const { queryByTestId, getByTestId, container } = renderContextCmp({
        summary,
        swapCommitment: mockSnsFullProject.swapCommitment as SnsSwapCommitment,
        Component: ParticipateButton,
      });

      expect(container.querySelector("svg.small")).toBeInTheDocument();
      expect(getByTestId("connecting_sale_canister")).not.toBeNull();
      expect(queryByTestId("sns-project-participate-button")).toBeNull();
    });

    it("should not display spinner if project has restricted countries, user location is loaded and user has no open ticket", async () => {
      const summary = createSummary({
        lifecycle: SnsSwapLifecycle.Open,
        restrictedCountries: ["US"],
      });
      userCountryStore.set({ isoCode: "US" });
      snsTicketsStore.setNoTicket(rootCanisterIdMock);

      const { queryByTestId } = renderContextCmp({
        summary,
        swapCommitment: mockSnsFullProject.swapCommitment as SnsSwapCommitment,
        Component: ParticipateButton,
      });

      expect(queryByTestId("connecting_sale_canister")).toBeNull();
      expect(
        queryByTestId("sns-project-participate-button")
      ).toBeInTheDocument();
    });

    it("should enable button if user has not committed max already", async () => {
      snsTicketsStore.setNoTicket(rootCanisterIdMock);

      const { queryByTestId } = renderContextCmp({
        summary: summaryForLifecycle(SnsSwapLifecycle.Open),
        swapCommitment: mockSnsFullProject.swapCommitment as SnsSwapCommitment,
        Component: ParticipateButton,
      });

      const button = queryByTestId(
        "sns-project-participate-button"
      ) as HTMLButtonElement;

      await waitFor(() => expect(button.getAttribute("disabled")).toBeNull());
    });

    it("should enable button if from a non-restricted country", async () => {
      snsTicketsStore.setNoTicket(rootCanisterIdMock);
      const summary = createSummary({
        lifecycle: SnsSwapLifecycle.Open,
        restrictedCountries: ["CH"],
      });
      userCountryStore.set({ isoCode: "US" });

      const { queryByTestId } = renderContextCmp({
        summary,
        swapCommitment: mockSnsFullProject.swapCommitment as SnsSwapCommitment,
        Component: ParticipateButton,
      });

      const button = queryByTestId(
        "sns-project-participate-button"
      ) as HTMLButtonElement;

      await waitFor(() => expect(button.getAttribute("disabled")).toBeNull());
    });

    it("should enable button if there was an error fetching the country of the user", async () => {
      snsTicketsStore.setNoTicket(rootCanisterIdMock);
      const summary = createSummary({
        lifecycle: SnsSwapLifecycle.Open,
        restrictedCountries: ["CH"],
      });
      userCountryStore.set(new Error("Error loading country"));

      const { queryByTestId } = renderContextCmp({
        summary,
        swapCommitment: mockSnsFullProject.swapCommitment as SnsSwapCommitment,
        Component: ParticipateButton,
      });

      const button = queryByTestId(
        "sns-project-participate-button"
      ) as HTMLButtonElement;

      await waitFor(() => expect(button.getAttribute("disabled")).toBeNull());
    });

    it("should disable button if user has committed max already", async () => {
      const mock = mockSnsFullProject.swapCommitment as SnsSwapCommitment;
      snsTicketsStore.setNoTicket(mock.rootCanisterId);

      const { queryByTestId, container } = renderContextCmp({
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

      const tooltipPo = new TooltipPo(new JestPageObjectElement(container));
      expect(await tooltipPo.getText()).toBe("Maximum commitment reached");
    });

    it("should disable button if user is from a restricted country", async () => {
      const userCountry = "CH";
      const summary = createSummary({
        lifecycle: SnsSwapLifecycle.Open,
        restrictedCountries: [userCountry],
      });
      userCountryStore.set({ isoCode: userCountry });
      const mock = mockSnsFullProject.swapCommitment as SnsSwapCommitment;
      snsTicketsStore.setNoTicket(mock.rootCanisterId);

      const { queryByTestId, container } = renderContextCmp({
        summary,
        swapCommitment: {
          rootCanisterId: mock.rootCanisterId,
          myCommitment: undefined,
        },
        Component: ParticipateButton,
      });

      const button = queryByTestId(
        "sns-project-participate-button"
      ) as HTMLButtonElement;
      expect(button.getAttribute("disabled")).not.toBeNull();

      const tooltipPo = new TooltipPo(new JestPageObjectElement(container));
      expect(await tooltipPo.getText()).toBe(
        "You are not eligible to participate in this swap."
      );
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
