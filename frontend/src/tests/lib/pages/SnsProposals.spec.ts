import SnsProposals from "$lib/pages/SnsProposals.svelte";
import { actionableProposalsSegmentStore } from "$lib/stores/actionable-proposals-segment.store";
import { actionableSnsProposalsStore } from "$lib/stores/actionable-sns-proposals.store";
import { snsFiltersStore } from "$lib/stores/sns-filters.store";
import { snsFunctionsStore } from "$lib/stores/sns-functions.store";
import { snsProposalsStore } from "$lib/stores/sns-proposals.store";
import { page } from "$mocks/$app/stores";
import * as fakeSnsGovernanceApi from "$tests/fakes/sns-governance-api.fake";
import {
  mockPrincipal,
  resetIdentity,
  setNoIdentity,
} from "$tests/mocks/auth.store.mock";
import en from "$tests/mocks/i18n.mock";
import { nervousSystemFunctionMock } from "$tests/mocks/sns-functions.mock";
import { createSnsProposal } from "$tests/mocks/sns-proposals.mock";
import { SnsProposalListPo } from "$tests/page-objects/SnsProposalList.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { setSnsProjects } from "$tests/utils/sns.test-utils";
import { render } from "$tests/utils/svelte.test-utils";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import { AnonymousIdentity } from "@dfinity/agent";
import {
  SnsProposalDecisionStatus,
  SnsProposalRewardStatus,
  SnsSwapLifecycle,
  type SnsProposalData,
} from "@dfinity/sns";
import { fireEvent, waitFor } from "@testing-library/svelte";
import { get } from "svelte/store";

vi.mock("$lib/api/sns-governance.api");

describe("SnsProposals", () => {
  fakeSnsGovernanceApi.install();

  const nothingFound = (
    container: HTMLElement
  ): HTMLParagraphElement | undefined =>
    Array.from(container.querySelectorAll("p")).filter(
      (p) => p.textContent === en.voting.nothing_found
    )[0];

  const rootCanisterId = mockPrincipal;
  const functionName = "test_function";
  const functionId = 3n;
  const projectName = "🪙";

  beforeEach(() => {
    vi.clearAllMocks();
    snsProposalsStore.reset();
    snsFunctionsStore.reset();
    snsFiltersStore.reset();
    // Reset to default value
    page.mock({ data: { universe: rootCanisterId.toText() } });
    setSnsProjects([
      {
        rootCanisterId,
        projectName,
        lifecycle: SnsSwapLifecycle.Committed,
        nervousFunctions: [
          {
            ...nervousSystemFunctionMock,
            name: functionName,
            id: functionId,
          },
        ],
      },
    ]);
    actionableProposalsSegmentStore.resetForTesting();
    actionableSnsProposalsStore.resetForTesting();
  });

  describe("logged in user", () => {
    beforeEach(() => {
      resetIdentity();
    });

    // TODO(max): add tests that the neurons are being fetched before the proposals (pr: https://github.com/dfinity/nns-dapp/pull/4420/)

    describe("Matching results when all proposals selected", () => {
      beforeEach(() => {
        fakeSnsGovernanceApi.addProposalWith({
          rootCanisterId,
          action: functionId,
        });
        actionableProposalsSegmentStore.set("all");
      });

      it("should load nervous system functions", async () => {
        const { queryByTestId } = render(SnsProposals);

        await waitFor(() =>
          expect(queryByTestId("proposal-card")).toBeInTheDocument()
        );

        expect(queryByTestId("proposal-card-heading").textContent).toMatch(
          functionName
        );
      });

      it("should load decision status filters", async () => {
        const { getByTestId, queryAllByTestId } = render(SnsProposals);

        const decisionStatusButton = getByTestId("filters-by-status");
        expect(decisionStatusButton).toBeInTheDocument();

        fireEvent.click(decisionStatusButton);

        await waitFor(() =>
          expect(getByTestId("filter-modal")).toBeInTheDocument()
        );

        expect(queryAllByTestId("checkbox").length).toBeGreaterThan(0);
      });

      it("should init types filter", async () => {
        const getFiltersStoreData = () =>
          get(snsFiltersStore)[rootCanisterId.toText()];

        expect(getFiltersStoreData()?.types).toEqual(undefined);
        render(SnsProposals);

        await runResolvedPromises();

        expect(getFiltersStoreData()?.types).toEqual([
          {
            checked: true,
            id: `${functionId}`,
            name: functionName,
            value: `${functionId}`,
          },
        ]);
      });

      it("should render a spinner while searching proposals", async () => {
        const { getByTestId } = render(SnsProposals);

        await waitFor(() =>
          expect(getByTestId("proposals-loading")).not.toBeNull()
        );
      });

      it("should render proposals", async () => {
        const { queryAllByTestId, queryByTestId } = render(SnsProposals);

        await waitFor(() =>
          expect(queryByTestId("proposals-loading")).not.toBeInTheDocument()
        );
        expect(queryAllByTestId("proposal-card").length).toBe(1);
      });

      it("should not render not found text on init", () => {
        const { container } = render(SnsProposals);

        const p: HTMLParagraphElement | undefined = nothingFound(container);

        expect(p).toBeUndefined();
      });
    });

    describe("No results when all proposals selected", () => {
      beforeEach(() => {
        actionableProposalsSegmentStore.set("all");
      });

      it("should render not found text", async () => {
        const { queryByTestId, container } = render(SnsProposals);

        await waitFor(() =>
          expect(queryByTestId("proposals-loading")).not.toBeInTheDocument()
        );

        const p: HTMLParagraphElement | undefined = nothingFound(container);
        expect(p).not.toBeUndefined();
      });
    });
  });

  describe("when not logged when all proposals selected", () => {
    beforeEach(() => {
      setNoIdentity();
      actionableProposalsSegmentStore.set("all");
      fakeSnsGovernanceApi.addProposalWith({
        identity: new AnonymousIdentity(),
        rootCanisterId,
        action: functionId,
      });
    });

    describe("Matching results", () => {
      it("should render proposals", async () => {
        const { queryAllByTestId, queryByTestId } = render(SnsProposals);

        await waitFor(() =>
          expect(queryByTestId("proposals-loading")).not.toBeInTheDocument()
        );

        expect(queryAllByTestId("proposal-card").length).toBe(1);
      });
    });
  });

  describe("filter proposals", () => {
    const proposals: SnsProposalData[] = [
      createSnsProposal({
        status: SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_OPEN,
        proposalId: 1n,
        rewardStatus:
          SnsProposalRewardStatus.PROPOSAL_REWARD_STATUS_ACCEPT_VOTES,
      }),
      createSnsProposal({
        status: SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_EXECUTED,
        proposalId: 2n,
        rewardStatus: SnsProposalRewardStatus.PROPOSAL_REWARD_STATUS_SETTLED,
      }),
    ];
    beforeEach(() => {
      const functionId1 = 3n;
      const functionId2 = 4n;
      setNoIdentity();
      actionableProposalsSegmentStore.set("all");
      fakeSnsGovernanceApi.addProposalWith({
        identity: new AnonymousIdentity(),
        rootCanisterId,
        ...proposals[0],
        action: functionId1,
      });
      fakeSnsGovernanceApi.addProposalWith({
        identity: new AnonymousIdentity(),
        rootCanisterId,
        ...proposals[1],
        action: functionId2,
      });
      snsFunctionsStore.setProjectsFunctions([
        {
          rootCanisterId,
          nsFunctions: [
            {
              ...nervousSystemFunctionMock,
              id: functionId1,
            },
            {
              ...nervousSystemFunctionMock,
              id: functionId2,
            },
          ],
          certified: true,
        },
      ]);
    });

    it("should filter by status", async () => {
      const { getByTestId, queryAllByTestId, queryByTestId } =
        render(SnsProposals);

      await waitFor(() =>
        expect(queryByTestId("proposals-loading")).not.toBeInTheDocument()
      );

      expect(queryAllByTestId("proposal-card").length).toBe(proposals.length);

      const decisionStatusButton = getByTestId("filters-by-status");
      expect(decisionStatusButton).toBeInTheDocument();

      fireEvent.click(decisionStatusButton);

      await waitFor(() =>
        expect(queryByTestId("filter-modal")).toBeInTheDocument()
      );

      const checkBoxes = queryAllByTestId("checkbox");
      expect(checkBoxes.length).toBeGreaterThan(0);

      const openCheckbox = checkBoxes.find(
        (element) =>
          element.getAttribute("id") ===
          String(SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_OPEN)
      );
      expect(openCheckbox).not.toBeUndefined();

      // Select Open status checkbox
      fireEvent.click(openCheckbox);

      // Apply filters
      fireEvent.click(getByTestId("apply-filters"));

      // Wait for modal to close
      await waitFor(() =>
        expect(queryByTestId("filter-modal")).not.toBeInTheDocument()
      );

      expect(queryAllByTestId("proposal-card").length).toBe(1);
    });

    it("should filter by types", async () => {
      const { getByTestId, queryAllByTestId, queryByTestId } =
        render(SnsProposals);

      await waitFor(() =>
        expect(queryByTestId("proposals-loading")).not.toBeInTheDocument()
      );

      // initially there are 2 proposals
      expect(queryAllByTestId("proposal-card").length).toBe(2);

      await fireEvent.click(getByTestId("filters-by-types"));
      await runResolvedPromises();

      expect(queryByTestId("filter-modal")).toBeInTheDocument();

      const functionId1Checkbox = queryAllByTestId("checkbox").find(
        (element) => element.getAttribute("id") === String(functionId)
      );
      expect(functionId1Checkbox).not.toBeUndefined();

      // Unchecked first proposal type
      await fireEvent.click(functionId1Checkbox);
      // Apply filters
      await fireEvent.click(getByTestId("apply-filters"));

      // Wait for modal to close
      await runResolvedPromises();
      expect(queryByTestId("filter-modal")).not.toBeInTheDocument();

      expect(queryAllByTestId("proposal-card").length).toBe(1);
    });
  });

  describe("actionable proposals segment", () => {
    const actionableProposal1 = createSnsProposal({
      proposalId: 10n,
      status: SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_OPEN,
    });
    const renderComponent = async () => {
      const { container } = render(SnsProposals);
      await runResolvedPromises();
      return SnsProposalListPo.under(new JestPageObjectElement(container));
    };
    const mockActionableProposalsLoadingDone = () =>
      actionableSnsProposalsStore.set({
        rootCanisterId,
        proposals: [actionableProposal1],
      });
    const selectActionableProposals = async (po: SnsProposalListPo) => {
      await po
        .getSnsProposalFiltersPo()
        .getActionableProposalsSegmentPo()
        .clickActionableProposals();
      await runResolvedPromises();
    };
    const selectAllProposals = async (po: SnsProposalListPo) => {
      await po
        .getSnsProposalFiltersPo()
        .getActionableProposalsSegmentPo()
        .clickAllProposals();
      await runResolvedPromises();
    };

    beforeEach(() => {
      resetIdentity();
      mockActionableProposalsLoadingDone();
    });

    it("should render actionable proposals by default", async () => {
      const po = await renderComponent();

      expect(await po.getAllProposalList().isPresent()).toEqual(false);
      expect(await po.getActionableProposalList().isPresent()).toEqual(true);
    });

    it("should switch proposal lists on actionable segment change", async () => {
      const po = await renderComponent();
      expect(await po.getAllProposalList().isPresent()).toEqual(false);
      expect(await po.getActionableProposalList().isPresent()).toEqual(true);

      await selectAllProposals(po);

      expect(await po.getAllProposalList().isPresent()).toEqual(true);
      expect(await po.getActionableProposalList().isPresent()).toEqual(false);

      await selectActionableProposals(po);

      expect(await po.getAllProposalList().isPresent()).toEqual(false);
      expect(await po.getActionableProposalList().isPresent()).toEqual(true);
    });

    it('should not display "Not signIn" banner', async () => {
      setNoIdentity();
      const po = await renderComponent();
      expect(await po.getActionableSignInBanner().isPresent()).toBe(false);

      // login
      resetIdentity();
      await runResolvedPromises();
      expect(await po.getActionableSignInBanner().isPresent()).toBe(false);
    });

    it("should display loading skeletons", async () => {
      actionableSnsProposalsStore.resetForTesting();
      const po = await renderComponent();

      expect(await po.getSkeletonCardPo().isPresent()).toBe(true);

      mockActionableProposalsLoadingDone();
      await runResolvedPromises();
      expect(await po.getSkeletonCardPo().isPresent()).toBe(false);
    });

    it('should display "No actionable proposals" banner', async () => {
      actionableSnsProposalsStore.set({
        rootCanisterId,
        proposals: [],
      });
      // no proposals available
      const po = await renderComponent();
      await selectActionableProposals(po);
      expect(await po.getActionableEmptyBanner().isPresent()).toBe(true);

      // with proposals available
      mockActionableProposalsLoadingDone();
      const po2 = await renderComponent();
      await selectActionableProposals(po2);
      expect(await po2.getActionableEmptyBanner().isPresent()).toBe(false);
    });

    it("should display actionable proposals", async () => {
      const po = await renderComponent();
      await selectAllProposals(po);

      expect((await po.getProposalCardPos()).length).toEqual(0);

      await selectActionableProposals(po);

      expect((await po.getProposalCardPos()).length).toEqual(1);
      expect(await (await po.getProposalCardPos())[0].getProposalId()).toEqual(
        "ID: 10"
      );
    });
  });
});
