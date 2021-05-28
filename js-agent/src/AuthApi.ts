import { AuthClient, AuthClientLoginOptions } from "@dfinity/auth-client";
import { Identity } from "@dfinity/agent";
import { DelegationIdentity } from "@dfinity/identity";
import { LedgerIdentity } from "@dfinity/identity-ledgerhq";
import { Option } from "./canisters/option";
import { executeWithLogging } from "./errorLogger";
import { IDENTITY_SERVICE_URL } from "./config.json";

const ONE_MINUTE_MILLIS = 60 * 1000;
const SESSION_TIMEOUT_IN_NS = BigInt(1_920_000_000_000) // 32 mins

export default class AuthApi {
    private readonly authClient: AuthClient;
    private readonly onLoggedOut: () => void;
    private expireSessionTimeout: Option<NodeJS.Timeout>;

    public static create = async (onLoggedOut: () => void) : Promise<AuthApi> => {
        const authClient = await AuthClient.create();
        return new AuthApi(authClient, onLoggedOut);
    }

    private constructor(authClient: AuthClient, onLoggedOut: () => void) {
        this.authClient = authClient;
        this.onLoggedOut = onLoggedOut;
        this.expireSessionTimeout = null;

        if (this.tryGetIdentity()) {
            this.handleDelegationExpiry();
        }
    }

    public tryGetIdentity = () : Option<Identity> => {
        const identity = this.authClient.getIdentity();
        if (identity.getPrincipal().isAnonymous()) {
            return null;
        }

        // If the identity will expire in less than 5 minutes, don't return the identity
        const durationUntilLogout = this.getTimeUntilSessionExpiryMs() - ONE_MINUTE_MILLIS;
        if (durationUntilLogout <= 5 * ONE_MINUTE_MILLIS) {
            return null;
        }

        return identity;
    }

    public login = async (onSuccess: () => void) : Promise<void> => {
        const options: AuthClientLoginOptions = {
            maxTimeToLive: SESSION_TIMEOUT_IN_NS,
            identityProvider: IDENTITY_SERVICE_URL,
            onSuccess: () => {
                this.handleDelegationExpiry();
                onSuccess();
            }
        }

        await executeWithLogging(() => this.authClient.login(options));
    }

    public logout = async () : Promise<void> => {
        if (this.expireSessionTimeout) {
            clearTimeout(this.expireSessionTimeout);
        }

        await executeWithLogging(() => this.authClient.logout());
        this.onLoggedOut();
    }

    public connectToHardwareWallet = () : Promise<LedgerIdentity> => {
        return executeWithLogging(LedgerIdentity.fromWebUsb);
    }

    public getPrincipal = () : string => {
        return this.tryGetIdentity()?.getPrincipal().toString();
    }

    public getTimeUntilSessionExpiryMs = () : Option<number> => {
        const identity = this.authClient.getIdentity();
        if (identity instanceof DelegationIdentity) {
            const expiryDateTimestampMs = Number(identity.getDelegation().delegations
                .map(d => d.delegation.expiration)
                .reduce((current, next) => next < current ? next : current) / BigInt(1_000_000));

            return expiryDateTimestampMs - Date.now();
        }
        return null;
    }

    private handleDelegationExpiry = () => {
        const durationUntilSessionExpiresMs = this.getTimeUntilSessionExpiryMs();

        if (durationUntilSessionExpiresMs) {
            const durationUntilLogoutMs = durationUntilSessionExpiresMs - ONE_MINUTE_MILLIS;

            if (durationUntilLogoutMs <= 0) {
                this.logout();
            } else {
                // Log the user out 1 minute before their session expires
                this.expireSessionTimeout = setTimeout(() => this.logout(), durationUntilSessionExpiresMs - ONE_MINUTE_MILLIS);
            }
        }
    }
}
