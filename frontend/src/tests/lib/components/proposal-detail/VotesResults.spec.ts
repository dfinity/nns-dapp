import VotesResults from "$lib/components/proposal-detail/VotesResults.svelte";
import {
  MINIMUM_YES_PROPORTION_OF_EXERCISED_VOTING_POWER,
  MINIMUM_YES_PROPORTION_OF_TOTAL_VOTING_POWER,
} from "$lib/constants/proposals.constants";
import { nowInSeconds } from "$lib/utils/date.utils";
import { basisPointsToPercent } from "$lib/utils/sns.utils";
import en from "$tests/mocks/i18n.mock";
import { VotesResultPo } from "$tests/page-objects/VotesResults.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "@testing-library/svelte";
import { describe } from "vitest";

const now = nowInSeconds();

describe("VotesResults", () => {
  const yesCount = 2;
  const noCount = 3;
  const totalValue = 5;
  const defaultImmediateMajorityPercent = basisPointsToPercent(
    MINIMUM_YES_PROPORTION_OF_EXERCISED_VOTING_POWER
  );
  const defaultStandardMajorityPercent = basisPointsToPercent(
    MINIMUM_YES_PROPORTION_OF_TOTAL_VOTING_POWER
  );
  const renderComponent = (props?: {
    deadlineTimestampSeconds?: bigint;
    immediateMajorityPercent?: number;
    standardMajorityPercent?: number;
  }) => {
    const { container } = render(VotesResults, {
      props: {
        yes: yesCount,
        no: noCount,
        total: totalValue,
        deadlineTimestampSeconds: props?.deadlineTimestampSeconds ?? 0n,
        immediateMajorityPercent:
          props?.immediateMajorityPercent ?? defaultImmediateMajorityPercent,
        standardMajorityPercent:
          props?.standardMajorityPercent ?? defaultStandardMajorityPercent,
      },
    });

    return VotesResultPo.under(new JestPageObjectElement(container));
  };

  it('should render "Adopt" value', async () => {
    const votesResultPo = renderComponent();
    expect(await votesResultPo.getAdoptVotingPower()).toEqual(yesCount);
  });

  it('should render "Reject" value', async () => {
    const votesResultPo = renderComponent();
    expect(await votesResultPo.getRejectVotingPower()).toEqual(noCount);
  });

  it("should render progressbar", async () => {
    const votesResultPo = renderComponent();

    expect(await votesResultPo.getProgressMinValue()).toBe(0);
    expect(await votesResultPo.getProgressNowValue()).toBe(yesCount);
    expect(await votesResultPo.getProgressMaxValue()).toBe(totalValue);
  });

  it("should render Expiration date", async () => {
    const votesResultPo = renderComponent({
      deadlineTimestampSeconds: BigInt(now + 100000),
    });
    expect(await votesResultPo.getExpirationDateText()).toEqual(
      "Expiration date 1 day, 3 hours remaining"
    );
  });

  it("should hide Expiration date when deadline in past", async () => {
    const votesResultPo = renderComponent({
      deadlineTimestampSeconds: BigInt(now - 1),
    });
    expect(await votesResultPo.getExpirationDateText()).toBe("");
  });

  describe("Standard vs Super majority", () => {
    it("should render default titles when default majorities", async () => {
      const po = renderComponent({
        immediateMajorityPercent: defaultImmediateMajorityPercent,
        standardMajorityPercent: defaultStandardMajorityPercent,
      });

      expect(await po.getImmediateMajorityTitle()).toBe(
        en.proposal_detail__vote.immediate_majority
      );
      expect(await po.getStandardMajorityTitle()).toBe(
        en.proposal_detail__vote.standard_majority
      );
    });

    it("should render default descriptions when default majorities", async () => {
      const po = renderComponent({
        immediateMajorityPercent: defaultImmediateMajorityPercent,
        standardMajorityPercent: defaultStandardMajorityPercent,
      });
      // expand majority descriptions
      await po.expandMajorityDescriptions();

      expect(await po.getImmediateMajorityDescription()).toBe(
        en.proposal_detail__vote.immediate_majority_description
      );
      const standardMajorityDescriptionText =
        en.proposal_detail__vote.standard_majority_description.replace(
          "$standard_majority",
          "3%"
        );
      expect(await po.getStandardMajorityDescription()).toBe(
        standardMajorityDescriptionText
      );
    });

    it("should render supermajority titles", async () => {
      const po = renderComponent({
        immediateMajorityPercent: 67,
        standardMajorityPercent: 20,
      });

      expect(await po.getImmediateMajorityTitle()).toBe(
        en.proposal_detail__vote.immediate_super_majority
      );
      expect(await po.getStandardMajorityTitle()).toBe(
        en.proposal_detail__vote.standard_super_majority
      );
    });

    it("should render supermajority descriptions", async () => {
      const po = renderComponent({
        immediateMajorityPercent: 67,
        standardMajorityPercent: 20,
      });
      // expand majority descriptions
      await po.expandMajorityDescriptions();

      const immediateMajorityDescriptionText =
        en.proposal_detail__vote.immediate_super_majority_description
          .replace("$immediate_majority", "67%")
          .replace("$no_immediate_majority", "33%");
      expect(await po.getImmediateMajorityDescription()).toBe(
        immediateMajorityDescriptionText
      );
      const standardMajorityDescriptionText =
        en.proposal_detail__vote.standard_super_majority_description
          .replace("$immediate_majority", "67%")
          .replace("$standard_majority", "20%");
      expect(await po.getStandardMajorityDescription()).toBe(
        standardMajorityDescriptionText
      );
    });
  });
});
