import DisburseSnsButton from "$lib/components/sns-neuron-detail/actions/DisburseSnsButton.svelte";
import { snsTokenSymbolSelectedStore } from "$lib/derived/sns/sns-token-symbol-selected.store";
import { mockPrincipal } from "$tests/mocks/auth.store.mock";
import en from "$tests/mocks/i18n.mock";
import {
  createMockSnsNeuron,
  mockSnsNeuron,
} from "$tests/mocks/sns-neurons.mock";
import { mockTokenStore } from "$tests/mocks/sns-projects.mock";
import { fireEvent, render } from "@testing-library/svelte";
import SnsNeuronContextTest from "../SnsNeuronContextTest.svelte";

describe("DisburseSnsButton", () => {
  beforeAll(() =>
    vi
      .spyOn(snsTokenSymbolSelectedStore, "subscribe")
      .mockImplementation(mockTokenStore)
  );

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders title", () => {
    const { getByText } = render(SnsNeuronContextTest, {
      props: {
        neuron: mockSnsNeuron,
        rootCanisterId: mockPrincipal,
        testComponent: DisburseSnsButton,
        passPropNeuron: true,
      },
    });

    expect(getByText(en.neuron_detail.disburse)).toBeInTheDocument();
  });

  it("renders disabled button when vesting", () => {
    const vestingNeuron = createMockSnsNeuron({
      id: [1],
      vesting: true,
    });
    const { queryByTestId } = render(SnsNeuronContextTest, {
      props: {
        neuron: vestingNeuron,
        rootCanisterId: mockPrincipal,
        testComponent: DisburseSnsButton,
        passPropNeuron: true,
      },
    });

    expect(
      queryByTestId("disburse-button").getAttribute("disabled")
    ).not.toBeNull();
  });

  it("opens sns modal", async () => {
    const { container, queryByTestId } = render(SnsNeuronContextTest, {
      props: {
        neuron: mockSnsNeuron,
        rootCanisterId: mockPrincipal,
        testComponent: DisburseSnsButton,
        passPropNeuron: true,
      },
    });

    const buttonElement = container.querySelector("button");
    expect(buttonElement).not.toBeNull();

    buttonElement && (await fireEvent.click(buttonElement));

    const modal = queryByTestId("disburse-sns-neuron-modal");
    expect(modal).toBeInTheDocument();
  });
});
