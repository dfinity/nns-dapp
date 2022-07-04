import { AppPath } from "../../../lib/constants/routes.constants";
import {
  getLastPathDetail,
  getLastPathDetailId,
  isAppPath,
  isRoutePath,
} from "../../../lib/utils/app-path.utils";

describe("routes", () => {
  describe("isAppPath()", () => {
    it("should translate valid urls", () => {
      expect(isAppPath("/")).toBeTruthy();
      expect(isAppPath(AppPath.Accounts)).toBeTruthy();
      expect(isAppPath(`${AppPath.Wallet}/123`)).toBeTruthy();
      expect(isAppPath(`${AppPath.CanisterDetail}/123`)).toBeTruthy();
      expect(isAppPath(`${AppPath.NeuronDetail}/123`)).toBeTruthy();
      expect(isAppPath(`${AppPath.Launchpad}`)).toBeTruthy();
      expect(isAppPath(`${AppPath.ProjectDetail}/123`)).toBeTruthy();
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

  describe("isRoutePath()", () => {
    it("should compare static paths", () => {
      expect(
        isRoutePath({
          path: AppPath.Authentication,
          routePath: "/",
        })
      ).toBeTruthy();
      expect(
        isRoutePath({
          path: AppPath.Accounts,
          routePath: "/#/accounts",
        })
      ).toBeTruthy();
      expect(
        isRoutePath({
          path: AppPath.Authentication,
          routePath: "",
        })
      ).toBeFalsy();
      expect(
        isRoutePath({
          path: AppPath.Accounts,
          routePath: "/#/neurons",
        })
      ).toBeFalsy();
    });

    it("should compare dynamic paths", () => {
      expect(
        isRoutePath({
          path: AppPath.Wallet,
          routePath: "/#/wallet/0",
        })
      ).toBeTruthy();
      expect(
        isRoutePath({
          path: AppPath.Wallet,
          routePath: "/#/wallet/a0",
        })
      ).toBeTruthy();
      expect(
        isRoutePath({
          path: AppPath.Wallet,
          routePath: "/#/wallet/",
        })
      ).toBeFalsy();
      expect(
        isRoutePath({
          path: AppPath.Wallet,
          routePath: "/#/wallet",
        })
      ).toBeFalsy();
      expect(
        isRoutePath({
          path: AppPath.Wallet,
          routePath: undefined,
        })
      ).toBeFalsy();
    });
  });
});
