/**
 * @jest-environment jsdom
 */

import * as proposalsApi from "$lib/api/proposals.api";
import { authStore } from "$lib/stores/auth.store";
import { LaunchpadPo } from "$tests/page-objects/Launchpad.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { toastsStore } from "@dfinity/gix-components";
import { render, waitFor } from "@testing-library/svelte";
import { get } from "svelte/store";
import Launchpad from "./LaunchpadWithLayout.svelte";
import snsPage0 from "./sns-agg-page-0-2023-09-29-1545.json";
import snsPage1 from "./sns-agg-page-1-2023-09-29-1545.json";

jest.mock("$lib/api/proposals.api");

describe("Launchpad", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    authStore.setForTesting(null);

    jest
      .spyOn(proposalsApi, "queryProposals")
      .mockImplementation(() => Promise.resolve([]));

    const mockFetch = jest.fn();
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(snsPage0),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(snsPage1),
      });
    global.fetch = mockFetch;
  });

  it("loads with prod data", async () => {
    const { container } = render(Launchpad);

    const po = LaunchpadPo.under(new JestPageObjectElement(container));

    await po.getCommittedProjectsPo().waitForContentLoaded();

    await waitFor(async () =>
      expect(
        (
          await po.getCommittedProjectsPo().getProjectCardPos()
        ).length
      ).toBeGreaterThan(0)
    );

    expect(get(toastsStore).length).toBe(0);
  });
});
