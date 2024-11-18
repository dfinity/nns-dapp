import MakeNeuronsPublicBanner from "$lib/components/neurons/MakeNeuronsPublicBanner.svelte";
import { neuronsStore } from "$lib/stores/neurons.store";
import { mockMainAccount } from "$tests/mocks/icp-accounts.store.mock";
import { mockNeuron } from "$tests/mocks/neurons.mock";
import { MakeNeuronsPublicBannerPo } from "$tests/page-objects/MakeNeuronsPublicBanner.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { setAccountsForTesting } from "$tests/utils/accounts.test-utils";
import { NeuronVisibility, type NeuronInfo } from "@dfinity/nns";
import { render } from "@testing-library/svelte";
import { beforeEach, describe, expect, it, vi } from "vitest";

const createTestNeuron = ({
  visibility = NeuronVisibility.Private,
  controlled = true,
}: {
  visibility?: NeuronVisibility;
  controlled?: boolean;
}): NeuronInfo => ({
  ...mockNeuron,
  visibility,
  fullNeuron: {
    ...mockNeuron.fullNeuron,
    controller: controlled ? mockMainAccount.principal.toText() : "other-user",
  },
});

describe("MakeNeuronsPublicBanner", () => {
  const localStorageKey = "isNeuronsPublicBannerDismissed";
  const renderComponent = () => {
    const { container } = render(MakeNeuronsPublicBanner);
    return MakeNeuronsPublicBannerPo.under(
      new JestPageObjectElement(container)
    );
  };

  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
    setAccountsForTesting({
      main: mockMainAccount,
      hardwareWallets: [],
    });
    vi.setSystemTime(new Date("2024-01-01"));
  });

  it("should not render when localStorageKey is set to true", async () => {
    localStorage.setItem(localStorageKey, "true");
    const po = renderComponent();

    expect(await po.isPresent()).toBe(false);
  });

  it("should render when localStorage is not set", async () => {
    neuronsStore.setNeurons({
      neurons: [createTestNeuron({})],
      certified: true,
    });
    const po = renderComponent();

    expect(await po.isPresent()).toBe(true);
  });

  it("should render when localStorageKey is set to false", async () => {
    localStorage.setItem(localStorageKey, "false");
    neuronsStore.setNeurons({
      neurons: [createTestNeuron({})],
      certified: true,
    });
    const po = renderComponent();

    expect(await po.isPresent()).toBe(true);
  });

  it("should not render when the date is past January 31, 2025", async () => {
    vi.setSystemTime(new Date("2025-02-01"));
    neuronsStore.setNeurons({
      neurons: [createTestNeuron({ visibility: NeuronVisibility.Private })],
      certified: true,
    });
    const po = renderComponent();

    expect(await po.isPresent()).toBe(false);
  });

  it("should disappear and set localStorageKey to true when close button is clicked", async () => {
    neuronsStore.setNeurons({
      neurons: [createTestNeuron({ visibility: NeuronVisibility.Private })],
      certified: true,
    });
    const po = renderComponent();

    expect(await po.isPresent()).toBe(true);

    expect(localStorage.getItem(localStorageKey)).toBeNull();

    await po.getCloseButtonPo().click();

    expect(await po.isPresent()).toBe(false);
    expect(localStorage.getItem(localStorageKey)).toBe("true");
  });

  it("should not render when there is no private neuron", async () => {
    neuronsStore.setNeurons({
      neurons: [createTestNeuron({ visibility: NeuronVisibility.Public })],
      certified: true,
    });
    const po = renderComponent();

    expect(await po.isPresent()).toBe(false);
  });

  it("should not render when private neuron is not controlled by the user", async () => {
    neuronsStore.setNeurons({
      neurons: [createTestNeuron({ controlled: false })],
      certified: true,
    });
    const po = renderComponent();

    expect(await po.isPresent()).toBe(false);
  });

  it("should render correct content", async () => {
    neuronsStore.setNeurons({
      neurons: [createTestNeuron({})],
      certified: true,
    });
    const po = renderComponent();

    expect(await po.getTitleText()).toBe(
      "Neurons can now be private or public"
    );
    expect(await po.getSubtitleText()).toBe(
      "If you would like to make your neurons public, you can open one and change it under “Advanced Details & Settings”. Learn more"
    );
    expect(await po.getSubtitleLinkPo().getText()).toBe("Learn more");
    expect(await po.getSubtitleLinkPo().getHref()).toBe(
      "https://internetcomputer.org/docs/current/developer-docs/daos/nns/concepts/neurons/neuron-management"
    );
    expect(await po.getBannerChangeNeuronVisibilityButtonPo().isPresent()).toBe(
      true
    );
    expect(await po.getBannerChangeNeuronVisibilityButtonPo().getText()).toBe(
      "Make Neurons Public"
    );
    expect(await po.getCloseButtonPo().isPresent()).toBe(true);
    expect(await po.getChangeNeuronVisibilityModalPo().isPresent()).toBe(false);
  });

  it("should display changeNeuronVisibilityModal when action button is clicked", async () => {
    const privateNeuron = createTestNeuron({});
    neuronsStore.setNeurons({
      neurons: [privateNeuron],
      certified: true,
    });
    const po = renderComponent();

    const modalPo = po.getChangeNeuronVisibilityModalPo();

    expect(await modalPo.isPresent()).toBe(false);

    await po.getBannerChangeNeuronVisibilityButtonPo().click();

    expect(await modalPo.isPresent()).toBe(true);
  });
});
