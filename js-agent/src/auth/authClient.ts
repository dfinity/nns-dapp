import {
    Principal,
    SignIdentity,
} from '@dfinity/agent';
import {
    Authenticator,
    DelegationChain,
    DelegationIdentity,
    Ed25519KeyIdentity,
} from '@dfinity/authentication';

const DEFAULT_IDP_URL = 'https://auth.ic0.app/authorize';

class AuthenticationClient {
    private _auth: Authenticator;

    constructor() {
        const idpUrl = new URL(DEFAULT_IDP_URL);

        this._auth = new Authenticator({
            identityProvider: {
                url: idpUrl,
            }
        });
    }

    createDelegationIdentity(key: SignIdentity, accessToken: string) : DelegationIdentity {
        // Parse the token which is a JSON object serialized in Hex form.
        const chainJson = [...accessToken]
            .reduce((acc, curr, i) => {
                acc[Math.floor(i/2)] = (acc[i/2 | 0] || "") + curr;
                return acc;
            }, [] as string[])
            .map(x => Number.parseInt(x, 16))
            .map(x => String.fromCharCode(x))
            .join('');
        const chain = DelegationChain.fromJSON(chainJson);
        return DelegationIdentity.fromDelegation(key, chain);
    }

    async loginWithRedirect(key: SignIdentity, options: { redirectUri?: string; scope?: Principal[]; } = {}) {
        await this._auth.sendAuthenticationRequest({
            session: {
                identity: key,
            },
            redirectUri: new URL(options.redirectUri || window.location.href),
            scope: options.scope?.map(x => ({ type: 'CanisterScope', principal: x })) ?? [],
        });
    }

    createKey() : Ed25519KeyIdentity {
        return Ed25519KeyIdentity.generate();
    }
}

const authClient = new AuthenticationClient();

export default authClient;
