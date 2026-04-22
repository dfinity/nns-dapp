import RangeDissolveDelay from "$lib/components/neurons/RangeDissolveDelay.svelte";
import { NNS_MAXIMUM_DISSOLVE_DELAY } from "$lib/constants/neurons.constants";
import { RangeDissolveDelayPo } from "$tests/page-objects/RangeDissolveDelay.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "@testing-library/svelte";

const renderComponent = (delayInSeconds: number) => {
  const { container } = render(RangeDissolveDelay, {
    props: {
      delayInSeconds,
      maxDelayInSeconds: NNS_MAXIMUM_DISSOLVE_DELAY,
      votingPower: 0,
    },
  });
  return RangeDissolveDelayPo.under(new JestPageObjectElement(container));
};

describe("RangeDissolveDelay", () => {
  it("should display '2 years' (not '2 years, 12 hours') at max dissolve delay", async () => {
    const po = renderComponent(NNS_MAXIMUM_DISSOLVE_DELAY);
    expect(await po.getDissolveDelayLabel()).toBe("2 years");
  });
});
