import 'package:flutter/services.dart';

import '../../dfinity.dart';

extension AllValid<T> on List<ValidatedField<T>> {
  bool get allAreValid =>
      this.all((ValidatedField<T> element) => element.failedValidation == null);
}

abstract class ValidatedField<T> {
  String name;
  final List<FieldValidation<T>> validations;
  T get currentValue;
  ValidatedField(this.name, this.validations);

  FieldValidation? get failedValidation => validations.firstOrNullWhere(
      (FieldValidation<T> element) => element.inputIsValid(currentValue));
}

class ValidatedTextField extends ValidatedField<String> {
  final GlobalKey key = GlobalKey();
  final textEditingController = TextEditingController();
  final List<TextInputFormatter>? inputFormatters;
  final TextInputType inputType;

  set initialText(String initialText) {
    textEditingController.text = initialText;
  }

  final focusNode = FocusNode();

  ValidatedTextField(String name,
      {required List<FieldValidation<String>> validations,
      this.inputFormatters,
      this.inputType = TextInputType.text,
      String? defaultText})
      : super(name, validations) {
    if (defaultText != null) {
      textEditingController.text = defaultText;
    }
  }

  @override
  String get currentValue => textEditingController.text;
}

class IntField extends ValidatedField<int> {
  IntField(String name, List<FieldValidation<int>> validations)
      : super(name, validations);

  @override
  int currentValue = 0;
}

class FieldValidation<T> {
  final String errorMessage;
  final bool Function(T) inputIsValid;

  FieldValidation(this.errorMessage, this.inputIsValid);
}

class StringFieldValidation extends FieldValidation<String> {
  StringFieldValidation(String errorMessage, bool Function(String) inputIsValid)
      : super(errorMessage, inputIsValid);

  StringFieldValidation.minimumLength(int numCharacters)
      : this("Must be longer than $numCharacters characters",
            (e) => e.length < numCharacters);

  StringFieldValidation.maximumLength(int numCharacters)
      : this("Must be shorter than $numCharacters characters",
            (e) => e.length > numCharacters);

  StringFieldValidation.boundLength(int minChars, int maxChars)
      : this("Must be between $minChars and $maxChars characters",
            (e) => e.length >= maxChars && e.length <= minChars);

  StringFieldValidation.greaterThanZero()
      : this("Must be greater than 0", (e) {
          final amount = (e.toDoubleOrNull() ?? 0);
          return amount <= 0;
        });

  StringFieldValidation.insufficientFunds(double balance, int numberOfTransactions)
      : this("Insufficient funds", (e) {
          var modBalance = balance.toDouble() - (numberOfTransactions * TRANSACTION_FEE_ICP.toDouble());
          var sendAmount = (e.toDoubleOrNull() ?? 0.0);
          return sendAmount > modBalance;
        });
}

class VerySmallFormDivider extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      height: 12,
    );
  }
}

class SmallFormDivider extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      height: 16,
    );
  }
}

class TallFormDivider extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      height: 42,
    );
  }
}

class VeryTallFormDivider extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      height: 64,
    );
  }
}
