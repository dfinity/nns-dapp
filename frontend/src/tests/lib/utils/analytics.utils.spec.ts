import {
  slugifyTitle,
  transformUrlForAnalytics,
} from "$lib/utils/analytics.utils";

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
    });
  });

  describe("transformUrlForAnalytics", () => {
    const projectsToSlugMap = new Map<string, string>([
      ["ajuq4-ruaaa-aaaaa-qaaga-cai", "project-one"],
      ["qsgjb-riaaa-aaaaa-aaaga-cai", "project-two"],
      ["bd3sg-teaaa-aaaaa-qaaba-cai", "project-three"],
    ]);

    describe("Project page transformations", () => {
      it("should transform project parameter", () => {
        const url = new URL(
          "http://localhost:8080/project/?project=ajuq4-ruaaa-aaaaa-qaaga-cai"
        );
        const result = transformUrlForAnalytics(url, projectsToSlugMap);
        expect(result).toBe("/project/project-one");
      });

      it("should return original pathname when project parameter is missing", () => {
        const urlWithTrailingSlash = new URL("http://localhost:8080/project/");
        expect(
          transformUrlForAnalytics(urlWithTrailingSlash, projectsToSlugMap)
        ).toBe("/project/");

        const urlWithoutTrailingSlash = new URL(
          "http://localhost:8080/project"
        );
        expect(
          transformUrlForAnalytics(urlWithoutTrailingSlash, projectsToSlugMap)
        ).toBe("/project");
      });

      it("should return original pathname when project parameter is empty", () => {
        const url = new URL("http://localhost:8080/project/?project=");
        const result = transformUrlForAnalytics(url, projectsToSlugMap);
        expect(result).toBe("/project/");
      });
    });

    describe("Neurons page transformations", () => {
      it("should transform universe parameter", () => {
        const url = new URL("http://localhost:8080/neurons/project-two");
        const result = transformUrlForAnalytics(url, projectsToSlugMap);
        expect(result).toBe("/neurons/project-two");
      });

      it("should not track neuron parameter", () => {
        const url = new URL(
          "http://localhost:8080/neurons/?u=qsgjb-riaaa-aaaaa-aaaga-cai&neuron=12345"
        );
        const result = transformUrlForAnalytics(url, projectsToSlugMap);
        expect(result).toBe("/neurons/project-two");
      });

      it("should return original pathname when universe parameter is missing", () => {
        const url = new URL("http://localhost:8080/neurons/");
        const result = transformUrlForAnalytics(url, projectsToSlugMap);
        expect(result).toBe("/neurons/");
      });

      it("should return original pathname when universe parameter is empty", () => {
        const url = new URL("http://localhost:8080/neurons/?u=");
        const result = transformUrlForAnalytics(url, projectsToSlugMap);
        expect(result).toBe("/neurons/");
      });
    });

    describe("Wallet page transformations", () => {
      it("should transform universe parameter", () => {
        const url = new URL(
          "http://localhost:8080/wallet/?u=bd3sg-teaaa-aaaaa-qaaba-cai"
        );
        const result = transformUrlForAnalytics(url, projectsToSlugMap);
        expect(result).toBe("/wallet/project-three");
      });

      it("should return original pathname when universe parameter is missing", () => {
        const url = new URL("http://localhost:8080/wallet/");
        const result = transformUrlForAnalytics(url, projectsToSlugMap);
        expect(result).toBe("/wallet/");
      });

      it("should return original pathname when universe parameter is empty", () => {
        const url = new URL("http://localhost:8080/wallet/?u=");
        const result = transformUrlForAnalytics(url, projectsToSlugMap);
        expect(result).toBe("/wallet/");
      });
    });

    describe("Default case - non-transformed pages", () => {
      it("should return original pathname for non-tracked pages", () => {
        const url = new URL("http://localhost:8080/settings");
        const result = transformUrlForAnalytics(url, projectsToSlugMap);
        expect(result).toBe("/settings");
      });

      it("should return original pathname for home page", () => {
        const url = new URL("http://localhost:8080/");
        const result = transformUrlForAnalytics(url, projectsToSlugMap);
        expect(result).toBe("/");
      });

      it("should return original pathname for tokens page", () => {
        const url = new URL("http://localhost:8080/tokens/");
        const result = transformUrlForAnalytics(url, projectsToSlugMap);
        expect(result).toBe("/tokens/");
      });
    });
  });
});
