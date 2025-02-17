let warningLogged = false;
function getUrl() {
  if (!warningLogged) {
    console.warn("Using R2.dev subdomain. Not suitable for prod.");
    warningLogged = true;
  }
  return "https://pub-e683ff6c0a5345b8af9cb2df0fbc7e43.r2.dev";
}

export function wordToAudioSource(id:number){
  return `${getUrl()}/words/${id}.mp3`;
}
export function phraseToAudioSource(id:number){
  return `${getUrl()}/phrases/${id}.mp3`;
}