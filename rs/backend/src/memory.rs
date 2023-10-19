//! Stable memory layout
//!
//! # References
//! * [Tutorial by Roman](https://mmapped.blog/posts/14-stable-structures.html#restricted-memory)
//! * [Quickstart](https://github.com/dfinity/stable-structures/blob/main/examples/src/quick_start/src/memory.rs)
//! * [Stable structures git repository](https://github.com/dfinity/stable-structures)
//! * [Stable structures rustdoc](https://docs.rs/ic-stable-structures/latest/ic_stable_structures/btreemap/struct.BTreeMap.html)
use ic_stable_structures::memory_manager::{MemoryManager, VirtualMemory};
use ic_stable_structures::{DefaultMemoryImpl, RestrictedMemory};
use std::cell::RefCell;

/// The number of pages at the beginning or memory reserved for metadata.
#[allow(dead_code)]
const METADATA_PAGES: u64 = 1;

#[allow(dead_code)]
type RM = RestrictedMemory<DefaultMemoryImpl>;
#[allow(dead_code)]
type VM = VirtualMemory<RM>;

thread_local! {
    /// The first few bytes of memory are unmanaged and used for storing metadata.
    pub static METADATA_MEMORY: RefCell<RM> = RefCell::new(RM::new(DefaultMemoryImpl::default(), 0..METADATA_PAGES));

    /// The memory manager is used for simulating multiple memories. Given a `MemoryId` it can
    /// return a memory that can be used by stable structures.
    ///
    /// Note: The memory manager exists only in versioned canisters.
    /// TODO: Remove the Option when the canister is versioned.
    static MEMORY_MANAGER: RefCell<MemoryManager<RM>> = RefCell::new(MemoryManager::init(RM::new(DefaultMemoryImpl::default(), METADATA_PAGES..u64::MAX)));
}
