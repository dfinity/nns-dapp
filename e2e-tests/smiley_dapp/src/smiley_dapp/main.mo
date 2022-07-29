actor  {

  var backgroundColor = "powderBlue";
  var smileyChar = "1F601";

  public func getBackgroundColor() : async Text {
    return backgroundColor;
  };
  
  public func getSmileyChar() : async Text {
    return smileyChar;
  };

  public func setSmileyChar( smiley : Text) : async () {
    smileyChar := smiley;
  };

  public func setBackgroundColor( color : Text) : async () {
    backgroundColor := color;
  }


};
