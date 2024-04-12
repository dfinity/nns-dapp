import * as governanceApi from "$lib/api/governance.api";
import FollowNeuronsModal from "$lib/modals/neurons/FollowNeuronsModal.svelte";
import { neuronsStore } from "$lib/stores/neurons.store";
import { resetIdentity } from "$tests/mocks/auth.store.mock";
import { mockFullNeuron, mockNeuron } from "$tests/mocks/neurons.mock";
import { FollowNeuronsModalPo } from "$tests/page-objects/FollowNeuronsModal.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { Topic } from "@dfinity/nns";
import { render } from "@testing-library/svelte";

describe("FollowNeuronsModal", () => {
  const neuronFollowing = {
    ...mockNeuron,
    fullNeuron: {
      ...mockFullNeuron,
      followees: [
        {
          topic: Topic.ExchangeRate,
          followees: [27n, 28n],
        },
      ],
    },
  };

  const fillNeuronStore = () =>
    neuronsStore.setNeurons({
      neurons: [neuronFollowing],
      certified: true,
    });

  beforeEach(() => {
    neuronsStore.reset();
    resetIdentity();
    const spyQueryKnownNeurons = vi
      .spyOn(governanceApi, "queryKnownNeurons")
      .mockResolvedValue([]);
    fillNeuronStore();
  });

  const renderComponent = ({ onClose }: { onClose?: () => void }) => {
    const { container, component } = render(FollowNeuronsModal, {
      props: {
        neuronId: neuronFollowing.neuronId,
      },
    });
    if (onClose) {
      component.$on("nnsClose", onClose);
    }

    return FollowNeuronsModalPo.under(new JestPageObjectElement(container));
  };

  it("renders title", async () => {
    const po = renderComponent({});
    expect(await po.getModalTitle()).toBe("Follow neurons");
  });

  it("close button closes modal", async () => {
    const onClose = vi.fn();
    const po = renderComponent({ onClose });

    expect(onClose).not.toBeCalled();
    await po.clickCloseButton();
    expect(onClose).toBeCalledTimes(1);
  });

  it("renders badge with numbers of followees on the topic", async () => {
    const po = renderComponent({});
    expect(
      await po.getEditFollowNeuronsPo().getBadgeNumber(Topic.ExchangeRate)
    ).toBe(2);
    expect(
      await po.getEditFollowNeuronsPo().getBadgeNumber(Topic.Governance)
    ).toBe(0);
  });
});
