import 'dart:async';
import 'dart:ui';

import 'package:dfinity_wallet/ui/_components/responsive.dart';

import '../../dfinity.dart';
import 'form_utils.dart';

class Debouncer {
  final int milliseconds;
  Timer? _timer;

  Debouncer({required this.milliseconds});

  run(VoidCallback action) {
    if (_timer != null) {
      _timer!.cancel();
    }

    _timer = Timer(Duration(milliseconds: milliseconds), action);
  }
}

class DebouncedValidatedFormField extends StatefulWidget {
  final ValidatedTextField textField;
  final Function? onChanged;
  final bool obscureText;
  final Widget? suffix;

  const DebouncedValidatedFormField(this.textField,
      {Key? key, this.obscureText = false, this.suffix, this.onChanged})
      : super(key: key);

  @override
  _DebouncedValidatedFormFieldState createState() =>
      _DebouncedValidatedFormFieldState();
}

class _DebouncedValidatedFormFieldState
    extends State<DebouncedValidatedFormField> {
  AutovalidateMode autovalidateMode = AutovalidateMode.disabled;
  final debouncer = Debouncer(milliseconds: 2000);

  @override
  void initState() {
    super.initState();
    widget.textField.focusNode.addListener(() {
      setState(() {});
    });
  }

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: TextFormField(
          key: widget.textField.key,
          focusNode: widget.textField.focusNode,
          controller: widget.textField.textEditingController,
          inputFormatters: widget.textField.inputFormatters,
          style: Responsive.isDesktop(context) | Responsive.isTablet(context)
              ? context.textTheme.subtitle1
              : context.textTheme.subtitle2,
          decoration: InputDecoration(
              labelText: widget.textField.name,
              labelStyle:
                  Responsive.isDesktop(context) | Responsive.isTablet(context)
                      ? context.textTheme.subtitle1
                      : context.textTheme.subtitle2,
              contentPadding: EdgeInsets.only(left: 20, top: 25, bottom: 25),
              border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(100),
                  borderSide: BorderSide(width: 1, color: AppColors.white)),
              focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(100),
                  borderSide: BorderSide(width: 1, color: AppColors.white)),
              suffix: widget.suffix),
          onChanged: (e) {
            if (autovalidateMode != AutovalidateMode.always) {
              debouncer.run(() {
                if (context.findRenderObject()?.attached == true) {
                  setState(() {
                    autovalidateMode = AutovalidateMode.always;
                  });
                }
              });
            }
            widget.onChanged?.call();
          },
          validator: (text) =>
              widget.textField.failedValidation?.errorMessage?.let((e) => e),
          autovalidateMode: autovalidateMode,
          obscureText: widget.obscureText,
        ),
      ),
    );
  }
}
