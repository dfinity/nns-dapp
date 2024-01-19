import SnsNeuronsFooter from "$lib/components/sns-neurons/SnsNeuronsFooter.svelte";
import { tokensStore } from "$lib/stores/tokens.store";
import { page } from "$mocks/$app/stores";
import { mockSnsToken, principal } from "$tests/mocks/sns-projects.mock";
import { SnsNeuronsFooterPo } from "$tests/page-objects/SnsNeuronsFooter.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { setSnsProjects } from "$tests/utils/sns.test-utils";
import { SnsSwapLifecycle } from "@dfinity/sns";
import { render } from "@testing-library/svelte";

describe("SnsNeuron footer", () => {
  const rootCanisterId = principal(23);
  const snsDogToken = {
    ...mockSnsToken,
    symbol: "DOG",
  };
  const snsDog = {
    rootCanisterId,
    projectName: "Dog",
    tokenMetadata: snsDogToken,
    lifecycle: SnsSwapLifecycle.Committed,
  };

  beforeEach(() => {
    setSnsProjects([snsDog]);
    tokensStore.setToken({
      certified: true,
      canisterId: rootCanisterId,
      token: snsDogToken,
    });
    page.mock({
      data: { universe: rootCanisterId.toText() },
    });
  });

  const renderComponent = () => {
    const { container } = render(SnsNeuronsFooter);
    return SnsNeuronsFooterPo.under(new JestPageObjectElement(container));
  };

  it("should open the StakeSnsNeuronModal on click to stake SNS Neurons", async () => {
    const po = renderComponent();
    expect(await po.getStakeNeuronsButtonPo().isPresent()).toBe(true);
    expect(await po.getSnsStakeNeuronModalPo().isPresent()).toBe(false);

    await po.clickStakeNeuronsButton();

    expect(await po.getSnsStakeNeuronModalPo().isPresent()).toBe(true);
  });
});
