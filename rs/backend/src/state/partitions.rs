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
use strum::IntoEnumIterator;
use strum_macros::EnumIter;
#[cfg(test)]
pub mod tests;

/// Stable memory layout: A wrapper for a memory manager with additional safety checks and functionality.
pub struct Partitions {
    /// A memory manager with a schema label in one of the virtual memories.
    pub memory_manager: MemoryManager<DefaultMemoryImpl>,
}

impl core::fmt::Debug for Partitions {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        writeln!(f, "Partitions {{")?;
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
    /// The memory ID.
    ///
    /// IMPORTANT: There must be a 1-1 mapping between `PartitionType`s and virtual memory IDs.
    #[must_use]
    pub const fn memory_id(self) -> MemoryId {
        MemoryId::new(self as u8)
    }
}

impl Partitions {
    /// Gets a partition.
    #[must_use]
    pub fn get(&self, memory_id: MemoryId) -> VirtualMemory<DefaultMemoryImpl> {
        self.memory_manager.borrow().get(memory_id)
    }

    /// Writes, growing the memory if necessary.
    pub fn growing_write(&self, memory_id: MemoryId, offset: u64, bytes: &[u8]) {
        let memory = self.get(memory_id);
        let min_pages: u64 = u64::try_from(bytes.len())
            .unwrap_or_else(|err| unreachable!("Buffer for growing_write is longer than 2**64 bytes?? Err: {err}"))
            .saturating_add(offset)
            .div_ceil(WASM_PAGE_SIZE_IN_BYTES);
        let current_pages = memory.size();
        if current_pages < min_pages {
            memory.grow(min_pages - current_pages);
        }
        memory.write(offset, bytes);
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
impl From<DefaultMemoryImpl> for Partitions {
    #[must_use]
    fn from(memory: DefaultMemoryImpl) -> Self {
        let memory_manager = MemoryManager::init(memory);
        Partitions { memory_manager }
    }
}
