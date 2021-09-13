import 'package:nns_dapp/ui/_components/form_utils.dart';
import 'package:nns_dapp/ui/_components/valid_fields_submit_button.dart';

import '../../../nns_dapp.dart';

class NewProposalDialog extends StatefulWidget {
  final Neuron neuron;

  NewProposalDialog({Key? key, required this.neuron}) : super(key: key);

  @override
  _NewProposalDialogState createState() => _NewProposalDialogState();
}

class _NewProposalDialogState extends State<NewProposalDialog> {
  final textField = ValidatedTextField("Text",
      validations: [StringFieldValidation.minimumLength(2)]);
  final urlField = ValidatedTextField("URL",
      validations: [StringFieldValidation.minimumLength(2)]);
  // final summaryField = ValidatedTextField("Summary",validations: [StringFieldValidation.minimumLength(2)]);

  List<ValidatedTextField> get fields => [textField, urlField];

  @override
  void initState() {
    super.initState();

    urlField.initialText = "www.demoicproposal.com";
    textField.initialText = "A modest proposal ${rand.nextInt(1000)}";
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(8.0),
      child: IntrinsicHeight(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            children: [
              Text(
                "Create a Motion Proposal",
                style: context.textTheme.headline3,
              ),
              SmallFormDivider(),
              ...fields.flatMap((e) => [
                    DebouncedValidatedFormField(e),
                    SmallFormDivider(),
                  ]),
              SizedBox(
                height: 60.0,
                width: double.infinity,
                child: ValidFieldsSubmitButton(
                  child: Text("Create"),
                  onPressed: () async {},
                  fields: fields,
                ),
              )
            ],
          ),
        ),
      ),
    );
  }
}
