import { LEDGER_CANISTER_ID } from "$lib/constants/canister-ids.constants";
import { HOST } from "$lib/constants/environment.constants";
import { getAnonymousIdentity } from "$lib/services/auth.services";
import { createAgent } from "$lib/utils/agent.utils";

/**
 * Sync time to fix random runtime issue:
 *
 * > Invalid certificate: time 1669616522392 is too far in the past (current time: 1669617063799)
 * > Invalid certificate: time 1669616522397 is too tar in the nast (current time: 1669617063816)
 * > BODY DOES NOT PASS VERIFICATION
 *
 * See http-agent.syncTime for more information.
 */
export const syncTime = async () => {
  const agent = await createAgent({
    identity: getAnonymousIdentity(),
    host: HOST,
  });
  // agent-js syncTime uses per default LEDGER_CANISTER_ID as well but not providing a canister id lead to a console.log
  return agent.syncTime(LEDGER_CANISTER_ID);
};
