//
// import '../../dfinity.dart';
//
// class MultiSelectField<T> {
//   final String title;
//   final List<T> options;
//   final String Function(T value) titleForOption;
//   T? selectedOption;
//
//   MultiSelectField(this.title, this.options, this.selectedOption, this.titleForOption);
// }
//
// class MultiSelectDropdownWidget<T> extends StatefulWidget {
//   final MultiSelectField<T> field;
//
//   const MultiSelectDropdownWidget(this.field, {Key? key}) : super(key: key);
//
//   @override
//   _MultiSelectDropdownWidgetState createState() => _MultiSelectDropdownWidgetState<T>();
// }
//
// class _MultiSelectDropdownWidgetState<T> extends State<MultiSelectDropdownWidget<T>> {
//   final FocusNode _focusNode = FocusNode();
//   OverlayEntry? _overlayEntry;
//
//   @override
//   void initState() {
//     super.initState();
//     _focusNode.addListener(() {
//       if (_focusNode.hasFocus) {
//         this._overlayEntry = this._createOverlayEntry();
//         Overlay.of(context)?.insert(this._overlayEntry!);
//       } else {
//         this._overlayEntry?.remove();
//       }
//     });
//   }
//
//   @override
//   Widget build(BuildContext context) {
//     return ConstrainedBox(
//       constraints: BoxConstraints(minHeight: 60),
//       child: OutlinedButton(
//         style: ButtonStyle(
//             foregroundColor: MaterialStateProperty.all(AppColors.gray800),
//             overlayColor: MaterialStateProperty.all(AppColors.gray800.withOpacity(0.1)),
//             textStyle: MaterialStateProperty.all(TextStyle(fontSize: 16, fontFamily: Fonts.circularBook)),
//             side: MaterialStateProperty.all(BorderSide(color: AppColors.gray600, width: 1))),
//         child: Row(
//           children: [
//             if (widget.field.selectedOption == null)
//               Center(
//                   child: Padding(
//                     padding: const EdgeInsets.only(left: 16.0),
//                     child: Text(
//                       widget.field.title,
//                     ),
//                   )),
//             // Expanded(
//             //     child: Container(
//             //       child: Wrap(
//             //         children: widget.field.selectedOptions.mapToList((e) => Container(
//             //           margin: EdgeInsets.only(left: 8.0, top: 8.0, bottom: 8.0),
//             //           padding: EdgeInsets.all(8.0),
//             //           decoration: ShapeDecoration(color: AppColors.gray400, shape: StadiumBorder()),
//             //           child: Text(
//             //             widget.field.titleForOption(e),
//             //             style:
//             //             TextStyle(fontFamily: Fonts.circularMedium, fontSize: 14, color: AppColors.blue600),
//             //           ),
//             //         )),
//             //       ),
//             //     )),
//             Center(
//                 child: Padding(
//                   padding: const EdgeInsets.all(16.0),
//                   child: SvgPicture.asset(
//                     "assets/icons/down_grey.svg",
//                     width: 18,
//                     height: 18,
//                   ),
//                 ))
//           ],
//         ),
//         onPressed: () {
//           _overlayEntry = _createOverlayEntry();
//           Overlay.of(context)?.insert(_overlayEntry!);
//         },
//       ),
//     );
//   }
//
//   OverlayEntry _createOverlayEntry() {
//     RenderBox renderBox = context.findRenderObject() as RenderBox;
//     var size = renderBox.size;
//     var offset = renderBox.localToGlobal(Offset.zero);
//     final frame = Rect.fromLTWH(offset.dx, offset.dy, size.width, size.height);
//
//     return OverlayEntry(builder: (context) {
//       return Scaffold(
//         backgroundColor: AppColors.transparent,
//         body: Stack(
//           children: [
//             Container(
//               color: AppColors.gray800.withOpacity(0.6),
//               child: GestureDetector(onTap: () {
//                 this._overlayEntry?.remove();
//               }),
//             ),
//             Center(
//               child: SizedBox(
//                 width: 420,
//                 child: MultiSelectList(
//                   field: widget.field,
//                   onChange: () {
//                     setState(() {});
//                   },
//                 ),
//               ),
//             ),
//           ],
//         ),
//       );
//     });
//   }
// }
//
// class MultiSelectList<T> extends StatefulWidget {
//   final MultiSelectField<T> field;
//   final Function onChange;
//
//   const MultiSelectList({Key? key, required this.field, required this.onChange}) : super(key: key);
//
//   @override
//   _MultiSelectListState createState() => _MultiSelectListState();
// }
//
// class _MultiSelectListState<T> extends State<MultiSelectList<T>> {
//   T selected;
//
//   @override
//   void initState() {
//     super.initState();
//     selected = widget.field.selectedOptions;
//   }
//
//   @override
//   Widget build(BuildContext context) {
//     return Container(
//       decoration: BoxDecoration(
//           color: AppColors.white,
//           boxShadow: [
//             BoxShadow(
//               blurRadius: 8,
//               color: Color.fromRGBO(69, 71, 82, 0.08),
//             )
//           ],
//           borderRadius: BorderRadius.circular(24)),
//       child: Column(
//         mainAxisSize: MainAxisSize.min,
//         mainAxisAlignment: MainAxisAlignment.start,
//         crossAxisAlignment: CrossAxisAlignment.stretch,
//         children: [
//           Container(
//             height: 48,
//             decoration: BoxDecoration(
//                 color: AppColors.gray400,
//                 borderRadius: BorderRadius.only(topLeft: Radius.circular(24), topRight: Radius.circular(24))),
//             child: Row(
//               children: [
//                 Container(
//                   width: 24,
//                 ),
//                 Center(
//                     child: Text(widget.field.title,
//                         style: TextStyle(fontFamily: Fonts.quicksandBold, fontSize: 16, color: AppColors.gray800))),
//                 Expanded(child: Container()),
//               ],
//             ),
//           ),
//           ...widget.field.options
//               .mapIndexed((index, value) => SizedBox(
//             height: 60,
//             child: TextButton(
//               style: ButtonStyle(
//                   textStyle: MaterialStateProperty.all(
//                       TextStyle(color: Color(0xff666A7A), fontFamily: Fonts.opensansRegular)),
//                   overlayColor: MaterialStateProperty.all(AppColors.gray800.withOpacity(0.1)),
//                   shape: MaterialStateProperty.all(shapeForIndex(index))),
//               onPressed: () {
//                 setState(() {
//                   if (selected.contains(value)) {
//                     selected.remove(value);
//                   } else {
//                     selected.add(value);
//                   }
//                   widget.onChange();
//                 });
//               },
//               child: Row(
//                 mainAxisSize: MainAxisSize.max,
//                 children: [
//                   SizedBox(
//                     width: 24,
//                   ),
//                   Text(
//                     titleForOption(value),
//                     style: TextStyle(color: Color(0xff666A7A), fontSize: 16, fontFamily: Fonts.opensansRegular),
//                   ),
//                   Expanded(child: Container()),
//                   Container(
//                     padding: EdgeInsets.all(8),
//                     decoration: ShapeDecoration(
//                       color: fillColorForOption(value),
//                       shape: CircleBorder(side: BorderSide(color: colorForOption(value), width: 2)),
//                     ),
//                   ),
//                   SizedBox(
//                     width: 24,
//                   )
//                 ],
//               ),
//             ),
//           ))
//               .toList(),
//         ],
//       ),
//     );
//   }
//
//   Color colorForOption(T option) {
//     return selected.contains(option) ? AppColors.blue200 : AppColors.gray600;
//   }
//
//   Color fillColorForOption(T option) {
//     return selected.contains(option) ? AppColors.primaryBlue : AppColors.white;
//   }
//
//   String titleForOption(T option) {
//     return widget.field.titleForOption(option);
//   }
//
//   OutlinedBorder shapeForIndex(int index) {
//     final radius = Radius.circular(24);
//
//     if (widget.field.options.length == 1) {
//       return RoundedRectangleBorder(borderRadius: BorderRadius.only(bottomLeft: radius, bottomRight: radius));
//     }
//
//     if (index == (widget.field.options.length - 1)) {
//       return RoundedRectangleBorder(borderRadius: BorderRadius.only(bottomLeft: radius, bottomRight: radius));
//     }
//     return RoundedRectangleBorder(borderRadius: BorderRadius.zero);
//   }
// }
