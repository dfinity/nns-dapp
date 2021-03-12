import 'dart:async';
import 'dart:ui';

import 'package:flutter/services.dart';

import '../../dfinity.dart';

extension AllValid on List<ValidatedField> {
  bool get allAreValid => this.all((element) => element.failedValidation == null);
}

class ValidatedField {
  final GlobalKey key = GlobalKey();
  final textEditingController = TextEditingController();
  final List<FieldValidation> validations;
  final List<TextInputFormatter>? inputFormatters;
  final TextInputType inputType;
  String name;

  set initialText(String initialText) {
    textEditingController.text = initialText;
  }

  final focusNode = FocusNode();

  ValidatedField(this.name, this.validations, {this.inputFormatters, this.inputType = TextInputType.text});

  String get text => textEditingController.text;

  FieldValidation? get failedValidation =>
      validations.firstOrNullWhere((element) => element.inputIsValid(textEditingController.text));
}

class FieldValidation {
  final String errorMessage;
  final bool Function(String) inputIsValid;

  FieldValidation(this.errorMessage, this.inputIsValid);

  FieldValidation.minimumLength(int numCharacters)
      : this("must be more than $numCharacters long", (e) => e.length < numCharacters);
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
      height: 20,
    );
  }
}

class TallFormDivider extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      height: 40,
    );
  }
}

class VeryTallFormDivider extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      height: 60,
    );
  }
}
