//! Tests for stable memory layout code.
use super::*;
use crate::state::{tests::setup_test_state, StableState};
use ic_cdk::api::stable::WASM_PAGE_SIZE_IN_BYTES;
use ic_crypto_sha2::Sha256;
use pretty_assertions::assert_eq;
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
fn partitions_should_get_correct_virtual_memory() {
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
        partitions.get(PartitionType::Metadata.memory_id()).size(),
        0,
        "Metadata partition should be empty."
    );
    assert_eq!(
        partitions.get(PartitionType::Heap.memory_id()).size(),
        0,
        "Heap partition should be empty."
    );

    // Grow a partition in the memory manager.  The partitions should grow with it.
    let toy_metadata_fill = [9u8; WASM_PAGE_SIZE_IN_BYTES as usize];
    memory_manager.get(PartitionType::Metadata.memory_id()).grow(1);
    let partitions = Partitions::try_from_memory(Rc::clone(&toy_memory))
        .expect("Failed to get partitions when one partition has grown");
    assert_eq!(
        Partitions::try_from_memory(Rc::clone(&toy_memory))
            .expect("Failed to get partitions")
            .get(PartitionType::Metadata.memory_id())
            .size(),
        1,
        "Metadata partition should have grown to 1."
    );
    assert_eq!(
        partitions.get(PartitionType::Heap.memory_id()).size(),
        0,
        "Heap partition should still be empty."
    );

    // Populate a partition with the memory manager.  The partitions should be able to read the data back.
    memory_manager
        .get(PartitionType::Metadata.memory_id())
        .write(0, &toy_metadata_fill);
    let partitions = Partitions::try_from_memory(Rc::clone(&toy_memory))
        .expect("Failed to get partitions when one partition is populated");
    assert_eq!(
        partitions.get(PartitionType::Metadata.memory_id()).size(),
        1,
        "Metadata partition should still be 1."
    );
    assert_eq!(
        partitions.get(PartitionType::Heap.memory_id()).size(),
        0,
        "Heap partition should still be empty."
    );
    should_contain(&partitions, PartitionType::Metadata.memory_id(), &toy_metadata_fill);

    // Populate another partition via partitions.  The memory manager should reflect the change.
    let toy_heap_fill = b"bar".repeat(1000);
    memory_manager.get(PartitionType::Heap.memory_id()).grow(2);
    let partitions = Partitions::try_from_memory(Rc::clone(&toy_memory))
        .expect("Failed to get partitions when one partition is populated");
    assert_eq!(
        memory_manager.get(PartitionType::Metadata.memory_id()).size(),
        1,
        "Metadata partition should still be 1."
    );
    assert_eq!(
        memory_manager.get(PartitionType::Heap.memory_id()).size(),
        2,
        "Heap partition should have grown to 2."
    );
    partitions
        .get(PartitionType::Heap.memory_id())
        .write(0, &toy_heap_fill[..]);
    assert_eq!(
        memory_manager.get(PartitionType::Metadata.memory_id()).size(),
        1,
        "Metadata partition should still be 1."
    );
    assert_eq!(
        memory_manager.get(PartitionType::Heap.memory_id()).size(),
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
        let mut buf = [0u8; WASM_PAGE_SIZE_IN_BYTES as usize];
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
        memory_manager.get(PartitionType::Accounts.memory_id()).grow(1);
        memory_manager.get(PartitionType::Accounts.memory_id()).write(0, b"foo");
    }
    let memory_hash_before = hash_memory(&toy_memory);
    // Load the memory into partitions and back again.
    let partitions = Partitions::try_from_memory(Rc::clone(&toy_memory)).expect("Failed to get partitions");
    let toy_memory_after = partitions.into_memory();
    let memory_hash_after = hash_memory(&toy_memory_after);
    assert_eq!(
        memory_hash_before, memory_hash_after,
        "Memory should be unchanged after converting to partitions and back."
    );
}

#[derive(Debug, Clone)]
struct GrowingWriteTestVector {
    initial_memory_pages: u64,
    write_offset: u64,
    buffer: Vec<u8>,
    expected_final_memory_pages: u64,
}

fn growing_write_test_vectors() -> Vec<GrowingWriteTestVector> {
    vec![
        GrowingWriteTestVector {
            initial_memory_pages: 0,
            write_offset: 0,
            buffer: vec![],
            expected_final_memory_pages: 0,
        },
        GrowingWriteTestVector {
            initial_memory_pages: 0,
            write_offset: 1,
            buffer: vec![],
            expected_final_memory_pages: 1,
        },
        GrowingWriteTestVector {
            initial_memory_pages: 0,
            write_offset: WASM_PAGE_SIZE_IN_BYTES,
            buffer: vec![],
            expected_final_memory_pages: 1,
        },
        GrowingWriteTestVector {
            initial_memory_pages: 0,
            write_offset: (WASM_PAGE_SIZE_IN_BYTES) + 1,
            buffer: vec![],
            expected_final_memory_pages: 2,
        },
        GrowingWriteTestVector {
            initial_memory_pages: 0,
            write_offset: 0,
            buffer: vec![1, 2, 3, 4],
            expected_final_memory_pages: 1,
        },
        GrowingWriteTestVector {
            initial_memory_pages: 0,
            write_offset: 1,
            buffer: vec![1, 2, 3, 4],
            expected_final_memory_pages: 1,
        },
        GrowingWriteTestVector {
            initial_memory_pages: 0,
            write_offset: WASM_PAGE_SIZE_IN_BYTES - 4,
            buffer: vec![1, 2, 3, 4],
            expected_final_memory_pages: 1,
        },
        GrowingWriteTestVector {
            initial_memory_pages: 0,
            write_offset: (WASM_PAGE_SIZE_IN_BYTES) - 3,
            buffer: vec![1, 2, 3, 4],
            expected_final_memory_pages: 2,
        },
        GrowingWriteTestVector {
            initial_memory_pages: 0,
            write_offset: (WASM_PAGE_SIZE_IN_BYTES),
            buffer: vec![1, 2, 3, 4],
            expected_final_memory_pages: 2,
        },
    ]
}

fn growing_write_should_work(memory_id: MemoryId, test_vector: &GrowingWriteTestVector) {
    let GrowingWriteTestVector {
        initial_memory_pages,
        write_offset,
        buffer,
        expected_final_memory_pages,
    } = test_vector;
    let toy_memory = DefaultMemoryImpl::default();
    MemoryManager::init(Partitions::copy_memory_reference(&toy_memory));
    let partitions = Partitions::try_from_memory(Rc::clone(&toy_memory)).expect("Failed to get partitions");
    partitions.get(memory_id).grow(*initial_memory_pages);
    assert_eq!(
        partitions.get(memory_id).size(),
        *initial_memory_pages,
        "Test setup error: Initial memory size should be as expected for test vector: {:?} {:?}",
        memory_id,
        test_vector
    );
    partitions.growing_write(memory_id, *write_offset, buffer.as_slice());
    assert_eq!(
        partitions.get(memory_id).size(),
        *expected_final_memory_pages,
        "growing_write did not leave the final memory size as expected for test vector: {:?} {:?}",
        memory_id,
        test_vector
    );
    let mut read_buffer = vec![0u8; buffer.len()];
    partitions
        .read_exact(memory_id, *write_offset, &mut read_buffer)
        .expect("Failed to read back what we wrote.");
    assert_eq!(
        read_buffer, *buffer,
        "growing_write did not write the expected data for test vector: {:?} {:?}",
        memory_id, test_vector
    );
}

#[test]
fn growing_write_should_work_for_all() {
    for memory_id in [PartitionType::Metadata.memory_id(), PartitionType::Accounts.memory_id()] {
        for test_vector in growing_write_test_vectors() {
            growing_write_should_work(memory_id, &test_vector);
        }
    }
}

#[test]
fn debug_should_portray_partitions_accurately() {
    let partitions = Partitions::new(DefaultMemoryImpl::default());
    partitions.get(PartitionType::Metadata.memory_id()).grow(5); // Has one page already, storing the schema label.  Increase this to 6.
    partitions.get(PartitionType::Accounts.memory_id()).grow(2);
    assert_eq!(
        format!("{:?}", partitions),
        "Partitions {\n  schema_label: AccountsInStableMemory\n  Metadata partition: 6 pages\n  Heap partition: 0 pages\n  Accounts partition: 2 pages\n}\n"
    );
}
