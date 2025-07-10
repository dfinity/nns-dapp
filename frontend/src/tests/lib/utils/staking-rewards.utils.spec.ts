import {
  LEDGER_CANISTER_ID,
  OWN_CANISTER_ID_TEXT,
} from "$lib/constants/canister-ids.constants";
import {
  E8S_RATE,
  SECONDS_IN_7_DAYS,
  SECONDS_IN_DAY,
  SECONDS_IN_EIGHT_YEARS,
  SECONDS_IN_FOUR_YEARS,
  SECONDS_IN_HALF_YEAR,
  SECONDS_IN_MONTH,
  SECONDS_IN_YEAR,
} from "$lib/constants/constants";
import type { CachedSnsDto } from "$lib/types/sns-aggregator";
import type { UserTokenData } from "$lib/types/tokens-page";
import {
  getStakingRewardData,
  type StakingRewardCalcParams,
} from "$lib/utils/staking-rewards.utils";
import {
  NeuronState,
  type GovernanceCachedMetrics,
  type NetworkEconomics,
  type NeuronInfo,
} from "@dfinity/nns";
import { Principal } from "@dfinity/principal";
import type { SnsNeuron } from "@dfinity/sns";

type TestStakingRewardCalcParams = {
  auth: boolean;
  tokens: Pick<UserTokenData, "balanceInUsd" | "ledgerCanisterId">[];
  snsProjects: {
    data: {
      canister_ids: Pick<
        CachedSnsDto["canister_ids"],
        "root_canister_id" | "ledger_canister_id"
      >;
      nervous_system_parameters: Pick<
        CachedSnsDto["nervous_system_parameters"],
        | "max_dissolve_delay_seconds"
        | "max_dissolve_delay_bonus_percentage"
        | "neuron_minimum_stake_e8s"
        | "max_neuron_age_for_age_bonus"
        | "neuron_minimum_dissolve_delay_to_vote_seconds"
        | "max_age_bonus_percentage"
        | "voting_rewards_parameters"
      >;
      icrc1_total_supply: CachedSnsDto["icrc1_total_supply"];
    }[];
  };
  snsNeurons: {
    [rootCanisterId: string]: {
      neurons: Pick<
        SnsNeuron,
        | "maturity_e8s_equivalent"
        | "staked_maturity_e8s_equivalent"
        | "cached_neuron_stake_e8s"
        | "neuron_fees_e8s"
        | "aging_since_timestamp_seconds"
        | "dissolve_state"
        | "auto_stake_maturity"
      >[];
    };
  };
  nnsNeurons: {
    neurons: Array<
      Pick<NeuronInfo, "neuronId" | "state" | "dissolveDelaySeconds"> & {
        fullNeuron: Pick<
          NeuronInfo["fullNeuron"],
          | "maturityE8sEquivalent"
          | "stakedMaturityE8sEquivalent"
          | "cachedNeuronStake"
          | "neuronFees"
          | "agingSinceTimestampSeconds"
          | "dissolveState"
          | "autoStakeMaturity"
        >;
      }
    >;
  };
  nnsEconomics: {
    parameters: Pick<NetworkEconomics, "neuronMinimumStake"> & {
      votingPowerEconomics: Pick<
        NetworkEconomics["votingPowerEconomics"],
        "neuronMinimumDissolveDelayToVoteSeconds"
      >;
    };
  };
  fxRates: Record<string, number>;
  governanceMetrics: {
    metrics: Pick<GovernanceCachedMetrics, "totalSupplyIcp">;
  };
  nnsTotalVotingPower: bigint;
};

const referenceDate = new Date("2025-07-04T00:00:00Z"); // 4 Jul 2025
const referenceDateSeconds = referenceDate.getTime() / 1000;

describe("neuron-utils", () => {
  let params: TestStakingRewardCalcParams;

  beforeEach(() => {
    // Reset params before each test to ensure a clean state
    params = getInitialMockedParams();
  });

  it("Works with an empty account", () => {
    params.nnsNeurons.neurons = [];
    params.tokens = [];
    expect(round(getRewardData(params).stakingPower, 2)).toBe(0);
    expect(round(getRewardData(params).stakingPowerUSD, 2)).toBe(0);
    expect(round(getRewardData(params).rewardBalanceUSD, 2)).toBe(0);
    expect(round(getRewardData(params).rewardEstimateWeekUSD, 2)).toBe(0);
    expect(
      round(getRewardData(params).apy.get(OWN_CANISTER_ID_TEXT).cur, 2)
    ).toBe(0);
    expect(
      round(getRewardData(params).apy.get(OWN_CANISTER_ID_TEXT).max, 2)
    ).toBe(0);

    params.snsProjects.data.push(getTestSns());
    expect(round(getRewardData(params).apy.get(TEST_SNS_IDS[0]).cur, 2)).toBe(
      0
    );
    expect(round(getRewardData(params).apy.get(TEST_SNS_IDS[0]).max, 2)).toBe(
      0
    );
  });

  /////////////////
  /// STAKING POWER
  /////////////////

  it("Calculates the Staking power (only NNS)", () => {
    // Initial state with a single NNS neuron, equale split between balance and stake
    expect(round(getRewardData(params).stakingPower, 2)).toBe(0.5);
    expect(round(getRewardData(params).stakingPowerUSD, 2)).toBe(450);

    // Account for neuron fees
    params.nnsNeurons.neurons[0].fullNeuron.neuronFees = BigInt(50 * E8S_RATE);
    expect(round(getRewardData(params).stakingPower, 2)).toBe(0);
    expect(round(getRewardData(params).stakingPowerUSD, 2)).toBe(0);
    params.nnsNeurons.neurons[0].fullNeuron.neuronFees = 0n;

    // Account for neuron staked maturitiy
    params.nnsNeurons.neurons[0].fullNeuron.stakedMaturityE8sEquivalent =
      BigInt(50 * E8S_RATE);
    expect(round(getRewardData(params).stakingPower, 2)).toBe(0.67);
    expect(round(getRewardData(params).stakingPowerUSD, 2)).toBe(900);
    params.nnsNeurons.neurons[0].fullNeuron.stakedMaturityE8sEquivalent = 0n;

    // Account for neuron un-staked maturitiy
    params.nnsNeurons.neurons[0].fullNeuron.maturityE8sEquivalent = BigInt(
      50 * E8S_RATE
    );
    expect(round(getRewardData(params).stakingPower, 2)).toBe(0.33);
    expect(round(getRewardData(params).stakingPowerUSD, 2)).toBe(450);
    params.nnsNeurons.neurons[0].fullNeuron.maturityE8sEquivalent = 0n;

    // Other cases with different balances
    params.tokens[0].balanceInUsd = 900;
    expect(round(getRewardData(params).stakingPower, 2)).toBe(0.33);
    expect(round(getRewardData(params).stakingPowerUSD, 2)).toBe(450);

    params.tokens[0].balanceInUsd = 1350;
    expect(round(getRewardData(params).stakingPower, 2)).toBe(0.25);
    expect(round(getRewardData(params).stakingPowerUSD, 2)).toBe(450);

    params.tokens[0].balanceInUsd = 13500;
    expect(round(getRewardData(params).stakingPower, 2)).toBe(0.03);
    expect(round(getRewardData(params).stakingPowerUSD, 2)).toBe(450);

    // Other cases with multiple neurons and different stakes
    params.nnsNeurons.neurons.push(getTestNeuronNns());
    expect(round(getRewardData(params).stakingPower, 2)).toBe(0.06);
    expect(round(getRewardData(params).stakingPowerUSD, 2)).toBe(900);

    params.nnsNeurons.neurons.push(getTestNeuronNns());
    expect(round(getRewardData(params).stakingPower, 2)).toBe(0.09);
    expect(round(getRewardData(params).stakingPowerUSD, 2)).toBe(1350);

    params.nnsNeurons.neurons.push(getTestNeuronNns());
    expect(round(getRewardData(params).stakingPower, 2)).toBe(0.12);
    expect(round(getRewardData(params).stakingPowerUSD, 2)).toBe(1800);

    params.nnsNeurons.neurons = [getTestNeuronNns(), getTestNeuronNns()];
    params.nnsNeurons.neurons[0].fullNeuron.cachedNeuronStake = BigInt(
      10 ** 10 * E8S_RATE
    );
    expect(round(getRewardData(params).stakingPower, 2)).toBe(1.0);
    expect(round(getRewardData(params).stakingPowerUSD, 2)).toBe(
      450 + 10 ** 10 * 9
    );

    // Test with no neurons
    params.nnsNeurons.neurons = [];
    expect(round(getRewardData(params).stakingPower, 2)).toBe(0);
    expect(round(getRewardData(params).stakingPowerUSD, 2)).toBe(0);

    // Test with a neuron that has no a negligible stake
    params.nnsNeurons.neurons.push(getTestNeuronNns());
    params.nnsNeurons.neurons[0].fullNeuron.cachedNeuronStake = BigInt(
      1 * E8S_RATE
    );
    expect(round(getRewardData(params).stakingPower, 2)).toBe(0);
    expect(round(getRewardData(params).stakingPowerUSD, 2)).toBe(9);
  });

  it("Calculates the Staking power (with SNSs)", () => {
    expect(round(getRewardData(params).stakingPower, 2)).toBe(0.5);
    expect(round(getRewardData(params).stakingPowerUSD, 2)).toBe(450);

    // Add a SNS project without a neuron
    params.snsProjects.data.push(getTestSns());
    params.tokens.push({
      balanceInUsd: 450,
      ledgerCanisterId: Principal.fromText(TEST_SNS_IDS[0]),
    });
    expect(round(getRewardData(params).stakingPower, 2)).toBe(0.33);
    expect(round(getRewardData(params).stakingPowerUSD, 2)).toBe(450);

    // Add an SNS neuron with a stake
    params.snsNeurons[TEST_SNS_IDS[0]] = {
      neurons: [getTestNeuronSns()],
    };
    params.snsNeurons[TEST_SNS_IDS[0]].neurons[0].cached_neuron_stake_e8s =
      BigInt(45 * E8S_RATE);
    params.fxRates[TEST_SNS_IDS[0]] = 10;
    expect(round(getRewardData(params).stakingPower, 2)).toBe(0.5);
    expect(round(getRewardData(params).stakingPowerUSD, 2)).toBe(900);

    // Modify the FX rate
    params.tokens[1].balanceInUsd = 45 * 1.23;
    params.fxRates[TEST_SNS_IDS[0]] = 1.23;
    expect(round(getRewardData(params).stakingPower, 2)).toBe(0.5);
    expect(round(getRewardData(params).stakingPowerUSD, 2)).toBe(
      450 + 45 * 1.23
    );

    // Account for neuron fees
    params.tokens[1].balanceInUsd = 450;
    params.snsNeurons[TEST_SNS_IDS[0]].neurons[0].neuron_fees_e8s = BigInt(
      45 * E8S_RATE
    );
    expect(round(getRewardData(params).stakingPower, 2)).toBe(0.33);
    expect(round(getRewardData(params).stakingPowerUSD, 2)).toBe(450);

    params.snsNeurons[TEST_SNS_IDS[0]].neurons[0].neuron_fees_e8s = BigInt(
      90 * E8S_RATE
    );
    expect(round(getRewardData(params).stakingPower, 2)).toBe(0.33);
    expect(round(getRewardData(params).stakingPowerUSD, 2)).toBe(450);

    params.tokens[1].balanceInUsd = 0;
    expect(round(getRewardData(params).stakingPower, 2)).toBe(0.5);
    expect(round(getRewardData(params).stakingPowerUSD, 2)).toBe(450);

    params.nnsNeurons.neurons[0].fullNeuron.neuronFees = BigInt(25 * E8S_RATE);
    expect(round(getRewardData(params).stakingPower, 2)).toBe(0.33);
    expect(round(getRewardData(params).stakingPowerUSD, 2)).toBe(225);

    params.nnsNeurons.neurons[0].fullNeuron.neuronFees = BigInt(50 * E8S_RATE);
    expect(round(getRewardData(params).stakingPower, 2)).toBe(0);
    expect(round(getRewardData(params).stakingPowerUSD, 2)).toBe(0);
  });

  it("Calculates the Staking power (complex cases: multiple SNSs, multiple neurons, fees, maturities)", () => {
    expect(round(getRewardData(params).stakingPower, 2)).toBe(0.5);
    expect(round(getRewardData(params).stakingPowerUSD, 2)).toBe(450);

    params.snsProjects.data.push(getTestSns(TEST_SNS_IDS[0]));
    params.tokens.push({
      balanceInUsd: 450,
      ledgerCanisterId: Principal.fromText(TEST_SNS_IDS[0]),
    });
    params.snsProjects.data.push(getTestSns(TEST_SNS_IDS[1]));
    params.tokens.push({
      balanceInUsd: 450,
      ledgerCanisterId: Principal.fromText(TEST_SNS_IDS[1]),
    });
    params.snsProjects.data.push(getTestSns(TEST_SNS_IDS[2]));
    params.tokens.push({
      balanceInUsd: 900,
      ledgerCanisterId: Principal.fromText(TEST_SNS_IDS[2]),
    });

    expect(round(getRewardData(params).stakingPower, 2)).toBe(0.17);
    expect(round(getRewardData(params).stakingPowerUSD, 2)).toBe(450);

    // Add SNS neurons
    params.snsNeurons[TEST_SNS_IDS[0]] = {
      neurons: [getTestNeuronSns()],
    };
    params.snsNeurons[TEST_SNS_IDS[0]].neurons[0].cached_neuron_stake_e8s =
      BigInt(50 * E8S_RATE);
    params.fxRates[TEST_SNS_IDS[0]] = 9;

    params.snsNeurons[TEST_SNS_IDS[1]] = {
      neurons: [getTestNeuronSns()],
    };
    params.snsNeurons[TEST_SNS_IDS[1]].neurons[0].cached_neuron_stake_e8s =
      BigInt(45 * E8S_RATE);
    params.fxRates[TEST_SNS_IDS[1]] = 10;

    params.snsNeurons[TEST_SNS_IDS[2]] = {
      neurons: [getTestNeuronSns()],
    };
    params.snsNeurons[TEST_SNS_IDS[2]].neurons[0].cached_neuron_stake_e8s =
      BigInt(1000 * E8S_RATE);
    params.fxRates[TEST_SNS_IDS[2]] = 0.9;

    expect(round(getRewardData(params).stakingPower, 2)).toBe(0.5);
    expect(round(getRewardData(params).stakingPowerUSD, 2)).toBe(2250);

    // Add fees
    params.snsNeurons[TEST_SNS_IDS[2]].neurons[0].neuron_fees_e8s = BigInt(
      500 * E8S_RATE
    );
    expect(round(getRewardData(params).stakingPower, 2)).toBe(0.44);
    expect(round(getRewardData(params).stakingPowerUSD, 2)).toBe(1800);

    params.snsNeurons[TEST_SNS_IDS[2]].neurons[0].neuron_fees_e8s = BigInt(
      1000 * E8S_RATE
    );
    expect(round(getRewardData(params).stakingPower, 2)).toBe(0.38);
    expect(round(getRewardData(params).stakingPowerUSD, 2)).toBe(1350);

    // Add maturities
    params.snsNeurons[TEST_SNS_IDS[2]].neurons[0].neuron_fees_e8s = BigInt(0);
    expect(round(getRewardData(params).stakingPower, 2)).toBe(0.5);
    expect(round(getRewardData(params).stakingPowerUSD, 2)).toBe(2250);
    params.snsNeurons[TEST_SNS_IDS[2]].neurons[0].maturity_e8s_equivalent =
      BigInt(1000 * E8S_RATE);
    expect(round(getRewardData(params).stakingPower, 2)).toBe(0.42);
    expect(round(getRewardData(params).stakingPowerUSD, 2)).toBe(2250);

    params.snsNeurons[
      TEST_SNS_IDS[2]
    ].neurons[0].staked_maturity_e8s_equivalent = [BigInt(1000 * E8S_RATE)];
    expect(round(getRewardData(params).stakingPower, 2)).toBe(0.5);
    expect(round(getRewardData(params).stakingPowerUSD, 2)).toBe(3150);
  });

  ///////
  /// APY
  ///////

  it("Calculates the APYs (NNS)", () => {
    // Conficende range for APY calculations in respect to the reference value
    // This is used to check if the calculated APY is within a reasonable range
    // Some small differences can occur due to rounding and different precision levels
    const confidence = 0.02; // 2% = 10 -> 9.8 <-> 10.2

    const checkApy = (id: string, max: boolean, value) =>
      inConfidenceRange(
        round(getRewardData(params).apy.get(id)[max ? "max" : "cur"] * 100, 2),
        value,
        confidence
      );

    // Dissolving neuron (6 months dissolve delay)
    params.tokens[0].balanceInUsd = 0;
    params.nnsNeurons.neurons[0].state = NeuronState.Dissolving;
    params.nnsNeurons.neurons[0].fullNeuron.cachedNeuronStake = BigInt(
      50 * E8S_RATE
    );
    params.nnsNeurons.neurons[0].fullNeuron.agingSinceTimestampSeconds =
      BigInt(0);
    params.nnsNeurons.neurons[0].fullNeuron.autoStakeMaturity = false;
    params.nnsNeurons.neurons[0].fullNeuron.dissolveState = {
      WhenDissolvedTimestampSeconds:
        BigInt(referenceDateSeconds) + BigInt(0.5 * SECONDS_IN_YEAR),
    };
    expect(checkApy(OWN_CANISTER_ID_TEXT, false, 0.02)).toBe(true);
    expect(checkApy(OWN_CANISTER_ID_TEXT, true, 13.75)).toBe(true);

    // Locked neuron (6 months dissolve delay)
    params.nnsNeurons.neurons[0].state = NeuronState.Locked;
    params.nnsNeurons.neurons[0].fullNeuron.agingSinceTimestampSeconds =
      BigInt(referenceDateSeconds);
    params.nnsNeurons.neurons[0].fullNeuron.dissolveState = {
      DissolveDelaySeconds: BigInt(0.5 * SECONDS_IN_YEAR),
    };
    expect(checkApy(OWN_CANISTER_ID_TEXT, false, 6.85)).toBe(true);
    expect(checkApy(OWN_CANISTER_ID_TEXT, true, 13.75)).toBe(true);

    // Different token balance have no effect on APY
    params.tokens[0].balanceInUsd = 10;
    expect(checkApy(OWN_CANISTER_ID_TEXT, false, 6.85)).toBe(true);
    expect(checkApy(OWN_CANISTER_ID_TEXT, true, 13.75)).toBe(true);

    params.tokens[0].balanceInUsd = 10 * 10 ** 10;
    expect(checkApy(OWN_CANISTER_ID_TEXT, false, 6.85)).toBe(true);
    expect(checkApy(OWN_CANISTER_ID_TEXT, true, 13.75)).toBe(true);

    params.tokens[0].balanceInUsd = 987654321;
    expect(checkApy(OWN_CANISTER_ID_TEXT, false, 6.85)).toBe(true);
    expect(checkApy(OWN_CANISTER_ID_TEXT, true, 13.75)).toBe(true);

    // Different stake should have no effect on APY (more stake, more rewards, same APY ratio)
    params.nnsNeurons.neurons[0].fullNeuron.cachedNeuronStake = BigInt(
      100 * E8S_RATE
    );
    expect(checkApy(OWN_CANISTER_ID_TEXT, false, 6.85)).toBe(true);
    expect(checkApy(OWN_CANISTER_ID_TEXT, true, 13.75)).toBe(true);

    params.nnsNeurons.neurons[0].fullNeuron.cachedNeuronStake = BigInt(
      10000 * E8S_RATE
    );
    expect(checkApy(OWN_CANISTER_ID_TEXT, false, 6.85)).toBe(true);
    expect(checkApy(OWN_CANISTER_ID_TEXT, true, 13.75)).toBe(true);

    params.nnsNeurons.neurons[0].fullNeuron.cachedNeuronStake = BigInt(
      987654321 * E8S_RATE
    );
    expect(checkApy(OWN_CANISTER_ID_TEXT, false, 6.85)).toBe(true);
    expect(checkApy(OWN_CANISTER_ID_TEXT, true, 13.75)).toBe(true);
    params.nnsNeurons.neurons[0].fullNeuron.cachedNeuronStake = BigInt(
      50 * E8S_RATE
    );

    // Auto-stake new maturity
    params.nnsNeurons.neurons[0].fullNeuron.autoStakeMaturity = true;
    expect(checkApy(OWN_CANISTER_ID_TEXT, false, 7.1)).toBe(true);
    expect(checkApy(OWN_CANISTER_ID_TEXT, true, 13.75)).toBe(true);

    // 1 Week of dissolve delay
    params.nnsNeurons.neurons[0].fullNeuron.dissolveState = {
      WhenDissolvedTimestampSeconds:
        BigInt(referenceDateSeconds) + BigInt(SECONDS_IN_7_DAYS),
    };
    expect(checkApy(OWN_CANISTER_ID_TEXT, false, 0.0)).toBe(true);
    expect(checkApy(OWN_CANISTER_ID_TEXT, true, 13.75)).toBe(true);

    // 4 Weeks of dissolve delay
    params.nnsNeurons.neurons[0].fullNeuron.dissolveState = {
      DissolveDelaySeconds: BigInt(4 * SECONDS_IN_7_DAYS),
    };
    expect(checkApy(OWN_CANISTER_ID_TEXT, false, 0.0)).toBe(true);
    expect(checkApy(OWN_CANISTER_ID_TEXT, true, 13.75)).toBe(true);

    // 6 Months of dissolve delay
    params.nnsNeurons.neurons[0].fullNeuron.dissolveState = {
      DissolveDelaySeconds: BigInt(SECONDS_IN_HALF_YEAR),
    };
    expect(checkApy(OWN_CANISTER_ID_TEXT, false, 7.1)).toBe(true);
    expect(checkApy(OWN_CANISTER_ID_TEXT, true, 13.75)).toBe(true);

    // 10 Years of dissolve delay
    params.nnsNeurons.neurons[0].fullNeuron.dissolveState = {
      DissolveDelaySeconds: BigInt(10 * SECONDS_IN_YEAR),
    };
    expect(checkApy(OWN_CANISTER_ID_TEXT, false, 13.75)).toBe(true);
    expect(checkApy(OWN_CANISTER_ID_TEXT, true, 13.75)).toBe(true);

    // The FX rate should not affect the APY
    params.fxRates[LEDGER_CANISTER_ID.toText()] = 1.23;
    expect(checkApy(OWN_CANISTER_ID_TEXT, false, 13.75)).toBe(true);
    expect(checkApy(OWN_CANISTER_ID_TEXT, true, 13.75)).toBe(true);

    params.fxRates[LEDGER_CANISTER_ID.toText()] = 987654.321;
    expect(checkApy(OWN_CANISTER_ID_TEXT, false, 13.75)).toBe(true);
    expect(checkApy(OWN_CANISTER_ID_TEXT, true, 13.75)).toBe(true);

    params.fxRates[LEDGER_CANISTER_ID.toText()] = 0.000001;
    expect(checkApy(OWN_CANISTER_ID_TEXT, false, 13.75)).toBe(true);
    expect(checkApy(OWN_CANISTER_ID_TEXT, true, 13.75)).toBe(true);
    params.fxRates[LEDGER_CANISTER_ID.toText()] = 9;

    // Changes in the minimium dissolve delay are accounted
    params.nnsNeurons.neurons[0].fullNeuron.dissolveState = {
      DissolveDelaySeconds: BigInt(4 * SECONDS_IN_YEAR),
    };
    expect(checkApy(OWN_CANISTER_ID_TEXT, false, 10.15)).toBe(true);
    expect(checkApy(OWN_CANISTER_ID_TEXT, true, 13.75)).toBe(true);
    params.nnsEconomics.parameters.votingPowerEconomics = {
      neuronMinimumDissolveDelayToVoteSeconds: BigInt(
        4 * SECONDS_IN_YEAR + SECONDS_IN_DAY
      ),
    };
    expect(checkApy(OWN_CANISTER_ID_TEXT, false, 0)).toBe(true);
    expect(checkApy(OWN_CANISTER_ID_TEXT, true, 13.75)).toBe(true);
    params.nnsEconomics.parameters.votingPowerEconomics = {
      neuronMinimumDissolveDelayToVoteSeconds: BigInt(SECONDS_IN_HALF_YEAR),
    };

    // Changes in the minimium stake are accounted
    params.nnsEconomics.parameters.neuronMinimumStake = BigInt(100 * E8S_RATE);
    expect(checkApy(OWN_CANISTER_ID_TEXT, false, 0)).toBe(true);
    expect(checkApy(OWN_CANISTER_ID_TEXT, true, 0)).toBe(true);
    params.nnsEconomics.parameters.neuronMinimumStake = BigInt(1 * E8S_RATE);

    // Dissolving neuron with 10 years dissolve delay
    params.nnsNeurons.neurons[0].state = NeuronState.Dissolving;
    params.nnsNeurons.neurons[0].fullNeuron.dissolveState = {
      WhenDissolvedTimestampSeconds:
        BigInt(referenceDateSeconds) + BigInt(10 * SECONDS_IN_YEAR),
    };
    expect(checkApy(OWN_CANISTER_ID_TEXT, false, 13.3)).toBe(true);
    expect(checkApy(OWN_CANISTER_ID_TEXT, true, 13.75)).toBe(true);

    // Dissolving neuron with 1 year dissolve delay
    params.nnsNeurons.neurons[0].fullNeuron.dissolveState = {
      WhenDissolvedTimestampSeconds:
        BigInt(referenceDateSeconds) + BigInt(1 * SECONDS_IN_YEAR),
    };
    expect(checkApy(OWN_CANISTER_ID_TEXT, false, 3.55)).toBe(true);
    expect(checkApy(OWN_CANISTER_ID_TEXT, true, 13.75)).toBe(true);

    // Dissolving neuron with 1 month dissolve delay
    params.nnsNeurons.neurons[0].fullNeuron.dissolveState = {
      WhenDissolvedTimestampSeconds:
        BigInt(referenceDateSeconds) + BigInt(1 * SECONDS_IN_MONTH),
    };
    expect(checkApy(OWN_CANISTER_ID_TEXT, false, 0)).toBe(true);
    expect(checkApy(OWN_CANISTER_ID_TEXT, true, 13.75)).toBe(true);

    // Staked maturity should not affect the APY (more stake, more rewards, same APY ratio)
    params.nnsNeurons.neurons[0].state = NeuronState.Locked;
    params.nnsNeurons.neurons[0].fullNeuron.autoStakeMaturity = false;
    params.nnsNeurons.neurons[0].fullNeuron.cachedNeuronStake = BigInt(
      50 * E8S_RATE
    );
    params.nnsNeurons.neurons[0].fullNeuron.agingSinceTimestampSeconds =
      BigInt(referenceDateSeconds);
    params.nnsNeurons.neurons[0].fullNeuron.dissolveState = {
      DissolveDelaySeconds: BigInt(SECONDS_IN_YEAR),
    };
    expect(checkApy(OWN_CANISTER_ID_TEXT, false, 7.25)).toBe(true);
    expect(checkApy(OWN_CANISTER_ID_TEXT, true, 13.75)).toBe(true);

    params.nnsNeurons.neurons[0].fullNeuron.stakedMaturityE8sEquivalent =
      BigInt(50 * E8S_RATE);
    expect(checkApy(OWN_CANISTER_ID_TEXT, false, 7.25)).toBe(true);
    expect(checkApy(OWN_CANISTER_ID_TEXT, true, 13.75)).toBe(true);

    params.nnsNeurons.neurons[0].fullNeuron.stakedMaturityE8sEquivalent =
      BigInt(987654321 * E8S_RATE);
    expect(checkApy(OWN_CANISTER_ID_TEXT, false, 7.25)).toBe(true);
    expect(checkApy(OWN_CANISTER_ID_TEXT, true, 13.75)).toBe(true);
    params.nnsNeurons.neurons[0].fullNeuron.stakedMaturityE8sEquivalent = 0n;

    // Un-staked maturity should not affect the current APY (the reward is compared to the staked amount)
    params.nnsNeurons.neurons[0].fullNeuron.maturityE8sEquivalent = BigInt(
      50 * E8S_RATE
    );
    expect(checkApy(OWN_CANISTER_ID_TEXT, false, 7.25)).toBe(true);
    expect(checkApy(OWN_CANISTER_ID_TEXT, true, 13.75)).toBe(true);

    params.nnsNeurons.neurons[0].fullNeuron.maturityE8sEquivalent = BigInt(
      987654321 * E8S_RATE
    );
    expect(checkApy(OWN_CANISTER_ID_TEXT, false, 7.25)).toBe(true);
    expect(checkApy(OWN_CANISTER_ID_TEXT, true, 13.75)).toBe(true);
    params.nnsNeurons.neurons[0].fullNeuron.maturityE8sEquivalent = 0n;

    // Auto-stake maturity should positively affect the APY (the reward is compared to the INITIAL staked amount)
    params.nnsNeurons.neurons[0].fullNeuron.autoStakeMaturity = true;
    expect(checkApy(OWN_CANISTER_ID_TEXT, false, 7.5)).toBe(true);
    expect(checkApy(OWN_CANISTER_ID_TEXT, true, 13.75)).toBe(true);

    // Handles multiple neurons
    params.nnsNeurons.neurons.push(getTestNeuronNns());
    params.nnsNeurons.neurons.push(getTestNeuronNns());
    params.nnsNeurons.neurons.forEach((n) => {
      n.state = NeuronState.Locked;
      n.fullNeuron.neuronFees = BigInt(0);
      n.fullNeuron.autoStakeMaturity = false;
      n.fullNeuron.maturityE8sEquivalent = BigInt(0);
      n.fullNeuron.stakedMaturityE8sEquivalent = BigInt(0);
      n.fullNeuron.cachedNeuronStake = BigInt(50 * E8S_RATE);
      n.fullNeuron.agingSinceTimestampSeconds = BigInt(referenceDateSeconds);
      n.fullNeuron.dissolveState = {
        DissolveDelaySeconds: BigInt(SECONDS_IN_YEAR),
      };
    });

    // Same neurons, same APY
    expect(checkApy(OWN_CANISTER_ID_TEXT, false, 7.25)).toBe(true);
    expect(checkApy(OWN_CANISTER_ID_TEXT, true, 13.75)).toBe(true);

    // Let's modify the 1st neuron in order not to generate rewards
    params.nnsNeurons.neurons[0].fullNeuron.dissolveState = {
      DissolveDelaySeconds: BigInt(SECONDS_IN_7_DAYS),
    };
    expect(checkApy(OWN_CANISTER_ID_TEXT, false, (7.25 / 3) * 2)).toBe(true);
    expect(checkApy(OWN_CANISTER_ID_TEXT, true, 13.75)).toBe(true);

    // Let's modify also the 2nd neuron in order not to generate rewards
    params.nnsNeurons.neurons[1].fullNeuron.dissolveState = {
      DissolveDelaySeconds: BigInt(SECONDS_IN_7_DAYS),
    };
    expect(checkApy(OWN_CANISTER_ID_TEXT, false, 7.25 / 3)).toBe(true);
    expect(checkApy(OWN_CANISTER_ID_TEXT, true, 13.75)).toBe(true);

    // All of them are not generating rewards
    params.nnsNeurons.neurons[2].fullNeuron.dissolveState = {
      DissolveDelaySeconds: BigInt(SECONDS_IN_7_DAYS),
    };
    expect(checkApy(OWN_CANISTER_ID_TEXT, false, 0)).toBe(true);
    expect(checkApy(OWN_CANISTER_ID_TEXT, true, 13.75)).toBe(true);
    params.nnsNeurons.neurons.forEach((n) => {
      n.fullNeuron.dissolveState = {
        DissolveDelaySeconds: BigInt(SECONDS_IN_YEAR),
      };
    });

    // Let's modify the 1st neuron to have a different stake, should have no effect (same weighted ratio)
    params.nnsNeurons.neurons[0].fullNeuron.cachedNeuronStake = BigInt(
      5000 * E8S_RATE
    );
    expect(checkApy(OWN_CANISTER_ID_TEXT, false, 7.25)).toBe(true);
    expect(checkApy(OWN_CANISTER_ID_TEXT, true, 13.75)).toBe(true);

    // Let's modify the 1st neuron to have auto-staking, should have a positive effect, weigthed by the stake (10x)
    params.nnsNeurons.neurons[0].fullNeuron.autoStakeMaturity = true;
    expect(checkApy(OWN_CANISTER_ID_TEXT, false, 7.45)).toBe(true);
    expect(checkApy(OWN_CANISTER_ID_TEXT, true, 13.75)).toBe(true);

    // Let's reduce the stake of the 1st neuron, the positive effect, weigthed by the stake (0.1x), is now negligible
    params.nnsNeurons.neurons[0].fullNeuron.cachedNeuronStake = BigInt(
      5 * E8S_RATE
    );
    expect(checkApy(OWN_CANISTER_ID_TEXT, false, 7.25)).toBe(true);
    expect(checkApy(OWN_CANISTER_ID_TEXT, true, 13.75)).toBe(true);
  });

  it("Calculates the APYs (SNSs)", () => {
    //@TODO
  });
});

///////////
/// HELPERS
///////////

const getRewardData = (params: TestStakingRewardCalcParams) => {
  const reward = getStakingRewardData(
    params as unknown as StakingRewardCalcParams,
    referenceDate
  );
  if ("error" in reward || reward.loading === true) {
    throw new Error(`Error calculating staking rewards.`);
  }
  return reward;
};

const round = (value: number, decimals: number): number => {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
};

const inConfidenceRange = (
  value: number,
  reference: number,
  confidence: number
): boolean => {
  const lowerBound = reference * (1 - confidence);
  const upperBound = reference * (1 + confidence);
  return value >= lowerBound && value <= upperBound;
};

/////////
/// MOCKS
/////////

const getInitialMockedParams = (): TestStakingRewardCalcParams => ({
  auth: true,
  tokens: [
    {
      balanceInUsd: 450,
      ledgerCanisterId: LEDGER_CANISTER_ID,
    },
  ],
  snsProjects: { data: [] },
  snsNeurons: { [TEST_SNS_IDS[0]]: { neurons: [] } },
  nnsNeurons: {
    neurons: [getTestNeuronNns()],
  },
  nnsEconomics: {
    parameters: {
      neuronMinimumStake: BigInt(1 * E8S_RATE),
      votingPowerEconomics: {
        neuronMinimumDissolveDelayToVoteSeconds: BigInt(SECONDS_IN_HALF_YEAR),
      },
    },
  },
  fxRates: { [LEDGER_CANISTER_ID.toText()]: 9 },
  governanceMetrics: { metrics: { totalSupplyIcp: 534_809_202n } }, // 24 Jun 2025
  nnsTotalVotingPower: 50_276_005_084_190_970n, // 24 Jun 2025
});

let neuronCounter = 0n;
const getTestNeuronNns =
  (): TestStakingRewardCalcParams["nnsNeurons"]["neurons"][0] => ({
    neuronId: neuronCounter++,
    state: NeuronState.Locked,
    dissolveDelaySeconds: BigInt(SECONDS_IN_EIGHT_YEARS),
    fullNeuron: {
      maturityE8sEquivalent: BigInt(0),
      stakedMaturityE8sEquivalent: BigInt(0),
      cachedNeuronStake: BigInt(50 * E8S_RATE),
      neuronFees: BigInt(0),
      agingSinceTimestampSeconds: BigInt(referenceDateSeconds),
      dissolveState: {
        DissolveDelaySeconds: BigInt(SECONDS_IN_EIGHT_YEARS),
      },
      autoStakeMaturity: true,
    },
  });

const getTestNeuronSns =
  (): TestStakingRewardCalcParams["snsNeurons"]["0"]["neurons"][0] => ({
    maturity_e8s_equivalent: BigInt(0),
    staked_maturity_e8s_equivalent: [BigInt(0)],
    cached_neuron_stake_e8s: BigInt(10 * E8S_RATE),
    neuron_fees_e8s: BigInt(0),
    aging_since_timestamp_seconds: BigInt(referenceDateSeconds),
    dissolve_state: [
      {
        DissolveDelaySeconds: BigInt(SECONDS_IN_EIGHT_YEARS),
      },
    ],
    auto_stake_maturity: [true],
  });

const TEST_SNS_IDS = [
  "be2us-64aaa-aaaaa-qaabq-cai",
  "ibahq-taaaa-aaaaq-aadna-cai",
  "u67kc-jyaaa-aaaaq-aabpq-cai",
];

const getTestSns = (
  id?: string
): TestStakingRewardCalcParams["snsProjects"]["data"][0] => ({
  canister_ids: {
    root_canister_id: id ?? TEST_SNS_IDS[0],
    ledger_canister_id: id ?? TEST_SNS_IDS[0],
  },
  nervous_system_parameters: {
    max_dissolve_delay_seconds: SECONDS_IN_FOUR_YEARS,
    max_dissolve_delay_bonus_percentage: 100,
    max_neuron_age_for_age_bonus: SECONDS_IN_FOUR_YEARS,
    max_age_bonus_percentage: 25,
    neuron_minimum_stake_e8s: 1 * E8S_RATE,
    neuron_minimum_dissolve_delay_to_vote_seconds: SECONDS_IN_HALF_YEAR,
    voting_rewards_parameters: {
      initial_reward_rate_basis_points: 800,
      final_reward_rate_basis_points: 400,
      reward_rate_transition_duration_seconds: SECONDS_IN_EIGHT_YEARS,
    },
  },
  icrc1_total_supply: 100_000_000,
});
