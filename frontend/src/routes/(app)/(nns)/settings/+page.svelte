<script lang="ts">
    import {Island, KeyValuePairInfo} from "@dfinity/gix-components";
    import Hash from "$lib/components/ui/Hash.svelte";
    import {authStore} from "$lib/stores/auth.store";

    let principalText = "";
    $: principalText = $authStore.identity?.getPrincipal().toText() ?? "";

    // TODO:
    // - extract component
    // - don't display user menu
    // - back to know referrer only
    // - in another PR: session legth
    // - in another PR: ckTESTBTC feature flag including popover that ask to confirm
</script>

<Island>
    <main class="legacy">
        <section>
            <h1>Settings</h1>

            <div class="content-cell-details">
                <KeyValuePairInfo>
                    <p slot="key" class="label">Your principal ID</p>
                    <p slot="value" class="value">
                        <Hash id="principal-id" text={principalText} tagName="p" showCopy />
                    </p>

                    <svelte:fragment slot="info">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec ac tempor diam. Donec varius tincidunt orci ac pellentesque. Maecenas eget dignissim tortor. Quisque pulvinar tincidunt malesuada.
                    </svelte:fragment>
                </KeyValuePairInfo>
            </div>
        </section>
    </main>
</Island>