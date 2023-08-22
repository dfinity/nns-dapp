/**
 * @jest-environment jsdom
 */

import * as proposalsApi from "$lib/api/proposals.api";
import { authStore } from "$lib/stores/auth.store";
import tenAggregatedSnses from "$tests/mocks/sns-aggregator.mock.json";
import { LaunchpadPo } from "$tests/page-objects/Launchpad.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { toastsStore } from "@dfinity/gix-components";
import { render, waitFor } from "@testing-library/svelte";
import { get } from "svelte/store";
import Launchpad from "./LaunchpadWithLayout.svelte";

jest.mock("$lib/api/proposals.api");

describe("Launchpad", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    authStore.setForTesting(undefined);

    jest
      .spyOn(proposalsApi, "queryProposals")
      .mockImplementation(() => Promise.resolve([]));

    const mockFetch = jest.fn();
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(tenAggregatedSnses),
      })
      .mockReturnValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
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
