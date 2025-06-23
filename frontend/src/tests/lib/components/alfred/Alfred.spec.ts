import Alfred from "$lib/components/alfred/Alfred.svelte";
import { resetIdentity } from "$tests/mocks/auth.store.mock";
import { AlfredPo } from "$tests/page-objects/Alfred.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "@testing-library/svelte";

describe("Alfred Component", () => {
  const signedOffOptions = [
    "Home",
    "Tokens",
    "Neurons",
    "Voting",
    "Launchpad",
    "Reporting",
    "Canisters",
    "Settings",
    "Log In",
  ];

  const signedInOptions = [
    "Home",
    "Tokens",
    "Neurons",
    "Voting",
    "Launchpad",
    "Reporting",
    "Canisters",
    "Settings",
    "Copy principal ID",
    "Hide Balance",
    "Log Out",
  ];

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

  it("should filter items based on input", async () => {
    const po = renderComponent();
    await po.open("mac");

    let titles = await po.getResultsTitle();
    expect(titles).toEqual(signedOffOptions);

    await po.type("repor");

    titles = await po.getResultsTitle();
    expect(titles).toEqual(["Reporting"]);

    await po.type("");

    titles = await po.getResultsTitle();
    expect(titles).toEqual(signedOffOptions);
  });

  it("should filter items based on context", async () => {
    resetIdentity();

    const po = renderComponent();
    await po.open("mac");

    const titles = await po.getResultsTitle();
    expect(titles).toEqual(signedInOptions);
  });
});
