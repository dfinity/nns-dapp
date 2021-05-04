use candid::CandidType;
use crate::state::StableState;
use dfn_candid::CandidOne;
use dfn_core::api::PrincipalId;
use dfn_core::CanisterId;
use on_wire::{IntoWire, FromWire};
use serde::Deserialize;
use std::collections::hash_map::Entry::{Occupied, Vacant};
use std::collections::HashMap;

#[derive(Default)]
pub struct CanisterStore {
    accounts: HashMap<PrincipalId, Vec<NamedCanister>>
}

#[derive(CandidType, Deserialize, Clone, Debug, PartialEq, Eq)]
pub struct NamedCanister {
    name: String,
    canister_id: CanisterId
}

impl CanisterStore {
    pub fn attach_canister(&mut self, caller: PrincipalId, request: AttachCanisterRequest) -> AttachCanisterResponse {
        match self.accounts.entry(caller) {
            Occupied(mut e) => {
                let canisters = e.get_mut();
                if canisters.len() >= u8::MAX as usize {
                    return AttachCanisterResponse::CanisterLimitExceeded
                }
                for c in canisters.iter() {
                    if c.name == request.name {
                        return AttachCanisterResponse::NameAlreadyTaken;
                    } else if c.canister_id == request.canister_id {
                        return AttachCanisterResponse::CanisterAlreadyAttached;
                    }
                }
                canisters.push(NamedCanister { name: request.name, canister_id: request.canister_id });
            },
            Vacant(e) => {
                let canisters = vec!(NamedCanister { name: request.name, canister_id: request.canister_id });
                e.insert(canisters);
            }
        }
        AttachCanisterResponse::Ok
    }

    pub fn get_canisters(&self, caller: &PrincipalId) -> Vec<NamedCanister> {
        let mut canisters = self.accounts.get(caller).map_or(Vec::new(), |c| c.iter().cloned().collect());
        canisters.sort_unstable_by_key(|c| c.name.clone());
        canisters
    }
}

impl StableState for CanisterStore {
    fn encode(&self) -> Vec<u8> {
        CandidOne(&self.accounts).into_bytes().unwrap()
    }

    fn decode(bytes: Vec<u8>) -> Result<Self, String> {
        let accounts: HashMap<PrincipalId, Vec<NamedCanister>> = CandidOne::from_bytes(bytes).map(|c| c.0)?;

        Ok(CanisterStore {
            accounts
        })
    }
}

#[derive(Deserialize)]
pub struct AttachCanisterRequest {
    name: String,
    canister_id: CanisterId
}

#[derive(CandidType)]
pub enum AttachCanisterResponse {
    Ok,
    CanisterLimitExceeded,
    CanisterAlreadyAttached,
    NameAlreadyTaken
}


#[cfg(test)]
mod tests {
    use super::*;
    use std::str::FromStr;

    const TEST_ACCOUNT_1: &str = "bngem-gzprz-dtr6o-xnali-fgmfi-fjgpb-rya7j-x2idk-3eh6u-4v7tx-hqe";
    const TEST_ACCOUNT_2: &str = "c2u3y-w273i-ols77-om7wu-jzrdm-gxxz3-b75cc-3ajdg-mauzk-hm5vh-jag";
    const TEST_ACCOUNT_3: &str = "347of-sq6dc-h53df-dtzkw-eama6-hfaxk-a7ghn-oumsd-jf2qy-tqvqc-wqe";
    const TEST_ACCOUNT_4: &str = "zrmyx-sbrcv-rod5f-xyd6k-letwb-tukpj-edhrc-sqash-lddmc-7qypw-yqe";
    const TEST_ACCOUNT_5: &str = "2fzwl-cu3hl-bawo2-idwrw-7yygk-uccms-cbo3a-c6kqt-lnk3j-mewg3-hae";
    const TEST_ACCOUNT_6: &str = "4gb44-uya57-c2v6u-fcz5v-qrpwl-wqkmf-o3fd3-esjio-kpysm-r5xxh-fqe";

    #[test]
    fn attach_canister_followed_by_get_canisters() {
        let principal = PrincipalId::from_str(TEST_ACCOUNT_1).unwrap();
        let mut store = CanisterStore::default();

        let canister_ids: Vec<_> = [TEST_ACCOUNT_2, TEST_ACCOUNT_3, TEST_ACCOUNT_4, TEST_ACCOUNT_5, TEST_ACCOUNT_6]
            .iter()
            .map(|&id| CanisterId::from_str(id).unwrap())
            .collect();

        for (index, canister_id) in canister_ids.iter().enumerate() {
            let result = store.attach_canister(principal, AttachCanisterRequest {
                name: index.to_string(),
                canister_id: canister_id.clone()
            });

            assert!(matches!(result, AttachCanisterResponse::Ok));
        }

        let canisters = store.get_canisters(&principal);

        let expected: Vec<_> = canister_ids.into_iter()
            .enumerate()
            .map(|(index, canister_id)| NamedCanister { name: index.to_string(), canister_id })
            .collect();

        assert_eq!(expected.len(), canisters.len());
        for i in 0..canisters.len() {
            assert_eq!(expected[i], canisters[i]);
        }
    }

    #[test]
    fn attach_canister_name_already_taken() {
        let principal = PrincipalId::from_str(TEST_ACCOUNT_1).unwrap();
        let mut store = CanisterStore::default();

        let canister_id1 = CanisterId::from_str(TEST_ACCOUNT_2).unwrap();
        let canister_id2 = CanisterId::from_str(TEST_ACCOUNT_3).unwrap();

        let result1 = store.attach_canister(principal, AttachCanisterRequest { name: "ABC".to_string(), canister_id: canister_id1 });
        let result2 = store.attach_canister(principal, AttachCanisterRequest { name: "ABC".to_string(), canister_id: canister_id2 });

        assert!(matches!(result1, AttachCanisterResponse::Ok));
        assert!(matches!(result2, AttachCanisterResponse::NameAlreadyTaken));
    }

    #[test]
    fn attach_canister_canister_already_attached() {
        let principal = PrincipalId::from_str(TEST_ACCOUNT_1).unwrap();
        let mut store = CanisterStore::default();

        let canister_id = CanisterId::from_str(TEST_ACCOUNT_2).unwrap();

        let result1 = store.attach_canister(principal, AttachCanisterRequest { name: "ABC".to_string(), canister_id });
        let result2 = store.attach_canister(principal, AttachCanisterRequest { name: "XYZ".to_string(), canister_id });

        assert!(matches!(result1, AttachCanisterResponse::Ok));
        assert!(matches!(result2, AttachCanisterResponse::CanisterAlreadyAttached));
    }
}
