import NnsNeuronPublicVisibilityAction from "$lib/components/neuron-detail/NnsNeuronPublicVisibilityAction.svelte";
import {
  mockHardwareWalletAccount,
  mockMainAccount,
} from "$tests/mocks/icp-accounts.store.mock";
import { mockNeuron } from "$tests/mocks/neurons.mock";
import { NnsNeuronPublicVisibilityActionPo } from "$tests/page-objects/NnsNeuronPublicVisibilityAction.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { setAccountsForTesting } from "$tests/utils/accounts.test-utils";
import { NeuronVisibility, type NeuronInfo } from "@dfinity/nns";
import { render } from "@testing-library/svelte";

describe("NnsNeuronPublicVisibilityAction", () => {
  const renderComponent = async (neuron) => {
    const { container } = render(NnsNeuronPublicVisibilityAction, {
      props: { neuron },
    });

    return NnsNeuronPublicVisibilityActionPo.under(
      new JestPageObjectElement(container)
    );
  };

  const controlledNeuron = {
    ...mockNeuron,
    fullNeuron: {
      ...mockNeuron.fullNeuron,
      controller: mockMainAccount.principal.toText(),
    },
  };

  const hwControlledNeuron = {
    ...mockNeuron,
    fullNeuron: {
      ...mockNeuron.fullNeuron,
      controller: mockHardwareWalletAccount.principal.toText(),
    },
  };

  beforeEach(() => {
    setAccountsForTesting({
      main: mockMainAccount,
      hardwareWallets: [mockHardwareWalletAccount],
    });
  });

  it("should render elements and text for public neuron", async () => {
    const mockNeuronPublic: NeuronInfo = {
      ...controlledNeuron,
      visibility: NeuronVisibility.Public,
    };
    const po = await renderComponent(mockNeuronPublic);

    expect(await po.getTitleText()).toBe("Public Neuron");
    expect(await po.getSubtitleText()).toBe(
      "This neuron exposes additional information, including its votes. Learn more"
    );
    expect(await po.getSubtitleLinkPo().getText()).toBe("Learn more");
    expect(await po.getSubtitleLinkPo().getHref()).toBe(
      "https://internetcomputer.org/docs/current/developer-docs/daos/nns/concepts/neurons/neuron-management"
    );
    expect(await po.getButtonPo().getText()).toBe("Make Neuron Private");
    expect(await po.getButtonPo().isDisabled()).toBe(false);
    expect(await po.getTooltipPo().isPresent()).toBe(false);
  });

  it("should render elements and text for private neuron", async () => {
    const mockNeuronPrivate: NeuronInfo = {
      ...controlledNeuron,
      visibility: NeuronVisibility.Private,
    };
    const po = await renderComponent(mockNeuronPrivate);

    expect(await po.getTitleText()).toBe("Private Neuron");
    expect(await po.getSubtitleText()).toBe(
      "This neuron limits information it exposes publicly. Learn more"
    );
    expect(await po.getSubtitleLinkPo().getText()).toBe("Learn more");
    expect(await po.getSubtitleLinkPo().getHref()).toBe(
      "https://internetcomputer.org/docs/current/developer-docs/daos/nns/concepts/neurons/neuron-management"
    );
    expect(await po.getButtonPo().getText()).toBe("Make Neuron Public");
    expect(await po.getButtonPo().isDisabled()).toBe(false);
    expect(await po.getTooltipPo().isPresent()).toBe(false);
  });

  it("should render elements and text for unspecified neuron", async () => {
    const mockNeuronUnspecified: NeuronInfo = {
      ...controlledNeuron,
      visibility: NeuronVisibility.Unspecified,
    };
    const po = await renderComponent(mockNeuronUnspecified);

    expect(await po.getTitleText()).toBe("Private Neuron");
    expect(await po.getSubtitleText()).toBe(
      "This neuron limits information it exposes publicly. Learn more"
    );

    expect(await po.getSubtitleLinkPo().getText()).toBe("Learn more");
    expect(await po.getSubtitleLinkPo().getHref()).toBe(
      "https://internetcomputer.org/docs/current/developer-docs/daos/nns/concepts/neurons/neuron-management"
    );
    expect(await po.getButtonPo().getText()).toBe("Make Neuron Public");
    expect(await po.getButtonPo().isDisabled()).toBe(false);
    expect(await po.getTooltipPo().isPresent()).toBe(false);
  });

  it("should render elements and text for neuron with no visibility", async () => {
    const mockNeuronVisibilityUndefined: NeuronInfo = {
      ...controlledNeuron,
      visibility: undefined,
    };
    const po = await renderComponent(mockNeuronVisibilityUndefined);

    expect(await po.getTitleText()).toBe("Private Neuron");
    expect(await po.getSubtitleText()).toBe(
      "This neuron limits information it exposes publicly. Learn more"
    );
    expect(await po.getSubtitleLinkPo().getText()).toBe("Learn more");
    expect(await po.getSubtitleLinkPo().getHref()).toBe(
      "https://internetcomputer.org/docs/current/developer-docs/daos/nns/concepts/neurons/neuron-management"
    );
    expect(await po.getButtonPo().getText()).toBe("Make Neuron Public");
    expect(await po.getButtonPo().isDisabled()).toBe(false);
    expect(await po.getTooltipPo().isPresent()).toBe(false);
  });

  it("should only not render button for uncontrolled neurons", async () => {
    const po = await renderComponent(mockNeuron);

    expect(await po.getTitleText()).toBe("Private Neuron");
    expect(await po.getSubtitleText()).toBe(
      "This neuron limits information it exposes publicly. Learn more"
    );
    expect(await po.getSubtitleLinkPo().getText()).toBe("Learn more");
    expect(await po.getSubtitleLinkPo().getHref()).toBe(
      "https://internetcomputer.org/docs/current/developer-docs/daos/nns/concepts/neurons/neuron-management"
    );
    expect(await po.getButtonPo().isPresent()).toBe(false);
  });

  it("should render button disabled with tooltip for hardware wallet controlled neurons", async () => {
    const po = await renderComponent(hwControlledNeuron);

    expect(await po.getTitleText()).toBe("Private Neuron");
    expect(await po.getSubtitleText()).toBe(
      "This neuron limits information it exposes publicly. Learn more"
    );
    expect(await po.getSubtitleLinkPo().getText()).toBe("Learn more");
    expect(await po.getSubtitleLinkPo().getHref()).toBe(
      "https://internetcomputer.org/docs/current/developer-docs/daos/nns/concepts/neurons/neuron-management"
    );

    expect(await po.getButtonPo().isDisabled()).toBe(true);
    expect(await po.getTooltipPo().getTooltipText()).toBe(
      "Updating visibility of Ledger device controlled neurons is not supported at the moment"
    );
  });
});
