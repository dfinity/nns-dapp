import '../../dfinity.dart';

final RoundedBorderDecoration = BoxDecoration(
    border: Border.all(color: AppColors.gray600, width: 2),
    borderRadius: BorderRadius.circular(10)
);

// class RoundedBorderDecoration extends ShapeDecoration {
//   RoundedBorderDecoration() : super(shape: RoundedRectangleBorder(
//       borderRadius: BorderRadius.circular(8),
//       side:
//       BorderSide(width: 2, color: Color(0xffFBB03B))));
//
// }