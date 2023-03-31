/**
 * @jest-environment jsdom
 */

import Settings from "$lib/routes/Settings.svelte";
import { authRemainingTimeStore, authStore } from "$lib/stores/auth.store";
import { layoutTitleStore } from "$lib/stores/layout.store";
import {
  mockAuthStoreSubscribe,
  mockPrincipalText,
} from "$tests/mocks/auth.store.mock";
import en from "$tests/mocks/i18n.mock";
import { render } from "@testing-library/svelte";
import { get } from "svelte/store";

describe("Settings", () => {
  beforeAll(() => {
    jest
      .spyOn(authStore, "subscribe")
      .mockImplementation(mockAuthStoreSubscribe);
  });

  it("should set title", async () => {
    const titleBefore = get(layoutTitleStore);
    expect(titleBefore).toEqual("");

    render(Settings);

    await (() => expect(get(layoutTitleStore)).toEqual(en.navigation.settings));
  });

  it("should render principal", () => {
    const { getByText } = render(Settings);

    expect(getByText(mockPrincipalText)).toBeInTheDocument();
  });

  it("should render a skeleton while loading expired session time", () => {
    const { getByTestId } = render(Settings);

    const element = getByTestId("skeleton-text");
    expect(element).not.toBeNull();
  });

  it("should render a dynamic expired session time", () => {
    const { getByTestId, rerender } = render(Settings);

    const element = getByTestId("session-duration");
    expect(element?.textContent.trim() ?? "").toEqual("");

    authRemainingTimeStore.set(250000);

    rerender(Settings);

    const element1 = getByTestId("session-duration");
    expect(element1?.textContent ?? "").toEqual("4 minutes");

    authRemainingTimeStore.set(20000);

    rerender(Settings);

    const element2 = getByTestId("session-duration");
    expect(element2.textContent ?? "").toEqual("20 seconds");

    authRemainingTimeStore.set(0);

    rerender(Settings);

    const element3 = getByTestId("session-duration");
    expect(element3.textContent ?? "").toEqual("0");
  });
});
