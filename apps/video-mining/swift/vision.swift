// Apple Vision helper for the video-mining pipeline.
//
//   vision ocr        reads image paths from stdin (one per line) and prints one JSON object per image:
//                     {"path": "...", "lines": [{"text": "...", "confidence": 0.9, "box": [x, y, w, h]}]}
//   vision saliency   same input; prints {"path": "...", "boxes": [{"box": [x, y, w, h], "confidence": 1}]}
//   vision tokenize   reads Chinese text (one per line); prints {"text": "...", "tokens": ["收拾", "一下", ...]}
//                     using Apple's word tokenizer (NaturalLanguage)
//   vision pinyin     reads Chinese text (one per line); prints {"text": "...", "syllables": ["zhǐ", "qīng"]}
//                     using the system's Mandarin-to-Latin transliteration (good with names: 池长老 → zhǎng)
//
// Boxes are normalised to 0–1 with the origin at the top left (Vision's own origin is bottom left).
// Build with: swiftc -O swift/vision.swift -o bin/vision
import Foundation
import NaturalLanguage
import Vision

func topLeftBox(_ rect: CGRect) -> [Double] {
  [Double(rect.minX), Double(1 - rect.maxY), Double(rect.width), Double(rect.height)]
}

func printJSON(_ object: [String: Any]) {
  let data = try! JSONSerialization.data(withJSONObject: object, options: [])
  FileHandle.standardOutput.write(data)
  FileHandle.standardOutput.write("\n".data(using: .utf8)!)
}

func recognizeText(at path: String) -> [String: Any] {
  let request = VNRecognizeTextRequest()
  request.recognitionLevel = .accurate
  request.recognitionLanguages = ["zh-Hans", "en-US"]
  request.usesLanguageCorrection = true
  let handler = VNImageRequestHandler(url: URL(fileURLWithPath: path))
  do { try handler.perform([request]) } catch { return ["path": path, "error": "\(error)", "lines": []] }
  let lines: [[String: Any]] = (request.results ?? []).compactMap { observation in
    guard let candidate = observation.topCandidates(1).first else { return nil }
    return ["text": candidate.string, "confidence": Double(candidate.confidence), "box": topLeftBox(observation.boundingBox)]
  }
  return ["path": path, "lines": lines]
}

func detectSaliency(at path: String) -> [String: Any] {
  let request = VNGenerateAttentionBasedSaliencyImageRequest()
  let handler = VNImageRequestHandler(url: URL(fileURLWithPath: path))
  do { try handler.perform([request]) } catch { return ["path": path, "error": "\(error)", "boxes": []] }
  let objects = (request.results?.first as? VNSaliencyImageObservation)?.salientObjects ?? []
  let boxes: [[String: Any]] = objects.map { ["box": topLeftBox($0.boundingBox), "confidence": Double($0.confidence)] }
  return ["path": path, "boxes": boxes]
}

func tokenize(_ text: String) -> [String: Any] {
  let tokenizer = NLTokenizer(unit: .word)
  tokenizer.setLanguage(.simplifiedChinese)
  tokenizer.string = text
  var tokens: [String] = []
  tokenizer.enumerateTokens(in: text.startIndex..<text.endIndex) { range, _ in
    tokens.append(String(text[range]))
    return true
  }
  return ["text": text, "tokens": tokens]
}

func transliterate(_ text: String) -> [String: Any] {
  let latin = text.applyingTransform(.mandarinToLatin, reverse: false) ?? ""
  return ["text": text, "syllables": latin.split(separator: " ").map(String.init)]
}

let modes: [String: (String) -> [String: Any]] = [
  "ocr": recognizeText, "saliency": detectSaliency, "tokenize": tokenize, "pinyin": transliterate,
]
let mode = CommandLine.arguments.dropFirst().first ?? ""
guard let handle = modes[mode] else {
  FileHandle.standardError.write("usage: vision ocr|saliency|tokenize|pinyin < lines\n".data(using: .utf8)!)
  exit(2)
}
while let line = readLine() {
  let input = line.trimmingCharacters(in: .whitespaces)
  if input.isEmpty { continue }
  printJSON(handle(input))
}
