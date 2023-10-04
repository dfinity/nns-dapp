/**
 * @jest-environment jsdom
 */

import SnsNeuronAdvancedSection from "$lib/components/sns-neuron-detail/SnsNeuronAdvancedSection.svelte";
import {
  SECONDS_IN_DAY,
  SECONDS_IN_FOUR_YEARS,
  SECONDS_IN_MONTH,
} from "$lib/constants/constants";
import { authStore } from "$lib/stores/auth.store";
import {
  mockAuthStoreSubscribe,
  mockIdentity,
  mockPrincipal,
} from "$tests/mocks/auth.store.mock";
import { renderSelectedSnsNeuronContext } from "$tests/mocks/context-wrapper.mock";
import {
  allSnsNeuronPermissions,
  createMockSnsNeuron,
  snsNervousSystemParametersMock,
} from "$tests/mocks/sns-neurons.mock";
import { mockToken } from "$tests/mocks/sns-projects.mock";
import { SnsNeuronAdvancedSectionPo } from "$tests/page-objects/SnsNeuronAdvancedSection.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { normalizeWhitespace } from "$tests/utils/utils.test-utils";
import { NeuronState } from "@dfinity/nns";
import type { Principal } from "@dfinity/principal";
import { SnsNeuronPermissionType, type SnsNeuron } from "@dfinity/sns";

describe("SnsNeuronAdvancedSection", () => {
  const nowInSeconds = new Date("Jul 20, 2023 8:53 AM").getTime() / 1000;
  const renderComponent = (neuron: SnsNeuron) => {
    const { container } = renderSelectedSnsNeuronContext({
      Component: SnsNeuronAdvancedSection,
      neuron,
      reload: () => undefined,
      props: {
        neuron,
        governanceCanisterId: mockPrincipal,
        parameters: snsNervousSystemParametersMock,
        token: mockToken,
        transactionFee: 10_000n,
      },
    });

    return SnsNeuronAdvancedSectionPo.under(
      new JestPageObjectElement(container)
    );
  };

  const controllerPermissions = {
    principal: [mockIdentity.getPrincipal()] as [Principal],
    permission_type: allSnsNeuronPermissions,
  };
  const noSplitPermissions = {
    principal: [mockIdentity.getPrincipal()] as [Principal],
    permission_type: allSnsNeuronPermissions.filter(
      (p) => p !== SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_SPLIT
    ),
  };

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(nowInSeconds * 1000);
    jest
      .spyOn(authStore, "subscribe")
      .mockImplementation(mockAuthStoreSubscribe);
  });

  it("should render neuron data", async () => {
    const id = [
      154, 174, 251, 49, 236, 17, 214, 189, 195, 140, 58, 89, 61, 29, 138, 113,
      79, 48, 136, 37, 96, 61, 215, 50, 182, 65, 198, 97, 8, 19, 238, 36,
    ];
    const created = BigInt(nowInSeconds - SECONDS_IN_MONTH);
    const neuron = createMockSnsNeuron({
      id,
      createdTimestampSeconds: created,
      ageSinceTimestampSeconds: created + BigInt(SECONDS_IN_DAY * 10),
    });
    const po = renderComponent(neuron);

    expect(await po.neuronId()).toBe("9aaefb3...813ee24");
    expect(normalizeWhitespace(await po.neuronCreated())).toBe(
      "Jun 19, 2023 10:23 PM"
    );
    expect(await po.neuronAge()).toBe("20 days, 10 hours");
    expect(await po.neuronAccount()).toBe("xlmdg-v...813ee24");
  });

  it("should render actions", async () => {
    const neuron = createMockSnsNeuron({
      id: [1],
      stake: 314_000_000n,
      maturity: 100_000_000n,
      permissions: [controllerPermissions],
    });
    const po = renderComponent(neuron);

    expect(await po.hasSplitNeuronButton()).toBe(true);
    expect(await po.hasStakeMaturityCheckbox()).toBe(true);
  });

  it("should not split neuron button if user has no split permissions", async () => {
    const neuron = createMockSnsNeuron({
      id: [1],
      permissions: [noSplitPermissions],
    });
    const po = renderComponent(neuron);

    expect(await po.hasSplitNeuronButton()).toBe(false);
  });

  it("should render dissolve date if neuron is dissolving", async () => {
    const neuron = createMockSnsNeuron({
      id: [1],
      state: NeuronState.Dissolving,
      whenDissolvedTimestampSeconds: BigInt(
        nowInSeconds + SECONDS_IN_FOUR_YEARS
      ),
    });

    const po = renderComponent(neuron);

    expect(normalizeWhitespace(await po.dissolveDate())).toBe(
      "Jul 20, 2027 8:53 AM"
    );
  });

  it("should not render dissolve date if neuron is not dissolving", async () => {
    const neuron = createMockSnsNeuron({
      id: [1],
      state: NeuronState.Locked,
    });

    const po = renderComponent(neuron);

    expect(await po.dissolveDate()).toBeNull();
  });
});
