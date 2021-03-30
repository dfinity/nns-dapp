import { blobFromUint8Array, derBlobFromBlob, SignIdentity } from "@dfinity/agent";
import GovernanceApi from "./GovernanceApi";
import LedgerApi from "./LedgerApi";
import GOVERNANCE_CANISTER_ID from "./canisters/governance/canisterId";
import { buildSubAccount, buildAccountIdentifier } from "./canisters/governance/createNeuron";

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
        console.log("acquireICPTs");
        await ledgerApi.acquireICPTs(account.accountIdentifier, {doms: BigInt(100_000_000)});
        await ledgerApi.acquireICPTs(account.subAccounts[0].accountIdentifier, {doms: BigInt(2_000_000_000)});
    } else {
        console.log("acquireICPTs");
        await ledgerApi.acquireICPTs(account.subAccounts[0].accountIdentifier, {doms: BigInt(1_000_100_000)});
    }
    
    console.log("getting balances");
    const balances = await ledgerApi.getBalances({
        accounts: [account.accountIdentifier].concat(account.subAccounts.map(a => a.accountIdentifier))
    });
    console.log(balances);

    console.log("getting transactions");
    const transactions = await ledgerApi.getTransactions({
        accountIdentifier: account.accountIdentifier,
        offset: 0,
        pageSize: 10
    });
    console.log(transactions);   
    
    console.log("creating a neuron");
    const createNeuronResult = await governanceApi.createNeuron({
        stake: {doms: BigInt(1_000_000_000)},
        dissolveDelayInSecs: BigInt(20_000_000),
        fromSubAccountId: account.subAccounts[0].id
    });
    console.log(createNeuronResult);

    if (!("Ok" in createNeuronResult)) {
        return;
    }
    console.log("make a 'motion' proposal");
    const neuronId = createNeuronResult.Ok;
    const manageNeuronResponse = await governanceApi.manageNeuron({
        id: { id: neuronId },
        command: {
            MakeProposal: {
                url: "https://www.facebook.com/megrogan",
                action: {
                    Motion: {
                        motionText: "Matt for King!"
                    }
                },
                summary: "Matt for King!"
            }
        }
    });
    console.log(manageNeuronResponse);    

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
