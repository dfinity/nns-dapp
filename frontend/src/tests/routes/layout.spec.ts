import * as icpSwapApi from "$lib/api/icp-swap.api";
import { CKUSDC_UNIVERSE_CANISTER_ID } from "$lib/constants/ckusdc-canister-ids.constants";
import { initAppPrivateDataProxy } from "$lib/proxy/app.services.proxy";
import * as analytics from "$lib/services/analytics.services";
import { initAuthWorker } from "$lib/services/worker-auth.services";
import { icpSwapTickersStore } from "$lib/stores/icp-swap.store";
import { stakingRewardsStore } from "$lib/stores/staking-rewards.store";
import App from "$routes/+layout.svelte";
import { resetIdentity, setNoIdentity } from "$tests/mocks/auth.store.mock";
import { mockIcpSwapTicker } from "$tests/mocks/icp-swap.mock";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import { toastsStore } from "@dfinity/gix-components";
import { render } from "@testing-library/svelte";
import { get } from "svelte/store";

const tickers = [
  {
    ...mockIcpSwapTicker,
    base_id: CKUSDC_UNIVERSE_CANISTER_ID.toText(),
    last_price: "10.00",
  },
];

vi.mock("$lib/services/worker-auth.services", () => ({
  initAuthWorker: vi.fn(() =>
    Promise.resolve({
      syncAuthIdle: () => {
        // Do nothing
      },
    })
  ),
}));

vi.mock("$lib/services/app.services", () => ({
  initApp: vi.fn(() => Promise.resolve()),
}));

vi.mock("$lib/proxy/app.services.proxy");

describe("Layout", () => {
  beforeEach(() => {
    setNoIdentity();
    vi.spyOn(icpSwapApi, "queryIcpSwapTickers").mockResolvedValue(tickers);
  });

  it("should init the app after sign in", async () => {
    expect(initAppPrivateDataProxy).not.toHaveBeenCalled();

    render(App);

    resetIdentity();
    await runResolvedPromises();

    expect(initAppPrivateDataProxy).toHaveBeenCalled();
  });

  it("should register auth worker sync after sign in", async () => {
    expect(initAuthWorker).not.toHaveBeenCalled();

    render(App);

    resetIdentity();
    await runResolvedPromises();

    expect(initAuthWorker).toHaveBeenCalled();
  });

  it("should reset toasts on sign in", async () => {
    const spy = vi.spyOn(toastsStore, "reset");
    expect(spy).not.toBeCalled();

    render(App);

    resetIdentity();
    await runResolvedPromises();

    expect(spy).toBeCalled();
  });

  it("should initialize analytics tracking on mount", async () => {
    const initAnalyticsSpy = vi.spyOn(analytics, "initAnalytics");

    expect(initAnalyticsSpy).not.toHaveBeenCalled();

    render(App);

    expect(initAnalyticsSpy).toHaveBeenCalledTimes(1);

    resetIdentity();
    await runResolvedPromises();

    expect(initAnalyticsSpy).toHaveBeenCalledTimes(1);
  });

  it("should load ICP Swap tickers", async () => {
    expect(get(icpSwapTickersStore)).toBeUndefined();
    expect(icpSwapApi.queryIcpSwapTickers).toBeCalledTimes(0);

    render(App);
    await runResolvedPromises();

    expect(get(icpSwapTickersStore)).toEqual(tickers);
    expect(icpSwapApi.queryIcpSwapTickers).toBeCalledTimes(1);
  });

  it("should load Staking Rewards", async () => {
    expect(get(stakingRewardsStore)).toBeUndefined();

    render(App);
    await runResolvedPromises();

    expect(get(stakingRewardsStore)).toEqual({
      error: "Not authorized.",
      loading: false,
    });

    resetIdentity();
    await runResolvedPromises();

    expect(get(stakingRewardsStore)).toEqual({
      loading: true,
    });
  });
});
