import {writable} from 'svelte/store';
import {AuthClient} from '@dfinity/auth-client';

export interface AuthStore {
    signedIn: boolean | undefined;
}

export const initAuthStore = () => {
    const { subscribe, set } = writable<AuthStore>({
        signedIn: undefined
    });

    return {
        subscribe,

        init: async () => {
            const authClient: AuthClient = await AuthClient.create();

            console.log('here', authClient, await authClient.isAuthenticated())

            set({
                signedIn: await authClient.isAuthenticated()
            });
        }
    }
}

export const authStore = initAuthStore();
