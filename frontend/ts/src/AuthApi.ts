import { AuthClient, AuthClientLoginOptions } from "@dfinity/auth-client";
import { Identity } from "@dfinity/agent";
import { DelegationIdentity } from "@dfinity/identity";
import { LedgerIdentity } from "./ledger/identity";
import { Option } from "./canisters/option";
import { executeWithLogging } from "./errorLogger";
import { IDENTITY_SERVICE_URL } from "./config.json";

const ONE_MINUTE_MILLIS = 60 * 1000;
const SESSION_TIMEOUT_IN_NS = BigInt(1_920_000_000_000); // 32 mins

/**
 * API for authenticating users into the app.
 */
export default class AuthApi {
  private readonly authClient: AuthClient;
  private readonly onLoggedOut: () => void;
  private expireSessionTimeout: Option<NodeJS.Timeout>;

  // A cache for the ledger identity.
  private ledgerIdentity?: LedgerIdentity;

  public static create = async (onLoggedOut: () => void): Promise<AuthApi> => {
    const authClient = await AuthClient.create();
    return new AuthApi(authClient, onLoggedOut);
  };

  private constructor(authClient: AuthClient, onLoggedOut: () => void) {
    this.authClient = authClient;
    this.onLoggedOut = onLoggedOut;
    this.expireSessionTimeout = null;
    this.ledgerIdentity = undefined;

    if (this.tryGetIdentity()) {
      this.handleDelegationExpiry();
    }
  }

  /**
   * Returns the identity of the user if the user is logged and the session
   * isn't about to expire, otherwise, returns null.
   */
  public tryGetIdentity = (): Option<Identity> => {
    const identity = this.authClient.getIdentity();
    if (identity.getPrincipal().isAnonymous()) {
      return null;
    }

    const timeUntilSessionExpiryMs = this.getTimeUntilSessionExpiryMs();
    if (timeUntilSessionExpiryMs) {
      // If the identity will expire in less than 5 minutes, don't return the identity
      const durationUntilLogout = timeUntilSessionExpiryMs - ONE_MINUTE_MILLIS;
      if (durationUntilLogout <= 5 * ONE_MINUTE_MILLIS) {
        return null;
      }
    }

    return identity;
  };

  /**
   * Prompts the user to login by redirecting them to the Internet Identity.
   */
  public login = async (onSuccess: () => void): Promise<void> => {
    const options: AuthClientLoginOptions = {
      maxTimeToLive: SESSION_TIMEOUT_IN_NS,
      identityProvider: IDENTITY_SERVICE_URL,
      onSuccess: () => {
        this.handleDelegationExpiry();
        onSuccess();
      },
    };

    await executeWithLogging(() => this.authClient.login(options));
  };

  /**
   * Logout of the app.
   */
  public logout = async (): Promise<void> => {
    if (this.expireSessionTimeout) {
      clearTimeout(this.expireSessionTimeout);
    }

    await executeWithLogging(() => this.authClient.logout());
    this.onLoggedOut();
  };

  public connectToHardwareWallet = async (): Promise<LedgerIdentity | null> => {
    if (this.ledgerIdentity) {
      return this.ledgerIdentity;
    }

    try {
      console.log("Creating new connection to hardware wallet");
      this.ledgerIdentity = await LedgerIdentity.create();
      return this.ledgerIdentity;
    } catch (err) {
      console.log(`An exception has occurred: ${err}`);
      if (
        err instanceof Error &&
        err.message.includes("device is already open")
      ) {
        alert(
          "The wallet is already being used. Please close any ongoing transactions on the wallet and try again."
        );
      } else {
        // Unkown error. Display as-is.
        alert(err);
      }
      return null;
    }
  };

  public getPrincipal = (): string | undefined => {
    return this.tryGetIdentity()?.getPrincipal().toString();
  };

  /**
   * @returns the amount of time in ms remaining for the session to expire.
   * Null is returned if the session doesn't expire or if the user isn't logged in.
   */
  public getTimeUntilSessionExpiryMs = (): Option<number> => {
    const identity = this.authClient.getIdentity();
    if (identity instanceof DelegationIdentity) {
      const expiryDateTimestampMs = Number(
        identity
          .getDelegation()
          .delegations.map((d) => d.delegation.expiration)
          .reduce((current, next) => (next < current ? next : current)) /
          BigInt(1_000_000)
      );

      return expiryDateTimestampMs - Date.now();
    }
    return null;
  };

  private handleDelegationExpiry = () => {
    const durationUntilSessionExpiresMs = this.getTimeUntilSessionExpiryMs();

    if (durationUntilSessionExpiresMs) {
      const durationUntilLogoutMs =
        durationUntilSessionExpiresMs - ONE_MINUTE_MILLIS;

      if (durationUntilLogoutMs <= 0) {
        this.logout();
      } else {
        // Log the user out 1 minute before their session expires
        this.expireSessionTimeout = setTimeout(
          () => this.logout(),
          durationUntilSessionExpiresMs - ONE_MINUTE_MILLIS
        );
      }
    }
  };
}
