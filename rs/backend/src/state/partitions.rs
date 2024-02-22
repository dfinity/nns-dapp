//! Stable Memory Layout
//!
//! The memory manager will be at the root of the memory, however `MemoryManager::init()` cheerfully overwrites data it doesn't recognize.
//! This code is here to protect the memory!
//!
//! This code also stores virtual memory IDs and other memory functions.
use core::borrow::Borrow;
use ic_cdk::api::stable::WASM_PAGE_SIZE_IN_BYTES;
use ic_cdk::println;
use ic_stable_structures::memory_manager::{MemoryId, MemoryManager, VirtualMemory};
use ic_stable_structures::{DefaultMemoryImpl, Memory};
#[cfg(not(target_arch = "wasm32"))]
use std::rc::Rc;
use strum::IntoEnumIterator;
use strum_macros::EnumIter;

#[cfg(test)]
use crate::state::SchemaLabel;

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

impl core::fmt::Debug for Partitions {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        writeln!(f, "Partitions {{")?;
        writeln!(f, "  schema_label: {:?}", self.schema_label())?;
        for id in PartitionType::iter() {
            writeln!(
                f,
                "  {:?} partition: {} pages",
                id,
                self.get(MemoryId::new(id as u8)).size()
            )?;
        }
        writeln!(f, "}}")
    }
}

#[derive(strum_macros::Display)]
pub enum PartitionsMaybe {
    /// Memory that has a memory manager.
    Partitions(Partitions),
    /// Memory that does not have any kind of memory manager.
    None(DefaultMemoryImpl),
}

#[cfg(test)]
impl PartitionsMaybe {
    /// Gets the schema label.
    pub fn schema_label(&self) -> SchemaLabel {
        match self {
            #[cfg(test)]
            PartitionsMaybe::Partitions(partitions) => partitions.schema_label(),
            PartitionsMaybe::None(_) => SchemaLabel::Map,
        }
    }
}

impl Default for PartitionsMaybe {
    fn default() -> Self {
        PartitionsMaybe::None(DefaultMemoryImpl::default())
    }
}

impl core::fmt::Debug for PartitionsMaybe {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            PartitionsMaybe::Partitions(partitions) => {
                write!(f, "MemoryWithPartitionType::MemoryManager({partitions:?})")
            }
            PartitionsMaybe::None(memory) => {
                write!(
                    f,
                    "MemoryWithPartitionType::None( Memory with {} pages )",
                    memory.size()
                )
            }
        }
    }
}

/// The virtual memory IDs for the partitions.
///
/// IMPORTANT: There must be a 1-1 mapping between enum entries and virtual memories (aka partitions of the stable memory).
///
/// IMPORTANT: The IDs must be stable across deployments.
#[repr(u8)]
#[derive(Debug, Copy, Clone, PartialEq, Eq, Hash, EnumIter)]
pub enum PartitionType {
    /// The virtual memory containing metadata such as schema version.
    ///
    /// Note: This ID is guaranteed to be stable across deployments.
    Metadata = 0,
    /// The virtual memory containing heap data.
    ///
    /// Note: This ID is guaranteed to be stable across deployments.
    Heap = 1,
    /// The virtual memory containing accounts.
    ///
    /// Note: This ID is guaranteed to be stable across deployments.
    Accounts = 2,
}
impl PartitionType {
    #[must_use]
    pub const fn memory_id(self) -> MemoryId {
        MemoryId::new(self as u8)
    }
}

impl Partitions {
    /// Determines whether the given memory is managed by a memory manager.
    #[must_use]
    #[allow(clippy::trivially_copy_pass_by_ref)] // The implementation changes depending on target, so clippy is wrong.
    fn is_managed(memory: &DefaultMemoryImpl) -> bool {
        // TODO: This is private in ic-stable-structures.  We should make it public, or have a public method for determining whether there is a memory manager at a given offset.
        const MEMORY_MANAGER_MAGIC_BYTES: &[u8; 3] = b"MGR"; // From the spec: https://docs.rs/ic-stable-structures/0.6.0/ic_stable_structures/memory_manager/struct.MemoryManager.html#v1-layout

        let memory_pages = memory.size();
        if memory_pages == 0 {
            return false;
        }
        let mut actual_first_bytes = [0u8; MEMORY_MANAGER_MAGIC_BYTES.len()];
        memory.read(0, &mut actual_first_bytes);
        let ans = actual_first_bytes == *MEMORY_MANAGER_MAGIC_BYTES;
        println!(
            "END memory is_managed: {}, {:?}",
            ans,
            String::from_utf8(actual_first_bytes.to_vec())
        );
        ans
    }

    /// Gets a partition.
    #[must_use]
    pub fn get(&self, memory_id: MemoryId) -> VirtualMemory<DefaultMemoryImpl> {
        self.memory_manager.borrow().get(memory_id)
    }

    /// Copies a reference to memory.  Note:  Does NOT copy the underlying memory.
    ///
    /// Note:
    /// - Canister stable memory is, in Rust, a stateless `struct` that makes API calls.  It implements Copy.
    /// - Vector memory uses an `Rc` so we use `Rc::clone()` to copy the reference.
    #[must_use]
    #[allow(clippy::trivially_copy_pass_by_ref)] // The implementation changes depending on target, so clippy is wrong.
    pub fn copy_memory_reference(memory: &DefaultMemoryImpl) -> DefaultMemoryImpl {
        // Empty structure that makes API calls.  Can be cloned.
        #[cfg(target_arch = "wasm32")]
        let ans = *memory;
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
        let min_pages: u64 = u64::try_from(bytes.len())
            .unwrap_or_else(|err| unreachable!("Buffer for growing_write is longer than 2**64 bytes?? Err: {err}"))
            .saturating_add(offset)
            .div_ceil(WASM_PAGE_SIZE_IN_BYTES as u64);
        let current_pages = memory.size();
        if current_pages < min_pages {
            memory.grow(min_pages - current_pages);
        }
        memory.write(offset, bytes);
    }

    /// Reads the exact number of bytes needed to fill `buffer`.
    pub fn read_exact(&self, memory_id: MemoryId, offset: u64, buffer: &mut [u8]) -> Result<(), String> {
        let memory = self.get(memory_id);
        let bytes_in_memory = memory.size()
            * u64::try_from(WASM_PAGE_SIZE_IN_BYTES)
                .unwrap_or_else(|err| unreachable!("Wasm page size is fixed and well within the range of u64: {err}"));
        if offset.saturating_add(u64::try_from(buffer.len()).unwrap_or_else(|err| {
            unreachable!("Buffer for read_exact is longer than 2**64.  This seems extremely implausible.  Err: {err}")
        })) > bytes_in_memory
        {
            return Err(format!("Out of bounds memory access: Failed to read exactly {} bytes at offset {} as memory size is only {} bytes.", buffer.len(), offset, bytes_in_memory));
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
