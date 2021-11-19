// Taken from proposal 22690
export const addNodeToSubnetPayload = new Uint8Array([
  68, 73, 68, 76, 2, 108, 2, 189, 134, 157, 139, 4, 104, 187, 248, 253, 237, 15,
  1, 109, 104, 1, 0, 1, 29, 48, 88, 10, 26, 118, 67, 4, 149, 19, 248, 247, 214,
  255, 230, 245, 16, 0, 87, 3, 69, 166, 49, 96, 202, 183, 120, 76, 89, 2, 6, 1,
  29, 51, 220, 137, 254, 80, 65, 97, 181, 128, 157, 164, 206, 198, 201, 192,
  116, 92, 173, 184, 210, 144, 204, 206, 121, 81, 13, 196, 148, 2, 1, 29, 62,
  91, 49, 39, 31, 78, 249, 101, 42, 251, 98, 132, 35, 89, 47, 167, 85, 234, 194,
  190, 198, 85, 248, 43, 205, 227, 7, 240, 2, 1, 29, 189, 179, 150, 208, 32,
  136, 253, 97, 98, 29, 125, 252, 114, 252, 135, 108, 64, 228, 17, 155, 56, 110,
  6, 209, 10, 58, 143, 250, 2, 1, 29, 83, 14, 206, 84, 1, 52, 115, 72, 105, 57,
  196, 135, 45, 191, 46, 40, 223, 245, 4, 84, 85, 11, 224, 139, 79, 204, 167,
  152, 2, 1, 29, 215, 173, 15, 73, 221, 103, 119, 194, 136, 56, 137, 28, 92,
  142, 200, 175, 27, 120, 60, 151, 12, 7, 18, 70, 49, 245, 101, 10, 2, 1, 29,
  107, 187, 11, 92, 235, 63, 72, 68, 146, 137, 68, 173, 47, 217, 208, 29, 198,
  86, 163, 58, 31, 67, 15, 163, 102, 110, 232, 11, 2,
]);

// Taken from payload 22955
export const updateSubnetPayload = new Uint8Array([
  68, 73, 68, 76, 1, 108, 2, 189, 134, 157, 139, 4, 104, 201, 239, 142, 197, 9,
  113, 1, 0, 1, 29, 106, 143, 103, 216, 110, 204, 131, 7, 4, 128, 56, 173, 113,
  89, 148, 88, 193, 49, 181, 49, 220, 155, 176, 182, 145, 148, 13, 185, 2, 40,
  51, 101, 97, 102, 56, 53, 52, 49, 99, 51, 56, 57, 98, 97, 100, 98, 100, 54,
  99, 100, 53, 48, 102, 102, 102, 51, 49, 101, 49, 53, 56, 53, 48, 53, 102, 52,
  52, 56, 55, 100,
]);

export const updateSubnetConfigPayload = new Uint8Array([
  68, 73, 68, 76, 10, 108, 28, 157, 188, 214, 5, 1, 140, 222, 255, 11, 2, 205,
  168, 240, 102, 1, 253, 217, 221, 150, 1, 3, 135, 210, 149, 176, 1, 126, 134,
  159, 150, 194, 1, 1, 200, 139, 164, 208, 3, 2, 189, 134, 157, 139, 4, 104,
  236, 160, 183, 153, 4, 1, 200, 132, 169, 172, 4, 1, 191, 183, 152, 241, 4, 1,
  242, 143, 178, 248, 4, 1, 163, 193, 142, 141, 5, 5, 213, 182, 238, 222, 5, 5,
  159, 156, 146, 151, 8, 1, 253, 166, 177, 136, 9, 2, 190, 189, 191, 246, 10,
  2, 225, 162, 150, 151, 11, 1, 230, 186, 175, 172, 12, 2, 131, 242, 191, 191,
  12, 2, 145, 147, 167, 203, 12, 2, 202, 194, 213, 231, 12, 6, 175, 204, 186,
  245, 12, 1, 142, 144, 239, 245, 12, 2, 209, 248, 252, 181, 13, 1, 194, 183,
  251, 250, 13, 2, 156, 237, 135, 156, 14, 8, 138, 148, 209, 203, 14, 6, 110,
  120, 110, 121, 110, 4, 108, 2, 211, 170, 190, 246, 2, 126, 198, 255, 196,
  202, 15, 126, 110, 126, 110, 7, 109, 113, 110, 9, 107, 3, 208, 214, 250, 209,
  2, 127, 217, 154, 186, 234, 2, 127, 239, 173, 138, 151, 15, 127, 1, 0, 0, 0,
  0, 0, 0, 0, 0, 1, 29, 207, 242, 128, 227, 45, 127, 92, 205, 34, 70, 136, 47,
  148, 175, 178, 15, 84, 202, 97, 162, 23, 101, 231, 18, 212, 61, 39, 137, 2,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 102, 115, 115, 104, 45, 101,
  100, 50, 53, 53, 49, 57, 32, 65, 65, 65, 65, 67, 51, 78, 122, 97, 67, 49,
  108, 90, 68, 73, 49, 78, 84, 69, 53, 65, 65, 65, 65, 73, 69, 86, 99, 98, 89,
  121, 87, 57, 67, 65, 83, 97, 73, 97, 56, 119, 104, 48, 55, 68, 118, 109, 53,
  100, 67, 101, 104, 48, 80, 47, 89, 103, 82, 80, 57, 75, 119, 114, 51, 56,
  103, 66, 53, 32, 99, 111, 110, 115, 101, 110, 115, 117, 115, 64, 49, 48, 46,
  51, 49, 46, 48, 46, 49, 52, 49, 96, 115, 115, 104, 45, 101, 100, 50, 53, 53,
  49, 57, 32, 65, 65, 65, 65, 67, 51, 78, 122, 97, 67, 49, 108, 90, 68, 73, 49,
  78, 84, 69, 53, 65, 65, 65, 65, 73, 67, 115, 79, 50, 73, 69, 86, 57, 54, 116,
  79, 86, 102, 106, 111, 79, 106, 52, 53, 48, 84, 90, 114, 52, 77, 68, 56, 80,
  97, 117, 72, 113, 104, 99, 76, 89, 118, 114, 109, 82, 82, 117, 101, 32, 112,
  102, 111, 112, 115, 64, 115, 102, 49, 45, 115, 112, 109, 49, 50, 89, 115,
  115, 104, 45, 101, 100, 50, 53, 53, 49, 57, 32, 65, 65, 65, 65, 67, 51, 78,
  122, 97, 67, 49, 108, 90, 68, 73, 49, 78, 84, 69, 53, 65, 65, 65, 65, 73, 77,
  122, 55, 53, 84, 121, 106, 115, 108, 54, 103, 120, 79, 74, 122, 48, 122, 72,
  73, 118, 99, 81, 99, 77, 113, 117, 73, 109, 55, 68, 72, 66, 66, 54, 50, 82,
  101, 74, 98, 82, 107, 107, 57, 32, 111, 112, 64, 112, 121, 114, 48, 55, 0, 0,
  0, 0, 0, 0
]);
