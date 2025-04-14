import FollowSnsNeuronsByTopicModal from "$lib/modals/sns/neurons/FollowSnsNeuronsByTopicModal.svelte";
import type { SnsTopicKey } from "$lib/types/sns";
import { resetIdentity } from "$tests/mocks/auth.store.mock";
import { createMockSnsNeuron } from "$tests/mocks/sns-neurons.mock";
import { principal } from "$tests/mocks/sns-projects.mock";
import { topicInfoDtoMock } from "$tests/mocks/sns-topics.mock";
import { FollowSnsNeuronsByTopicModalPo } from "$tests/page-objects/FollowSnsNeuronsByTopicModal.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { setSnsProjects } from "$tests/utils/sns.test-utils";
import type { Principal } from "@dfinity/principal";
import type { SnsNeuron } from "@dfinity/sns";
import { nonNullish } from "@dfinity/utils";
import { render } from "@testing-library/svelte";

describe("FollowSnsNeuronsByTopicModal", () => {
  const rootCanisterId = principal(1);
  const criticalTopicKey1: SnsTopicKey = "CriticalDappOperations";
  const criticalTopicName1 = "Critical Dapp Operations";
  const criticalTopicKey2: SnsTopicKey = "TreasuryAssetManagement";
  const criticalTopicName2 = "Treasury Asset Management";
  const topicKey1: SnsTopicKey = "DaoCommunitySettings";
  const topicName1 = "Dao Community Settings";
  const topicKey2: SnsTopicKey = "ApplicationBusinessLogic";
  const topicName2 = "Application Business Logic";
  const followeeNeuronId1 = {
    id: Uint8Array.from([1, 2, 3]),
  };
  const followeeNeuronId2 = {
    id: Uint8Array.from([3, 2, 1]),
  };
  const neuron = createMockSnsNeuron({
    sourceNnsNeuronId: 0n,
    topicFollowees: {
      [criticalTopicKey1]: [
        {
          neuronId: followeeNeuronId1,
        },
        {
          neuronId: followeeNeuronId2,
        },
      ],
    },
  });

  const renderComponent = (
    props: {
      rootCanisterId: Principal;
      neuron: SnsNeuron;
      reloadNeuron: () => Promise<void>;
    },
    onNnsClose?: () => void
  ) => {
    const { container } = render(FollowSnsNeuronsByTopicModal, {
      props,
      events: {
        ...(nonNullish(onNnsClose) && { nnsClose: onNnsClose }),
      },
    });

    return FollowSnsNeuronsByTopicModalPo.under(
      new JestPageObjectElement(container)
    );
  };
  const defaultProps = {
    rootCanisterId,
    neuron,
    reloadNeuron: vi.fn(),
  };

  beforeEach(() => {
    resetIdentity();

    setSnsProjects([
      {
        rootCanisterId,
        topics: {
          topics: [
            topicInfoDtoMock({
              topic: criticalTopicKey1,
              name: criticalTopicName1,
              description: "",
              isCritical: true,
            }),
            topicInfoDtoMock({
              topic: criticalTopicKey2,
              name: criticalTopicName2,
              description: "",
              isCritical: true,
            }),
            topicInfoDtoMock({
              topic: topicKey1,
              name: topicName1,
              description: "",
              isCritical: false,
            }),
            topicInfoDtoMock({
              topic: topicKey2,
              name: topicName2,
              description: "",
              isCritical: false,
            }),
          ],
          uncategorized_functions: [],
        },
      },
    ]);
  });

  it("displays initially topics step", async () => {
    const po = renderComponent({
      ...defaultProps,
    });

    const topicsStepPo = await po.getFollowSnsNeuronsByTopicStepTopicsPo();
    expect(await topicsStepPo.isPresent()).toEqual(true);
    expect(await topicsStepPo.getCriticalTopicItemNames()).toEqual([
      criticalTopicName1,
      criticalTopicName2,
    ]);
    expect(await topicsStepPo.getNonCriticalTopicItemNames()).toEqual([
      topicName1,
      topicName2,
    ]);
  });
});
