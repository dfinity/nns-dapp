import Alfred from "$lib/components/alfred/Alfred.svelte";
import { AlfredPo } from "$tests/page-objects/Alfred.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "@testing-library/svelte";

describe("Alfred Component", () => {
  const renderComponent = () => {
    const { container } = render(Alfred);
    return AlfredPo.under(new JestPageObjectElement(container));
  };

  beforeEach(() => {
    vi.useFakeTimers();
  });

  it("should not be visible by default", async () => {
    const po = renderComponent();
    expect(await po.isPresent()).toBe(false);
  });

  it("should open it with the keyboard combination", async () => {
    const po = renderComponent();
    expect(await po.isPresent()).toBe(false);

    await po.open("mac");
    expect(await po.isPresent()).toBe(true);

    await po.close();
    vi.advanceTimersByTime(500);

    expect(await po.isPresent()).toBe(false);

    await po.open("windows");
    expect(await po.isPresent()).toBe(true);

    await po.close();
    vi.advanceTimersByTime(500);

    expect(await po.isPresent()).toBe(false);
  });
});
