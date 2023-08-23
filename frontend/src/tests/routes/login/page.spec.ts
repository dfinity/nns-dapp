/**
 * @jest-environment jsdom
 */

import { AppPath } from "$lib/constants/routes.constants";
import { pageStore } from "$lib/derived/page.derived";
import App from "$routes/(login)/+page.svelte";
import { render, waitFor } from "@testing-library/svelte";
import { get } from "svelte/store";

describe("Layout", () => {
  afterAll(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it("should redirect to accounts", async () => {
    render(App);

    await waitFor(() => {
      const { path } = get(pageStore);
      expect(path).toEqual(AppPath.Accounts);
    });
  });
});
