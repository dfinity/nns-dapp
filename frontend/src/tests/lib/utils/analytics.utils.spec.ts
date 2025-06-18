import { slugifyTitle } from "$lib/utils/analytics.utils";

describe("analytics.utils", () => {
  describe("slugifyTitle", () => {
    it("should convert camelCase to kebab-case", () => {
      expect(slugifyTitle("ckBTC")).toBe("ck-btc");
    });

    it("should remove special characters", () => {
      expect(slugifyTitle("c@#kBTC")).toBe("ck-btc");
    });

    it("should replace spaces with hyphens", () => {
      expect(slugifyTitle("Internet Computer")).toBe("internet-computer");
    });

    it("should remove leading and trailing hyphens", () => {
      expect(slugifyTitle("-Internet Computer ")).toBe("internet-computer");
import { transformUrlForAnalytics } from "$lib/utils/analytics.utils";

describe("analytics.utils", () => {
  describe("transformUrlForAnalytics", () => {
    describe("Project page transformations", () => {
      it("should transform project parameter", () => {
        const url = new URL(
          "http://localhost:8080/project/?project=ajuq4-ruaaa-aaaaa-qaaga-cai"
        );
        const result = transformUrlForAnalytics(url);
        expect(result).toBe("/project/ajuq4-ruaaa-aaaaa-qaaga-cai");
      });

      it("should return original pathname when project parameter is missing", () => {
        const urlWithTrailingSlash = new URL("http://localhost:8080/project/");
        expect(transformUrlForAnalytics(urlWithTrailingSlash)).toBe(
          "/project/"
        );

        const urlWithoutTrailingSlash = new URL(
          "http://localhost:8080/project"
        );
        expect(transformUrlForAnalytics(urlWithoutTrailingSlash)).toBe(
          "/project"
        );
      });

      it("should return original pathname when project parameter is empty", () => {
        const url = new URL("http://localhost:8080/project/?project=");
        const result = transformUrlForAnalytics(url);
        expect(result).toBe("/project/");
      });
    });

    describe("Proposal page transformations", () => {
      it("should transform universe and proposal parameters", () => {
        const url = new URL(
          "http://localhost:8080/proposal/?u=qsgjb-riaaa-aaaaa-aaaga-cai&proposal=14"
        );
        const result = transformUrlForAnalytics(url);
        expect(result).toBe(
          "/proposal/universe/qsgjb-riaaa-aaaaa-aaaga-cai/proposal/14"
        );
      });

      it("should transform parameters in different order", () => {
        const url = new URL(
          "http://localhost:8080/proposal/?proposal=14&u=qsgjb-riaaa-aaaaa-aaaga-cai"
        );
        const result = transformUrlForAnalytics(url);
        expect(result).toBe(
          "/proposal/universe/qsgjb-riaaa-aaaaa-aaaga-cai/proposal/14"
        );
      });

      it("should return original pathname when universe parameter is missing", () => {
        const url = new URL("http://localhost:8080/proposal/?proposal=14");
        const result = transformUrlForAnalytics(url);
        expect(result).toBe("/proposal/");
      });

      it("should return original pathname when proposal parameter is missing", () => {
        const url = new URL(
          "http://localhost:8080/proposal/?u=qsgjb-riaaa-aaaaa-aaaga-cai"
        );
        const result = transformUrlForAnalytics(url);
        expect(result).toBe("/proposal/");
      });

      it("should return original pathname when both parameters are missing", () => {
        const url = new URL("http://localhost:8080/proposal/");
        const result = transformUrlForAnalytics(url);
        expect(result).toBe("/proposal/");
      });
    });

    describe("Neurons page transformations", () => {
      it("should transform universe parameter", () => {
        const url = new URL(
          "http://localhost:8080/neurons/?u=qsgjb-riaaa-aaaaa-aaaga-cai"
        );
        const result = transformUrlForAnalytics(url);
        expect(result).toBe("/neurons/qsgjb-riaaa-aaaaa-aaaga-cai");
      });

      it("should not track neuron parameter", () => {
        const url = new URL(
          "http://localhost:8080/neurons/?u=qsgjb-riaaa-aaaaa-aaaga-cai&neuron=12345"
        );
        const result = transformUrlForAnalytics(url);
        expect(result).toBe("/neurons/qsgjb-riaaa-aaaaa-aaaga-cai");
      });

      it("should return original pathname when universe parameter is missing", () => {
        const url = new URL("http://localhost:8080/neurons/");
        const result = transformUrlForAnalytics(url);
        expect(result).toBe("/neurons/");
      });

      it("should return original pathname when universe parameter is empty", () => {
        const url = new URL("http://localhost:8080/neurons/?u=");
        const result = transformUrlForAnalytics(url);
        expect(result).toBe("/neurons/");
      });
    });

    describe("Accounts page transformations", () => {
      it("should transform universe parameter", () => {
        const url = new URL(
          "http://localhost:8080/accounts/?u=qsgjb-riaaa-aaaaa-aaaga-cai"
        );
        const result = transformUrlForAnalytics(url);
        expect(result).toBe("/accounts/qsgjb-riaaa-aaaaa-aaaga-cai");
      });

      it("should return original pathname when universe parameter is missing", () => {
        const url = new URL("http://localhost:8080/accounts/");
        const result = transformUrlForAnalytics(url);
        expect(result).toBe("/accounts/");
      });

      it("should return original pathname when universe parameter is empty", () => {
        const url = new URL("http://localhost:8080/accounts/?u=");
        const result = transformUrlForAnalytics(url);
        expect(result).toBe("/accounts/");
      });
    });

    describe("Wallet page transformations", () => {
      it("should transform universe parameter", () => {
        const url = new URL(
          "http://localhost:8080/wallet/?u=bd3sg-teaaa-aaaaa-qaaba-cai"
        );
        const result = transformUrlForAnalytics(url);
        expect(result).toBe("/wallet/bd3sg-teaaa-aaaaa-qaaba-cai");
      });

      it("should return original pathname when universe parameter is missing", () => {
        const url = new URL("http://localhost:8080/wallet/");
        const result = transformUrlForAnalytics(url);
        expect(result).toBe("/wallet/");
      });

      it("should return original pathname when universe parameter is empty", () => {
        const url = new URL("http://localhost:8080/wallet/?u=");
        const result = transformUrlForAnalytics(url);
        expect(result).toBe("/wallet/");
      });
    });

    describe("Default case - non-transformed pages", () => {
      it("should return original pathname for non-tracked pages", () => {
        const url = new URL("http://localhost:8080/settings");
        const result = transformUrlForAnalytics(url);
        expect(result).toBe("/settings");
      });

      it("should return original pathname for home page", () => {
        const url = new URL("http://localhost:8080/");
        const result = transformUrlForAnalytics(url);
        expect(result).toBe("/");
      });

      it("should return original pathname for tokens page", () => {
        const url = new URL("http://localhost:8080/tokens/");
        const result = transformUrlForAnalytics(url);
        expect(result).toBe("/tokens/");
      });
    });
  });
});
