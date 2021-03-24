import WalletApi from "./WalletApi";
import { AnonymousIdentity } from "@dfinity/agent";
​
export default function(walletApi: WalletApi) {
    console.log("Enter testCalls");

    const identity = new AnonymousIdentity();
    const ledgerService = walletApi.buildLedgerService(
        "http://localhost:8080/", 
        identity);
    ​
    ledgerService.account_balance({
        account: identity.getPrincipal(),
        sub_account: []
    }).then(r => console.log(r));

    console.log("Leave testCalls");
}