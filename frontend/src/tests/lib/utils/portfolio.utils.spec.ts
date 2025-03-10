import { CYCLES_TRANSFER_STATION_ROOT_CANISTER_ID } from "$lib/constants/canister-ids.constants";
import { CKBTC_UNIVERSE_CANISTER_ID } from "$lib/constants/ckbtc-canister-ids.constants";
import { CKUSDC_UNIVERSE_CANISTER_ID } from "$lib/constants/ckusdc-canister-ids.constants";
import type { TableProject } from "$lib/types/staking";
import type { UserToken } from "$lib/types/tokens-page";
import {
  formatParticipation,
  getMinCommitmentPercentage,
  getTopHeldTokens,
  getTopStakedTokens,
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
import { Principal } from "@dfinity/principal";

describe("Portfolio utils", () => {
  describe("getTopTokens", () => {
    const mockNonUserToken = createUserTokenLoading();
    const mockIcpToken = createIcpUserToken();
    const mockCkBTCToken = createUserToken({
      universeId: CKBTC_UNIVERSE_CANISTER_ID,
    });
    const mockCkUSDCToken = createUserToken({
      universeId: CKUSDC_UNIVERSE_CANISTER_ID,
    });
    const mockOtherToken = createUserToken({
      universeId: principal(1),
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

    it("should order tokens: ICP first, then ckBTC/ckUSDC, then others", () => {
      const tokens: UserToken[] = [
        mockOtherToken,
        mockCkUSDCToken,
        mockCkBTCToken,
        mockNonUserToken,
        mockIcpToken,
      ];
      const result = getTopHeldTokens({ userTokens: tokens });

      expect(result).toEqual([
        mockIcpToken,
        mockCkBTCToken,
        mockCkUSDCToken,
        mockOtherToken,
      ]);
    });

    describe("when signed in", () => {
      const mockIcpToken = createIcpUserToken({
        balanceInUsd: 100,
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

      it("should exclude tokens with zero balance", () => {
        const tokens: UserToken[] = [
          mockZeroBalanceUserTokenData,
          mockOtherToken,
          mockCkUSDCToken,
          mockCkBTCToken,
          mockNonUserToken,
          mockIcpToken,
        ];
        const result = getTopHeldTokens({
          userTokens: tokens,
          isSignedIn: true,
        });

        expect(result).toHaveLength(4);
        expect(result).not.toContainEqual(mockZeroBalanceUserTokenData);
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
          isSignedIn: true,
        });

        expect(result).toEqual([
          mockIcpToken, // 100$
          mockOtherToken, // 2000$
          mockCkUSDCToken, // 1000$
          mockCkBTCToken, // 10$
        ]);
      });

      it("should return empty array when all tokens have zero balance", () => {
        const mockIcpToken = createIcpUserToken({ balanceInUsd: 0 });
        const tokens: UserToken[] = [
          mockZeroBalanceUserTokenData,
          mockIcpToken,
        ];
        const result = getTopHeldTokens({
          userTokens: tokens,
          isSignedIn: true,
        });

        expect(result).toHaveLength(0);
      });

      it("should filter CTS token", () => {
        const mockIcpToken = createIcpUserToken({ balanceInUsd: 1000 });
        const mockCSTProject = createUserToken({
          universeId: Principal.fromText(
            CYCLES_TRANSFER_STATION_ROOT_CANISTER_ID
          ),
          balanceInUsd: 0,
        });
        const tokens: UserToken[] = [mockCSTProject, mockIcpToken];
        const result = getTopHeldTokens({
          userTokens: tokens,
          isSignedIn: true,
        });

        expect(result).toHaveLength(1);
        expect(result).not.toContainEqual(mockCSTProject);
      });
    });
  });

  describe("getTopProjects", () => {
    const mockIcpProject: TableProject = {
      ...mockTableProject,
      title: "Internet Computer",
      stakeInUsd: 0,
    };

    const mockProject1: TableProject = {
      ...mockTableProject,
      title: "A Project",
      stakeInUsd: 0,
      universeId: "1",
    };

    const mockProject2: TableProject = {
      ...mockTableProject,
      title: "B Project",
      stakeInUsd: 0,
      universeId: "2",
    };

    const mockProject3: TableProject = {
      ...mockTableProject,
      title: "C Project",
      stakeInUsd: 0,
      universeId: "3",
    };

    const mockProject4: TableProject = {
      ...mockTableProject,
      title: "D Project",
      stakeInUsd: 0,
      universeId: "4",
    };

    it("should respect the result limit of MAX_NUMBER_OF_ITEMS(4)", () => {
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

    it("should order projects: ICP first, then by project title value", () => {
      const projects = [
        mockProject2,
        mockProject3,
        mockProject1,
        mockIcpProject,
      ];

      const result = getTopStakedTokens({ projects });

      expect(result).toEqual([
        mockIcpProject,
        mockProject1,
        mockProject2,
        mockProject3,
      ]);
    });

    describe("when signed in", () => {
      const mockIcpProject: TableProject = {
        ...mockTableProject,
        title: "Internet Computer",
        stakeInUsd: 100,
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

      const mockZeroStakeProject: TableProject = {
        ...mockTableProject,
        title: "Zero Stake Project",
        stakeInUsd: 0,
        universeId: "4",
      };

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
          isSignedIn: true,
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
          isSignedIn: true,
        });

        expect(result).toEqual([
          mockIcpProject, // ICP first, 100$
          mockProject1, // 2000$
          mockProject2, // 1000$
          mockProject3, // 10$
        ]);
      });

      it("should return empty array when all projects have zero stake", () => {
        const zeroIcpProject: TableProject = {
          ...mockTableProject,
          stakeInUsd: 0,
        };

        const projects = [mockZeroStakeProject, zeroIcpProject];

        const result = getTopStakedTokens({
          projects,
          isSignedIn: true,
        });

        expect(result).toHaveLength(0);
      });

      it("should filter CTS project", () => {
        const mockCTSProject: TableProject = {
          ...mockTableProject,
          stakeInUsd: 1000,
          universeId: CYCLES_TRANSFER_STATION_ROOT_CANISTER_ID,
        };

        const projects = [mockCTSProject, mockIcpProject];

        const result = getTopStakedTokens({
          projects,
          isSignedIn: true,
        });

        expect(result).toHaveLength(1);
        expect(result).not.toContainEqual(mockCTSProject);
      });
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
          currentCardNumberOfTokens: 3,
          otherCardNumberOfTokens: 3,
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
    it("should return integer values as strings without decimal places", () => {
      expect(formatParticipation(0n)).toBe("0");
      expect(formatParticipation(100_000_000n)).toBe("1");
      expect(formatParticipation(10_000_000_000n)).toBe("100");
      expect(formatParticipation(999_000_000_000n)).toBe("9990");
    });

    it("should format decimal values less than 10,000 with 2 decimal places", () => {
      expect(formatParticipation(12_345_000_000n)).toBe("123.45");
      expect(formatParticipation(10_000_000n)).toBe("0.10");
      expect(formatParticipation(999_999_000_000n)).toBe("9999.99");
    });

    it("should format values >= 10,000 with K suffix", () => {
      expect(formatParticipation(1_000_000_000_000n)).toBe("10K");
      expect(formatParticipation(1_200_000_000_000n)).toBe("12K");
      expect(formatParticipation(40_000_000_000_000n)).toBe("400K");
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
});
