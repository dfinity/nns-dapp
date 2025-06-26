import VotesResults from "$lib/components/proposal-detail/VotesResults.svelte";
import {
  MINIMUM_YES_PROPORTION_OF_EXERCISED_VOTING_POWER,
  MINIMUM_YES_PROPORTION_OF_TOTAL_VOTING_POWER,
} from "$lib/constants/proposals.constants";
import { nowInSeconds } from "$lib/utils/date.utils";
import { basisPointsToPercent } from "$lib/utils/utils";
import en from "$tests/mocks/i18n.mock";
import { VotesResultPo } from "$tests/page-objects/VotesResults.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "@testing-library/svelte";

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
    yes?: number;
    no?: number;
    total?: number;
  }) => {
    const { container } = render(VotesResults, {
      props: {
        yes: props?.yes ?? yesCount,
        no: props?.no ?? noCount,
        total: props?.total ?? totalValue,
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

  it('should not render "Adopt cast votes" value for default proposals', async () => {
    const votesResultPo = renderComponent();
    expect(await votesResultPo.getAdoptCastVotesValue()).toBeNull();
  });

  it('should not render "Reject cast votes" value for default proposals', async () => {
    const votesResultPo = renderComponent();
    expect(await votesResultPo.getRejectCastVotesValue()).toBeNull();
  });

  it('should render "Adopt cast votes" value for critical proposal', async () => {
    const votesResultPo = renderComponent({
      immediateMajorityPercent: 67,
      standardMajorityPercent: 20,
    });
    expect(await votesResultPo.getAdoptCastVotesValue()).toEqual("40%");
  });

  it('should render "Reject cast votes" value for critical proposal', async () => {
    const votesResultPo = renderComponent({
      immediateMajorityPercent: 67,
      standardMajorityPercent: 20,
    });
    expect(await votesResultPo.getRejectCastVotesValue()).toEqual("60%");
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

    it("should render default descriptions when default majorities with placeholders", async () => {
      const po = renderComponent({
        immediateMajorityPercent: defaultImmediateMajorityPercent,
        standardMajorityPercent: defaultStandardMajorityPercent,
      });
      // expand majority descriptions
      await po.expandMajorityDescriptions();

      expect(await po.getImmediateMajorityDescription()).toBe(
        `This condition is met when there are more yes-votes than no-votes by the expiration date.This can become true at the expiration date or if the yes-bar reaches  - in which case the condition cannot be changed anymore and the proposal is adopted early.See here for more information.`
      );
      expect(await po.getStandardMajorityDescription()).toBe(
        en.proposal_detail__vote.standard_majority_description.replace(
          "$icon_standard_majority",
          ""
        )
      );
    });

    it("should render supermajority titles for a Critical proposal", async () => {
      const po = renderComponent({
        immediateMajorityPercent: 67,
        standardMajorityPercent: 20,
      });

      expect(await po.getStandardMajorityTitle()).toBe(
        en.proposal_detail__vote.standard_super_majority
      );
      expect(await po.getImmediateMajorityTitle()).toBe(
        en.proposal_detail__vote.immediate_super_majority
      );
    });

    it("should render supermajority descriptions with placeholders for a Critical proposal", async () => {
      const po = renderComponent({
        immediateMajorityPercent: 67,
        standardMajorityPercent: 20,
      });
      // expand majority descriptions
      await po.expandMajorityDescriptions();

      expect(await po.getStandardMajorityDescription()).toBe(
        en.proposal_detail__vote.standard_super_majority_description.replace(
          "$icon_standard_majority",
          ""
        )
      );
      expect(await po.getImmediateMajorityDescription()).toBe(
        `This condition is met when there are more than twice as many yes-votes as no-votes by the expiration date.This can become true at the expiration date or if the yes-bar reaches  - in which case the condition cannot be changed anymore and the proposal is adopted early.See here for more information.`
      );
    });
  });

  describe("Voting status", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    describe("voting period is open", () => {
      const deadlineTimestampSeconds = BigInt(now + 100000);

      describe("participation condition", () => {
        it("should render default status when participation threshold is not met", async () => {
          const po = renderComponent({
            standardMajorityPercent: 3,
            yes: 0,
            no: 0,
            total: 10,
            deadlineTimestampSeconds,
          });

          // yes is 0%, where participation condition is 3%
          expect(await po.getParticipationStatus()).toBe("default");
        });

        it("should render participation success when participation condition is met", async () => {
          const po = renderComponent({
            standardMajorityPercent: 3,
            yes: 1,
            no: 0,
            total: 10,
            deadlineTimestampSeconds,
          });

          // yes is 10%, where participation condition is 3%
          expect(await po.getParticipationStatus()).toBe("success");
        });
      });

      describe("majority condition", () => {
        it("should render default status when absolute majority condition is not met", async () => {
          const po = renderComponent({
            immediateMajorityPercent: 50,
            yes: 4,
            no: 0,
            total: 10,
            deadlineTimestampSeconds,
          });

          // yes is 40%, where majority condition is 50%
          expect(await po.getMajorityStatus()).toBe("default");
        });

        it("should render majority success when yes votes are more than immediate majority threshold -> absolute majority", async () => {
          const po = renderComponent({
            immediateMajorityPercent: 50,
            yes: 6,
            no: 0,
            total: 10,
            deadlineTimestampSeconds,
          });

          // yes is 60% when immediate majority is 50% -> absolute majority
          expect(await po.getMajorityStatus()).toBe("success");
        });

        it("should render majority failed when no votes are more than immediate majority threshold -> absolute majority", async () => {
          const po = renderComponent({
            immediateMajorityPercent: 50,
            yes: 0,
            no: 6,
            total: 10,
            deadlineTimestampSeconds,
          });

          // no is 60% when immediate majority is 50% -> absolute majority
          expect(await po.getMajorityStatus()).toBe("failed");
        });
      });
    });

    describe("voting period is closed", () => {
      const deadlineTimestampSeconds = BigInt(now - 1);

      describe("participation condition", () => {
        it("should render participation success when standard majority condition is met", async () => {
          const po = renderComponent({
            standardMajorityPercent: 3,
            yes: 3,
            no: 0,
            total: 10,
            deadlineTimestampSeconds,
          });

          // yes is 30% where standard majority is 3%
          expect(await po.getParticipationStatus()).toBe("success");
        });

        it("should render participation success when standard majority condition is met", async () => {
          const po = renderComponent({
            standardMajorityPercent: 3,
            yes: 0.1,
            no: 3,
            total: 10,
            deadlineTimestampSeconds,
          });

          // yes is 1% where standard majority is 3%
          expect(await po.getParticipationStatus()).toBe("failed");
        });
      });

      describe("majority condition", () => {
        it("should render majority success when yes votes are more than no votes -> Normal proposal", async () => {
          const po = renderComponent({
            immediateMajorityPercent: 50,
            yes: 3.1,
            no: 3,
            total: 10,
            deadlineTimestampSeconds,
          });

          // yes is 31% and no votes are 30% for a normal proposal
          expect(await po.getMajorityStatus()).toBe("success");
        });

        it("should render majority failed when yes votes are not more than no votes -> Normal proposal", async () => {
          const po = renderComponent({
            immediateMajorityPercent: 50,
            yes: 3,
            no: 3,
            total: 10,
            deadlineTimestampSeconds,
          });

          // yes is 30% and no is 30% for a normal proposal
          expect(await po.getMajorityStatus()).toBe("failed");
        });

        it("should render majority 'success' when yes votes exceed immediateMajorityPercent of exercised voting power in critical proposal", async () => {
          const po = renderComponent({
            immediateMajorityPercent: 67,
            standardMajorityPercent: 20,
            yes: 6.1,
            no: 3,
            total: 10,
            deadlineTimestampSeconds,
          });

          // Total exercised votes = 6.1 + 3 = 9.1
          // Yes percentage = (6.1 / 9.1) * 100 ≈ 67.03%
          // 67.03% > 67%, so it should return "success"
          expect(await po.getMajorityStatus()).toBe("success");
        });

        it("should render majority 'failed' when yes votes do not exceed immediateMajorityPercent in critical proposal", async () => {
          const po = renderComponent({
            immediateMajorityPercent: 67,
            standardMajorityPercent: 20,
            yes: 6.02,
            no: 3,
            total: 10,
            deadlineTimestampSeconds,
          });

          // Total exercised votes = 6.05 + 3 = 9.05
          // Yes percentage = (6.05 / 9.05) * 100 = 66.85%
          // 66.85% < 67%, so it should return "failed"
          expect(await po.getMajorityStatus()).toBe("failed");
        });
      });
    });
  });
});
