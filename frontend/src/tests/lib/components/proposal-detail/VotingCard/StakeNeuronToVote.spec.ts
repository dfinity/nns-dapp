import StakeNeuronToVote from "$lib/components/proposal-detail/VotingCard/StakeNeuronToVote.svelte";
import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { AppPath } from "$lib/constants/routes.constants";
import { pageStore } from "$lib/derived/page.derived";
import { page } from "$mocks/$app/stores";
import { mockSnsFullProject } from "$tests/mocks/sns-projects.mock";
import { StakeNeuronToVotePo } from "$tests/page-objects/StakeNeuronToVote.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { setSnsProjects } from "$tests/utils/sns.test-utils";
import { SnsSwapLifecycle } from "@dfinity/sns";
import { render } from "@testing-library/svelte";
import { get } from "svelte/store";

describe("StakeNeuronToVote", () => {
  const renderComponent = async () => {
    const { container } = render(StakeNeuronToVote);

    return StakeNeuronToVotePo.under(new JestPageObjectElement(container));
  };
  const renderAndExpand = async () => {
    const po = await renderComponent();
    // will also work without clicking the button,
    // but it's better not to rely on the current expandable implementation
    await po.getExpandButton().click();
    return po;
  };

  describe("for NNS", () => {
    it("should display expand button", async () => {
      const po = await renderComponent();

      expect(await po.getExpandButton().isPresent()).toBe(true);
    });

    it("should display description", async () => {
      const po = await renderAndExpand();

      expect(await po.getDescriptionText()).toBe(
        "To be eligible to vote in the future, you need to stake a neuron."
      );
    });

    it("should display NNS version of the button", async () => {
      const po = await renderAndExpand();

      await expect(await po.getGotoNeuronsButtonText()).toBe(
        "Stake ICP neuron"
      );
    });

    it("should navigate to nns neurons page", async () => {
      const po = await renderAndExpand();

      await po.clickGotoNeurons();

      expect(get(pageStore)).toEqual({
        path: AppPath.Neurons,
        universe: OWN_CANISTER_ID_TEXT,
      });
    });
  });

  describe("for SNS", () => {
    const rootCanisterId = mockSnsFullProject.rootCanisterId;
    beforeEach(() => {
      page.mock({
        data: { universe: rootCanisterId.toText() },
      });
      setSnsProjects([
        {
          rootCanisterId,
          lifecycle: SnsSwapLifecycle.Committed,
        },
      ]);
    });

    it("should display expand button", async () => {
      const po = await renderComponent();

      expect(await po.getExpandButton().isPresent()).toBe(true);
    });

    it("should display description", async () => {
      const po = await renderAndExpand();

      expect(await po.getDescriptionText()).toBe(
        "To be eligible to vote in the future, you need to stake a neuron."
      );
    });

    it("should display SNS version of the button", async () => {
      const po = await renderAndExpand();

      await expect(await po.getGotoNeuronsButtonText()).toBe(
        "Stake CAT neuron"
      );
    });

    it("should navigate to sns neurons page", async () => {
      const po = await renderAndExpand();

      await po.clickGotoNeurons();

      expect(get(pageStore)).toEqual({
        path: AppPath.Neurons,
        universe: rootCanisterId.toText(),
      });
    });
  });
});
