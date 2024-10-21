import MakeNeuronsPublicBanner from "$lib/components/neurons/MakeNeuronsPublicBanner.svelte";
import { overrideFeatureFlagsStore } from "$lib/stores/feature-flags.store";
import { neuronsStore } from "$lib/stores/neurons.store";
import { mockIdentity, resetIdentity } from "$tests/mocks/auth.store.mock";
import { mockNeuron } from "$tests/mocks/neurons.mock";
import { MakeNeuronsPublicBannerPo } from "$tests/page-objects/MakeNeuronsPublicBanner.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
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
    controller: controlled
      ? mockIdentity.getPrincipal().toText()
      : "other-user",
  },
});

describe("MakeNeuronsPublicBanner", () => {
  const renderComponent = () => {
    const { container } = render(MakeNeuronsPublicBanner);
    return MakeNeuronsPublicBannerPo.under(
      new JestPageObjectElement(container)
    );
  };

  const getItemSpy = vi.spyOn(Storage.prototype, "getItem");
  const setItemSpy = vi.spyOn(Storage.prototype, "setItem");

  beforeEach(() => {
    vi.useFakeTimers();
    neuronsStore.reset();
    vi.resetAllMocks();
    resetIdentity();
    overrideFeatureFlagsStore.reset();
    vi.setSystemTime(new Date("2024-01-01"));
    overrideFeatureFlagsStore.setFlag("ENABLE_NEURON_VISIBILITY", true);
  });

  it("should not render when localStorage is set to false", async () => {
    getItemSpy.mockReturnValue("false");
    const po = renderComponent();

    expect(await po.isPresent()).toBe(false);
  });

  it("should render when localStorage is not set", async () => {
    getItemSpy.mockReturnValue(null);
    neuronsStore.setNeurons({
      neurons: [createTestNeuron({})],
      certified: true,
    });
    const po = renderComponent();

    expect(await po.isPresent()).toBe(true);
  });

  it("should render when localStorage is set to true", async () => {
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

  it("should not render when ENABLE_NEURON_VISIBILITY flag is false", async () => {
    overrideFeatureFlagsStore.setFlag("ENABLE_NEURON_VISIBILITY", false);
    neuronsStore.setNeurons({
      neurons: [createTestNeuron({})],
      certified: true,
    });
    const po = renderComponent();

    expect(await po.isPresent()).toBe(false);
  });

  it("should disappear when close button is clicked", async () => {
    neuronsStore.setNeurons({
      neurons: [createTestNeuron({ visibility: NeuronVisibility.Private })],
      certified: true,
    });
    const po = renderComponent();

    expect(await po.isPresent()).toBe(true);

    expect(setItemSpy).not.toBeCalledWith(
      "makeNeuronsPublicBannerVisible",
      "false"
    );

    await po.getCloseButtonPo().click();

    expect(await po.isPresent()).toBe(false);
    expect(setItemSpy).toHaveBeenCalledWith(
      "makeNeuronsPublicBannerVisible",
      "false"
    );
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
