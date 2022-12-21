/**
 * @jest-environment jsdom
 */

import { page } from "$app/stores";
import { AppPath } from "$lib/constants/routes.constants";
import { pageStore } from "$lib/derived/page.derived";
import Login from "$lib/pages/Login.svelte";
import { authStore } from "$lib/stores/auth.store";
import { render } from "@testing-library/svelte";
import { get } from "svelte/store";
import {
  authStoreMock,
  mockAuthStoreSubscribe,
  mutableMockAuthStoreSubscribe,
} from "../../mocks/auth.store.mock";

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

    it("should redirect to proposal detail for backwards compatibility", () => {
      const proposalId = "4";

      window.history.pushState(
        {},
        "Proposal detail",
        `/#/proposal/${proposalId}`
      );

      render(Login);
      const { path } = get(pageStore);
      expect(path).toEqual(AppPath.Proposal);

      const {
        data: { proposal },
      } = get(page);
      expect(proposal).toEqual(proposalId);

      window.history.back();
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
