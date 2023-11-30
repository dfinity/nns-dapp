//! Tests for stable memory layout code.
use super::*;
use crate::state::{tests::setup_test_state, StableState};
use ic_cdk::api::stable::WASM_PAGE_SIZE_IN_BYTES;
use ic_crypto_sha::Sha256;
use std::rc::Rc;

#[test]
fn is_managed_should_recognize_memory_manager() {
    let toy_memory = DefaultMemoryImpl::default();
    assert!(
        !Partitions::is_managed(&toy_memory),
        "Empty (zero pages) of memory should not be recognized as a memory manager."
    );
    toy_memory.grow(5);
    assert!(
        !Partitions::is_managed(&toy_memory),
        "Blank, unpopulated memory should not be recognized as managed."
    );
    let old_style_memory = setup_test_state().encode();
    toy_memory.write(0, &old_style_memory);
    assert!(!Partitions::is_managed(&toy_memory), "Random fill or old style memory should not be recognized as managed.  There _should_ be only a 2**24 bit chance of a false positive.");
    MemoryManager::init(Rc::clone(&toy_memory)); // Note: The clone() clones the Rc, not the memory.
    assert!(
        Partitions::is_managed(&toy_memory),
        "Memory manager should be recognized as managed."
    );
}

/// If memory contains a memory manager, we should be able to get a partition table from it.
#[test]
fn should_be_able_to_get_partitions_from_managed_memory() {
    // Prepare some memory.
    let toy_memory = DefaultMemoryImpl::default();
    assert!(
        Partitions::try_from_memory(Rc::clone(&toy_memory)).is_err(),
        "Zero bytes of memory should not yeild a partition table."
    );
    assert!(toy_memory.size() == 0, "Zero bytes of memory should have zero pages.");
    toy_memory.grow(5);
    assert!(
        Partitions::try_from_memory(Rc::clone(&toy_memory)).is_err(),
        "Blank memory should not yield a partition table."
    );
    // Create a memory manager.
    MemoryManager::init(Rc::clone(&toy_memory));
    let partitions = Partitions::try_from_memory(std::rc::Rc::clone(&toy_memory));
    assert!(
        partitions.is_ok(),
        "Managed memory should yield a partition table, even if it is empty."
    );
}

/// The virtual memory in a partition table should correspond to that created by a memory manager.
#[test]
fn partitins_should_get_correct_virtual_memory() {
    /// Checks that the contents of virtual memory is as we expect.
    fn should_contain(partitions: &Partitions, memory_id: MemoryId, expected_contents: &[u8]) {
        let memory = partitions.get(memory_id);
        let mut actual_contents = vec![0u8; expected_contents.len()];
        memory.read(0, &mut actual_contents);
        assert_eq!(
            expected_contents, actual_contents,
            "Partition {:?} should contain the expected contents.",
            memory_id
        );
    }

    // Prepare some memory.
    let toy_memory = DefaultMemoryImpl::default();
    let memory_manager = MemoryManager::init(Rc::clone(&toy_memory));
    // At this stage, partitions should be empty.
    let partitions = Partitions::try_from_memory(Rc::clone(&toy_memory)).expect("Failed to get empty partitions");
    assert_eq!(
        partitions.get(Partitions::METADATA_MEMORY_ID).size(),
        0,
        "Metadata partition should be empty."
    );
    assert_eq!(
        partitions.get(Partitions::HEAP_MEMORY_ID).size(),
        0,
        "Heap partition should be empty."
    );

    // Grow a partition in the memory manager.  The partitions should grow with it.
    let toy_metadata_fill = [9u8; WASM_PAGE_SIZE_IN_BYTES];
    memory_manager.get(Partitions::METADATA_MEMORY_ID).grow(1);
    let partitions = Partitions::try_from_memory(Rc::clone(&toy_memory))
        .expect("Failed to get partitions when one partition has grown");
    assert_eq!(
        Partitions::try_from_memory(Rc::clone(&toy_memory))
            .expect("Failed to get partitions")
            .get(Partitions::METADATA_MEMORY_ID)
            .size(),
        1,
        "Metadata partition should have grown to 1."
    );
    assert_eq!(
        partitions.get(Partitions::HEAP_MEMORY_ID).size(),
        0,
        "Heap partition should still be empty."
    );

    // Populate a partition with the memory manager.  The partitions should be able to read the data back.
    memory_manager
        .get(Partitions::METADATA_MEMORY_ID)
        .write(0, &toy_metadata_fill);
    let partitions = Partitions::try_from_memory(Rc::clone(&toy_memory))
        .expect("Failed to get partitions when one partition is populated");
    assert_eq!(
        partitions.get(Partitions::METADATA_MEMORY_ID).size(),
        1,
        "Metadata partition should still be 1."
    );
    assert_eq!(
        partitions.get(Partitions::HEAP_MEMORY_ID).size(),
        0,
        "Heap partition should still be empty."
    );
    should_contain(&partitions, Partitions::METADATA_MEMORY_ID, &toy_metadata_fill);

    // Populate another partition via partitions.  The memory manager should reflect the change.
    let toy_heap_fill = b"bar".repeat(1000);
    memory_manager.get(Partitions::HEAP_MEMORY_ID).grow(2);
    let partitions = Partitions::try_from_memory(Rc::clone(&toy_memory))
        .expect("Failed to get partitions when one partition is populated");
    assert_eq!(
        memory_manager.get(Partitions::METADATA_MEMORY_ID).size(),
        1,
        "Metadata partition should still be 1."
    );
    assert_eq!(
        memory_manager.get(Partitions::HEAP_MEMORY_ID).size(),
        2,
        "Heap partition should have grown to 2."
    );
    partitions.get(Partitions::HEAP_MEMORY_ID).write(0, &toy_heap_fill[..]);
    assert_eq!(
        memory_manager.get(Partitions::METADATA_MEMORY_ID).size(),
        1,
        "Metadata partition should still be 1."
    );
    assert_eq!(
        memory_manager.get(Partitions::HEAP_MEMORY_ID).size(),
        2,
        "Heap partition should still be 2."
    );
    // Basic sanity check seems OK!
}

#[test]
fn should_be_able_to_convert_memory_to_partitions_and_back() {
    /// Memory hasher, used to check that the memory is the same before and after.
    fn hash_memory(memory: &DefaultMemoryImpl) -> [u8; 32] {
        let mut hasher = Sha256::new();
        let mut buf = [0u8; WASM_PAGE_SIZE_IN_BYTES];
        for page_num in 0..memory.size() {
            let byte_offset = page_num * u64::try_from(WASM_PAGE_SIZE_IN_BYTES).expect("Amazingly large pages");
            memory.read(byte_offset, &mut buf);
            hasher.write(&buf);
        }
        hasher.finish()
    }
    // Create some toy memory.
    let toy_memory = DefaultMemoryImpl::default();
    // Populate the memory and hash it.
    {
        toy_memory.grow(5);
        let memory_manager = MemoryManager::init(Partitions::copy_memory_reference(&toy_memory));
        memory_manager.get(Partitions::METADATA_MEMORY_ID).grow(1);
        memory_manager.get(Partitions::METADATA_MEMORY_ID).write(0, b"foo");
    }
    let memory_hash_before = hash_memory(&toy_memory);
    // Load the memory into partitions and back again.
    let partitions = Partitions::try_from_memory(Rc::clone(&toy_memory)).expect("Failed to get partitions");
    let toy_memory_after = partitions.to_memory();
    let memory_hash_after = hash_memory(&toy_memory_after);
    assert_eq!(
        memory_hash_before, memory_hash_after,
        "Memory should be unchanged after converting to partitions and back."
    );
}
