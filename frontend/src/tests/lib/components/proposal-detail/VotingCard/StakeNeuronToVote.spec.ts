import StakeNeuronToVote from "$lib/components/proposal-detail/VotingCard/StakeNeuronToVote.svelte";
import { page } from "$mocks/$app/stores";
import {
  mockSnsFullProject,
  mockSnsToken,
} from "$tests/mocks/sns-projects.mock";
import { StakeNeuronToVotePo } from "$tests/page-objects/StakeNeuronToVote.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { setSnsProjects } from "$tests/utils/sns.test-utils";
import { SnsSwapLifecycle } from "@dfinity/sns";
import { render } from "@testing-library/svelte";

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

    it("should display title", async () => {
      const po = await renderAndExpand();

      expect(await po.getTitleText()).toBe(
        "You don't have any neurons to vote"
      );
    });

    it("should display description", async () => {
      const po = await renderAndExpand();

      expect(await po.getDescriptionText()).toBe(
        "You have no neurons. Create a neuron by staking ICP to vote on proposals."
      );
    });

    it("should display NNS version of the button", async () => {
      const po = await renderAndExpand();

      await expect(await po.getGotoNeuronsLinkText()).toBe("Stake ICP");
    });

    it("should navigate to nns neurons page", async () => {
      const po = await renderAndExpand();

      expect(await po.getGotoNeuronsLinkHref()).toEqual(
        "/neurons/?u=qhbym-qaaaa-aaaaa-aaafq-cai"
      );
    });
  });

  describe("for SNS", () => {
    const rootCanisterId = mockSnsFullProject.rootCanisterId;
    const projectName = "Fish tank";
    const tokenSymbol = "FISH";
    const tokenMetadata = {
      ...mockSnsToken,
      symbol: tokenSymbol,
    };
    beforeEach(() => {
      page.mock({
        data: { universe: rootCanisterId.toText() },
      });
      setSnsProjects([
        {
          rootCanisterId,
          projectName,
          tokenMetadata,
          lifecycle: SnsSwapLifecycle.Committed,
        },
      ]);
    });

    it("should display expand button", async () => {
      const po = await renderComponent();

      expect(await po.getExpandButton().isPresent()).toBe(true);
    });

    it("should display title", async () => {
      const po = await renderAndExpand();

      expect(await po.getTitleText()).toBe(
        `You don't have any ${projectName} neurons to vote`
      );
    });

    it("should display description", async () => {
      const po = await renderAndExpand();

      expect(await po.getDescriptionText()).toBe(
        `You have no ${projectName} neurons. Create a neuron by staking ${tokenSymbol} to vote on ${projectName} proposals.`
      );
    });

    it("should display SNS version of the button", async () => {
      const po = await renderAndExpand();

      await expect(await po.getGotoNeuronsLinkText()).toBe(
        `Stake ${tokenSymbol}`
      );
    });

    it("should navigate to sns neurons page", async () => {
      const po = await renderAndExpand();

      expect(await po.getGotoNeuronsLinkHref()).toEqual(
        "/neurons/?u=g3pce-2iaae"
      );
    });
  });
});
