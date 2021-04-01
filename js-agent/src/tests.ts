import { blobFromUint8Array, derBlobFromBlob, SignIdentity } from "@dfinity/agent";
import GovernanceApi from "./GovernanceApi";
import LedgerApi from "./LedgerApi";
import GOVERNANCE_CANISTER_ID from "./canisters/governance/canisterId";
import { buildSubAccount, buildAccountIdentifier } from "./canisters/governance/createNeuron";
import { Topic, Vote } from "./canisters/governance/model";

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

    if (balances[firstSubAccount.accountIdentifier] < BigInt(3_000_000_000)) {
        console.log("topping up balance");
        await ledgerApi.acquireICPTs(firstSubAccount.accountIdentifier, BigInt(2_100_000_000));
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

    console.log("get neurons")
    let neurons = await governanceApi.getNeurons();
    console.log(neurons)

    if (neurons.length < 3) {    
        console.log("creating a neuron");
        const createNeuronResult = await governanceApi.createNeuron({
            stake: BigInt(1_000_000_000),
            dissolveDelayInSecs: BigInt(20_000_000),
            fromSubAccountId: firstSubAccount.id
        });
        console.log(createNeuronResult);

        if (!("Ok" in createNeuronResult)) {
            return;
        }

        console.log("get neurons again")
        neurons = await governanceApi.getNeurons();
        console.log(neurons)
    }

    console.log("Get pending proposals"); 
    const pendingProposals = await governanceApi.getPendingProposals();
    console.log(pendingProposals);    

    const latestNeuronId = neurons[neurons.length - 1].neuronId;

    if (pendingProposals.length < 3) {
        console.log("make a 'motion' proposal");
        const manageNeuronResponse = await governanceApi.makeMotionProposal({
            neuronId: latestNeuronId,
            url: "https://www.lipsum.com/",
            text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
            summary: "Lorem Ipsum"
        });
        console.log(manageNeuronResponse);    

        console.log("Get pending proposals"); 
        const pendingProposals = await governanceApi.getPendingProposals();
        console.log(pendingProposals);        
    }

    {
        console.log("increase dissolve delay of latest neuron by 30 days");
        const increase = 3600 * 24 * 30;
        const manageNeuronResponse = await governanceApi.increaseDissolveDelay({
            neuronId: latestNeuronId,
            additionalDissolveDelaySeconds: increase
        });
        console.log(manageNeuronResponse);            
    }    

    {
        console.log("stop dissolving latest neuron");
        const manageNeuronResponse = await governanceApi.stopDissolving({
            neuronId: latestNeuronId
        });
        console.log(manageNeuronResponse);            
    }    

    {
        console.log("start dissolving latest neuron");
        const manageNeuronResponse = await governanceApi.startDissolving({
            neuronId: latestNeuronId
        });
        console.log(manageNeuronResponse);            
    }    

    // Create a neuron with zero dissolve delay if none exists so it can be disbursed
    let disbursableNeuronId = neurons.find(n => n.dissolveDelaySeconds == BigInt(0) && n.fullNeuron.cachedNeuronStakeDoms > 1_000_000_000)?.neuronId;
    if (!disbursableNeuronId) {    
        console.log("creating a neuron with zero dissolve delay");
        const createNeuronResult = await governanceApi.createNeuron({
            stake: BigInt(1_000_000_000),
            dissolveDelayInSecs: BigInt(0),
            fromSubAccountId: firstSubAccount.id
        });
        console.log(createNeuronResult);

        if (!("Ok" in createNeuronResult)) {
            return;
        }

        disbursableNeuronId = createNeuronResult.Ok;
    }

    // Disburse a neuron to my default account
    {
        console.log("Disburse 1_000_000 doms from first disbursable neuron to my default account");
        const manageNeuronResponse = await governanceApi.disburse({
            neuronId: disbursableNeuronId,
            toSubaccountId: null,
            amountDoms: BigInt(1_000_000)
        });
        console.log(manageNeuronResponse);            
    }

    {
        console.log("getting balances");
        const balances = await ledgerApi.getBalances({
            accounts: [account.accountIdentifier].concat(account.subAccounts.map(a => a.accountIdentifier))
        });
        console.log(balances);
    }

    {
        // Find a neuron with dissolve delay > 6 months
        // THIS DOESN'T WORK BECAUSE YOU CAN ONLY VOTE ON PROPOSALS CREATED AFTER THIS NEURON WAS CREATED
        let votingNeuronId = neurons.find(n => n.dissolveDelaySeconds > BigInt(3600 * 24 * 183))?.neuronId;
        const proposalId = pendingProposals.find(p => !p.ballots.find(b => b.neuronId == votingNeuronId))?.id;
        if (proposalId) {
            console.log("vote on 1st pending proposal I've not already voted on");
            const manageNeuronResponse = await governanceApi.registerVote({
                neuronId: votingNeuronId,
                vote: Vote.YES,
                proposal: proposalId
            });
            console.log(manageNeuronResponse);
        }
    }


    if (neurons.length > 2) {
        console.log("Setting a neuron to follow another");

        const response = await governanceApi.follow({
            neuronId: neurons[0].neuronId,
            topic: Topic.Unspecified,
            followees: [neurons[1].neuronId]
        });

        console.log(response);
    }

    console.log("finish integration test");
}

export async function test_create_neuron_functions(): Promise<void> {
    console.log("Create sub-account");

    const publicKey = new Uint8Array([48,42,48,5,6,3,43,101,112,3,33,0,181,24,137,15,148,110,55,201,158,206,110,91,176,249,155,62,237,13,87,9,79,26,225,92,162,113,124,246,221,218,76,239]);
    const nonce = new Uint8Array([0,0,0,0,0,0,48,57]);

    const subAccount = await buildSubAccount(nonce, derBlobFromBlob(blobFromUint8Array(publicKey)));

    console.log("subAccount");
    console.log(subAccount);

    const accountIdentifier = buildAccountIdentifier(GOVERNANCE_CANISTER_ID, subAccount);
    console.log("accountIdentifier");
    console.log(accountIdentifier);
    console.log(accountIdentifier.length);
}
