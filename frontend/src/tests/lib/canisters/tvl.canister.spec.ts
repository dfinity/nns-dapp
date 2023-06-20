import { createAgent } from "$lib/api/agent.api";
import { TVLCanister } from "$lib/canisters/tvl/tvl.canister";
import type { _SERVICE as TVLService } from "$lib/canisters/tvl/tvl.types";
import { mockIdentity } from "$tests/mocks/auth.store.mock";
import { Principal } from "@dfinity/principal";
import { mock } from "jest-mock-extended";

describe("TVL canister", () => {
  const createTVLCanister = async (service: TVLService) => {
    const defaultAgent = await createAgent({ identity: mockIdentity });
    const canisterId = Principal.fromText("aaaaa-aa");

    return TVLCanister.create({
      agent: defaultAgent,
      certifiedServiceOverride: service,
      canisterId,
    });
  };

  const tvl = {
    tvl: 123n,
    time_sec: 456n,
  };

  const response = {
    Ok: tvl,
  };

  it("should return result on success", async () => {
    const service = mock<TVLService>();
    service.get_tvl.mockResolvedValue(response);

    const canister = await createTVLCanister(service);

    const res = await canister.getTVL({ certified: true });

    expect(res).toEqual(tvl);
  });

  it("should return result with currency on success", async () => {
    const service = mock<TVLService>();
    service.get_tvl.mockResolvedValue(response);

    const canister = await createTVLCanister(service);

    const currency = { CNY: null };

    const res = await canister.getTVL({ certified: true, currency });

    expect(res).toEqual({
      ...tvl,
      currency,
    });
  });

  it("should throw an error", async () => {
    const message = "Test";

    const service = mock<TVLService>();
    service.get_tvl.mockResolvedValue({ Err: { message } });

    const canister = await createTVLCanister(service);

    const call = async () => canister.getTVL({ certified: true });

    await expect(call).rejects.toThrow(message);
  });
});
