import FollowSnsNeuronsButton from "$lib/components/sns-neuron-detail/actions/FollowSnsNeuronsButton.svelte";
import { snsTokenSymbolSelectedStore } from "$lib/derived/sns/sns-token-symbol-selected.store";
import { mockPrincipal } from "$tests/mocks/auth.store.mock";
import en from "$tests/mocks/i18n.mock";
import { mockSnsNeuron } from "$tests/mocks/sns-neurons.mock";
import { mockTokenStore } from "$tests/mocks/sns-projects.mock";
import { fireEvent, render } from "@testing-library/svelte";
import { vi } from "vitest";
import SnsNeuronContextTest from "../SnsNeuronContextTest.svelte";

vi.mock("$lib/services/$public/sns.services", () => {
  return {
    loadSnsNervousSystemFunctions: vi.fn(),
  };
});

describe("FollowSnsNeuronsButton", () => {
  beforeAll(() =>
    vi
      .spyOn(snsTokenSymbolSelectedStore, "subscribe")
      .mockImplementation(mockTokenStore)
  );

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders Follow Neurons message", () => {
    const { getByText } = render(SnsNeuronContextTest, {
      props: {
        neuron: mockSnsNeuron,
        rootCanisterId: mockPrincipal,
        testComponent: FollowSnsNeuronsButton,
      },
    });

    expect(getByText(en.neuron_detail.follow_neurons)).toBeInTheDocument();
  });

  it("opens Add Hotkey Neuron Modal", async () => {
    const { container, queryByTestId } = render(SnsNeuronContextTest, {
      props: {
        neuron: mockSnsNeuron,
        rootCanisterId: mockPrincipal,
        testComponent: FollowSnsNeuronsButton,
      },
    });

    const buttonElement = container.querySelector("button");
    expect(buttonElement).not.toBeNull();

    buttonElement && (await fireEvent.click(buttonElement));

    const modal = queryByTestId("follow-sns-neurons-modal");
    expect(modal).toBeInTheDocument();
  });
});
