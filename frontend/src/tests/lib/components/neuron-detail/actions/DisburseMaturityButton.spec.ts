import DisburseMaturityButton from "$lib/components/neuron-detail/actions/DisburseMaturityButton.svelte";
import { DisburseMaturityButtonPo } from "$tests/page-objects/DisburseMaturityButton.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "@testing-library/svelte";

describe("DisburseMaturityButton", () => {
  const renderComponent = (disabledText) => {
    const { container } = render(DisburseMaturityButton, {
      props: {
        disabledText,
      },
    });
    return DisburseMaturityButtonPo.under(new JestPageObjectElement(container));
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders disburse maturity cta", async () => {
    const po = renderComponent(undefined);

    expect(await po.isPresent()).toBe(true);
  });

  it("should be enabled", async () => {
    const po = renderComponent(undefined);

    expect(await po.isDisabled()).toBe(false);
  });

  it("should be disabled", async () => {
    const po = renderComponent("Disabled Text");

    expect(await po.isDisabled()).toBe(true);
  });
});
