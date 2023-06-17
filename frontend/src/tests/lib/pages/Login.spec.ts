/**
 * @jest-environment jsdom
 */

import { AppPath } from "$lib/constants/routes.constants";
import { pageStore } from "$lib/derived/page.derived";
import Login from "$lib/pages/Login.svelte";
import { authStore } from "$lib/stores/auth.store";
import {
  authStoreMock,
  mockAuthStoreSubscribe,
  mutableMockAuthStoreSubscribe,
} from "$tests/mocks/auth.store.mock";
import { render } from "@testing-library/svelte";
import { get } from "svelte/store";

describe("Login", () => {
  describe("Manual sign-in", () => {
    beforeAll(() => {
      jest
        .spyOn(authStore, "subscribe")
        .mockImplementation(mutableMockAuthStoreSubscribe);

      authStoreMock.next({
        identity: undefined,
      });
    });

    afterAll(() => {
      jest.clearAllMocks();
      jest.restoreAllMocks();
    });

    it("should not redirect to account", () => {
      render(Login);
      const { path } = get(pageStore);
      expect(path).toBeNull();
    });
  });

  describe("Auto sign-in", () => {
    beforeAll(() => {
      jest
        .spyOn(authStore, "subscribe")
        .mockImplementation(mockAuthStoreSubscribe);
    });

    afterAll(() => {
      jest.clearAllMocks();
      jest.restoreAllMocks();
    });

    it("should redirect to account", () => {
      render(Login);
      const { path } = get(pageStore);
      expect(path).toEqual(AppPath.Accounts);
    });
  });

  describe("Links", () => {
    const shouldRenderLink = ({
      path,
      testId,
    }: {
      path: AppPath;
      testId: string;
    }) => {
      const { getByTestId } = render(Login);
      expect(
        (getByTestId(testId) as HTMLLinkElement | null)?.getAttribute("href")
      ).toEqual(path);
    };

    it("should render a link to accounts", () =>
      shouldRenderLink({
        testId: "auth-link-accounts",
        path: AppPath.Accounts,
      }));
    it("should render a link to neurons", () =>
      shouldRenderLink({ testId: "auth-link-neurons", path: AppPath.Neurons }));
    it("should render a link to proposals", () =>
      shouldRenderLink({
        testId: "auth-link-proposals",
        path: AppPath.Proposals,
      }));
  });
});
