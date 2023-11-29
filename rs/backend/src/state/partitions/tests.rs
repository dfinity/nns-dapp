//! Tests for stable memory layout code.
use ic_cdk::api::stable::WASM_PAGE_SIZE_IN_BYTES;

use super::*;
use crate::state::{tests::setup_test_state, StableState};

#[test]
fn is_managed_should_recognize_memory_manager() {
    let toy_memory = DefaultMemoryImpl::default();
    assert_eq!(
        Partitions::is_managed(&toy_memory),
        false,
        "Empty (zero pages) of memory should not be recognized as a memory manager."
    );
    toy_memory.grow(5);
    assert_eq!(
        Partitions::is_managed(&toy_memory),
        false,
        "Blank, unpopulated memory should not be recognized as managed."
    );
    let old_style_memory = setup_test_state().encode();
    toy_memory.write(0, &old_style_memory);
    assert_eq!(Partitions::is_managed(&toy_memory), false, "Random fill or old style memory should not be recognized as managed.  There _should_ be only a 2**24 bit chance of a false positive.");
    MemoryManager::init(toy_memory.clone()); // Note: The clone() clones the Rc, not the memory.
    assert!(
        Partitions::is_managed(&toy_memory),
        "Memory manager should be recognized as managed."
    );
}

#[test]
fn should_be_able_to_get_partitions_from_managed_memory() {
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
    assert!(
        Partitions::try_from_memory(toy_memory.clone()).is_err(),
        "Zero bytes of memory should not yeild a partition table."
    );
    assert!(toy_memory.size() == 0, "Zero bytes of memory should have zero pages.");
    toy_memory.grow(5);
    assert!(
        Partitions::try_from_memory(toy_memory.clone()).is_err(),
        "Blank memory should not yield a partition table."
    );
    // Create a memory manager.
    let memory_manager = MemoryManager::init(toy_memory.clone()); // Note: The clone() clones the Rc, not the memory.
    let partitions = Partitions::try_from_memory(toy_memory.clone());
    assert!(
        partitions.is_ok(),
        "Managed memory should yield a partition table, even if it is empty."
    );
    // Check that the partitions are at least basically functional and refer to the same memory that was provided:
    // The partitions should be empty:
    let partitions = partitions.unwrap();
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
    // Populate a partition with some data.
    let toy_metadata_fill = [9u8;WASM_PAGE_SIZE_IN_BYTES as usize];
    let metadata_memory = memory_manager.borrow().get(Partitions::METADATA_MEMORY_ID);
    //metadata_memory.grow(1);
    partitions.get(Partitions::METADATA_MEMORY_ID).grow(1);
    assert_eq!(
        Partitions::try_from_memory(toy_memory).expect("Failed to get partitions").get(Partitions::METADATA_MEMORY_ID).size(),
        1,
        "Metadata partition should have grown to 1."
    );

    assert_eq!(
        partitions.get(Partitions::HEAP_MEMORY_ID).size(),
        0,
        "Heap partition should still be empty."
    );
    partitions.get(Partitions::METADATA_MEMORY_ID).write(0, &toy_metadata_fill);

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
/*
    
    // Populate another partition.
    let toy_heap_fill = b"bar".repeat(1000);
    let heap_memory = memory_manager.borrow().get(Partitions::HEAP_MEMORY_ID);
    heap_memory.grow(2);
    assert_eq!(
        partitions.get(Partitions::METADATA_MEMORY_ID).size(),
        1,
        "Metadata partition should still be 1."
    );
    assert_eq!(
        partitions.get(Partitions::HEAP_MEMORY_ID).size(),
        0,
        "Heap partition should have grown to 2."
    );
    heap_memory.write(0, &toy_heap_fill[..]);
    assert_eq!(
        partitions.get(Partitions::METADATA_MEMORY_ID).size(),
        1,
        "Metadata partition should still be 1."
    );
    assert_eq!(
        partitions.get(Partitions::HEAP_MEMORY_ID).size(),
        0,
        "Heap partition should still be 2."
    );
    */
    // Basic sanity check seems OK!
}
