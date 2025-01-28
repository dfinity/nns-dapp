import FollowSnsTopicSection from "$lib/components/sns-neuron-detail/FollowSnsTopicSection.svelte";
import * as snsNeuronsServices from "$lib/services/sns-neurons.services";
import { removeFollowee } from "$lib/services/sns-neurons.services";
import { getSnsNeuronIdAsHexString } from "$lib/utils/sns-neuron.utils";
import { renderSelectedSnsNeuronContext } from "$tests/mocks/context-wrapper.mock";
import { nervousSystemFunctionMock } from "$tests/mocks/sns-functions.mock";
import {
  createMockSnsNeuron,
  mockSnsNeuron,
} from "$tests/mocks/sns-neurons.mock";
import { principal } from "$tests/mocks/sns-projects.mock";
import { FollowSnsTopicSectionPo } from "$tests/page-objects/FollowSnsTopicSection.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import type { SnsNeuron } from "@dfinity/sns";

describe("FollowSnsTopicSection", () => {
  const reload = vi.fn();
  const rootCanisterId = principal(2);
  const followee1 = createMockSnsNeuron({ id: [1, 2, 3] });
  const followee2 = createMockSnsNeuron({ id: [5, 6, 7] });
  const followees = [followee1.id[0], followee2.id[0]];
  const neuron: SnsNeuron = {
    ...mockSnsNeuron,
    followees: [[nervousSystemFunctionMock.id, { followees }]],
  };

  beforeEach(() => {
    vi.spyOn(snsNeuronsServices, "removeFollowee").mockResolvedValue({
      success: true,
    });
  });

  const renderComponent = () => {
    const { container } = renderSelectedSnsNeuronContext({
      Component: FollowSnsTopicSection,
      reload,
      neuron,
      props: {
        neuron,
        rootCanisterId,
        nsFunction: nervousSystemFunctionMock,
      },
    });

    return FollowSnsTopicSectionPo.under(new JestPageObjectElement(container));
  };

  it("renders follow topic section", async () => {
    const po = renderComponent();

    expect(await po.isPresent()).toBe(true);
  });

  it("renders followees for that topic", async () => {
    const po = renderComponent();

    const followeePos = await po.getHashPos();
    expect(followeePos.length).toBe(2);
    expect(await followeePos[0].getFullText()).toBe(
      getSnsNeuronIdAsHexString(followee1)
    );
    expect(await followeePos[1].getFullText()).toBe(
      getSnsNeuronIdAsHexString(followee2)
    );
  });

  it("opens new followee modal", async () => {
    const po = renderComponent();

    const sectionPo = await po.getFollowTopicSectionPo();
    const modalPo = po.getNewSnsFolloweeModalPo();
    expect(await modalPo.isPresent()).toBe(false);

    await sectionPo.getAddFolloweeButtonPo().click();
    await runResolvedPromises();

    expect(await modalPo.isPresent()).toBe(true);
  });

  it("removes followee", async () => {
    const po = renderComponent();
    await runResolvedPromises();

    expect(removeFollowee).toBeCalledTimes(0);
    await po.removeFollowee(getSnsNeuronIdAsHexString(followee1));
    await runResolvedPromises();

    expect(removeFollowee).toBeCalledWith({
      rootCanisterId,
      neuron,
      functionId: nervousSystemFunctionMock.id,
      followee: {
        id: followee1.id[0].id,
      },
    });
    expect(removeFollowee).toBeCalledTimes(1);
  });
});
