import AddSnsHotkeyButton from "$lib/components/sns-neuron-detail/actions/AddSnsHotkeyButton.svelte";
import { mockPrincipal } from "$tests/mocks/auth.store.mock";
import en from "$tests/mocks/i18n.mock";
import { mockSnsNeuron } from "$tests/mocks/sns-neurons.mock";
import { fireEvent, render } from "@testing-library/svelte";
import SnsNeuronContextTest from "../SnsNeuronContextTest.svelte";

describe("AddSnsHotkeyButton", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  const renderCard = () =>
    render(SnsNeuronContextTest, {
      props: {
        neuron: mockSnsNeuron,
        rootCanisterId: mockPrincipal,
        testComponent: AddSnsHotkeyButton,
      },
    });

  it("renders add hotkey message", () => {
    const { getByText } = renderCard();

    expect(getByText(en.neuron_detail.add_hotkey)).toBeInTheDocument();
  });

  it("opens Add Hotkey Neuron Modal", async () => {
    const { container, queryByTestId } = renderCard();

    const buttonElement = container.querySelector("button");
    expect(buttonElement).not.toBeNull();

    buttonElement && (await fireEvent.click(buttonElement));

    const modal = queryByTestId("add-hotkey-neuron-modal");
    expect(modal).toBeInTheDocument();
  });
});
