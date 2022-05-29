import { HttpAgent, Identity, SignIdentity } from "@dfinity/agent";
import { Ed25519KeyIdentity } from "@dfinity/identity";
import { Option } from "./canisters/option";
import governanceBuilder from "./canisters/governance/builder";
import GovernanceService, {
  AddHotKeyRequest,
  DisburseRequest,
  DisburseResponse,
  DisburseToNeuronRequest,
  DisburseToNeuronResponse,
  EmptyResponse,
  FollowRequest,
  IncreaseDissolveDelayRequest,
  JoinCommunityFundRequest,
  KnownNeuron,
  ListProposalsRequest,
  ListProposalsResponse,
  MergeMaturityRequest,
  MergeMaturityResponse,
  MergeRequest,
  NeuronInfo,
  NeuronInfoForHw,
  RegisterVoteRequest,
  RemoveHotKeyRequest,
  SpawnRequest,
  SpawnResponse,
  SplitRequest,
  StartDissolvingRequest,
  StopDissolvingRequest,
} from "./canisters/governance/model";
import { ProposalInfo } from "./canisters/governance/model";
import ledgerBuilder from "./canisters/ledger/builder";
import LedgerService, {
  GetBalancesRequest,
  SendICPTsRequest,
} from "./canisters/ledger/model";
import nnsDappBuilder from "./canisters/nnsDapp/builder";
import NnsDappService, {
  AccountDetails,
  AttachCanisterRequest,
  AttachCanisterResult,
  CanisterDetails,
  CreateSubAccountResponse,
  DetachCanisterRequest,
  DetachCanisterResponse,
  GetTransactionsRequest,
  GetTransactionsResponse,
  RegisterHardwareWalletRequest,
  RegisterHardwareWalletResponse,
  RenameSubAccountRequest,
  RenameSubAccountResponse,
} from "./canisters/nnsDapp/model";
import cyclesMintingServiceBuilder from "./canisters/cyclesMinting/builder";
import CyclesMintingService from "./canisters/cyclesMinting/model";
import icManagementBuilder from "./canisters/icManagement/builder";
import ICManagementService, {
  CanisterDetailsResponse,
  UpdateSettingsRequest,
  UpdateSettingsResponse,
} from "./canisters/icManagement/model";
import {
  createNeuronWithNnsDapp,
  CreateNeuronRequest,
} from "./canisters/createNeuron";
import topUpNeuronImpl, { TopUpNeuronRequest } from "./canisters/topUpNeuron";
import {
  createCanisterImpl,
  CreateCanisterRequest,
  CreateCanisterResponse,
} from "./canisters/createCanister";
import {
  AccountIdentifier,
  BlockHeight,
  CanisterIdString,
  E8s,
  NeuronId,
  PrincipalString,
} from "./canisters/common/types";
import { LedgerIdentity } from "./ledger/identity";
import { HOST } from "./canisters/constants";
import { executeWithLogging } from "./errorLogger";
import { FETCH_ROOT_KEY } from "./config.json";
import checkNeuronBalances from "./canisters/checkNeuronBalances";
import {
  topUpCanisterImpl,
  TopUpCanisterRequest,
  TopUpCanisterResponse,
} from "./canisters/topUpCanister";
import { principalToAccountIdentifier } from "./canisters/converter";
import { Principal } from "@dfinity/principal";
import {
  addNodeToSubnetPayload,
  addOrRemoveDataCentersPayload,
  updateSubnetConfigPayload,
  updateSubnetPayload,
} from "./canisters/governance/nnsFunctions/samplePayloads";
import { base64ToUInt8Array } from "./utils";

/**
 * An API for interacting with various canisters.
 */
export default class ServiceApi {
  private readonly ledgerService: LedgerService;
  private readonly nnsDappService: NnsDappService;
  private readonly governanceService: GovernanceService;
  private readonly cyclesMintingService: CyclesMintingService;
  private readonly icManagementService: ICManagementService;
  private readonly identity: SignIdentity;

  public static create = async (
    identity: SignIdentity
  ): Promise<ServiceApi> => {
    const agent = new HttpAgent({
      host: HOST,
      identity,
    });

    if (FETCH_ROOT_KEY) {
      await agent.fetchRootKey();
    }

    return new ServiceApi(agent, identity);
  };

  private constructor(agent: HttpAgent, identity: SignIdentity) {
    this.ledgerService = ledgerBuilder(agent);
    this.nnsDappService = nnsDappBuilder(agent);
    this.governanceService = governanceBuilder(agent, identity);
    this.cyclesMintingService = cyclesMintingServiceBuilder(agent);
    this.icManagementService = icManagementBuilder(agent);
    this.identity = identity;
    setupExports(this.governanceService);
  }

  /* ACCOUNTS */

  public createSubAccount = (
    name: string
  ): Promise<CreateSubAccountResponse> => {
    return executeWithLogging(() => this.nnsDappService.createSubAccount(name));
  };

  public renameSubAccount = (
    request: RenameSubAccountRequest
  ): Promise<RenameSubAccountResponse> => {
    return executeWithLogging(() =>
      this.nnsDappService.renameSubAccount(request)
    );
  };

  public principalToAccountIdentifier(
    principal: PrincipalString
  ): AccountIdentifier {
    return principalToAccountIdentifier(Principal.fromText(principal));
  }

  public registerHardwareWallet = (
    name: string,
    identity: LedgerIdentity
  ): Promise<RegisterHardwareWalletResponse> => {
    const request: RegisterHardwareWalletRequest = {
      name,
      principal: identity.getPrincipal().toString(),
    };
    return executeWithLogging(() =>
      this.nnsDappService.registerHardwareWallet(request)
    );
  };

  public getAccount = async (certified = true): Promise<AccountDetails> => {
    const response = await executeWithLogging(() =>
      this.nnsDappService.getAccount(certified)
    );
    if ("Ok" in response) {
      return response.Ok;
    } else {
      const accountIdentifier = await executeWithLogging(() =>
        this.nnsDappService.addAccount()
      );
      return {
        principal: this.identity.getPrincipal().toString(),
        accountIdentifier,
        subAccounts: [],
        hardwareWalletAccounts: [],
      };
    }
  };

  public getBalances = (
    request: GetBalancesRequest,
    certified: boolean
  ): Promise<Record<AccountIdentifier, E8s>> => {
    return executeWithLogging(() =>
      this.ledgerService.getBalances(request, certified)
    );
  };

  public getTransactions = (
    request: GetTransactionsRequest,
    certified: boolean
  ): Promise<GetTransactionsResponse> => {
    return executeWithLogging(() =>
      this.nnsDappService.getTransactions(request, certified)
    );
  };

  public sendICP = (
    identity: Identity,
    request: SendICPTsRequest
  ): Promise<BlockHeight> => {
    if (!request.memo) {
      // Always explicitly set the memo for compatibility with ledger wallet.
      request.memo = BigInt(0);
    }

    return executeWithLogging(async () =>
      (await ledgerService(identity)).sendICPTs(request)
    );
  };

  /* GOVERNANCE */

  public getNeuron = (
    neuronId: NeuronId,
    certified = true
  ): Promise<Option<NeuronInfo>> => {
    return executeWithLogging(async () => {
      const res = await this.governanceService.getNeurons(certified, [
        neuronId,
      ]);
      return res.length > 0 ? res[0] : null;
    });
  };

  public getNeurons = (certified = true): Promise<Array<NeuronInfo>> => {
    return executeWithLogging(() =>
      this.governanceService.getNeurons(certified)
    );
  };

  // Returns true if any neurons were refreshed, otherwise false
  public checkNeuronBalances = (
    neurons: Array<NeuronInfo>
  ): Promise<boolean> => {
    return executeWithLogging(() =>
      checkNeuronBalances(neurons, this.ledgerService, this.governanceService)
    );
  };

  public getNeuronsForHw = (
    identity: Identity
  ): Promise<Array<NeuronInfoForHw>> => {
    return executeWithLogging(async () =>
      (await governanceService(identity)).getNeuronsForHW()
    );
  };

  public getPendingProposals = (): Promise<Array<ProposalInfo>> => {
    return executeWithLogging(() =>
      this.governanceService.getPendingProposals()
    );
  };

  public getProposalInfo = (
    proposalId: bigint
  ): Promise<Option<ProposalInfo>> => {
    return executeWithLogging(() =>
      this.nnsDappService.getProposal(proposalId)
    );
  };

  public listProposals = (
    request: ListProposalsRequest
  ): Promise<ListProposalsResponse> => {
    return executeWithLogging(() =>
      this.governanceService.listProposals(request)
    );
  };

  public addHotKey = (request: AddHotKeyRequest): Promise<EmptyResponse> => {
    return executeWithLogging(() => this.governanceService.addHotKey(request));
  };

  public removeHotKey = (
    identity: Identity,
    request: RemoveHotKeyRequest
  ): Promise<EmptyResponse> => {
    return executeWithLogging(async () =>
      (await governanceService(identity)).removeHotKey(request)
    );
  };

  public startDissolving = (
    identity: Identity,
    request: StartDissolvingRequest
  ): Promise<EmptyResponse> => {
    return executeWithLogging(async () =>
      (await governanceService(identity)).startDissolving(request)
    );
  };

  public stopDissolving = (
    identity: Identity,
    request: StopDissolvingRequest
  ): Promise<EmptyResponse> => {
    return executeWithLogging(async () =>
      (await governanceService(identity)).stopDissolving(request)
    );
  };

  public increaseDissolveDelay = (
    identity: Identity,
    request: IncreaseDissolveDelayRequest
  ): Promise<EmptyResponse> => {
    return executeWithLogging(async () =>
      (await governanceService(identity)).increaseDissolveDelay(request)
    );
  };

  public joinCommunityFund = (
    identity: Identity,
    request: JoinCommunityFundRequest
  ): Promise<EmptyResponse> => {
    return executeWithLogging(async () =>
      (await governanceService(identity)).joinCommunityFund(request)
    );
  };

  public follow = (request: FollowRequest): Promise<EmptyResponse> => {
    return executeWithLogging(() => this.governanceService.follow(request));
  };

  public registerVote = (
    request: RegisterVoteRequest
  ): Promise<EmptyResponse> => {
    return executeWithLogging(() =>
      this.governanceService.registerVote(request)
    );
  };

  public spawn = (
    identity: Identity,
    request: SpawnRequest
  ): Promise<SpawnResponse> => {
    return executeWithLogging(async () =>
      (await governanceService(identity)).spawn(request)
    );
  };

  public split = (
    identity: Identity,
    request: SplitRequest
  ): Promise<NeuronId> => {
    return executeWithLogging(async () =>
      (await governanceService(identity)).split(request)
    );
  };

  public disburse = (
    identity: Identity,
    request: DisburseRequest
  ): Promise<DisburseResponse> => {
    return executeWithLogging(async () =>
      (await governanceService(identity)).disburse(request)
    );
  };

  public disburseToNeuron = (
    request: DisburseToNeuronRequest
  ): Promise<DisburseToNeuronResponse> => {
    return executeWithLogging(() =>
      this.governanceService.disburseToNeuron(request)
    );
  };

  public merge = (
    identity: Identity,
    request: MergeRequest
  ): Promise<EmptyResponse> => {
    return executeWithLogging(async () =>
      (await governanceService(identity)).merge(request)
    );
  };

  public mergeMaturity = (
    identity: Identity,
    request: MergeMaturityRequest
  ): Promise<MergeMaturityResponse> => {
    return executeWithLogging(async () => {
      if (identity instanceof LedgerIdentity) {
        // If this is a hardware wallet, ensure the user is using the correct
        // version of the Ledger app.
        await verifyHardwareWalletV2(identity);
      }

      return (await governanceService(identity)).mergeMaturity(request);
    });
  };

  public createNeuron = async (
    request: CreateNeuronRequest
  ): Promise<string> => {
    return await executeWithLogging(async () => {
      const neuronId = await createNeuronWithNnsDapp(
        this.identity.getPrincipal(),
        this.ledgerService,
        this.nnsDappService,
        request
      );
      console.log("Received neuron id");
      console.log(neuronId);

      // NOTE: we're returning the neuron ID as a string for dart compatibility.
      return neuronId.toString();
    });
  };

  public topUpNeuron = (request: TopUpNeuronRequest): Promise<void> => {
    return executeWithLogging(() =>
      topUpNeuronImpl(
        this.identity.getPrincipal(),
        this.ledgerService,
        this.nnsDappService,
        request
      )
    );
  };

  /* CANISTERS */

  public createCanister = (
    request: CreateCanisterRequest
  ): Promise<CreateCanisterResponse> => {
    return executeWithLogging(() =>
      createCanisterImpl(
        this.identity.getPrincipal(),
        this.ledgerService,
        this.nnsDappService,
        request
      )
    );
  };

  public topUpCanister = (
    request: TopUpCanisterRequest
  ): Promise<TopUpCanisterResponse> => {
    return executeWithLogging(() =>
      topUpCanisterImpl(
        this.identity.getPrincipal(),
        this.ledgerService,
        this.nnsDappService,
        request
      )
    );
  };

  public attachCanister = (
    request: AttachCanisterRequest
  ): Promise<AttachCanisterResult> => {
    return executeWithLogging(() =>
      this.nnsDappService.attachCanister(request)
    );
  };

  public detachCanister = (
    request: DetachCanisterRequest
  ): Promise<DetachCanisterResponse> => {
    return executeWithLogging(() =>
      this.nnsDappService.detachCanister(request)
    );
  };

  public getCanisters = (): Promise<Array<CanisterDetails>> => {
    return executeWithLogging(() => this.nnsDappService.getCanisters());
  };

  public getCanisterDetails = (
    canisterId: CanisterIdString
  ): Promise<CanisterDetailsResponse> => {
    return executeWithLogging(() =>
      this.icManagementService.getCanisterDetails(canisterId)
    );
  };

  public updateCanisterSettings = (
    request: UpdateSettingsRequest
  ): Promise<UpdateSettingsResponse> => {
    return executeWithLogging(() =>
      this.icManagementService.updateSettings(request)
    );
  };

  public getIcpToCyclesConversionRate = (): Promise<bigint> => {
    return executeWithLogging(() =>
      this.cyclesMintingService.getIcpToCyclesConversionRate()
    );
  };

  public followeeSuggestions = (
    certified: boolean
  ): Promise<Array<KnownNeuron>> => {
    return executeWithLogging(() =>
      this.governanceService.listKnownNeurons(certified)
    );
  };

  /*
   * Gives the caller the specified amount of (fake) ICPs.
   * Should/can only be used on testnets.
   */
  public acquireICPTs = async (
    accountIdentifier: AccountIdentifier,
    e8s: E8s
  ): Promise<void> => {
    // Create an identity who's default ledger account is initialised with 10k ICP on the testnet, then use that
    // identity to send the current user some ICP to test things with.
    // The identity's principal is jg6qm-uw64t-m6ppo-oluwn-ogr5j-dc5pm-lgy2p-eh6px-hebcd-5v73i-nqe
    // The identity's default ledger address is 5b315d2f6702cb3a27d826161797d7b2c2e131cd312aece51d4d5574d1247087
    const publicKey = "Uu8wv55BKmk9ZErr6OIt5XR1kpEGXcOSOC1OYzrAwuk=";
    const privateKey =
      "N3HB8Hh2PrWqhWH2Qqgr1vbU9T3gb1zgdBD8ZOdlQnVS7zC/nkEqaT1kSuvo4i3ldHWSkQZdw5I4LU5jOsDC6Q==";
    const identity = Ed25519KeyIdentity.fromKeyPair(
      base64ToUInt8Array(publicKey),
      base64ToUInt8Array(privateKey)
    );

    const agent = new HttpAgent({
      host: HOST,
      identity,
    });
    await agent.fetchRootKey();
    const anonLedgerService = ledgerBuilder(agent);
    const req = {
      to: accountIdentifier,
      amount: e8s,
    };
    await anonLedgerService.sendICPTs(req);
  };

  // Uses the passed in neuron to make a few dummy proposals.
  // Should/can only be used on testnets.
  public makeDummyProposals = async (neuronId: NeuronId): Promise<void> => {
    try {
      {
        console.log("make a 'Motion' proposal");
        const manageNeuronResponse =
          await this.governanceService.makeMotionProposal({
            title: "Test proposal title - Lower all prices!",
            neuronId,
            url: "http://free-stuff-for-all.com",
            text: "We think that it is too expensive to run canisters on the IC. The long term goal of the IC should be to reduce the cycles cost of all operations by a factor of 10! Please pass this motion",
            summary: "Change the world with the IC - lower all prices!",
          });
        console.log(manageNeuronResponse);
      }

      {
        console.log("make a 'NetworkEconomics' proposal");
        const manageNeuronResponse =
          await this.governanceService.makeNetworkEconomicsProposal({
            neuronId,
            title: "Increase minimum neuron stake",
            url: "https://www.lipsum.com/",
            summary: "Increase minimum neuron stake",
            networkEconomics: {
              neuronMinimumStake: BigInt(100_000_000),
              maxProposalsToKeepPerTopic: 1000,
              neuronManagementFeePerProposal: BigInt(10_000),
              rejectCost: BigInt(10_000_000),
              transactionFee: BigInt(1000),
              neuronSpawnDissolveDelaySeconds: BigInt(3600 * 24 * 7),
              minimumIcpXdrRate: BigInt(1),
              maximumNodeProviderRewards: BigInt(10_000_000_000),
            },
          });
        console.log(manageNeuronResponse);
      }

      {
        console.log("make a 'RewardNodeProvider' proposal");
        const manageNeuronResponse =
          await this.governanceService.makeRewardNodeProviderProposal({
            neuronId,
            url: "https://www.lipsum.com/",
            title: "Reward for Node Provider 'ABC'",
            summary: "Reward for Node Provider 'ABC'",
            amount: BigInt(10_000_000),
            nodeProvider: this.identity.getPrincipal().toString(),
            rewardMode: {
              RewardToNeuron: { dissolveDelaySeconds: BigInt(1000) },
            },
          });
        console.log(manageNeuronResponse);
      }

      {
        console.log("make an 'Add node to subnet' proposal");
        const manageNeuronResponse =
          await this.governanceService.makeExecuteNnsFunctionProposal({
            neuronId,
            title: "Add node(s) to subnet 10",
            url: "https://github.com/ic-association/nns-proposals/blob/main/proposals/subnet_management/20210928T1140Z.md",
            summary: "Add node(s) to subnet 10",
            nnsFunction: 2,
            payload: addNodeToSubnetPayload,
          });
        console.log(manageNeuronResponse);
      }

      {
        console.log("make an 'Update subnet config' proposal");
        const manageNeuronResponse =
          await this.governanceService.makeExecuteNnsFunctionProposal({
            neuronId,
            title: "Update configuration of subnet: tdb26-",
            url: "",
            summary:
              "Update the NNS subnet tdb26-jop6k-aogll-7ltgs-eruif-6kk7m-qpktf-gdiqx-mxtrf-vb5e6-eqe in order to grant backup access to three backup pods operated by the DFINITY Foundation. The backup user has only read-only access to the recent blockchain artifacts.",
            nnsFunction: 7,
            payload: updateSubnetConfigPayload,
          });
        console.log(manageNeuronResponse);
      }

      {
        console.log("make an 'Update subnet' proposal");
        const manageNeuronResponse =
          await this.governanceService.makeExecuteNnsFunctionProposal({
            neuronId,
            title:
              "Update subnet shefu-t3kr5-t5q3w-mqmdq-jabyv-vyvtf-cyyey-3kmo4-toyln-emubw-4qe to version 3eaf8541c389badbd6cd50fff31e158505f4487d",
            url: "https://github.com/ic-association/nns-proposals/blob/main/proposals/subnet_management/20210930T0728Z.md",
            summary:
              "Update subnet shefu-t3kr5-t5q3w-mqmdq-jabyv-vyvtf-cyyey-3kmo4-toyln-emubw-4qe to version 3eaf8541c389badbd6cd50fff31e158505f4487d",
            nnsFunction: 11,
            payload: updateSubnetPayload,
          });
        console.log(manageNeuronResponse);
      }

      {
        console.log("make an 'Add or remove data center' proposal");
        const manageNeuronResponse =
          await this.governanceService.makeExecuteNnsFunctionProposal({
            neuronId,
            title: "Initialize datacenter records",
            url: "",
            summary:
              "Initialize datacenter records. For more info about this proposal, read the forum announcement: https://forum.dfinity.org/t/improvements-to-node-provider-remuneration/10553",
            nnsFunction: 21,
            payload: addOrRemoveDataCentersPayload,
          });
        console.log(manageNeuronResponse);
      }
    } catch (e) {
      console.log(e);
      throw e;
    }
  };
}

/**
 * @returns A service to interact with the governance canister with the given identity.
 */
async function governanceService(
  identity: Identity
): Promise<GovernanceService> {
  const agent = new HttpAgent({
    host: HOST,
    identity: identity,
  });

  if (FETCH_ROOT_KEY) {
    await agent.fetchRootKey();
  }

  return governanceBuilder(agent, identity);
}

/**
 * @returns A service to interact with the ledger canister with the given identity.
 */
async function ledgerService(identity: Identity): Promise<LedgerService> {
  const agent = new HttpAgent({
    host: HOST,
    identity: identity,
  });

  if (FETCH_ROOT_KEY) {
    await agent.fetchRootKey();
  }

  return ledgerBuilder(agent);
}

// Exports methods that can be triggered from the console.
// Eventually we'll add support to all the commands, but that's better and easier
// to do once we migrate to using @dfinity/nns.
//
// e.g. await nns.governance.addHotKey("<neuron-id>", "<principal>")
function setupExports(governance: GovernanceService) {
  // @ts-ignore
  window["nns"] = {
    governance: {
      // Modifying the method signature to be a bit more ergonomic for the console.
      addHotKey: function (neuronId: NeuronId, principal: PrincipalString) {
        return governance.addHotKey({
          neuronId: neuronId,
          principal: principal,
        });
      },
    },
  };
}

/**
 * Verifies that the ledger wallet has a version of the 'Internet Computer' app that's >= 2.0.
 * e.g. Merge maturity on hardware wallet will only be available as of version >= 2.0.2.
 *
 * @param identity The identity of the Ledger device.
 */
async function verifyHardwareWalletV2(identity: LedgerIdentity): Promise<void> {
  const version = await identity.getVersion();
  if (version.major < 2) {
    throw "Available soon for Ledger devices.";
  }
}
