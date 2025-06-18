import {
  CKBTC_LEDGER_CANISTER_ID,
  CKTESTBTC_LEDGER_CANISTER_ID,
} from "$lib/constants/ckbtc-canister-ids.constants";
import { getMapOfUniversesToProjectSlug } from "$lib/derived/analytics.derived";
import { principal } from "$tests/mocks/sns-projects.mock";
import { setSnsProjects } from "$tests/utils/sns.test-utils";
import { get } from "svelte/store";
import { describe, expect, it } from "vitest";

describe("getMapOfUniversesToProjectSlug", () => {
  it("should have base universes", () => {
    const map = get(getMapOfUniversesToProjectSlug);

    // IC universe Id
    expect(map.get("qhbym-qaaaa-aaaaa-aaafq-cai")).toBe("internet-computer");
    expect(map.get(CKBTC_LEDGER_CANISTER_ID.toText())).toBe("ck-btc");
    expect(map.get(CKTESTBTC_LEDGER_CANISTER_ID.toText())).toBe("ck-testbtc");
  });

  it("should map SNS projects' root canister IDs to slugified names", () => {
    const rootCanisterId1 = principal(1);
    const rootCanisterId2 = principal(2);

    setSnsProjects([
      {
        rootCanisterId: rootCanisterId1,
        projectName: "Project One",
      },
      {
        rootCanisterId: rootCanisterId2,
        projectName: "Project Two",
      },
    ]);
    const map = get(getMapOfUniversesToProjectSlug);

    expect(map.get(rootCanisterId1.toText())).toBe("project-one");
    expect(map.get(rootCanisterId2.toText())).toBe("project-two");
  });
});
