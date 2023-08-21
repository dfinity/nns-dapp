/**
 * @jest-environment jsdom
 */

import ProjectSwapDetails from "$lib/components/project-detail/ProjectSwapDetails.svelte";
import { E8S_PER_ICP } from "$lib/constants/icp.constants";
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
        tokensDistributed: 7125n * BigInt(E8S_PER_ICP),
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
        minParticipantCommitment: BigInt(2.5 * E8S_PER_ICP),
      }),
      swapCommitment: mockSnsFullProject.swapCommitment as SnsSwapCommitment,
    });

    expect(await po.getMinParticipantCommitment()).toEqual("2.50 ICP");
  });

  it("should render max commitment", async () => {
    const po = renderComponent({
      summary: createSummary({
        maxParticipantCommitment: BigInt(345 * E8S_PER_ICP),
      }),
      swapCommitment: mockSnsFullProject.swapCommitment as SnsSwapCommitment,
    });

    expect(await po.getMaxParticipantCommitment()).toEqual("345.00 ICP");
  });

  it("should render sale end", async () => {
    const swapDeadline = new Date("2023-10-04T15:00:00.000Z").getTime() / 1000;
    const po = renderComponent({
      summary: createSummary({ swapDueTimestampSeconds: BigInt(swapDeadline) }),
      swapCommitment: mockSnsFullProject.swapCommitment as SnsSwapCommitment,
    });

    expect(await po.getSaleEnd()).toEqual("Oct 4, 2023 3:00 PM");
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
