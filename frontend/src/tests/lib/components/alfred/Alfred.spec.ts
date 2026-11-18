import Alfred from "$lib/components/alfred/Alfred.svelte";
import { alfredVisibleStore } from "$lib/stores/alfred.store";
import { resetIdentity } from "$tests/mocks/auth.store.mock";
import { AlfredPo } from "$tests/page-objects/Alfred.page-object";
import { ImportSnsUtilPo } from "$tests/page-objects/ImportSnsUtil.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import { fireEvent, render } from "@testing-library/svelte";
import { get } from "svelte/store";

describe("Alfred Component", () => {
  const signedOffOptions = [
    "Home",
    "Tokens",
    "Neurons",
    "Voting",
    "Launchpad",
    "Address Book",
    "Reporting",
    "Canisters",
    "Hotkeys",
    "Settings",
    "Encode ICRC-1 Account",
    "Import SNS",
    "Log In",
  ];

  const signedInOptions = [
    "Home",
    "Tokens",
    "Neurons",
    "Voting",
    "Launchpad",
    "Address Book",
    "Reporting",
    "Canisters",
    "Hotkeys",
    "Settings",
    "Copy principal ID",
    "Hide Balance",
    "Show transaction memo",
    "Encode ICRC-1 Account",
    "Import SNS",
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

  it("should expose the panel as a modal dialog", async () => {
    const { container } = render(Alfred);
    alfredVisibleStore.set(true);
    await runResolvedPromises();

    const panel = container.querySelector('[data-tid="alfred-component"]');
    expect(panel.getAttribute("role")).toBe("dialog");
    expect(panel.getAttribute("aria-modal")).toBe("true");
    expect(panel.getAttribute("aria-label")).toBe("Quick search");
    expect(panel.hasAttribute("aria-hidden")).toBe(false);
  });

  describe("focus trap", () => {
    const renderOpen = async () => {
      const { container } = render(Alfred);
      alfredVisibleStore.set(true);
      await runResolvedPromises();
      const focusable = Array.from(
        container.querySelectorAll<HTMLElement>(
          '[data-tid="alfred-component"] .menu input, [data-tid="alfred-component"] .menu button'
        )
      );
      return { first: focusable[0], last: focusable[focusable.length - 1] };
    };

    const pressTab = (shiftKey = false) =>
      fireEvent.keyDown(window, { key: "Tab", shiftKey });

    it("should move from the last control to the first one", async () => {
      const { first, last } = await renderOpen();
      last.focus();

      await pressTab();

      expect(document.activeElement).toBe(first);
    });

    it("should move from the first control to the last one with Shift", async () => {
      const { first, last } = await renderOpen();
      first.focus();

      await pressTab(true);

      expect(document.activeElement).toBe(last);
    });

    it("should keep the focus in the panel if no control is focusable", async () => {
      const { container } = render(Alfred);
      alfredVisibleStore.set(true);
      await runResolvedPromises();
      container
        .querySelectorAll<
          HTMLInputElement | HTMLButtonElement
        >("[data-tid='alfred-component'] .menu input, [data-tid='alfred-component'] .menu button")
        .forEach((element) => (element.disabled = true));
      (document.activeElement as HTMLElement | null)?.blur();

      await pressTab();

      expect(document.activeElement).toBe(
        container.querySelector("[data-tid='alfred-component'] .menu")
      );
    });

    it("should move the focus into the panel if it is outside", async () => {
      const { first } = await renderOpen();
      (document.activeElement as HTMLElement | null)?.blur();

      await pressTab();

      expect(document.activeElement).toBe(first);
    });
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

  it("should open when another component sets the store", async () => {
    const po = renderComponent();
    expect(await po.isPresent()).toBe(false);

    alfredVisibleStore.set(true);
    await runResolvedPromises();

    expect(await po.isPresent()).toBe(true);
  });

  it("should reset the store when it closes", async () => {
    const po = renderComponent();

    await po.open("mac");
    expect(get(alfredVisibleStore)).toBe(true);

    await po.close();
    vi.advanceTimersByTime(500);

    expect(get(alfredVisibleStore)).toBe(false);
  });

  it("should clear the query when it opens again", async () => {
    const po = renderComponent();
    await po.open("mac");

    await po.type("repor");
    expect(await po.getResultsTitle()).toEqual(["Reporting"]);

    await po.close();
    vi.advanceTimersByTime(500);

    alfredVisibleStore.set(true);
    await runResolvedPromises();

    expect(await po.getResultsTitle()).toEqual(signedOffOptions);
  });

  it("should open the Import SNS util", async () => {
    const po = renderComponent();
    await po.open("mac");
    await po.type("import sns");

    const [result] = await po.getResultsPo();
    await result.select();

    expect(await ImportSnsUtilPo.under(po.root).isPresent()).toBe(true);
  });

  it("should not select a result when the user presses Enter in a util", async () => {
    const po = renderComponent();
    await po.open("mac");
    await po.type("import sns");

    const [result] = await po.getResultsPo();
    await result.select();
    await po.pressEnter();
    vi.advanceTimersByTime(500);

    expect(await po.isPresent()).toBe(true);
    expect(await ImportSnsUtilPo.under(po.root).isPresent()).toBe(true);
  });
});
