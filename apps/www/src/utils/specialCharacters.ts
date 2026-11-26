export const noTypingRequired = /[ .?？…’,!。，！，":]/;
export const punctuationCharacters = [...'.?？…’,!。，！，":'];
export const punctuation = new RegExp(`[${punctuationCharacters.join("")}]`);
export const spacePunctuation = new RegExp(` (?=${punctuation.source})`, "g");
