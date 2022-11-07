/**
 * @jest-environment jsdom
 */

import { authStore } from "$lib/stores/auth.store";
import LaunchpadPage from "$routes/(app)/launchpad/+page.svelte";
import { render } from "@testing-library/svelte";
import {
  authStoreMock,
  mutableMockAuthStoreSubscribe,
} from "../../../mocks/auth.store.mock";

describe("Launchpad page", () => {
  jest
    .spyOn(authStore, "subscribe")
    .mockImplementation(mutableMockAuthStoreSubscribe);

  beforeAll(() => {
    authStoreMock.next({
      identity: undefined,
    });
  });

  afterAll(() => jest.clearAllMocks());

  it("should render sign-in if not logged in", () => {
    const { getByTestId } = render(LaunchpadPage);

    expect(getByTestId("login-button")).not.toBeNull();
  });
});
