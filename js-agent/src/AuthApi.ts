import { LedgerIdentity } from "@dfinity/identity-ledgerhq";
import { AuthClient } from "@dfinity/auth-client";
import { Identity } from "@dfinity/agent";
import { Option } from "./canisters/option";

const IDENTITY_SERVICE_URL = "https://qsgjb-riaaa-aaaaa-aaaga-cai.cdtesting.dfinity.network/";

export default class AuthApi {
    private readonly authClient: AuthClient;

    public static create = async () : Promise<AuthApi> => {
        const authClient = await AuthClient.create();
        return new AuthApi(authClient);
    }

    private constructor(authClient: AuthClient) {
        this.authClient = authClient;
    }

    public tryGetIdentity = () : Option<Identity> => {
        const identity = this.authClient.getIdentity();
        return identity.getPrincipal().isAnonymous()
            ? null
            : identity;
    }

    public login = async () : Promise<void> => {
        await this.authClient.login({ identityProvider: IDENTITY_SERVICE_URL });
    }

    public logout = async () : Promise<void> => {
        await this.authClient.logout();
    }

    public connectToHardwareWallet = () : Promise<LedgerIdentity> => {
        return LedgerIdentity.fromWebUsb();
    }
}
