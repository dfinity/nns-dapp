//! Stable Memory Layout
//!
//! The memory manager will be at the root of the memory, however `MemoryManager::init()` cheerfully overwrites data it doesn't recognize.
//! This code is here to protect the memory!
//!
//! This code also stores virtual memory IDs and other memory functions.
use core::borrow::Borrow;
use ic_cdk::api::stable::WASM_PAGE_SIZE_IN_BYTES;
use ic_stable_structures::memory_manager::{MemoryId, MemoryManager, VirtualMemory};
use ic_stable_structures::{DefaultMemoryImpl, Memory};
#[cfg(not(target_arch = "wasm32"))]
use std::rc::Rc;

pub mod schemas;
#[cfg(test)]
pub mod tests;

/// Stable memory layout: A wrapper for a memory manager with additional safety checks and functionality.
pub struct Partitions {
    pub memory_manager: MemoryManager<DefaultMemoryImpl>,
    /// Note: DO NOT USE THIS.  The memory manager consumes a memory instance
    /// but has no method for returning it.  If we wish to convert a `DefaultMemoryImpl`
    /// to `Partitions` and back again, we need to keep a reference to the memory to
    /// provide when we convert back.
    #[cfg(test)]
    memory: DefaultMemoryImpl,
}
impl Partitions {
    /// The virtual memory containing metadata such as schema version.
    ///
    /// Note: This ID is guaranteed to be stable across deployments.
    pub const METADATA_MEMORY_ID: MemoryId = MemoryId::new(0);
    /// The virtual memory containing heap data.
    ///
    /// Note: This ID is guaranteed to be stable across deployments.
    pub const HEAP_MEMORY_ID: MemoryId = MemoryId::new(1);
    /// The virtual memory containing accounts.
    ///
    /// Note: This ID is guaranteed to be stable across deployments.
    pub const ACCOUNTS_MEMORY_ID: MemoryId = MemoryId::new(2);

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

    /// Copies a reference to memory.  Note:  Does NOT copy the underlying memory.
    ///
    /// Note:
    /// - Canister stable memory is, in Rust, a stateless `struct` that makes API calls.  It implements Copy.
    /// - Vector memory uses an `Rc` so we use `Rc::clone()` to copy the reference.
    pub fn copy_memory_reference(memory: &DefaultMemoryImpl) -> DefaultMemoryImpl {
        // Empty structure that makes API calls.  Can be cloned.
        #[cfg(target_arch = "wasm32")]
        let ans = (*memory).clone();
        // Reference counted pointer.  Make a copy of the pointer.
        #[cfg(not(target_arch = "wasm32"))]
        let ans = Rc::clone(memory);
        ans
    }

    /// Returns the raw memory, discarding the partitions data structure in RAM.
    ///
    /// Note: The memory manager is still represented in the underlying memory,
    /// so converting from `Partitions` to `DefaultMemoryImpl` and back again
    /// returns to the original state.
    #[cfg(test)]
    pub fn into_memory(self) -> DefaultMemoryImpl {
        self.memory
    }

    /// Writes, growing the memory if necessary.
    pub fn growing_write(&self, memory_id: MemoryId, offset: u64, bytes: &[u8]) {
        let memory = self.get(memory_id);
        let min_pages = u64::try_from(
            (usize::try_from(offset).unwrap() + bytes.len() + WASM_PAGE_SIZE_IN_BYTES - 1) / WASM_PAGE_SIZE_IN_BYTES,
        )
        .expect("That is a large number of pages");
        let current_pages = memory.size();
        if current_pages < min_pages {
            memory.grow(min_pages - current_pages);
        }
        memory.write(offset, bytes)
    }
    /// Reads as much data as available to the buffer
    ///
    /// # Returns
    /// The number of bytes read.
    #[cfg(any())]
    pub fn read_available(&self, memory_id: MemoryId, offset: u64, buffer: &mut [u8]) -> u64 {
        let memory = self.get(memory_id);
        let bytes_in_memory =
            memory.size() * u64::try_from(WASM_PAGE_SIZE_IN_BYTES).expect("Wasm page size is too large");
        if offset >= bytes_in_memory {
            return 0;
        }
        let bytes_to_read = u64::min(bytes_in_memory - offset, u64::try_from(buffer.len()).unwrap());
        memory.read(offset, &mut buffer[0..bytes_to_read as usize]);
        bytes_to_read
    }
    /// Reads a buffer, if possible.
    pub fn try_read(&self, memory_id: MemoryId, offset: u64, buffer: &mut [u8]) -> Result<(), &'static str> {
        let memory = self.get(memory_id);
        let bytes_in_memory =
            memory.size() * u64::try_from(WASM_PAGE_SIZE_IN_BYTES).expect("Wasm page size is too large");
        if offset + u64::try_from(buffer.len()).unwrap() >= bytes_in_memory {
            return Err("Insufficient memory to read");
        }
        memory.read(offset, buffer);
        Ok(())
    }
}

impl From<DefaultMemoryImpl> for Partitions {
    /// Gets an existing memory manager, if there is one.  If not, creates a new memory manager,
    /// obliterating any existing memory.
    ///
    /// Note: This is equivalent to `MemoryManager::init()`.
    fn from(memory: DefaultMemoryImpl) -> Self {
        let memory_manager = MemoryManager::init(Self::copy_memory_reference(&memory));
        Partitions {
            memory_manager,
            #[cfg(test)]
            memory,
        }
    }
}

/// Gets an existing memory manager, if there is one.  If not, returns the unmodified memory.
///
/// Typical usage:
/// - The canister is upgraded.
/// - The stable memory may contain a memory manager _or_ serialized heap data directly in raw memory.
/// - This method gets the memory manager while being non-destructive if there is none.
///
/// Note: Would prefer to use `TryFrom`, but that causes a conflict.  `DefaultMemoryImpl` a type alias which
/// may refer to a type that has a generic implementation of `TryFrom`.  This is frustrating.
impl Partitions {
    pub fn try_from_memory(memory: DefaultMemoryImpl) -> Result<Self, DefaultMemoryImpl> {
        if Self::is_managed(&memory) {
            Ok(Self::from(memory))
        } else {
            Err(memory)
        }
    }
}
