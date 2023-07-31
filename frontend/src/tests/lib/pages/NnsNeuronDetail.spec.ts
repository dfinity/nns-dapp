/**
 * @jest-environment jsdom
 */

import * as api from "$lib/api/governance.api";
import { OWN_CANISTER_ID } from "$lib/constants/canister-ids.constants";
import NnsNeuronDetail from "$lib/pages/NnsNeuronDetail.svelte";
import { overrideFeatureFlagsStore } from "$lib/stores/feature-flags.store";
import { layoutTitleStore } from "$lib/stores/layout.store";
import { neuronsStore } from "$lib/stores/neurons.store";
import { voteRegistrationStore } from "$lib/stores/vote-registration.store";
import { dispatchIntersecting } from "$lib/utils/events.utils";
import * as fakeGovernanceApi from "$tests/fakes/governance-api.fake";
import en from "$tests/mocks/i18n.mock";
import { mockNeuron } from "$tests/mocks/neurons.mock";
import { mockVoteRegistration } from "$tests/mocks/proposal.mock";
import { NnsNeuronDetailPo } from "$tests/page-objects/NnsNeuronDetail.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import { render, waitFor } from "@testing-library/svelte";
import { get } from "svelte/store";

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
  const props = {
    neuronIdText: `${neuronId}`,
  };
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

  const querySkeleton = (container: HTMLElement): HTMLElement | null =>
    container.querySelector('[data-tid="skeleton-card"]');

  beforeEach(() => {
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
    beforeEach(() => {
      overrideFeatureFlagsStore.setFlag("ENABLE_NEURON_SETTINGS", true);
    });

    it("renders new sections", async () => {
      const po = await renderComponent(`${neuronId}`);

      // Old components
      expect(await po.getMaturityCardPo().isPresent()).toBe(false);
      expect(await po.getNnsNeuronMetaInfoCardPageObjectPo().isPresent()).toBe(
        false
      );
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

  describe("when old neuron details page", () => {
    beforeEach(() => {
      overrideFeatureFlagsStore.setFlag("ENABLE_NEURON_SETTINGS", false);
    });

    it("renders old sections", async () => {
      const po = await renderComponent(`${neuronId}`);

      // Old components
      expect(await po.getMaturityCardPo().isPresent()).toBe(true);
      expect(await po.getNnsNeuronMetaInfoCardPageObjectPo().isPresent()).toBe(
        true
      );
      expect(await po.getNnsNeuronInfoStakePo().isPresent()).toBe(true);
      expect(await po.hasJoinFundCard()).toBe(true);

      // New components
      expect(await po.getVotingPowerSectionPo().isPresent()).toBe(false);
      expect(await po.getMaturitySectionPo().isPresent()).toBe(false);
      expect(await po.getAdvancedSectionPo().isPresent()).toBe(false);
    });

    it("should query neurons", async () => {
      render(NnsNeuronDetail, props);

      await waitFor(() => expect(api.queryNeurons).toHaveBeenCalled());
    });

    it("should display skeletons", () => {
      const { container } = render(NnsNeuronDetail, props);

      expect(querySkeleton(container)).not.toBeNull();
    });

    it("should show the proper neuron id", async () => {
      const { getByTestId } = render(NnsNeuronDetail, props);

      await waitFor(() => {
        const neuronIdElement = getByTestId("neuron-id");
        expect(neuronIdElement).not.toBeNull();
        expect(neuronIdElement.textContent).toEqual(`${neuronId}`);
        expect(neuronIdElement.textContent).not.toEqual(
          `${mockNeuron.neuronId}`
        );
      });
    });

    const testTitle = async ({
      intersecting,
      text,
    }: {
      intersecting: boolean;
      text: string;
    }) => {
      const { getByTestId } = render(NnsNeuronDetail, props);

      await waitFor(() => expect(getByTestId("neuron-id")).not.toBeNull());

      const element = getByTestId("neuron-id-title") as HTMLElement;
      dispatchIntersecting({ element, intersecting });

      const title = get(layoutTitleStore);
      await waitFor(() => expect(title).toEqual(text));
    };

    it("should render a title with neuron ID if title is not intersecting viewport", async () =>
      await testTitle({
        intersecting: false,
        text: `${en.core.icp} – ${neuronId}`,
      }));

    it("should render a static title if title is intersecting viewport", async () =>
      await testTitle({ intersecting: true, text: en.neuron_detail.title }));

    it("should hide skeletons after neuron data are available", async () => {
      const { container } = render(NnsNeuronDetail, props);

      await waitFor(() => expect(querySkeleton(container)).toBeNull());
    });

    it("should render nns project name", async () => {
      const { getByTestId } = render(NnsNeuronDetail, props);

      await waitFor(() =>
        expect(getByTestId("projects-summary")).not.toBeNull()
      );
    });

    it("should show skeletons when neuron is in voting process", async () => {
      const { container } = render(NnsNeuronDetail, props);

      await waitFor(() => expect(querySkeleton(container)).toBeNull());

      voteRegistrationStore.add({
        ...mockVoteRegistration,
        neuronIdStrings: [`${neuronId}`],
        canisterId: OWN_CANISTER_ID,
      });

      await waitFor(() => expect(querySkeleton(container)).not.toBeNull());
    });

    it("should render last maturity distribution", async () => {
      const { container } = render(NnsNeuronDetail, props);

      await runResolvedPromises();

      const po = NnsNeuronDetailPo.under(new JestPageObjectElement(container));

      expect(
        await po.getMaturityCardPo().getLastDistributionMaturity()
      ).toEqual("May 19, 1992");
    });
  });
});
