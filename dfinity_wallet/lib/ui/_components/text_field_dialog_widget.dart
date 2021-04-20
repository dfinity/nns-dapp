import 'package:dfinity_wallet/ui/_components/valid_fields_submit_button.dart';

import '../../dfinity.dart';
import 'debounced_validated_form_field.dart';
import 'form_utils.dart';

class TextFieldDialogWidget extends StatefulWidget {
  final Function(String walletName) onComplete;
  final String fieldName;
  final String title;
  final String buttonTitle;

  TextFieldDialogWidget(
      {Key? key, required this.title, required this.fieldName, required this.buttonTitle, required this.onComplete})
      : super(key: key);

  @override
  _TextFieldDialogWidgetState createState() => _TextFieldDialogWidgetState();
}

class _TextFieldDialogWidgetState extends State<TextFieldDialogWidget> {
  late ValidatedTextField nameField;

  @override
  void initState() {
    super.initState();
    nameField = ValidatedTextField(widget.fieldName, validations: [StringFieldValidation.minimumLength(2)]);
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(24.0),
      child: ConstrainedBox(
        constraints: BoxConstraints(maxWidth: 500),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              widget.title,
              style: context.textTheme.headline3,
            ),
            SmallFormDivider(),
            DebouncedValidatedFormField(nameField),
            SmallFormDivider(),
            SizedBox(
              height: 60.0,
              width: double.infinity,
              child: ValidFieldsSubmitButton(
                child: Text("Create"),
                onPressed: () {
                  widget.onComplete(nameField.currentValue);
                  OverlayBaseWidget.of(context)?.dismiss();
                },
                fields: [nameField],
              ),
            )
          ],
        ),
      ),
    );
  }
}
