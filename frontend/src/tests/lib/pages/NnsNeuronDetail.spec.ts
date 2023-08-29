/**
 * @jest-environment jsdom
 */

import { OWN_CANISTER_ID } from "$lib/constants/canister-ids.constants";
import NnsNeuronDetail from "$lib/pages/NnsNeuronDetail.svelte";
import { neuronsStore } from "$lib/stores/neurons.store";
import { voteRegistrationStore } from "$lib/stores/vote-registration.store";
import * as fakeGovernanceApi from "$tests/fakes/governance-api.fake";
import { resetIdentity } from "$tests/mocks/auth.store.mock";
import { mockVoteRegistration } from "$tests/mocks/proposal.mock";
import { NnsNeuronDetailPo } from "$tests/page-objects/NnsNeuronDetail.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import { render } from "@testing-library/svelte";

// Used when NeuronFollowingCard is mounted
jest.mock("$lib/services/known-neurons.services", () => {
  return {
    listKnownNeurons: jest.fn().mockResolvedValue(undefined),
  };
});

jest.mock("$lib/api/governance.api");

describe("NeuronDetail", () => {
  fakeGovernanceApi.install();

  const neuronId = BigInt(314);
  const latestRewardEventTimestamp = Math.floor(
    new Date("1992-05-22T21:00:00").getTime() / 1000
  );
  const renderComponent = async (neuronId: string) => {
    const { container } = render(NnsNeuronDetail, {
      props: {
        neuronIdText: neuronId,
      },
    });

    await runResolvedPromises();

    return NnsNeuronDetailPo.under(new JestPageObjectElement(container));
  };

  beforeEach(() => {
    resetIdentity();
    neuronsStore.reset();
    voteRegistrationStore.reset();
    fakeGovernanceApi.addNeuronWith({ neuronId });
    fakeGovernanceApi.addNeuronWith({ neuronId: 1234n });
    fakeGovernanceApi.setLatestRewardEvent({
      rounds_since_last_distribution: [3n] as [bigint],
      actual_timestamp_seconds: BigInt(latestRewardEventTimestamp),
    });
  });

  describe("when new neuron details page", () => {
    it("renders new sections", async () => {
      const po = await renderComponent(`${neuronId}`);

      // Old components
      expect(await po.getMaturityCardPo().isPresent()).toBe(false);
      expect(await po.getNnsNeuronMetaInfoCardPo().isPresent()).toBe(false);
      expect(await po.getNnsNeuronInfoStakePo().isPresent()).toBe(false);
      expect(await po.hasJoinFundCard()).toBe(false);

      // New components
      expect(await po.getVotingPowerSectionPo().isPresent()).toBe(true);
      expect(await po.getMaturitySectionPo().isPresent()).toBe(true);
      expect(await po.getAdvancedSectionPo().isPresent()).toBe(true);
    });

    it("should display skeletons", async () => {
      fakeGovernanceApi.pause();
      const { container } = render(NnsNeuronDetail, {
        props: {
          neuronIdText: `${neuronId}`,
        },
      });

      const po = NnsNeuronDetailPo.under(new JestPageObjectElement(container));

      expect((await po.getSkeletonCardPos()).length).toBeGreaterThan(0);
    });

    it("should hide skeletons after neuron data are available", async () => {
      fakeGovernanceApi.pause();
      const { container } = render(NnsNeuronDetail, {
        props: {
          neuronIdText: `${neuronId}`,
        },
      });

      const po = NnsNeuronDetailPo.under(new JestPageObjectElement(container));

      expect((await po.getSkeletonCardPos()).length).toBeGreaterThan(0);

      fakeGovernanceApi.resume();

      await po.getSkeletonCardPo().waitForAbsent();
    });

    it("should show the proper neuron id", async () => {
      const po = await renderComponent(`${neuronId}`);

      expect(await po.getNeuronId()).toEqual(`${neuronId}`);
    });

    it("should render nns project name", async () => {
      const po = await renderComponent(`${neuronId}`);

      expect(await po.getUniverse()).toBe("Internet Computer");
    });

    it("should show skeletons when neuron is in voting process", async () => {
      const po = await renderComponent(`${neuronId}`);

      expect((await po.getSkeletonCardPos()).length).toBe(0);

      voteRegistrationStore.add({
        ...mockVoteRegistration,
        neuronIdStrings: [`${neuronId}`],
        canisterId: OWN_CANISTER_ID,
      });

      await po.getSkeletonCardPo().waitFor();
    });

    it("should render last maturity distribution", async () => {
      const po = await renderComponent(`${neuronId}`);

      expect(await po.getAdvancedSectionPo().lastRewardsDistribution()).toEqual(
        "May 19, 1992"
      );
    });
  });
});
