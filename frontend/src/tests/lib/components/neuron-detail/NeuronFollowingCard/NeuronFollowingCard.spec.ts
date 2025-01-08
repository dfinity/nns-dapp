import NeuronFollowingCard from "$lib/components/neuron-detail/NeuronFollowingCard/NeuronFollowingCard.svelte";
import { listKnownNeurons } from "$lib/services/known-neurons.services";
import { mockIdentity, resetIdentity } from "$tests/mocks/auth.store.mock";
import { mockFullNeuron, mockNeuron } from "$tests/mocks/neurons.mock";
import { NeuronFollowingCardPo } from "$tests/page-objects/NeuronFollowingCard.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "$tests/utils/svelte.test-utils";
import { Topic, type NeuronInfo } from "@dfinity/nns";
import NeuronContextActionsTest from "../NeuronContextActionsTest.svelte";

vi.mock("$lib/services/known-neurons.services", () => {
  return {
    listKnownNeurons: vi.fn().mockResolvedValue(undefined),
  };
});

describe("NeuronFollowingCard", () => {
  const followees = [111, 222, 333].map(BigInt);
  const neuron: NeuronInfo = {
    ...mockNeuron,
    fullNeuron: {
      ...mockFullNeuron,
      controller: mockIdentity.getPrincipal().toText(),
      followees: [
        {
          topic: Topic.ExchangeRate,
          followees: followees,
        },
      ],
    },
  };
  const renderComponent = (neuron) => {
    const { container } = render(NeuronContextActionsTest, {
      props: {
        neuron,
        testComponent: NeuronFollowingCard,
      },
    });
    return NeuronFollowingCardPo.under(new JestPageObjectElement(container));
  };

  beforeEach(() => {
    resetIdentity();
  });

  it("should render edit button", async () => {
    const po = renderComponent(neuron);

    expect(await po.getFollowNeuronsButtonPo().isPresent()).toEqual(true);
    expect(
      await po.getFollowNeuronsButtonPo().isButtonVariantPrimary()
    ).toEqual(true);
  });

  it("should render followees", async () => {
    const po = renderComponent(neuron);
    const followeesPos = await po.getFolloweePos();
    const ids = await Promise.all(followeesPos.map((po) => po.getId()));
    const expectedIds = followees.map((id) => `followee-${id.toString()}`);
    expect(ids).toEqual(expectedIds);
  });

  it("should render no frame if no followees available", async () => {
    const po = renderComponent(mockNeuron);

    expect(await po.getFolloweesList().isPresent()).toBe(false);
  });

  it("should trigger listKnownNeurons", async () => {
    renderComponent(mockNeuron);

    expect(listKnownNeurons).toBeCalled();
  });
});
