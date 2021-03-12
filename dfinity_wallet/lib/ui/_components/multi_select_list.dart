
import '../../dfinity.dart';

class MultiSelectField<T> {
    final String title;
    final List<T> options;
    final String Function(T value) titleForOption;
    List<T> selectedOptions;

    MultiSelectField(this.title, this.options, this.selectedOptions, this.titleForOption);
}


class MultiSelectList<T> extends StatefulWidget {
    final MultiSelectField<T> field;
    final Function onChange;

    const MultiSelectList({Key? key, required this.field, required this.onChange}) : super(key: key);

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
                        height: 48,
                        decoration: BoxDecoration(
                                color: AppColors.gray400,
                                borderRadius: BorderRadius.only(topLeft: Radius.circular(24), topRight: Radius.circular(24))),
                        child: Row(
                            children: [
                                Container(
                                    width: 24,
                                ),
                                Center(
                                        child: Text(widget.field.title,
                                                style: TextStyle(fontFamily: Fonts.circularBook, fontSize: 16, color: AppColors.gray800))),
                                Expanded(child: Container()),
                            ],
                        ),
                    ),
                    ...widget.field.options
                            .mapIndexed((index, value) => SizedBox(
                        height: 60,
                        child: TextButton(
                            style: ButtonStyle(
                                    textStyle: MaterialStateProperty.all(
                                            TextStyle(color: Color(0xff666A7A), fontFamily: Fonts.circularBook)),
                                    overlayColor: MaterialStateProperty.all(AppColors.gray800.withOpacity(0.1)),
                                    shape: MaterialStateProperty.all(shapeForIndex(index))),
                            onPressed: () {
                                setState(() {
                                    if (selected.contains(value)) {
                                        selected.remove(value);
                                    } else {
                                        selected.add(value);
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
                                        style: TextStyle(color: Color(0xff666A7A), fontSize: 16, fontFamily: Fonts.circularBook),
                                    ),
                                    Expanded(child: Container()),
                                    Container(
                                        padding: EdgeInsets.all(8),
                                        decoration: ShapeDecoration(
                                            color: fillColorForOption(value),
                                            shape: CircleBorder(side: BorderSide(color: colorForOption(value), width: 2)),
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
            return RoundedRectangleBorder(borderRadius: BorderRadius.only(bottomLeft: radius, bottomRight: radius));
        }

        if (index == (widget.field.options.length - 1)) {
            return RoundedRectangleBorder(borderRadius: BorderRadius.only(bottomLeft: radius, bottomRight: radius));
        }
        return RoundedRectangleBorder(borderRadius: BorderRadius.zero);
    }
}
