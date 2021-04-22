import { blobFromUint8Array, derBlobFromBlob, Principal, SignIdentity } from "@dfinity/agent";
import GovernanceApi from "./GovernanceApi";
import LedgerApi from "./LedgerApi";
import GOVERNANCE_CANISTER_ID from "./canisters/governance/canisterId";
import { buildSubAccount, buildAccountIdentifier } from "./canisters/ledger/createNeuron";
import { NeuronId, Topic, Vote } from "./canisters/governance/model";

var running = false;

export async function test_happy_path(host: string, identity: SignIdentity): Promise<void> {

    if (running) { 
        // Only run these once
        return;
    }

    running = true;

    console.log("start integration test");
    const ledgerApi = new LedgerApi(host, identity);
    const governanceApi = new GovernanceApi(host, identity);

    console.log("getting account");
    let account = await ledgerApi.getAccount();
    console.log(account);

    if (!account.subAccounts.length) {
        console.log("creating sub-account Abc");
        await ledgerApi.createSubAccount("Abc");

        console.log("getting account");
        account = await ledgerApi.getAccount();
    }

    console.log("getting balances");
    const balances = await ledgerApi.getBalances({
        accounts: [account.accountIdentifier].concat(account.subAccounts.map(a => a.accountIdentifier))
    });
    console.log(balances);

    const firstSubAccount = account.subAccounts[0];

    if (balances[firstSubAccount.accountIdentifier] < BigInt(25_000_000_000)) {
        console.log("topping up balance");
        await ledgerApi.acquireICPTs(firstSubAccount.accountIdentifier, BigInt(25_100_000_000));
    }

    {
        console.log("getting transactions");
        const transactions = await ledgerApi.getTransactions({
            accountIdentifier: account.accountIdentifier,
            offset: 0,
            pageSize: 10
        });
        console.log(transactions);   
    }

    console.log("create 1st neuron with 80 ICPT");
    await ledgerApi.createNeuron({
        stake: BigInt(8_000_000_000),
        fromSubAccountId: firstSubAccount.id
    });

    console.log("get neurons")
    let neurons = await governanceApi.getNeurons();
    console.log(neurons);
    let firstNeuronId = neurons[neurons.length - 1].neuronId;

    {
        console.log("increase dissolve delay of 1st neuron by a year");
        const increase = 3600 * 24 * 365;
        const manageNeuronResponse = await governanceApi.increaseDissolveDelay({
            neuronId: firstNeuronId,
            additionalDissolveDelaySeconds: increase
        });
        console.log(manageNeuronResponse);            
    }    

    console.log("With 1st neuron make a 'motion' proposal");
    const manageNeuronResponse = await governanceApi.makeMotionProposal({
        neuronId: firstNeuronId,
        url: "https://www.lipsum.com/",
        text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
        summary: "Lorem Ipsum"
    });
    console.log(manageNeuronResponse);   
    const newProposalId = manageNeuronResponse.proposalId;

    console.log("create 2nd neuron with 8 ICPT");
    await ledgerApi.createNeuron({
        stake: BigInt(800_000_000),
        fromSubAccountId: firstSubAccount.id
    });

    console.log("get neurons")
    neurons = await governanceApi.getNeurons();
    console.log(neurons);
    let secondNeuronId = neurons[neurons.length - 1].neuronId;

    {
        console.log("increase dissolve delay of 2nd neuron by a year");
        const increase = 3600 * 24 * 365;
        const manageNeuronResponse = await governanceApi.increaseDissolveDelay({
            neuronId: secondNeuronId,
            additionalDissolveDelaySeconds: increase
        });
        console.log(manageNeuronResponse);            
    }    

    {
        console.log("Vote on new proposal with 2nd neuron");
        const manageNeuronResponse = await governanceApi.registerVote({
            neuronId: secondNeuronId,
            vote: Vote.YES,
            proposal: newProposalId
        });
        console.log(manageNeuronResponse);
    }

    {
        console.log("List recent proposals"); 
        const pendingProposals = await governanceApi.listProposals({
            limit: 20,
            beforeProposal: null,
            includeRewardStatus: [],
            excludeTopic: [Topic.Kyc, Topic.ExchangeRate],
            includeStatus: []
        });
        console.log(pendingProposals);        
    }

    {
        console.log("Set 2nd neuron to follow 1st neuron");
        const response = await governanceApi.follow({
            neuronId: secondNeuronId,
            topic: Topic.Unspecified,
            followees: [firstNeuronId]
        });
        console.log(response);
    }

    await create_dummy_proposals(host, identity, firstNeuronId);

    {
        console.log("List recent proposals"); 
        const pendingProposals = await governanceApi.listProposals({
            limit: 20,
            beforeProposal: null,
            includeRewardStatus: [],
            excludeTopic: [Topic.Kyc, Topic.ExchangeRate],
            includeStatus: []
        });
        console.log(pendingProposals);        
    }

    {
        console.log("stop dissolving 1st neuron");
        const manageNeuronResponse = await governanceApi.stopDissolving({
            neuronId: firstNeuronId
        });
        console.log(manageNeuronResponse);            
    }    

    {
        console.log("start dissolving 1st neuron");
        const manageNeuronResponse = await governanceApi.startDissolving({
            neuronId: firstNeuronId
        });
        console.log(manageNeuronResponse);            
    }    

    // Create a neuron that can be disbursed
    console.log("creating a 3rd neuron with zero dissolve delay");
    await ledgerApi.createNeuron({
        stake: BigInt(1_000_000_000),
        fromSubAccountId: firstSubAccount.id
    });

    console.log("get neurons")
    neurons = await governanceApi.getNeurons();
    console.log(neurons);
    const thirdNeuronId = neurons[neurons.length - 1].neuronId;

    // Disburse a neuron to my default account
    {
        console.log("Disburse 1_000_000 e8s from first disbursable neuron to my default account");
        const manageNeuronResponse = await governanceApi.disburse({
            neuronId: thirdNeuronId,
            toAccountId: account.accountIdentifier,
            amount: BigInt(1_000_000)
        });
        console.log(manageNeuronResponse);            
    }

    console.log("finish integration test");
}

export async function create_dummy_proposals(host: string, identity: SignIdentity, neuronId: NeuronId) : Promise<void> {

    console.log("start create_dummy_proposals");
    const governanceApi = new GovernanceApi(host, identity);

    console.log("get neurons")
    let neurons = await governanceApi.getNeurons();
    console.log(neurons);

    {
        console.log("make a 'NetworkEconomics' proposal");
        const manageNeuronResponse = await governanceApi.makeNetworkEconomicsProposal({
            neuronId: neuronId,
            url: "https://www.lipsum.com/",
            summary: "New networks economics proposal",
            networkEcomomics: {
                rejectCost: BigInt(10_000_000),
                manageNeuronCostPerProposal: BigInt(1_000),
                neuronMinimumStake: BigInt(100_000_000),
                maximumNodeProviderRewards: BigInt(10_000_000_000),
                neuronSpawnDissolveDelaySeconds: BigInt(3600 * 24 * 7),
                transactionFee: BigInt(1000),
                minimumIcpXdrRate: BigInt(1)
            }
        });
        console.log(manageNeuronResponse);
    }

    {
        console.log("make a 'SetDefaultFollowees' proposal");
        const manageNeuronResponse = await governanceApi.makeSetDefaultFolloweesProposal({
            neuronId: neuronId,
            url: "https://www.lipsum.com/",
            summary: "Set default followees",
            followees: [
                { topic: Topic.ExchangeRate, followees: [neurons[0].neuronId, neurons[1].neuronId] },
                { topic: Topic.NetworkEconomics, followees: [neurons[0].neuronId, neurons[1].neuronId] },
                { topic: Topic.Governance, followees: [neurons[0].neuronId] },
                { topic: Topic.NodeAdmin, followees: [neurons[2].neuronId, neurons[3].neuronId] },
                { topic: Topic.ParticipantManagement, followees: [neurons[0].neuronId, neurons[1].neuronId, neurons[2].neuronId] },
                { topic: Topic.SubnetManagement, followees: [neurons[0].neuronId] },
                { topic: Topic.NetworkCanisterManagement, followees: [neurons[0].neuronId] },
                { topic: Topic.Kyc, followees: [neurons[0].neuronId, neurons[1].neuronId] },
            ]
        });
        console.log(manageNeuronResponse);
    }

    {
        console.log("make a 'RewardNodeProvider' proposal");
        const manageNeuronResponse = await governanceApi.makeRewardNodeProviderProposal({
            neuronId: neuronId,
            url: "https://www.lipsum.com/",
            summary: "Try to reward my own principal",
            amount: BigInt(10_000_000),
            nodeProvider: identity.getPrincipal()
        });
        console.log(manageNeuronResponse);
    }

    console.log("finish create_dummy_proposals");
}

// export async function test_create_neuron_functions(): Promise<void> {
//     console.log("Create sub-account");

//     const publicKey = new Uint8Array([48,42,48,5,6,3,43,101,112,3,33,0,181,24,137,15,148,110,55,201,158,206,110,91,176,249,155,62,237,13,87,9,79,26,225,92,162,113,124,246,221,218,76,239]);
//     const nonce = new Uint8Array([0,0,0,0,0,0,48,57]);

//     const subAccount = await buildSubAccount(nonce, derBlobFromBlob(blobFromUint8Array(publicKey)));

//     console.log("subAccount");
//     console.log(subAccount);

//     const accountIdentifier = buildAccountIdentifier(GOVERNANCE_CANISTER_ID, subAccount);
//     console.log("accountIdentifier");
//     console.log(accountIdentifier);
//     console.log(accountIdentifier.length);
// }



