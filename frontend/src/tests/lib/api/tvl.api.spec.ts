import { queryTVL } from "$lib/api/tvl.api.cjs";
import { TVLCanister } from "$lib/canisters/tvl/tvl.canister";
import { ACTOR_PARAMS } from "$lib/constants/canister-actor.constants";
import { AnonymousIdentity } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";
import mock from "jest-mock-extended/lib/Mock";

jest.mock("@dfinity/agent", () => {
  const agent = jest.requireActual("@dfinity/agent");
  return {
    ...agent,
    HttpAgent: jest.fn().mockImplementation(() => {
      return {};
    }),
  };
});

const defaultTVLCanisterId = Principal.fromText("ewh3f-3qaaa-aaaap-aazjq-cai");
jest.mock("$lib/constants/canister-ids.constants");

describe("tvl api", () => {
  const tvlCanisterMock = mock<TVLCanister>();
  const params = {
    identity: new AnonymousIdentity(),
    certified: true,
    ...ACTOR_PARAMS,
  };

  const result = {
    tvl: 1n,
    time_sec: 0n,
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.spyOn(TVLCanister, "create").mockImplementation(() => tvlCanisterMock);
  });

  describe("with tvl canister id set", () => {
    beforeEach(async () => {
      // `import` returns "readonly" properties.
      // casting is needed to change the value
      const canisterIds = (await import(
        "$lib/constants/canister-ids.constants"
      )) as { TVL_CANISTER_ID: Principal };
      canisterIds.TVL_CANISTER_ID = defaultTVLCanisterId;
    });

    it("returns the tvl", async () => {
      const getTVLSpy = tvlCanisterMock.getTVL.mockResolvedValue(result);

      const response = await queryTVL(params);

      expect(response).toEqual(result);

      expect(getTVLSpy).toBeCalled();
    });

    it("throws an error if no token", () => {
      tvlCanisterMock.getTVL.mockImplementation(async () => {
        throw new Error();
      });

      const call = () => queryTVL(params);

      expect(call).rejects.toThrowError();
    });
  });

  describe("with tvl canister id not set", () => {
    beforeEach(async () => {
      // `import` returns "readonly" properties.
      // casting is needed to change the value
      const canisterIds = (await import(
        "$lib/constants/canister-ids.constants"
      )) as { TVL_CANISTER_ID: Principal };
      canisterIds.TVL_CANISTER_ID = undefined;
    });

    it("returns undefined", async () => {
      const getTVLSpy = tvlCanisterMock.getTVL.mockResolvedValue(result);

      const response = await queryTVL(params);

      expect(response).toBeUndefined();
      expect(getTVLSpy).not.toBeCalled();
    });
  });
});
