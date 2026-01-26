export const noTypingRequired = /[ .?？’,!。，！，":]/;
export const punctuation = /[.?？’,!。，！，":]/;
export const spacePunctuation = new RegExp(` (?=${punctuation.source})`, "g");
