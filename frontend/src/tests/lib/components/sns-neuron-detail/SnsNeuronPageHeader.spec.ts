import SnsNeuronPageHeader from "$lib/components/sns-neuron-detail/SnsNeuronPageHeader.svelte";
import { snsQueryStore } from "$lib/stores/sns.store";
import { page } from "$mocks/$app/stores";
import { mockPrincipal } from "$tests/mocks/auth.store.mock";
import { renderSelectedSnsNeuronContext } from "$tests/mocks/context-wrapper.mock";
import { mockSnsNeuron } from "$tests/mocks/sns-neurons.mock";
import { snsResponseFor } from "$tests/mocks/sns-response.mock";
import { SnsNeuronPageHeaderPo } from "$tests/page-objects/SnsNeuronPageHeader.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { SnsSwapLifecycle, type SnsNeuron } from "@dfinity/sns";

describe("SnsNeuronPageHeader", () => {
  const renderSnsNeuronCmp = (neuron: SnsNeuron) => {
    const { container } = renderSelectedSnsNeuronContext({
      Component: SnsNeuronPageHeader,
      neuron,
      reload: vi.fn(),
    });

    return SnsNeuronPageHeaderPo.under(new JestPageObjectElement(container));
  };
  it("should render the Sns universe name", async () => {
    const projectName = "Tetris";
    const rootCanisterId = mockPrincipal;
    const responses = snsResponseFor({
      principal: rootCanisterId,
      lifecycle: SnsSwapLifecycle.Committed,
      projectName,
    });
    snsQueryStore.setData(responses);
    page.mock({ data: { universe: rootCanisterId.toText() } });

    const po = renderSnsNeuronCmp(mockSnsNeuron);

    expect(await po.getUniverse()).toEqual(projectName);
  });
});
