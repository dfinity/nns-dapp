import {
  CYCLES_TRANSFER_STATION_ROOT_CANISTER_ID,
  SEERS_ROOT_CANISTER_ID,
} from "$lib/constants/canister-ids.constants";
import { CKBTC_UNIVERSE_CANISTER_ID } from "$lib/constants/ckbtc-canister-ids.constants";
import { CKUSDC_UNIVERSE_CANISTER_ID } from "$lib/constants/ckusdc-canister-ids.constants";
import type { TableProject } from "$lib/types/staking";
import type { UserToken } from "$lib/types/tokens-page";
import * as dateUtils from "$lib/utils/date.utils";
import {
  formatParticipation,
  getMinCommitmentPercentage,
  getTopHeldTokens,
  getTopStakedTokens,
  mapProposalInfoToCard,
  shouldShowInfoRow,
} from "$lib/utils/portfolio.utils";
import type { FullProjectCommitmentSplit } from "$lib/utils/projects.utils";
import { principal } from "$tests/mocks/sns-projects.mock";
import { mockTableProject } from "$tests/mocks/staking.mock";
import {
  createIcpUserToken,
  createUserToken,
  createUserTokenLoading,
} from "$tests/mocks/tokens-page.mock";
import type { ProposalInfo } from "@dfinity/nns";
import { Principal } from "@dfinity/principal";

describe("Portfolio utils", () => {
  describe("getTopTokens", () => {
    const mockNonUserToken = createUserTokenLoading();
    const mockIcpToken = createIcpUserToken({
      balanceInUsd: 1,
    });

    const mockCkBTCToken = createUserToken({
      universeId: CKBTC_UNIVERSE_CANISTER_ID,
      balanceInUsd: 10,
    });

    const mockCkUSDCToken = createUserToken({
      universeId: CKUSDC_UNIVERSE_CANISTER_ID,
      balanceInUsd: 1000,
    });

    const mockOtherToken = createUserToken({
      universeId: principal(1),
      balanceInUsd: 2000,
    });

    const mockZeroBalanceUserTokenData = createUserToken({
      universeId: principal(2),
      balanceInUsd: 0,
    });

    it("should exclude non-UserTokenData tokens", () => {
      const tokens: UserToken[] = [
        mockIcpToken,
        mockOtherToken,
        mockCkUSDCToken,
        mockCkBTCToken,
        mockNonUserToken,
      ];

      const result = getTopHeldTokens({ userTokens: tokens });

      expect(result).toHaveLength(4);
      expect(result).not.toContainEqual(mockNonUserToken);
    });

    it("should return an empty array if no ICP", () => {
      const tokens = [
        mockOtherToken,
        mockCkUSDCToken,
        mockCkBTCToken,
        mockNonUserToken,
      ];

      const result = getTopHeldTokens({
        userTokens: tokens,
      });

      expect(result).toHaveLength(0);
    });

    it("should respect the result limit", () => {
      const tokens: UserToken[] = [
        mockIcpToken,
        mockOtherToken,
        mockCkUSDCToken,
        mockCkBTCToken,
        mockNonUserToken,
      ];
      const result = getTopHeldTokens({
        userTokens: tokens,
      });

      expect(result).toHaveLength(4);
    });

    it("should exclude tokens with zero balance but not ICP", () => {
      const mockZeroIcp = createIcpUserToken({
        balanceInUsd: 0,
      });
      const tokens: UserToken[] = [mockZeroBalanceUserTokenData, mockZeroIcp];
      const result = getTopHeldTokens({
        userTokens: tokens,
      });

      expect(result).toHaveLength(1);
      expect(result).not.toContainEqual(mockZeroBalanceUserTokenData);
      expect(result).toContainEqual(mockZeroIcp);
    });

    it("should order tokens: ICP first, then by descending USD balance", () => {
      const tokens: UserToken[] = [
        mockOtherToken,
        mockCkUSDCToken,
        mockCkBTCToken,
        mockNonUserToken,
        mockZeroBalanceUserTokenData,
        mockIcpToken,
      ];
      const result = getTopHeldTokens({
        userTokens: tokens,
      });

      expect(result).toEqual([
        mockIcpToken, // 1$
        mockOtherToken, // 2000$
        mockCkUSDCToken, // 1000$
        mockCkBTCToken, // 10$
      ]);
    });

    it("should filter CTS token", () => {
      const mockCSTProject = createUserToken({
        universeId: Principal.fromText(
          CYCLES_TRANSFER_STATION_ROOT_CANISTER_ID
        ),
        balanceInUsd: 0,
      });
      const tokens: UserToken[] = [mockCSTProject, mockIcpToken];
      const result = getTopHeldTokens({
        userTokens: tokens,
      });

      expect(result).toHaveLength(1);
      expect(result).not.toContainEqual(mockCSTProject);
    });
  });

  describe("getTopProjects", () => {
    const mockIcpProject: TableProject = {
      ...mockTableProject,
      title: "Internet Computer",
      stakeInUsd: 1,
    };

    const mockProject1: TableProject = {
      ...mockTableProject,
      title: "Alpha Project",
      stakeInUsd: 2000,
      universeId: "1",
    };

    const mockProject2: TableProject = {
      ...mockTableProject,
      title: "Beta Project",
      stakeInUsd: 1000,
      universeId: "2",
    };

    const mockProject3: TableProject = {
      ...mockTableProject,
      title: "Gamma Project",
      stakeInUsd: 10,
      universeId: "3",
    };

    const mockProject4: TableProject = {
      ...mockTableProject,
      title: "Gamma Project",
      stakeInUsd: 1,
      universeId: "3",
    };

    const mockZeroStakeProject: TableProject = {
      ...mockTableProject,
      title: "Zero Stake Project",
      stakeInUsd: 0,
      universeId: "4",
    };

    it("should respect the result limit", () => {
      const projects = [
        mockIcpProject,
        mockProject1,
        mockProject2,
        mockProject3,
        mockProject4,
      ];

      const result = getTopStakedTokens({
        projects,
      });

      expect(result).toHaveLength(4);
      expect(result).toEqual([
        mockIcpProject,
        mockProject1,
        mockProject2,
        mockProject3,
      ]);
    });

    it("should return an empty array if no ICP", () => {
      const projects = [
        mockProject1,
        mockProject2,
        mockProject3,
        mockZeroStakeProject,
      ];

      const result = getTopStakedTokens({
        projects,
      });

      expect(result).toHaveLength(0);
    });

    it("should exclude projects with zero stake", () => {
      const projects = [
        mockZeroStakeProject,
        mockProject1,
        mockProject2,
        mockProject3,
        mockIcpProject,
      ];

      const result = getTopStakedTokens({
        projects,
      });

      expect(result).toHaveLength(4);
      expect(result).not.toContainEqual(mockZeroStakeProject);
    });

    it("should order projects: ICP first, then by descending USD stake", () => {
      const projects = [
        mockProject3,
        mockProject2,
        mockProject1,
        mockZeroStakeProject,
        mockIcpProject,
      ];

      const result = getTopStakedTokens({
        projects,
      });

      expect(result).toEqual([
        mockIcpProject, // ICP first, 1$
        mockProject1, // 2000$
        mockProject2, // 1000$
        mockProject3, // 10$
      ]);
    });

    it("should exclude projects with zero balance but not ICP", () => {
      const zeroIcpProject: TableProject = {
        ...mockTableProject,
        stakeInUsd: 0,
      };

      const projects = [mockZeroStakeProject, zeroIcpProject];

      const result = getTopStakedTokens({
        projects,
      });

      expect(result).toHaveLength(1);
      expect(result).toContainEqual(zeroIcpProject);
    });

    it("should filter abandoned project", () => {
      const mockCTSProject: TableProject = {
        ...mockTableProject,
        stakeInUsd: 1000,
        universeId: CYCLES_TRANSFER_STATION_ROOT_CANISTER_ID,
      };
      const mockSeersProject: TableProject = {
        ...mockTableProject,
        stakeInUsd: 1000,
        universeId: SEERS_ROOT_CANISTER_ID,
      };

      const projects = [mockCTSProject, mockSeersProject, mockIcpProject];

      const result = getTopStakedTokens({
        projects,
      });

      expect(result).toHaveLength(1);
      expect(result).not.toContainEqual(mockCTSProject);
      expect(result).not.toContainEqual(mockSeersProject);
    });
  });

  describe("shouldShowInfoRow", () => {
    it("should show info row when other card has more tokens", () => {
      expect(
        shouldShowInfoRow({
          currentCardNumberOfTokens: 1,
          otherCardNumberOfTokens: 4,
        })
      ).toBe(true);
    });

    it("should show info row when other card is empty and current card has less than 4 tokens", () => {
      expect(
        shouldShowInfoRow({
          currentCardNumberOfTokens: 2,
          otherCardNumberOfTokens: 0,
        })
      ).toBe(true);

      expect(
        shouldShowInfoRow({
          currentCardNumberOfTokens: 3,
          otherCardNumberOfTokens: 0,
        })
      ).toBe(true);

      expect(
        shouldShowInfoRow({
          currentCardNumberOfTokens: 4,
          otherCardNumberOfTokens: 0,
        })
      ).toBe(false);

      expect(
        shouldShowInfoRow({
          currentCardNumberOfTokens: 5,
          otherCardNumberOfTokens: 0,
        })
      ).toBe(false);
    });

    it("should show info row when both cards have fewer than 3 tokens", () => {
      expect(
        shouldShowInfoRow({
          currentCardNumberOfTokens: 2,
          otherCardNumberOfTokens: 2,
        })
      ).toBe(true);

      expect(
        shouldShowInfoRow({
          currentCardNumberOfTokens: 1,
          otherCardNumberOfTokens: 2,
        })
      ).toBe(true);
    });

    it("should not show info row when both cards have 3 or more tokens", () => {
      expect(
        shouldShowInfoRow({
          currentCardNumberOfTokens: 4,
          otherCardNumberOfTokens: 4,
        })
      ).toBe(false);

      expect(
        shouldShowInfoRow({
          currentCardNumberOfTokens: 4,
          otherCardNumberOfTokens: 3,
        })
      ).toBe(false);
    });
  });

  describe("formatParticipation", () => {
    it("should format values < 1,000 as plain numbers", () => {
      expect(formatParticipation(0n)).toBe("0");
      expect(formatParticipation(100_000_000n)).toBe("1");
      expect(formatParticipation(105_000_000n)).toBe("1.05");
      expect(formatParticipation(150_000_000n)).toBe("1.5");
      expect(formatParticipation(99_900_000_000n)).toBe("999");
    });

    it("should format values between 1,000 and 999,999 with decimal k suffix", () => {
      expect(formatParticipation(100_001_000_000n)).toBe("1k");
      expect(formatParticipation(105_000_000_000n)).toBe("1.05k");
      expect(formatParticipation(110_000_000_000n)).toBe("1.1k");
      expect(formatParticipation(990_000_000_000n)).toBe("9.9k");

      expect(formatParticipation(1_000_001_000_000n)).toBe("10k");
      expect(formatParticipation(1_050_001_000_000n)).toBe("10.5k");
      expect(formatParticipation(1_055_001_000_000n)).toBe("10.55k");
      expect(formatParticipation(9_990_001_000_000n)).toBe("99.9k");

      expect(formatParticipation(10_000_000_000_000n)).toBe("100k");
      expect(formatParticipation(10_500_000_000_000n)).toBe("105k");
      expect(formatParticipation(10_505_000_000_000n)).toBe("105.05k");
      expect(formatParticipation(10_550_000_000_000n)).toBe("105.5k");
      expect(formatParticipation(99_900_000_000_000n)).toBe("999k");
    });

    it("should format values >= 1,000,000 with M suffix", () => {
      expect(formatParticipation(100_000_000_000_000n)).toBe("1M");
      expect(formatParticipation(100_005_000_000_000n)).toBe("1M");
      expect(formatParticipation(105_000_000_000_000n)).toBe("1.05M");
      expect(formatParticipation(150_000_000_000_000n)).toBe("1.5M");
    });
  });

  describe("getMinCommitmentPercentage", () => {
    const baseProjectCommitmentProps = {
      totalCommitmentE8s: 1n,
      nfCommitmentE8s: 1n,
      maxDirectCommitmentE8s: 1n,
      isNFParticipating: true,
    };

    it("should calculate the correct percentage ratio", () => {
      const zeroMinDirectCommitment: FullProjectCommitmentSplit = {
        ...baseProjectCommitmentProps,
        directCommitmentE8s: 500_000_000n,
        minDirectCommitmentE8s: 0n,
      };
      expect(getMinCommitmentPercentage(zeroMinDirectCommitment)).toBe(0);

      const zeroCommitment: FullProjectCommitmentSplit = {
        ...baseProjectCommitmentProps,
        directCommitmentE8s: 0n,
        minDirectCommitmentE8s: 500_000_000n,
      };
      expect(getMinCommitmentPercentage(zeroCommitment)).toBe(0);

      const equalCommitments: FullProjectCommitmentSplit = {
        ...baseProjectCommitmentProps,
        directCommitmentE8s: 500_000_000n,
        minDirectCommitmentE8s: 500_000_000n,
      };
      expect(getMinCommitmentPercentage(equalCommitments)).toBe(1);

      const halfCommitment: FullProjectCommitmentSplit = {
        ...baseProjectCommitmentProps,
        directCommitmentE8s: 500_000_000n,
        minDirectCommitmentE8s: 1_000_000_000n,
      };
      expect(getMinCommitmentPercentage(halfCommitment)).toBe(0.5);

      const doubleCommitment: FullProjectCommitmentSplit = {
        ...baseProjectCommitmentProps,
        directCommitmentE8s: 1_000_000_000n,
        minDirectCommitmentE8s: 500_000_000n,
      };
      expect(getMinCommitmentPercentage(doubleCommitment)).toBe(2);

      const decimalResult: FullProjectCommitmentSplit = {
        ...baseProjectCommitmentProps,
        directCommitmentE8s: 123_456_789n,
        minDirectCommitmentE8s: 500_000_000n,
      };
      expect(getMinCommitmentPercentage(decimalResult)).toBeCloseTo(0.2469, 4);
    });
  });

  describe("mapProposalInfoToCard", () => {
    beforeEach(() => {
      vi.spyOn(dateUtils, "nowInSeconds").mockReturnValue(1000);
    });

    it("should return undefined when proposal is missing", () => {
      const proposalInfo = {} as ProposalInfo;
      expect(mapProposalInfoToCard(proposalInfo)).toBeUndefined();
    });

    it("should return undefined when action is missing", () => {
      const proposalInfo = {
        proposal: {},
      } as ProposalInfo;
      expect(mapProposalInfoToCard(proposalInfo)).toBeUndefined();
    });

    it("should return undefined when action is not CreateServiceNervousSystem", () => {
      const proposalInfo = {
        proposal: {
          action: {
            ManageNeuron: {
              id: undefined,
              command: undefined,
              neuronIdOrSubaccount: undefined,
            },
          },
        },
      } as ProposalInfo;
      expect(mapProposalInfoToCard(proposalInfo)).toBeUndefined();
    });

    it("should correctly map a valid CreateServiceNervousSystem proposal", () => {
      const proposalInfo = {
        id: 12345n,
        deadlineTimestampSeconds: 2000n,
        proposal: {
          title: "Test SNS Proposal",
          action: {
            CreateServiceNervousSystem: {
              name: "Test SNS",
              logo: {
                base64Encoding: "data:image/png;base64,testImageData",
              },
            },
          },
        },
      } as ProposalInfo;

      const result = mapProposalInfoToCard(proposalInfo);

      expect(result).toEqual({
        durationTillDeadline: 1000n, // 2000 - 1000 (mocked nowInSeconds)
        id: 12345n,
        title: "Test SNS Proposal",
        logo: "data:image/png;base64,testImageData",
        name: "Test SNS",
      });
    });

    it("should handle missing optional fields", () => {
      const proposalInfo = {
        id: 12345n,
        deadlineTimestampSeconds: 2000n,
        proposal: {
          action: {
            CreateServiceNervousSystem: {
              name: "Test SNS",
              // no logo provided
            },
          },
          // no title provided
        },
      } as ProposalInfo;

      const result = mapProposalInfoToCard(proposalInfo);

      expect(result).toEqual({
        durationTillDeadline: 1000n,
        id: 12345n,
        title: undefined,
        logo: undefined,
        name: "Test SNS",
      });
    });

    it("should handle missing deadlineTimestampSeconds", () => {
      const proposalInfo = {
        id: 12345n,
        // no deadlineTimestampSeconds
        proposal: {
          title: "Test SNS Proposal",
          action: {
            CreateServiceNervousSystem: {
              name: "Test SNS",
            },
          },
        },
      } as ProposalInfo;

      const result = mapProposalInfoToCard(proposalInfo);

      expect(result).toEqual({
        durationTillDeadline: 0n,
        id: 12345n,
        title: "Test SNS Proposal",
        logo: undefined,
        name: "Test SNS",
      });
    });
  });
});
