/**
 * @jest-environment jsdom
 */

import { page } from "$app/stores";
import { AppPath } from "$lib/constants/routes.constants";
import { pageStore } from "$lib/derived/page.derived";
import Auth from "$lib/pages/Auth.svelte";
import { authStore } from "$lib/stores/auth.store";
import { render } from "@testing-library/svelte";
import { get } from "svelte/store";
import {
  authStoreMock,
  mockAuthStoreSubscribe,
  mutableMockAuthStoreSubscribe,
} from "../../mocks/auth.store.mock";

describe("Auth", () => {
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
      render(Auth);
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
      render(Auth);
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

      render(Auth);
      const { path } = get(pageStore);
      expect(path).toEqual(AppPath.Proposal);

      const {
        data: { proposal },
      } = get(page);
      expect(proposal).toEqual(proposalId);

      window.history.back();
    });
  });
});
