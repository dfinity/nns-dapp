/**
 * @jest-environment jsdom
 */

import { authStore } from "$lib/stores/auth.store";
import ProjectPage from "$routes/(app)/project/+page.svelte";
import { render } from "@testing-library/svelte";
import {
  authStoreMock,
  mutableMockAuthStoreSubscribe,
} from "../../../mocks/auth.store.mock";

describe("Project page", () => {
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
    const { getByTestId } = render(ProjectPage, {
      props: {
        data: {
          project: "test",
        },
      },
    });

    expect(getByTestId("login-button")).not.toBeNull();
  });
});
