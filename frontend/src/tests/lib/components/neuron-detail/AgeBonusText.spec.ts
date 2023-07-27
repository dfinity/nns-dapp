/**
 * @jest-environment jsdom
 */

import AgeBonusText from "$lib/components/neuron-detail/AgeBonusText.svelte";
import { AgeBonusTextPo } from "$tests/page-objects/AgeBonusText.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "@testing-library/svelte";

describe("AgeBonusText", () => {
  const renderComponent = (ageBonus: number) => {
    const { container } = render(AgeBonusText, { props: { ageBonus } });

    return AgeBonusTextPo.under(new JestPageObjectElement(container));
  };

  it("should render age bonus as percentage", async () => {
    const po = renderComponent(1.25);
    expect(await po.getText()).toBe("Age bonus: 25%");
  });

  it("should render a tooltip with detailed percentage", async () => {
    const po = renderComponent(1.25678);
    expect(await po.getTooltipText()).toBe("25.678%");
  });
});
