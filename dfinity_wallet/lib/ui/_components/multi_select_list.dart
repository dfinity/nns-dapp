import '../../dfinity.dart';

class MultiSelectField<T> {
  final String title;
  final List<T> options;
  final String Function(T? value) titleForOption;
  List<T> selectedOptions;

  MultiSelectField(
      this.title, this.options, this.selectedOptions, this.titleForOption);
}

class MultiSelectDropdownWidget<T> extends StatefulWidget {
  final MultiSelectField<T> field;
  final Function()? onChange;
  final Function()? onDismiss;

  const MultiSelectDropdownWidget(this.field,
      {Key? key, this.onChange, this.onDismiss})
      : super(key: key);

  @override
  _MultiSelectDropdownWidgetState createState() =>
      _MultiSelectDropdownWidgetState<T>();
}

class _MultiSelectDropdownWidgetState<T>
    extends State<MultiSelectDropdownWidget<T>> {
  final FocusNode _focusNode = FocusNode();
  @override
  void initState() {
    super.initState();
    _focusNode.addListener(() {
      if (_focusNode.hasFocus) {
        showPopup();
      } else {
        OverlayBaseWidget.of(context)?.dismiss();
      }
    });
  }

  void showPopup() {
    OverlayBaseWidget.show(context, SizedBox(
      width: 420,
      child: MultiSelectList(
          field: widget.field,
          onChange: () {
            widget.onChange?.call();
            setState(() {});
          },
          onDismissPressed: (context) {
            OverlayBaseWidget.of(context)!.dismiss();
            widget.onDismiss?.call();
          }),
    ), borderRadius: 20);
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Padding(
                padding:
                    const EdgeInsets.only(left: 16.0, top: 8.0, bottom: 8.0),
                child: Text(
                  widget.field.title,
                  style: context.textTheme.headline4
                      ?.copyWith(color: AppColors.white),
                )),
          ],
        ),
        Expanded(
          child: ConstrainedBox(
            constraints: BoxConstraints(minHeight: 60),
            child: OutlinedButton(
              style: ButtonStyle(
                  backgroundColor: MaterialStateProperty.all(AppColors.gray600),
                  foregroundColor: MaterialStateProperty.all(AppColors.gray400),
                  overlayColor: MaterialStateProperty.all(
                      AppColors.gray400),
                  textStyle: MaterialStateProperty.all(
                      TextStyle(fontSize: 16, fontFamily: Fonts.circularBook)),
                  side: MaterialStateProperty.all(
                      BorderSide(color: AppColors.gray600, width: 0))),
              child: Row(
                children: [
                  Expanded(
                      child: Padding(
                    padding: const EdgeInsets.all(8.0),
                    child: Wrap(
                      // scrollDirection: Axis.horizontal,
                      children: widget.field.selectedOptions
                          .mapToList((e) => Container(
                                margin: EdgeInsets.only(
                                    left: 8.0, top: 4.0, bottom: 4.0),
                                padding: EdgeInsets.all(8.0),
                                decoration: ShapeDecoration(
                                    color: AppColors.gray800,
                                    shape: StadiumBorder()),
                                child: Text(
                                  widget.field.titleForOption(e),
                                  style: TextStyle(
                                      fontFamily: Fonts.circularMedium,
                                      fontSize: 14,
                                      color: AppColors.gray50),
                                ),
                              )),
                    ),
                  )),
                  Center(
                      child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: SvgPicture.asset(
                      "assets/down_grey.svg",
                      width: 18,
                      height: 18,
                    ),
                  ))
                ],
              ),
              onPressed: () {
                showPopup();
              },
            ),
          ),
        ),
      ],
    );
  }

}

class MultiSelectList<T> extends StatefulWidget {
  final MultiSelectField<T> field;
  final Function onChange;
  final Function(BuildContext context)? onDismissPressed;

  const MultiSelectList(
      {Key? key,
      required this.field,
      required this.onChange,
      this.onDismissPressed})
      : super(key: key);

  @override
  _MultiSelectListState createState() => _MultiSelectListState();
}

class _MultiSelectListState<T> extends State<MultiSelectList<T>> {
  late List<T> selected;

  @override
  void initState() {
    super.initState();
    selected = widget.field.selectedOptions;
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
          color: AppColors.white,
          boxShadow: [
            BoxShadow(
              blurRadius: 8,
              color: Color.fromRGBO(69, 71, 82, 0.08),
            )
          ],
          borderRadius: BorderRadius.circular(24)),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        mainAxisAlignment: MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Container(
            height: 64,
            decoration: BoxDecoration(
                color: AppColors.gray100,
                borderRadius: BorderRadius.only(
                    topLeft: Radius.circular(24),
                    topRight: Radius.circular(24))),
            child: Padding(
              padding: const EdgeInsets.all(8.0),
              child: Row(
                children: [
                  Container(
                    width: 24,
                  ),
                  Center(
                      child: Text(widget.field.title,
                          style: TextStyle(
                              fontFamily: Fonts.circularBook,
                              fontSize: 24,
                              color: AppColors.gray800))),
                  Expanded(child: Container()),
                  if (widget.onDismissPressed != null)
                    AspectRatio(
                        aspectRatio: 1,
                        child: TextButton(
                          onPressed: () {
                            widget.onDismissPressed?.call(context);
                          },
                          child: Center(
                            child: Text(
                              "✕",
                              style: TextStyle(
                                  fontFamily: Fonts.circularBook,
                                  fontSize: 24,
                                  color: AppColors.gray800),
                            ),
                          ),
                        )),
                ],
              ),
            ),
          ),
          ...widget.field.options
              .mapIndexed((index, value) => SizedBox(
                    height: 60,
                    child: TextButton(
                      style: ButtonStyle(
                          textStyle: MaterialStateProperty.all(TextStyle(
                              color: Color(0xff666A7A),
                              fontFamily: Fonts.circularBook)),
                          overlayColor: MaterialStateProperty.all(
                              AppColors.gray800.withOpacity(0.1)),
                          shape:
                              MaterialStateProperty.all(shapeForIndex(index))),
                      onPressed: () {
                        setState(() {
                          if (selected.contains(value)) {
                            selected.remove(value);
                          } else {
                            selected.insert(0, value);
                          }
                          widget.onChange();
                        });
                      },
                      child: Row(
                        mainAxisSize: MainAxisSize.max,
                        children: [
                          SizedBox(
                            width: 24,
                          ),
                          Text(
                            titleForOption(value),
                            style: TextStyle(
                                color: Color(0xff666A7A),
                                fontSize: 16,
                                fontFamily: Fonts.circularBook),
                          ),
                          Expanded(child: Container()),
                          Container(
                            padding: EdgeInsets.all(8),
                            decoration: ShapeDecoration(
                              color: fillColorForOption(value),
                              shape: CircleBorder(
                                  side: BorderSide(
                                      color: colorForOption(value), width: 2)),
                            ),
                          ),
                          SizedBox(
                            width: 24,
                          )
                        ],
                      ),
                    ),
                  ))
              .toList(),
          Padding(
            padding: const EdgeInsets.all(8.0),
            child: Align(
              alignment: Alignment.bottomRight,
              child: ElevatedButton(
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Text("Close"),
                ),
                onPressed: () {
                  widget.onDismissPressed?.call(context);
                },
              ),
            ),
          )
        ],
      ),
    );
  }

  Color colorForOption(T option) {
    return selected.contains(option) ? AppColors.blue200 : AppColors.gray600;
  }

  Color fillColorForOption(T option) {
    return selected.contains(option) ? AppColors.blue600 : AppColors.white;
  }

  String titleForOption(T option) {
    return widget.field.titleForOption(option);
  }

  OutlinedBorder shapeForIndex(int index) {
    final radius = Radius.circular(24);

    if (widget.field.options.length == 1) {
      return RoundedRectangleBorder(
          borderRadius:
              BorderRadius.only(bottomLeft: radius, bottomRight: radius));
    }

    if (index == (widget.field.options.length - 1)) {
      return RoundedRectangleBorder(
          borderRadius:
              BorderRadius.only(bottomLeft: radius, bottomRight: radius));
    }
    return RoundedRectangleBorder(borderRadius: BorderRadius.zero);
  }
}
