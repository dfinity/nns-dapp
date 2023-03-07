/**
 * @jest-environment jsdom
 */

import { querySnsMetrics } from "../../../lib/api/sns-swap-metrics.api";
import { mockPrincipal } from "../../mocks/auth.store.mock";

describe("sns-swap-metrics.api", () => {
  it("should query raw metrics with swapCanisterId", async () => {
    const mockFetch = jest.fn();
    mockFetch.mockReturnValueOnce(
      Promise.resolve({
        ok: true,
        text: () => Promise.resolve("test"),
      })
    );
    global.fetch = mockFetch;

    const swapCanisterId = mockPrincipal;
    const result = await querySnsMetrics({ swapCanisterId });

    expect(result).toEqual("test");
    expect(mockFetch).toBeCalledTimes(1);
    expect(mockFetch).toBeCalledWith(
      expect.stringContaining(swapCanisterId.toText())
    );
  });
});
