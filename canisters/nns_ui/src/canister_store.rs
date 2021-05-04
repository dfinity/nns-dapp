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

#[derive(CandidType, Deserialize, Clone)]
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

    pub fn get_canisters(&self, caller: PrincipalId) -> Vec<NamedCanister> {
        self.accounts.get(&caller).map_or(Vec::new(), |c| c.iter().cloned().collect())
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