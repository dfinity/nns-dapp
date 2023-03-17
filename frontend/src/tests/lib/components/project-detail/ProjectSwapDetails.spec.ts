/**
 * @jest-environment jsdom
 */

import ProjectSwapDetails from "$lib/components/project-detail/ProjectSwapDetails.svelte";
import { snsTotalTokenSupplyStore } from "$lib/stores/sns-total-token-supply.store";
import type { SnsSwapCommitment } from "$lib/types/sns";
import { secondsToDate, secondsToTime } from "$lib/utils/date.utils";
import { formatToken } from "$lib/utils/token.utils";
import {
  mockSnsFullProject,
  mockSnsParams,
  mockSummary,
} from "$tests/mocks/sns-projects.mock";
import { renderContextCmp } from "$tests/mocks/sns.mock";
import { ProjectSwapDetailsPo } from "$tests/page-objects/ProjectSwapDetails.page-object";
import { TokenAmount } from "@dfinity/nns";

describe("ProjectSwapDetails", () => {
  beforeEach(() => {
    snsTotalTokenSupplyStore.reset();
  });

  it("should render total tokens", () => {
    const { container } = renderContextCmp({
      summary: mockSummary,
      swapCommitment: mockSnsFullProject.swapCommitment as SnsSwapCommitment,
      Component: ProjectSwapDetails,
    });

    const element = Array.from(
      container.querySelectorAll('[data-tid="token-value"]')
    )[0];

    expect(element?.innerHTML).toEqual(
      `${(Number(mockSnsParams.sns_token_e8s) / 100000000).toFixed(2)}`
    );
  });

  it("should render min commitment", () => {
    const { container } = renderContextCmp({
      summary: mockSummary,
      swapCommitment: mockSnsFullProject.swapCommitment as SnsSwapCommitment,
      Component: ProjectSwapDetails,
    });

    const element = Array.from(
      container.querySelectorAll('[data-tid="token-value"]')
    )[1];

    expect(element?.innerHTML).toEqual(
      `${(Number(mockSnsParams.min_participant_icp_e8s) / 100000000).toFixed(
        2
      )}`
    );
  });

  it("should render max commitment", () => {
    const { container } = renderContextCmp({
      summary: mockSummary,
      swapCommitment: mockSnsFullProject.swapCommitment as SnsSwapCommitment,
      Component: ProjectSwapDetails,
    });

    const element = Array.from(
      container.querySelectorAll('[data-tid="token-value"]')
    )[2];

    expect(element?.innerHTML).toEqual(
      `${(Number(mockSnsParams.max_participant_icp_e8s) / 100000000).toFixed(
        2
      )}`
    );
  });

  it("should render sale end", () => {
    const { queryByTestId } = renderContextCmp({
      summary: mockSummary,
      swapCommitment: mockSnsFullProject.swapCommitment as SnsSwapCommitment,
      Component: ProjectSwapDetails,
    });

    const element = queryByTestId("date-seconds");

    const seconds = Number(
      mockSnsFullProject.summary.swap.params.swap_due_timestamp_seconds
    );
    expect(element?.innerHTML).toEqual(
      `${secondsToDate(seconds)} ${secondsToTime(seconds)}`
    );
  });

  it("should render total token supply if present", () => {
    const totalSupply = BigInt(2_000_000_000);
    const totalTokensSupply = TokenAmount.fromE8s({
      amount: totalSupply,
      token: mockSummary.token,
    });
    const { container } = renderContextCmp({
      summary: mockSummary,
      swapCommitment: mockSnsFullProject.swapCommitment as SnsSwapCommitment,
      totalTokensSupply,
      Component: ProjectSwapDetails,
    });

    const po = ProjectSwapDetailsPo.under(container);

    expect(po.getTotalSupply()).toMatch(formatToken({ value: totalSupply }));
  });
});
