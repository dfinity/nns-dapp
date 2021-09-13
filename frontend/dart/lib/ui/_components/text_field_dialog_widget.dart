import '../../nns_dapp.dart';
import 'debounced_validated_form_field.dart';
import 'form_utils.dart';
import 'responsive.dart';
import 'valid_fields_submit_button.dart';

class TextFieldDialogWidget extends StatefulWidget {
  final Function(String walletName) onComplete;
  final String fieldName;
  final String title;
  final String buttonTitle;

  TextFieldDialogWidget(
      {Key? key,
      required this.title,
      required this.fieldName,
      required this.buttonTitle,
      required this.onComplete})
      : super(key: key);

  @override
  _TextFieldDialogWidgetState createState() => _TextFieldDialogWidgetState();
}

class _TextFieldDialogWidgetState extends State<TextFieldDialogWidget> {
  late ValidatedTextField nameField;

  @override
  void initState() {
    super.initState();
    nameField = ValidatedTextField(widget.fieldName,
        validations: [StringFieldValidation.minimumLength(2)]);
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
            Expanded(
              child: Align(
                alignment: Alignment(0, -0.5),
                child: FractionallySizedBox(
                  widthFactor: 1,
                  child: Card(
                    child: Padding(
                      padding: const EdgeInsets.all(6.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.center,
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(widget.title,
                              style: Responsive.isMobile(context)
                                  ? context.textTheme.headline4
                                  : context.textTheme.headline3),
                          DebouncedValidatedFormField(nameField),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ),
            SizedBox(
              height: 60.0,
              width: double.infinity,
              child: ValidFieldsSubmitButton(
                child: Text(widget.buttonTitle),
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
