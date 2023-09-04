/**
 * @jest-environment jsdom
 */

import DissolveDelayBonusText from "$lib/components/neuron-detail/DissolveDelayBonusText.svelte";
import { DissolveDelayBonusTextPo } from "$tests/page-objects/DissolveDelayBonusText.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "@testing-library/svelte";

describe("DissolveDelayBonusText", () => {
  const renderComponent = (dissolveMultiplier: number) => {
    const { container } = render(DissolveDelayBonusText, {
      props: { dissolveMultiplier },
    });

    return DissolveDelayBonusTextPo.under(new JestPageObjectElement(container));
  };

  it("should render dissolve delay bonus as percentage", async () => {
    const po = renderComponent(1.25);
    expect(await po.getText()).toBe("Dissolve delay bonus: +25%");
  });

  it("should render a tooltip with detailed percentage", async () => {
    const po = renderComponent(1.25678);
    expect(await po.getTooltipText()).toBe("25.678%");
  });
});
