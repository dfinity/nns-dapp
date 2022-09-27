import { AppPath, CONTEXT_PATH } from "../../../lib/constants/routes.constants";
import {
  changePathContext,
  getContextDetailsFromPath,
  getContextFromPath,
  getLastPathDetail,
  getLastPathDetailId,
  getParentPathDetail,
  isAppPath,
  isContextPath,
  isRoutePath,
} from "../../../lib/utils/app-path.utils";

describe("routes", () => {
  describe("isAppPath()", () => {
    it("should translate valid urls", () => {
      expect(isAppPath("/")).toBeTruthy();
      expect(isAppPath(AppPath.LegacyAccounts)).toBeTruthy();
      expect(isAppPath(`${AppPath.LegacyWallet}/123`)).toBeTruthy();
      expect(isAppPath(`${AppPath.CanisterDetail}/123`)).toBeTruthy();
      expect(isAppPath(`${AppPath.LegacyNeuronDetail}/123`)).toBeTruthy();
      expect(isAppPath(`${AppPath.Launchpad}`)).toBeTruthy();
      expect(isAppPath(`${AppPath.ProjectDetail}/123`)).toBeTruthy();
      expect(isAppPath(`${CONTEXT_PATH}/123/neurons`)).toBeTruthy();
      expect(isAppPath(`${CONTEXT_PATH}/123/neuron/1234`)).toBeTruthy();
      expect(isAppPath(`${CONTEXT_PATH}/123/accounts`)).toBeTruthy();
      expect(isAppPath(`${CONTEXT_PATH}/123/wallet/1234`)).toBeTruthy();
      const t =
        "/#/u/qvhpv-4qaaa-aaaaa-aaagq-cai/wallet/8703f867c97952906b676578c2cc9923d26d7aba865008b4478ec9c94f41c2f9";
      expect(isAppPath(t)).toBeTruthy();
    });

    it("should return null for invalid urls", () => {
      expect(isAppPath("/some-invalid-url")).toBeFalsy();
      expect(isAppPath("//")).toBeFalsy();
      expect(isAppPath(`${AppPath.Wallet}/`)).toBeFalsy();
    });
  });

  describe("getLastPathDetailId", () => {
    beforeAll(() => {
      // Avoid to print errors during test
      jest.spyOn(console, "error").mockImplementation(() => undefined);
    });
    afterAll(() => jest.clearAllMocks());
    it("should get id from valid path", () => {
      expect(getLastPathDetailId("/#/neuron/123")).toBe(BigInt(123));
      expect(getLastPathDetailId("/neuron/123")).toBe(BigInt(123));
      expect(getLastPathDetailId("/proposal/123")).toBe(BigInt(123));
      expect(getLastPathDetailId("/#/neuron/0")).toBe(BigInt(0));
      expect(getLastPathDetailId("/1234")).toBe(BigInt(1234));
    });

    it("should not get neuronId from invalid path", () => {
      expect(getLastPathDetailId("/#/neuron/")).toBeUndefined();
      expect(getLastPathDetailId("/#/neuron/1.5")).toBeUndefined();
      expect(getLastPathDetailId("/neuron/1.5")).toBeUndefined();
      expect(getLastPathDetailId("/")).toBeUndefined();
      expect(getLastPathDetailId("/#/neuron/123n")).toBeUndefined();
    });
  });

  describe("getLastPathDetail", () => {
    beforeAll(() => {
      // Avoid to print errors during test
      jest.spyOn(console, "error").mockImplementation(() => undefined);
    });
    afterAll(() => jest.clearAllMocks());
    it("should get detail from valid path", () => {
      expect(getLastPathDetail("/#/neuron/123_abc")).toBe("123_abc");
      expect(getLastPathDetail("/neuron/123_abc")).toBe("123_abc");
      expect(getLastPathDetail("/proposal/123_abc")).toBe("123_abc");
      expect(getLastPathDetail("/#/neuron/0")).toBe("0");
      expect(getLastPathDetail("/123_abc")).toBe("123_abc");
    });

    it("should get empty detail for an invalid path", () => {
      expect(getLastPathDetail("/#/neuron/")).toEqual("");
      expect(getLastPathDetail("/neuron/")).toEqual("");
      expect(getLastPathDetail("/")).toEqual("");
    });

    it("should not get detail for an undefined path", () => {
      expect(getLastPathDetail(undefined)).toBeUndefined();
    });
  });

  describe("getParentPathDetail", () => {
    beforeAll(() => {
      // Avoid to print errors during test
      jest.spyOn(console, "error").mockImplementation(() => undefined);
    });
    afterAll(() => jest.clearAllMocks());
    it("should get detail from valid path", () => {
      expect(getParentPathDetail("/#/u/123/neuron/123_abc")).toBe("123");
      expect(getParentPathDetail("/#/project/123/neuron/123_abc")).toBe("123");
      expect(getParentPathDetail("/#/project/123/proposal/123_abc")).toBe(
        "123"
      );
    });

    it("should get empty detail for an invalid path", () => {
      expect(getParentPathDetail("/project/123")).toBeUndefined();
      expect(getParentPathDetail("/#/neuron/")).toBeUndefined();
      expect(getParentPathDetail("/neuron/")).toBeUndefined();
      expect(getParentPathDetail("/")).toBeUndefined();
    });

    it("should not get detail for an undefined path", () => {
      expect(getLastPathDetail(undefined)).toBeUndefined();
    });
  });

  describe("isRoutePath()", () => {
    it("should compare static paths", () => {
      expect(
        isRoutePath({
          paths: [AppPath.Authentication],
          routePath: "/",
        })
      ).toBeTruthy();
      expect(
        isRoutePath({
          paths: [AppPath.LegacyAccounts],
          routePath: "/#/accounts",
        })
      ).toBeTruthy();
      expect(
        isRoutePath({
          paths: [AppPath.Authentication],
          routePath: "",
        })
      ).toBeFalsy();
      expect(
        isRoutePath({
          paths: [AppPath.Accounts, AppPath.Canisters],
          routePath: "/#/neurons",
        })
      ).toBeFalsy();
    });

    it("should compare dynamic paths", () => {
      expect(
        isRoutePath({
          paths: [AppPath.LegacyWallet],
          routePath: "/#/wallet/0",
        })
      ).toBeTruthy();
      expect(
        isRoutePath({
          paths: [AppPath.Wallet],
          routePath:
            "/#/u/qvhpv-4qaaa-aaaaa-aaagq-cai/wallet/8703f867c97952906b676578c2cc9923d26d7aba865008b4478ec9c94f41c2f9",
        })
      ).toBeTruthy();
      expect(
        isRoutePath({
          paths: [AppPath.LegacyWallet],
          routePath: "/#/wallet/a0",
        })
      ).toBeTruthy();
      expect(
        isRoutePath({
          paths: [AppPath.LegacyWallet],
          routePath: "/#/wallet/",
        })
      ).toBeFalsy();
      expect(
        isRoutePath({
          paths: [AppPath.LegacyWallet, AppPath.Wallet],
          routePath: "/#/wallet",
        })
      ).toBeFalsy();
      expect(
        isRoutePath({
          paths: [AppPath.LegacyWallet],
          routePath: undefined,
        })
      ).toBeFalsy();
    });
  });

  describe("isContextPath", () => {
    it("returns true for context related paths", () => {
      expect(isContextPath(CONTEXT_PATH + "/123")).toBeTruthy();
      expect(isContextPath(CONTEXT_PATH + "/123/neuron/123")).toBeTruthy();
    });

    it("returns false for non context related paths", () => {
      expect(isContextPath(AppPath.Accounts)).toBeFalsy();
      expect(isContextPath(AppPath.Wallet)).toBeFalsy();
      expect(isContextPath(AppPath.Proposals)).toBeFalsy();
      expect(isContextPath(AppPath.ProposalDetail + "/123")).toBeFalsy();
      expect(isContextPath(AppPath.Authentication)).toBeFalsy();
    });
  });

  describe("getContextFromPath", () => {
    it("returns values after `/#/u` parent path", () => {
      expect(getContextFromPath("/#/u/aaaaa-aa")).toBe("aaaaa-aa");
      expect(getContextFromPath("/#/u/aaaaa-aa/neurons")).toBe("aaaaa-aa");
      expect(getContextFromPath("/#/u/aaaaa-aa/accounts")).toBe("aaaaa-aa");
      expect(
        getContextFromPath("/#/u/wxns6-qiaaa-aaaaa-aaaqa-cai/neurons")
      ).toBe("wxns6-qiaaa-aaaaa-aaaqa-cai");
      expect(getContextFromPath("/#/u/123444")).toBe("123444");
    });

    it("returns undefined when no context", () => {
      expect(getContextFromPath("/")).toBeUndefined();
      expect(getContextFromPath("/u")).toBeUndefined();
      expect(getContextFromPath("/project/aaaaa-aa")).toBeUndefined();
      expect(getContextFromPath("/neuron/aaaa")).toBeUndefined();
      expect(getContextFromPath("#/u/aaaaa-aa")).toBeUndefined();
    });
  });

  describe("getContextDetailsFromPath", () => {
    it("returns the rest of the path after the context", () => {
      expect(getContextDetailsFromPath("/#/u/aaaaa-aa")).toBe("");
      expect(getContextDetailsFromPath("/#/u/aaaaa-aa/neurons")).toBe(
        "/neurons"
      );
      expect(getContextDetailsFromPath("/#/u/aaaaa-aa/accounts")).toBe(
        "/accounts"
      );
      expect(
        getContextDetailsFromPath("/#/u/wxns6-qiaaa-aaaaa-aaaqa-cai/neurons")
      ).toBe("/neurons");
      expect(getContextDetailsFromPath("/#/u/123444")).toBe("");
    });
  });

  describe("changePathContext", () => {
    it("returns same path with new context", () => {
      const path1 = `${CONTEXT_PATH}/aaaaa-aa/neuron/12344`;
      const path2 = `${CONTEXT_PATH}/aaaaa-aa/neurons`;
      const path3 = `${CONTEXT_PATH}/aaaaa-aa/accounts`;
      const newContext = "bbbbb-bb";
      expect(changePathContext({ path: path1, newContext })).toBe(
        `${CONTEXT_PATH}/${newContext}/neuron/12344`
      );
      expect(changePathContext({ path: path2, newContext })).toBe(
        `${CONTEXT_PATH}/${newContext}/neurons`
      );
      expect(changePathContext({ path: path3, newContext })).toBe(
        `${CONTEXT_PATH}/${newContext}/accounts`
      );
    });

    it("returns path with context for exceptions", () => {
      const path1 = "/#/neuron/12344";
      const path2 = "/#/neurons";
      const path3 = "/#/accounts";
      const path4 = "/#/wallet/12344";
      const newContext = "bbbbb-bb";
      expect(changePathContext({ path: path1, newContext })).toBe(
        `${CONTEXT_PATH}/${newContext}/neuron/12344`
      );
      expect(changePathContext({ path: path2, newContext })).toBe(
        `${CONTEXT_PATH}/${newContext}/neurons`
      );
      expect(changePathContext({ path: path3, newContext })).toBe(
        `${CONTEXT_PATH}/${newContext}/accounts`
      );
      expect(changePathContext({ path: path4, newContext })).toBe(
        `${CONTEXT_PATH}/${newContext}/wallet/12344`
      );
    });

    it("returns same path if it's not a context path", () => {
      const path1 = AppPath.Canisters;
      const path2 = AppPath.Launchpad;
      const path3 = `${AppPath.CanisterDetail}/12345`;
      const newContext = "bbbbb-bb";
      expect(changePathContext({ path: path1, newContext })).toBe(path1);
      expect(changePathContext({ path: path2, newContext })).toBe(path2);
      expect(changePathContext({ path: path3, newContext })).toBe(path3);
    });
  });

  it("returns undefined if path is not context dependent", () => {
    expect(getContextDetailsFromPath("/")).toBeUndefined();
    expect(getContextDetailsFromPath("/#/neurons")).toBeUndefined();
    expect(getContextDetailsFromPath("/#/u")).toBeUndefined();
    expect(getContextDetailsFromPath("/#/acconts/aaa/neurons")).toBeUndefined();
    expect(getContextDetailsFromPath("/#/project/aaaa-aa")).toBeUndefined();
  });
});
