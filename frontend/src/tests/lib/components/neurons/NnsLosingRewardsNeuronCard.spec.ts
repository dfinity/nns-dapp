import { OWN_CANISTER_ID_TEXT } from "$ib/constants/canister-ids.constants";
import NnsLosingRewardsNeuronCard from "$lib/components/neurons/NnsLosingRewardsNeuronCard.svelte";
import { mockIdentity } from "$tests/mocks/auth.store.mock";
import { mockFullNeuron, mockNeuron } from "$tests/mocks/neurons.mock";
import { NnsLosingRewardsNeuronCardPo } from "$tests/page-objects/NnsLosingRewardsNeuronCard.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { Topic, type NeuronInfo } from "@dfinity/nns";
import { render } from "@testing-library/svelte";

describe("NnsLosingRewardsNeuronCard", () => {
  const followNeuronId1 = 111n;
  const followNeuronId2 = 222n;
  const neuronId = 123n;
  const neuron: NeuronInfo = {
    ...mockNeuron,
    neuronId,
    fullNeuron: {
      ...mockFullNeuron,
      controller: mockIdentity.getPrincipal().toText(),
      followees: [
        {
          topic: Topic.ExchangeRate,
          followees: [followNeuronId1, followNeuronId2],
        },
        {
          topic: Topic.Governance,
          followees: [followNeuronId1],
        },
      ],
    },
  };

  const renderComponent = (props) => {
    const { container } = render(NnsLosingRewardsNeuronCard, {
      props,
    });
    return NnsLosingRewardsNeuronCardPo.under(
      new JestPageObjectElement(container)
    );
  };

  it("should render link", async () => {
    const po = await renderComponent({ neuron });

    expect(await po.getHref()).toEqual(
      `/neuron/?u=${OWN_CANISTER_ID_TEXT}&neuron=${neuronId}`
    );
  });

  it("should render following", async () => {
    const po = await renderComponent({ neuron });

    const followeePos = await po.getFolloweePos();

    expect(followeePos.length).toBe(2);
    expect(await followeePos[0].getName()).toEqual(`${followNeuronId1}`);
    expect(await followeePos[0].getTags()).toEqual([
      "Exchange Rate",
      "Governance",
    ]);
    expect(await followeePos[1].getName()).toEqual(`${followNeuronId2}`);
    expect(await followeePos[1].getTags()).toEqual(["Exchange Rate"]);
  });
});
