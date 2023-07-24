import IncreaseSnsDissolveDelayButton from "$lib/components/sns-neuron-detail/actions/IncreaseSnsDissolveDelayButton.svelte";
import { snsQueryStore } from "$lib/stores/sns.store";
import { tokensStore } from "$lib/stores/tokens.store";
import { page } from "$mocks/$app/stores";
import { mockPrincipal } from "$tests/mocks/auth.store.mock";
import {
  createMockSnsNeuron,
  mockSnsNeuron,
} from "$tests/mocks/sns-neurons.mock";
import { mockToken } from "$tests/mocks/sns-projects.mock";
import { snsResponseFor } from "$tests/mocks/sns-response.mock";
import { ButtonPo } from "$tests/page-objects/Button.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { NeuronState } from "@dfinity/nns";
import { SnsSwapLifecycle, type SnsNeuron } from "@dfinity/sns";
import { render, waitFor } from "@testing-library/svelte";
import SnsNeuronContextTest from "../SnsNeuronContextTest.svelte";

// Avoid triggering the api call to not have to mock the api layer. Not needed for this test.
vi.mock("$lib/services/sns-parameters.services");

describe("IncreaseSnsDissolveDelayButton", () => {
  const rootCanisterId = mockPrincipal;
  const response = snsResponseFor({
    principal: rootCanisterId,
    lifecycle: SnsSwapLifecycle.Committed,
    certified: true,
  });
  beforeEach(() => {
    vi.clearAllMocks();
    snsQueryStore.reset();
    snsQueryStore.setData(response);
    tokensStore.reset();
    tokensStore.setToken({
      canisterId: rootCanisterId,
      certified: true,
      token: mockToken,
    });
    page.mock({ data: { universe: rootCanisterId.toText() } });
  });

  const renderComponent = (neuron: SnsNeuron) => {
    const { container } = render(SnsNeuronContextTest, {
      props: {
        neuron,
        passPropNeuron: true,
        rootCanisterId,
        testComponent: IncreaseSnsDissolveDelayButton,
      },
    });

    return ButtonPo.under({
      element: new JestPageObjectElement(container),
    });
  };

  it("should render 'Increase Delay' text for non unlocked neurons", async () => {
    const lockedNeuron = createMockSnsNeuron({
      id: [1],
      state: NeuronState.Locked,
    });
    const po = renderComponent(lockedNeuron);
    expect(await po.getText()).toEqual("Increase Delay");
  });

  it("should render 'Set Dissolve Delay' text for unlocked neurons", async () => {
    const unlockedNeuron = createMockSnsNeuron({
      id: [1],
      state: NeuronState.Dissolved,
    });
    const po = renderComponent(unlockedNeuron);
    expect(await po.getText()).toEqual("Set Dissolve Delay");
  });

  it("should open increase increase dissolve delay modal", async () => {
    const { container, queryByTestId } = render(SnsNeuronContextTest, {
      props: {
        neuron: mockSnsNeuron,
        passPropNeuron: true,
        rootCanisterId,
        testComponent: IncreaseSnsDissolveDelayButton,
      },
    });

    const po = ButtonPo.under({
      element: new JestPageObjectElement(container),
    });
    expect(
      queryByTestId("increase-sns-dissolve-delay-modal-component")
    ).not.toBeInTheDocument();

    await po.click();

    await waitFor(() =>
      expect(
        queryByTestId("increase-sns-dissolve-delay-modal-component")
      ).toBeInTheDocument()
    );
  });
});
