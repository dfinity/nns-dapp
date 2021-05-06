import { Principal, SignIdentity } from "@dfinity/agent";
import { Topic, Vote } from "./canisters/governance/model";
import { CreateCanisterResult } from "./canisters/createCanister";
import ServiceApi from "./ServiceApi";
import { CanisterId, NeuronId } from "./canisters/common/types";

export async function get_set_authorized_subnetworks_proposal(host: string, identity: SignIdentity): Promise<void> {
    const serviceApi = new ServiceApi(host, identity);
    const proposal = await serviceApi.getProposalInfo(BigInt(31));
    console.log("proposal 31");
    console.log(proposal);
}

export async function vote_for_authorized_subnetworks_proposal(host: string, identity: SignIdentity): Promise<void> {
    console.log("Vote for proposal 4");
    const serviceApi = new ServiceApi(host, identity);
    const response = await serviceApi.registerVote({
        neuronId: BigInt(425045688689725563n),
        vote: Vote.YES, 
        proposal: BigInt(4)    
    });
    console.log("registerVote response");
    console.log(response);
    const proposal = await serviceApi.getProposalInfo(BigInt(4));
    console.log("proposal 4");
    console.log(proposal);
}

export async function test_canisters(host: string, identity: SignIdentity): Promise<void> {
    const serviceApi = new ServiceApi(host, identity);

    let newCanisterId: CanisterId;
    {
        console.log("Create a canister");
        let response = await serviceApi.createCanister({
            stake: BigInt(1_000_000_000),
            name: generateRandomName("Canister - ", 8)  
        });   
        newCanisterId = response.canisterId;
        console.log(response);
    }
    {
        console.log("Get canister status");
        const response = await serviceApi.getCanisterDetails(newCanisterId);
        if (response.kind === "userNotTheController") {
            console.log("You are not the owner of this canister");
        } else {
            console.log(response);
        }
    }
    {
        console.log("Topup canister");
        await serviceApi.topupCanister({
            stake: BigInt(300_000_000),
            targetCanisterId: newCanisterId            
        });        
    }
    {
        console.log("Get canister status");
        const response = await serviceApi.getCanisterDetails(newCanisterId);
        if (response.kind === "userNotTheController") {
            console.log("You are not the owner of this canister");
        } else {
            console.log(response);
        }
    }
    {
        console.log("Get attached canisters");
        const response = await serviceApi.getCanisters();
        for (let i = 0; i < response.length; i++) {
            console.log(response[i].name);
            console.log(response[i].canisterId.toText());
        }
    }
    {
        console.log("Try changing ownership to anon user");
        const response = await serviceApi.updateCanisterSettings({
            canisterId: newCanisterId,
            settings: {
                controller: Principal.anonymous()
            }
        });
        if (response.kind === "userNotTheController") {
            console.log("You are not the owner of this canister");
        } else {
            console.log(response);
        }
    }
    {
        console.log("Try to get canister status of non-owned canister");
        const response = await serviceApi.getCanisterDetails(newCanisterId);
        if (response.kind === "userNotTheController") {
            console.log("You are not the owner of this canister");
        } else {
            console.log(response);
        }
    }
}

export async function test_happy_path(host: string, identity: SignIdentity): Promise<void> {

    console.log(identity.getPrincipal().toText());

    console.log("start integration test");
    const serviceApi = new ServiceApi(host, identity);

    console.log("getting account");
    let account = await serviceApi.getAccount();
    console.log(account);

    if (!account.subAccounts.length) {
        console.log("creating sub-account Abc");
        await serviceApi.createSubAccount("Abc");

        console.log("getting account");
        account = await serviceApi.getAccount();
    }

    console.log("getting balances");
    const balances = await serviceApi.getBalances({
        accounts: [account.accountIdentifier].concat(account.subAccounts.map(a => a.accountIdentifier))
    });
    console.log(balances);

    const firstSubAccount = account.subAccounts[0];

    if (balances[account.accountIdentifier] < BigInt(6_000_000_000)) {
        console.log("topping up default balance");
        await serviceApi.acquireICPTs(account.accountIdentifier, BigInt(6_100_000_000));
    }
    
    if (balances[firstSubAccount.accountIdentifier] < BigInt(6_000_000_000)) {
        console.log("topping up 1st sub-account balance");
        await serviceApi.acquireICPTs(firstSubAccount.accountIdentifier, BigInt(6_100_000_000));
    }

    {
        console.log("getting transactions");
        const transactions = await serviceApi.getTransactions({
            accountIdentifier: account.accountIdentifier,
            offset: 0,
            pageSize: 10
        });
        console.log(transactions);   
    }

    {
        console.log("creating a canister with default account as controller");
        let response = await serviceApi.createCanister({
            stake: BigInt(1_000_000_000),
            //fromSubAccountId: firstSubAccount.id,
            name: "My canister"         
        });       
        
        if (response.result === CreateCanisterResult.Ok) {        
            console.log("canisterId");
            console.log(response.canisterId);

            console.log("topup the canister");
            await serviceApi.topupCanister({
                stake: BigInt(300_000_000),
                fromSubAccountId: firstSubAccount.id,
                targetCanisterId: response.canisterId            
            });        
        } else {
            console.log("createCanisterFailed");
            console.log(response);
            return;
        }
    }

    console.log("create 1st neuron with 10 ICPT");
    let firstNeuronId = await serviceApi.createNeuron({
        stake: BigInt(1_000_000_000),
        fromSubAccountId: firstSubAccount.id
    });

    {
        console.log("increase dissolve delay of 1st neuron by a year");
        const increase = 3600 * 24 * 365;
        const manageNeuronResponse = await serviceApi.increaseDissolveDelay({
            neuronId: firstNeuronId,
            additionalDissolveDelaySeconds: increase
        });
        console.log(manageNeuronResponse);            
    }    

    console.log("get neurons")
    let neurons = await serviceApi.getNeurons();
    console.log(neurons);

    console.log("With 1st neuron make a 'motion' proposal");
    const manageNeuronResponse = await serviceApi.makeMotionProposal({
        neuronId: firstNeuronId,
        url: "https://www.lipsum.com/",
        text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
        summary: "Lorem Ipsum"
    });
    console.log(manageNeuronResponse);   
    const newProposalId = manageNeuronResponse.proposalId;

    console.log("create 2nd neuron with 8 ICPT");
    await serviceApi.createNeuron({
        stake: BigInt(800_000_000),
        fromSubAccountId: firstSubAccount.id
    });

    console.log("get neurons")
    neurons = await serviceApi.getNeurons();
    console.log(neurons);
    let secondNeuronId = neurons[neurons.length - 1].neuronId;

    {
        console.log("increase dissolve delay of 2nd neuron by a year");
        const increase = 3600 * 24 * 365;
        const manageNeuronResponse = await serviceApi.increaseDissolveDelay({
            neuronId: secondNeuronId,
            additionalDissolveDelaySeconds: increase
        });
        console.log(manageNeuronResponse);            
    }    

    {
        console.log("Vote on new proposal with 2nd neuron");
        const manageNeuronResponse = await serviceApi.registerVote({
            neuronId: secondNeuronId,
            vote: Vote.YES,
            proposal: newProposalId
        });
        console.log(manageNeuronResponse);
    }

    {
        console.log("List recent proposals"); 
        const pendingProposals = await serviceApi.listProposals({
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
        const response = await serviceApi.follow({
            neuronId: secondNeuronId,
            topic: Topic.Unspecified,
            followees: [firstNeuronId]
        });
        console.log(response);
    }

    await create_dummy_proposals(host, identity, firstNeuronId);

    {
        console.log("List recent proposals"); 
        const pendingProposals = await serviceApi.listProposals({
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
        const manageNeuronResponse = await serviceApi.stopDissolving({
            neuronId: firstNeuronId
        });
        console.log(manageNeuronResponse);            
    }    

    {
        console.log("start dissolving 1st neuron");
        const manageNeuronResponse = await serviceApi.startDissolving({
            neuronId: firstNeuronId
        });
        console.log(manageNeuronResponse);            
    }    

    // Create a neuron that can be disbursed
    console.log("creating a 3rd neuron with zero dissolve delay");
    await serviceApi.createNeuron({
        stake: BigInt(1_000_000_000),
        fromSubAccountId: firstSubAccount.id
    });

    console.log("get neurons")
    neurons = await serviceApi.getNeurons();
    console.log(neurons);
    const thirdNeuronId = neurons[neurons.length - 1].neuronId;

    // Disburse a neuron to my default account
    {
        console.log("Disburse 1_000_000 e8s from first disbursable neuron to my default account");
        const manageNeuronResponse = await serviceApi.disburse({
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
    const serviceApi = new ServiceApi(host, identity);

    console.log("get neurons")
    let neurons = await serviceApi.getNeurons();
    console.log(neurons);

    {
        const manageNeuronResponse = await serviceApi.makeMotionProposal({
            neuronId: neuronId,
            url: "http://free-stuff-for-all.com",
            text: "We think that it is too expensive to run canisters on the IC. The long term goal of the IC should be to reduce the cycles cost of all operations by a factor of 10! Please pass this motion",
            summary: "Change the world with the IC - lower all prices!"
        });
    }

    {
        console.log("make a 'NetworkEconomics' proposal");
        const manageNeuronResponse = await serviceApi.makeNetworkEconomicsProposal({
            neuronId: neuronId,
            url: "https://www.lipsum.com/",
            summary: "Increase minimum neuron stake",
            networkEcomomics: {
                neuronMinimumStake: BigInt(100_000_000),
                maxProposalsToKeepPerTopic: 1000,
                neuronManagementFeePerProposal: BigInt(10_000),
                rejectCost: BigInt(10_000_000),
                transactionFee: BigInt(1000),
                neuronSpawnDissolveDelaySeconds: BigInt(3600 * 24 * 7),
                minimumIcpXdrRate: BigInt(1),
                maximumNodeProviderRewards: BigInt(10_000_000_000),
            }
        });
        console.log(manageNeuronResponse);
    }

    {
        // console.log("make a 'SetDefaultFollowees' proposal");
        // const manageNeuronResponse = await serviceApi.makeSetDefaultFolloweesProposal({
        //     neuronId: neuronId,
        //     url: "https://www.lipsum.com/",
        //     summary: "Set default followees",
        //     followees: [
        //         { topic: Topic.ExchangeRate, followees: [neurons[0].neuronId, neurons[1].neuronId] },
        //         { topic: Topic.NetworkEconomics, followees: [neurons[0].neuronId, neurons[1].neuronId] },
        //         { topic: Topic.Governance, followees: [neurons[0].neuronId] },
        //         { topic: Topic.NodeAdmin, followees: [neurons[2].neuronId, neurons[3].neuronId] },
        //         { topic: Topic.ParticipantManagement, followees: [neurons[0].neuronId, neurons[1].neuronId, neurons[2].neuronId] },
        //         { topic: Topic.SubnetManagement, followees: [neurons[0].neuronId] },
        //         { topic: Topic.NetworkCanisterManagement, followees: [neurons[0].neuronId] },
        //         { topic: Topic.Kyc, followees: [neurons[0].neuronId, neurons[1].neuronId] },
        //     ]
        // });
        // console.log(manageNeuronResponse);
    }

    {
        console.log("make a 'RewardNodeProvider' proposal");
        const manageNeuronResponse = await serviceApi.makeRewardNodeProviderProposal({
            neuronId: neuronId,
            url: "https://www.lipsum.com/",
            summary: "Reward for Node Provider 'ABC'",
            amount: BigInt(10_000_000),
            nodeProvider: identity.getPrincipal(),
            createNeuron: null
        });
        console.log(manageNeuronResponse);
    }

    console.log("finish create_dummy_proposals");
}

function generateRandomName(prefix: string, suffixLength: number) {
    const result = [];
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for ( var i = 0; i < suffixLength; i++ ) {
        const char = characters.charAt(Math.floor(Math.random() * characters.length));
        result.push(char);
    }
    return prefix + result.join('');
}