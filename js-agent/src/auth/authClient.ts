import {
    Principal,
    SignIdentity,
} from '@dfinity/agent';
import {
    DelegationChain,
    DelegationIdentity,
    Ed25519KeyIdentity,
} from '@dfinity/identity';
import { createAuthenticationRequestUrl } from "@dfinity/authentication";

const DEFAULT_IDP_URL = 'https://auth.ic0.app/authorize';

class AuthenticationClient {
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
        const url = await createAuthenticationRequestUrl({
            identityProvider: DEFAULT_IDP_URL,
            publicKey: key.getPublicKey(),
            redirectUri: options.redirectUri || window.location.href,
            scope: options.scope ?? [],
        });

        window.location.href = url.toString();
    }

    createKey() : Ed25519KeyIdentity {
        return Ed25519KeyIdentity.generate();
    }
}

const authClient = new AuthenticationClient();

export default authClient;
