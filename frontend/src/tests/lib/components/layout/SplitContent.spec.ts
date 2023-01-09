/**
 * @jest-environment jsdom
 */

import SplitContent from "$lib/components/layout/SplitContent.svelte";
import { authStore } from "$lib/stores/auth.store";
import { layoutTitleStore } from "$lib/stores/layout.store";
import { render } from "@testing-library/svelte";
import {
  authStoreMock,
  mockIdentity,
  mutableMockAuthStoreSubscribe,
} from "../../../mocks/auth.store.mock";

describe("SplitContent", () => {
  jest
    .spyOn(authStore, "subscribe")
    .mockImplementation(mutableMockAuthStoreSubscribe);

  beforeAll(() => layoutTitleStore.set("the header"));

  it("should render the universe nav", () => {
    const { getByTestId } = render(SplitContent);
    expect(getByTestId("select-universe-nav-title")).not.toBeNull();
  });

  it("should render a header", () => {
    const { getByText } = render(SplitContent);

    expect(getByText("the header")).toBeInTheDocument();
  });

  it("should render the login button in the header", () => {
    authStoreMock.next({
      identity: undefined,
    });

    const { getByTestId } = render(SplitContent);
    expect(getByTestId("toolbar-login")).not.toBeNull();
  });

  it("should render the account menu", () => {
    authStoreMock.next({
      identity: mockIdentity,
    });

    const { getByTestId } = render(SplitContent);
    expect(getByTestId("account-menu")).not.toBeNull();
  });
});
