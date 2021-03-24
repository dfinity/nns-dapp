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
    private _key: SignIdentity | null;

    constructor() {
        const idpUrl = new URL(DEFAULT_IDP_URL);

        this._auth = new Authenticator({
            identityProvider: {
                url: idpUrl,
            }
        });
    }

    createDelegationIdentity(accessToken: string) : DelegationIdentity {
        const key = this._key;
        if (!key) {
            throw new Error('Key missing');
        }

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

    async loginWithRedirect(options: { redirectUri?: string; scope?: Principal[]; } = {}) {
        const key = this._getOrCreateKey();

        await this._auth.sendAuthenticationRequest({
            session: {
                identity: key,
            },
            redirectUri: new URL(options.redirectUri || window.location.href),
            scope: options.scope?.map(x => ({ type: 'CanisterScope', principal: x })) ?? [],
        });
    }

    _getOrCreateKey() : SignIdentity {
        let key = this._key;
        if (!key) {
            key = Ed25519KeyIdentity.generate();
            this._key = key;
        }
        return key;
    }
}

const authClient = new AuthenticationClient();

export default authClient;
