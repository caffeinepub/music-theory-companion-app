import Map "mo:core/Map";
import Text "mo:core/Text";
import List "mo:core/List";



actor {
  var chordProgressions = Map.empty<Text, [Text]>();
  var scaleInformation = Map.empty<Text, Text>();
  var theoryExplanations = Map.empty<Text, Text>();
  var improvisationTips = Map.empty<Text, Text>();
  var compositionSuggestions = Map.empty<Text, Text>();

  // Initialize educational content
  chordProgressions.add("C Major", ["I-IV-V", "ii-V-I", "I-vi-ii-V"]);
  chordProgressions.add("A Minor", ["i-iv-V", "i-VI-III-VII"]);
  chordProgressions.add("D Dorian", ["i-IV-v", "i-ii-III"]);

  scaleInformation.add("C Major", "C D E F G A B");
  scaleInformation.add("A Minor", "A B C D E F G");
  scaleInformation.add("D Dorian", "D E F G A B C");

  theoryExplanations.add("Circle of Fifths", "The circle of fifths shows the relationship between keys.");
  theoryExplanations.add("Modes", "Modes are variations of scales with different tonal centers.");
  theoryExplanations.add("Chord Progressions", "Common chord progressions create harmonic movement.");

  improvisationTips.add("C Major", "Focus on the C major scale and use chord tones for strong melodies.");
  improvisationTips.add("A Minor", "Experiment with natural and harmonic minor variations.");
  improvisationTips.add("D Dorian", "Emphasize the major 6th for a Dorian sound.");

  compositionSuggestions.add("C Major", "Try using I-IV-V progressions for a classic sound.");
  compositionSuggestions.add("A Minor", "Use i-iv-V for a minor feel with tension.");
  compositionSuggestions.add("D Dorian", "Mix minor and major chords for modal flavor.");

  public query func getChordProgressions(key : Text) : async ?[Text] {
    chordProgressions.get(key);
  };

  public query func getScaleInformation(key : Text) : async ?Text {
    scaleInformation.get(key);
  };

  public query func getTheoryExplanation(topic : Text) : async ?Text {
    theoryExplanations.get(topic);
  };

  public query func getImprovisationTips(key : Text) : async ?Text {
    improvisationTips.get(key);
  };

  public query func getCompositionSuggestions(key : Text) : async ?Text {
    compositionSuggestions.get(key);
  };

  public query func getAllKeys() : async [Text] {
    chordProgressions.keys().toArray();
  };

  public query func getAllTheoryTopics() : async [Text] {
    theoryExplanations.keys().toArray();
  };
};
