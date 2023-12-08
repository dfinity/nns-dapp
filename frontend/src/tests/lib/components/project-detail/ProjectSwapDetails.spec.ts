import ProjectSwapDetails from "$lib/components/project-detail/ProjectSwapDetails.svelte";
import { snsTotalTokenSupplyStore } from "$lib/stores/sns-total-token-supply.store";
import type { SnsSwapCommitment } from "$lib/types/sns";
import { formatToken } from "$lib/utils/token.utils";
import {
  createSummary,
  mockSnsFullProject,
  mockSummary,
} from "$tests/mocks/sns-projects.mock";
import { renderContextCmp } from "$tests/mocks/sns.mock";
import { ProjectSwapDetailsPo } from "$tests/page-objects/ProjectSwapDetails.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { TokenAmount } from "@dfinity/utils";

describe("ProjectSwapDetails", () => {
  const renderComponent = (props): ProjectSwapDetailsPo => {
    const { container } = renderContextCmp({
      ...props,
      Component: ProjectSwapDetails,
    });

    return ProjectSwapDetailsPo.under(new JestPageObjectElement(container));
  };

  beforeEach(() => {
    snsTotalTokenSupplyStore.reset();
  });

  it("should render total distributed tokens", async () => {
    const po = await renderComponent({
      summary: createSummary({
        tokensDistributed: 712_500_000_000n,
      }),
      swapCommitment: mockSnsFullProject.swapCommitment as SnsSwapCommitment,
    });

    expect(await po.getTokensDistributed()).toEqual("7'125.00");
  });

  it("should render min participants", async () => {
    const po = renderComponent({
      summary: createSummary({ minParticipants: 1430 }),
      swapCommitment: mockSnsFullProject.swapCommitment as SnsSwapCommitment,
    });

    expect(await po.getMinParticipants()).toEqual("1’430");
  });

  it("should render min commitment", async () => {
    const po = renderComponent({
      summary: createSummary({
        minParticipantCommitment: 250_000_000n,
      }),
      swapCommitment: mockSnsFullProject.swapCommitment as SnsSwapCommitment,
    });

    expect(await po.getMinParticipantCommitment()).toEqual("2.50 ICP");
  });

  it("should render min commitment with many significant decimals", async () => {
    const po = renderComponent({
      summary: createSummary({
        minParticipantCommitment: 100000278n,
      }),
      swapCommitment: mockSnsFullProject.swapCommitment as SnsSwapCommitment,
    });

    expect(await po.getMinParticipantCommitment()).toEqual("1.00000278 ICP");
  });

  it("should render max commitment", async () => {
    const po = renderComponent({
      summary: createSummary({
        maxParticipantCommitment: 34_500_000_000n,
      }),
      swapCommitment: mockSnsFullProject.swapCommitment as SnsSwapCommitment,
    });

    expect(await po.getMaxParticipantCommitment()).toEqual("345.00 ICP");
  });

  it("should render max NF commitment", async () => {
    const po = renderComponent({
      summary: createSummary({
        maxNFParticipation: 60000000000n,
      }),
      swapCommitment: mockSnsFullProject.swapCommitment as SnsSwapCommitment,
    });

    expect(await po.getMaxNfCommitment()).toEqual("600.00 ICP");
  });

  it("should render NOT max NF commitment if not present", async () => {
    const po = renderComponent({
      summary: createSummary({
        maxNFParticipation: undefined,
      }),
      swapCommitment: mockSnsFullProject.swapCommitment as SnsSwapCommitment,
    });

    expect(await po.hasMaxNfCommitment()).toEqual(false);
  });

  it("should render sale end", async () => {
    const swapDeadline = new Date("2023-10-04T15:00:00.000Z").getTime() / 1000;
    const po = renderComponent({
      summary: createSummary({ swapDueTimestampSeconds: BigInt(swapDeadline) }),
      swapCommitment: mockSnsFullProject.swapCommitment as SnsSwapCommitment,
    });

    expect(await po.getSaleEnd()).toEqual("Oct 4, 2023 3:00 PM");
  });

  it("should render total token supply if present", async () => {
    const totalSupply = BigInt(2_000_000_000);
    const totalTokensSupply = TokenAmount.fromE8s({
      amount: totalSupply,
      token: mockSummary.token,
    });
    const po = renderComponent({
      summary: mockSummary,
      swapCommitment: mockSnsFullProject.swapCommitment as SnsSwapCommitment,
      totalTokensSupply,
    });

    expect(await po.getTotalSupply()).toMatch(
      formatToken({ value: totalSupply })
    );
  });

  it("should not render restricted countries if absent", async () => {
    const po = renderComponent({
      summary: createSummary({ restrictedCountries: [] }),
      swapCommitment: mockSnsFullProject.swapCommitment as SnsSwapCommitment,
    });

    expect(await po.getExcludedCountriesPo().isPresent()).toBe(false);
  });

  it("should render restricted countries", async () => {
    const po = renderComponent({
      summary: createSummary({ restrictedCountries: ["CH", "US"] }),
      swapCommitment: mockSnsFullProject.swapCommitment as SnsSwapCommitment,
    });

    expect(await po.getExcludedCountriesPo().getValueText()).toBe("CH, US");
  });
});
