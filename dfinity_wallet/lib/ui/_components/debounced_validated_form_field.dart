import 'dart:async';
import 'dart:ui';

import '../../dfinity.dart';
import 'form_utils.dart';

class Debouncer {
  final int milliseconds;
  Timer?_timer;

  Debouncer({required this.milliseconds});

  run(VoidCallback action) {
    if (_timer != null) {
      _timer!.cancel();
    }

    _timer = Timer(Duration(milliseconds: milliseconds), action);
  }
}

class DebouncedValidatedFormField extends StatefulWidget {
  final ValidatedField textField;
  final bool obscureText;

  const DebouncedValidatedFormField(this.textField, {Key? key, this.obscureText = false}) : super(key: key);

  @override
  _DebouncedValidatedFormFieldState createState() => _DebouncedValidatedFormFieldState();
}

class _DebouncedValidatedFormFieldState extends State<DebouncedValidatedFormField> {
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
      child: TextFormField(
          key: widget.textField.key,
          focusNode: widget.textField.focusNode,
          controller: widget.textField.textEditingController,
          inputFormatters: widget.textField.inputFormatters,
          decoration: InputDecoration(
              labelText: widget.textField.name,
              contentPadding: EdgeInsets.only(left: 20, top: 25, bottom: 25),
              border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(100), borderSide: BorderSide(width: 1, color: AppColors.gray800)),
              focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(100),
                  borderSide: BorderSide(width: 1, color: AppColors.blue600))),
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
          },
          validator: (text) =>
              widget.textField.failedValidation?.errorMessage?.let((e) => "${widget.textField.name} $e"),
          autovalidateMode: autovalidateMode,
          obscureText: widget.obscureText),
    );
  }
}
