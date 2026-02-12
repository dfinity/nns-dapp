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

    const origin = "http://localhost:8080";

    describe("Project page transformations", () => {
      it("should transform project parameter", () => {
        const url = new URL(
          `${origin}/project/?project=ajuq4-ruaaa-aaaaa-qaaga-cai`
        );
        const result = transformUrlForAnalytics(url, projectsToSlugMap);
        expect(result).toBe(`${origin}/project/project-one`);
      });

      it("should return original pathname when project parameter is missing", () => {
        const urlWithTrailingSlash = new URL(`${origin}/project/`);
        expect(
          transformUrlForAnalytics(urlWithTrailingSlash, projectsToSlugMap)
        ).toBe(`${origin}/project/`);

        const urlWithoutTrailingSlash = new URL(`${origin}/project`);
        expect(
          transformUrlForAnalytics(urlWithoutTrailingSlash, projectsToSlugMap)
        ).toBe(`${origin}/project/`);
      });

      it("should return original pathname when project parameter is empty", () => {
        const url = new URL(`${origin}/project/?project=`);
        const result = transformUrlForAnalytics(url, projectsToSlugMap);
        expect(result).toBe(`${origin}/project/`);
      });
    });

    describe("Neurons page transformations", () => {
      it("should transform universe parameter", () => {
        const url = new URL(`${origin}/neurons/?u=qsgjb-riaaa-aaaaa-aaaga-cai`);
        const result = transformUrlForAnalytics(url, projectsToSlugMap);
        expect(result).toBe(`${origin}/neurons/project-two`);
      });

      it("should not track neuron parameter", () => {
        const url = new URL(
          `${origin}/neurons/?u=qsgjb-riaaa-aaaaa-aaaga-cai&neuron=12345`
        );
        const result = transformUrlForAnalytics(url, projectsToSlugMap);
        expect(result).toBe(`${origin}/neurons/project-two`);
      });

      it("should return original pathname when universe parameter is missing", () => {
        const url = new URL(`${origin}/neurons/`);
        const result = transformUrlForAnalytics(url, projectsToSlugMap);
        expect(result).toBe(`${origin}/neurons/`);
      });

      it("should return original pathname when universe parameter is empty", () => {
        const url = new URL(`${origin}/neurons/?u=`);
        const result = transformUrlForAnalytics(url, projectsToSlugMap);
        expect(result).toBe(`${origin}/neurons/`);
      });
    });

    describe("Neuron page transformations", () => {
      it("should transform universe parameter", () => {
        const url = new URL(`${origin}/neuron/?u=qsgjb-riaaa-aaaaa-aaaga-cai`);
        const result = transformUrlForAnalytics(url, projectsToSlugMap);
        expect(result).toBe(`${origin}/neuron/project-two`);
      });

      it("should not track neuron parameter", () => {
        const url = new URL(
          `${origin}/neuron/?u=qsgjb-riaaa-aaaaa-aaaga-cai&neuron=12345`
        );
        const result = transformUrlForAnalytics(url, projectsToSlugMap);
        expect(result).toBe(`${origin}/neuron/project-two`);
      });
    });

    describe("Wallet page transformations", () => {
      it("should transform universe parameter", () => {
        const url = new URL(`${origin}/wallet/?u=bd3sg-teaaa-aaaaa-qaaba-cai`);
        const result = transformUrlForAnalytics(url, projectsToSlugMap);
        expect(result).toBe(`${origin}/wallet/project-three`);
      });

      it("should return original pathname when universe parameter is missing", () => {
        const url = new URL(`${origin}/wallet/`);
        const result = transformUrlForAnalytics(url, projectsToSlugMap);
        expect(result).toBe(`${origin}/wallet/`);
      });

      it("should return original pathname when universe parameter is empty", () => {
        const url = new URL(`${origin}/wallet/?u=`);
        const result = transformUrlForAnalytics(url, projectsToSlugMap);
        expect(result).toBe(`${origin}/wallet/`);
      });
    });

    describe("Unkown projects", () => {
      it("should transform project parameter", () => {
        const url = new URL(`${origin}/project/?project=ajuq4-ruaaa`);
        const result = transformUrlForAnalytics(url, projectsToSlugMap);
        expect(result).toBe(`${origin}/project/ajuq4-ruaaa`);
      });

      it("should transform universe parameter", () => {
        const url = new URL(`${origin}/neurons/?u=qsgjb-riaaa`);
        const result = transformUrlForAnalytics(url, projectsToSlugMap);
        expect(result).toBe(`${origin}/neurons/qsgjb-riaaa`);
      });

      it("should leave the canisterId if universe is not known", () => {
        const url = new URL(`${origin}/wallet/?u=bd3sg-teaaa`);
        const result = transformUrlForAnalytics(url, projectsToSlugMap);
        expect(result).toBe(`${origin}/wallet/bd3sg-teaaa`);
      });
    });

    describe("Default case - non-transformed pages", () => {
      it("should return full URL for non-tracked pages", () => {
        const url = new URL(`${origin}/settings`);
        const result = transformUrlForAnalytics(url, projectsToSlugMap);
        expect(result).toBe(`${origin}/settings`);
      });

      it("should return full URL for home page", () => {
        const url = new URL(`${origin}/`);
        const result = transformUrlForAnalytics(url, projectsToSlugMap);
        expect(result).toBe(`${origin}/`);
      });

      it("should return full URL for tokens page", () => {
        const url = new URL(`${origin}/tokens/`);
        const result = transformUrlForAnalytics(url, projectsToSlugMap);
        expect(result).toBe(`${origin}/tokens/`);
      });
    });
  });
});
