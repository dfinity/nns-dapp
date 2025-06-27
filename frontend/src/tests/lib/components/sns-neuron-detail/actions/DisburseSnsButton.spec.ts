import DisburseSnsButton from "$lib/components/sns-neuron-detail/actions/DisburseSnsButton.svelte";
import { snsTokenSymbolSelectedStore } from "$lib/derived/sns/sns-token-symbol-selected.store";
import SnsNeuronContextTest from "$tests/lib/components/sns-neuron-detail/SnsNeuronContextTest.svelte";
import { mockPrincipal } from "$tests/mocks/auth.store.mock";
import en from "$tests/mocks/i18n.mock";
import {
  createMockSnsNeuron,
  mockSnsNeuron,
} from "$tests/mocks/sns-neurons.mock";
import { mockTokenStore } from "$tests/mocks/sns-projects.mock";
import { fireEvent, render } from "@testing-library/svelte";

describe("DisburseSnsButton", () => {
  const renderComponent = (neuron = mockSnsNeuron) => {
    return render(SnsNeuronContextTest, {
      props: {
        neuron,
        rootCanisterId: mockPrincipal,
        testComponent: DisburseSnsButton,
        passPropNeuron: true,
      },
    });
  };

  beforeEach(() => {
    vi.spyOn(snsTokenSymbolSelectedStore, "subscribe").mockImplementation(
      mockTokenStore
    );
  });

  it("renders title", () => {
    const { getByText } = renderComponent();
    expect(getByText(en.neuron_detail.disburse)).toBeInTheDocument();
  });

  it("renders disabled button when vesting", () => {
    const vestingNeuron = createMockSnsNeuron({
      id: [1],
      vesting: true,
    });
    const { queryByTestId } = renderComponent(vestingNeuron);

    expect(
      queryByTestId("disburse-button").getAttribute("disabled")
    ).not.toBeNull();
  });

  it("renders disabled button when not enough stake", () => {
    const emptyNeuron = createMockSnsNeuron({ stake: BigInt(0) });
    const { queryByTestId } = renderComponent(emptyNeuron);

    expect(
      queryByTestId("disburse-button").getAttribute("disabled")
    ).not.toBeNull();
  });

  it("opens sns modal", async () => {
    const { container, queryByTestId } = renderComponent();
    const buttonElement = container.querySelector("button");
    expect(buttonElement).not.toBeNull();

    buttonElement && (await fireEvent.click(buttonElement));

    const modal = queryByTestId("disburse-sns-neuron-modal");
    expect(modal).toBeInTheDocument();
  });
});
