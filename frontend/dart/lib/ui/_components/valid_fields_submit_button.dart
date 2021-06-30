import '../../dfinity.dart';
import 'form_utils.dart';

class ValidFieldsSubmitButton extends StatefulWidget {
  final VoidCallback? onPressed;
  final List<ValidatedTextField> fields;
  final Widget child;

  const ValidFieldsSubmitButton({
    Key? key,
    required this.fields,
    required this.onPressed,
    required this.child,
  }) : super(key: key);

  @override
  ValidFieldsSubmitButtonState createState() => ValidFieldsSubmitButtonState();
}

class ValidFieldsSubmitButtonState extends State<ValidFieldsSubmitButton> {
  @override
  void initState() {
    super.initState();
    widget.fields.forEach((element) {
      element.textEditingController.addListener(() {
        setState(() {});
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    final allValid = widget.fields.allAreValid;
    return ElevatedButton(
      child: widget.child,
      onPressed: allValid ? widget.onPressed : null,
    );
  }

  @override
  void dispose() {
    super.dispose();
    widget.fields.forEach((element) {
      element.textEditingController.dispose();
    });
  }
}
