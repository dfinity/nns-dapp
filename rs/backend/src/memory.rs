//! Stable memory layout
//! 
//! # References
//! * [Tutorial by Roman](https://mmapped.blog/posts/14-stable-structures.html#restricted-memory)
//! * [Quickstart](https://github.com/dfinity/stable-structures/blob/main/examples/src/quick_start/src/memory.rs)
//! * [Stable structures git repository](https://github.com/dfinity/stable-structures)
//! * [Stable structures rustdoc](https://docs.rs/ic-stable-structures/latest/ic_stable_structures/btreemap/struct.BTreeMap.html)
use ic_stable_structures::memory_manager::{MemoryId, MemoryManager, VirtualMemory};
use ic_stable_structures::DefaultMemoryImpl;
use std::cell::RefCell;

// Stable memory is split into several virtual memories for different purposes.
#[allow(dead_code)]
type DefaultVirtualMemory = VirtualMemory<DefaultMemoryImpl>;
#[allow(dead_code)]
const CONTROL_MEMORY_ID: MemoryId = MemoryId::new(0);
#[allow(dead_code)]
const HEAP_MEMORY_ID: MemoryId = MemoryId::new(1);
#[allow(dead_code)]
const ACCOUNTS_DATA_MEMORY_ID_SCHEMA_A: MemoryId = MemoryId::new(2);
#[allow(dead_code)]
const ACCOUNTS_DATA_MEMORY_ID_SCHEMA_B: MemoryId = MemoryId::new(3);
// NOTE: we allocate the first 1 page (64KiB) of the
// canister memory for the memory layout version information.
#[allow(dead_code)]
const METADATA_PAGES: u64 = 1;

#[allow(dead_code)]
type RM = RestrictedMemory<DefaultMemoryImpl>;
#[allow(dead_code)]
type VM = VirtualMemory<RM>;

thread_local! {
    pub static STATE: State = State::default();

    /// The first few bytes of memory are unmanaged and used for storing metadata.
    pub static METADATA_MEMORY: RefCell<RM> = RefCell::new(RM::new(DefaultMemoryImpl::default(), 0..METADATA_PAGES));

    /// The memory manager is used for simulating multiple memories. Given a `MemoryId` it can
    /// return a memory that can be used by stable structures.
    ///
    /// Note: The memory manager exists only in versioned canisters.
    /// TODO: Remove the Option when the canister is versioned.
    static MEMORY_MANAGER: RefCell<MemoryManager<RM>> = RefCell::new(MemoryManager::init(RM::new(DefaultMemoryImpl::default(), METADATA_PAGES..u64::MAX)));

    /// 
    // TODO: Change the key to a struct consisting of pagenum, principal length and a byte vec.
    // TODO: Change the value to a 1kb page; u16len+data; use -1 if the page is full and there is a follow-on page.
    pub static ACCOUNTS_MEMORY_A: RefCell<StableBTreeMap<s1::AccountStorageKey, s1::AccountStoragePage, VM>> =
    MEMORY_MANAGER.with(|mm| {
      RefCell::new(StableBTreeMap::init(mm.borrow().get(ACCOUNTS_DATA_MEMORY_ID_SCHEMA_A)))
    });
}
