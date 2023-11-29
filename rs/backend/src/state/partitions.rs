//! Stable Memory Layout
//!
//! The memory manager will be at the root of the memory, however MemoryManager::init() cheerfully overwrites data it doesn't recognize.
//! This code is here to protect the memory!
use core::borrow::Borrow;
use ic_stable_structures::memory_manager::{MemoryId, MemoryManager, VirtualMemory};
use ic_stable_structures::{DefaultMemoryImpl, Memory};

#[cfg(test)]
pub mod tests;

/// Memory layout consisting of a memory manager and some virtual memory.
pub struct Partitions {
    pub memory_manager: MemoryManager<DefaultMemoryImpl>,
}
impl Partitions {
    /// The partition containing metadata such as schema version.
    ///
    /// Note: This ID is guaranteed to be stable across deployments.
    pub const METADATA_MEMORY_ID: MemoryId = MemoryId::new(0);
    /// The partition containing heap data.
    ///
    /// Note: This ID is guaranteed to be stable across deployments.
    pub const HEAP_MEMORY_ID: MemoryId = MemoryId::new(1);

    /// Determines whether the given memory is managed by a memory manager.
    fn is_managed(memory: &DefaultMemoryImpl) -> bool {
        let memory_pages = memory.size();
        if memory_pages == 0 {
            return false;
        }
        // TODO: This is private in ic-stable-structures.  We should make it public, or have a public method for determining whether there is a memory manager at a given offset.
        const MEMORY_MANAGER_MAGIC_BYTES: &[u8; 3] = b"MGR"; // From the spec: https://docs.rs/ic-stable-structures/0.6.0/ic_stable_structures/memory_manager/struct.MemoryManager.html#v1-layout
        let mut actual_first_bytes = [0u8; MEMORY_MANAGER_MAGIC_BYTES.len()];
        memory.read(0, &mut actual_first_bytes);
        let ans = actual_first_bytes == *MEMORY_MANAGER_MAGIC_BYTES;
        dfn_core::api::print(format!(
            "END memory is_managed: {}, {:?}",
            ans,
            String::from_utf8(actual_first_bytes.to_vec())
        ));
        ans
    }

    /// Gets a partition.
    pub fn get(&self, memory_id: MemoryId) -> VirtualMemory<DefaultMemoryImpl> {
        self.memory_manager.borrow().get(memory_id)
    }
}

impl From<DefaultMemoryImpl> for Partitions {
    /// Gets an existing memory manager, if there is one.  If not, creates a new memory manager,
    /// obliterating any existing memory.
    ///
    /// Note: This is equivalent to `MemoryManager::init()`.
    fn from(memory: DefaultMemoryImpl) -> Self {
        let memory_manager = MemoryManager::init(memory);
        Partitions { memory_manager }
    }
}

/// Gets an existing memory manager, if there is one.  If not, returns the unmodified memory.
///
/// Typical usage:
/// - The canister is upgraded.
/// - The stable memory may contain a memory manager _or_ serialized heap data directly in raw memory.
/// - This method gets the memory manager while being non-destructive if there is none.
// Note: Would prefer to use TryFrom, but that causes a conflict.  DefaultMemoryImpl a type alias which
// may refer to a type that has a generic implementation of TryFrom.  This is frustrating.
//impl TryFrom<DefaultMemoryImpl> for Partitions {
//    type Error = DefaultMemoryImpl;
impl Partitions {
    pub fn try_from_memory(memory: DefaultMemoryImpl) -> Result<Self, DefaultMemoryImpl> {
        if Self::is_managed(&memory) {
            Ok(Self::from(memory))
        } else {
            Err(memory)
        }
    }
}
