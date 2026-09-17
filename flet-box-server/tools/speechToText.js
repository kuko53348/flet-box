// stt.js - Speech-to-Text module for FletBox
// Uses Google Cloud Speech-to-Text API

/**
 * # SPEECH-TO-TEXT MODULE
 * - easy way to convert audio to text
 * - supports multiple languages and audio formats
 * - returns transcribed text
 *
 * All methods:
 * - speechToText(audioBuffer, options)
 * - transcribeFile(filePath, options)
 * - transcribeStream(stream, options)
 *
 * @example
 * import { speechToText } from '@flet-box/stt';
 *
 * // Transcribe audio buffer
 * const text = await speechToText(audioBuffer, {
 *   language: 'es-ES',
 *   encoding: 'MP3'
 * });
 *
 * // Transcribe file
 * const text = await transcribeFile('audio.mp3', {
 *   language: 'es-ES'
 * });
 */

import { SpeechClient } from "@google-cloud/speech";
import { readFile } from "fs/promises";
import { createReadStream } from "fs";

/**
 * Transcribes audio using Google Cloud STT
 * @param {Buffer} audioBuffer - Audio data
 * @param {Object} options - STT options
 * @param {string} options.language - Language code (default: 'es-ES')
 * @param {string} options.encoding - Audio encoding (default: 'MP3')
 * @param {number} options.sampleRate - Sample rate (default: 16000)
 * @param {boolean} options.punctuation - Enable punctuation (default: true)
 * @param {boolean} options.profanity - Filter profanity (default: false)
 * @param {string[]} options.phrases - Custom phrases for context
 * @returns {Promise<string>} Transcribed text
 */
export async function speechToText(audioBuffer, options = {}) {
  const {
    language = "es-ES",
    encoding = "MP3",
    sampleRate = 16000,
    punctuation = true,
    profanity = false,
    phrases = [],
  } = options;

  try {
    const client = new SpeechClient();

    const config = {
      encoding: encoding,
      sampleRateHertz: sampleRate,
      languageCode: language,
      enableAutomaticPunctuation: punctuation,
      profanityFilter: profanity,
      speechContexts: phrases.length > 0 ? [{ phrases }] : [],
      model: "latest_long",
    };

    const audio = {
      content: audioBuffer.toString("base64"),
    };

    const request = {
      config: config,
      audio: audio,
    };

    const [response] = await client.recognize(request);
    const transcription = response.results
      .map((result) => result.alternatives[0].transcript)
      .join("\n");

    return transcription;
  } catch (error) {
    console.error("STT Error:", error.message);
    throw error;
  }
}

/**
 * Transcribes an audio file
 * @param {string} filePath - Path to audio file
 * @param {Object} options - STT options
 * @returns {Promise<string>}
 */
export async function transcribeFile(filePath, options = {}) {
  const audioBuffer = await readFile(filePath);
  return speechToText(audioBuffer, options);
}

/**
 * Transcribes a stream (for real-time transcription)
 * @param {ReadableStream} stream - Audio stream
 * @param {Object} options - STT options
 * @returns {Promise<string>}
 */
export async function transcribeStream(stream, options = {}) {
  const { language = "es-ES", encoding = "MP3", sampleRate = 16000 } = options;

  try {
    const client = new SpeechClient();

    const config = {
      encoding: encoding,
      sampleRateHertz: sampleRate,
      languageCode: language,
    };

    const request = {
      config,
      interimResults: true,
    };

    const streamResponse = client
      .streamingRecognize(request)
      .on("error", console.error);

    stream.pipe(streamResponse);

    return new Promise((resolve, reject) => {
      let transcription = "";
      streamResponse.on("data", (data) => {
        if (data.results[0]?.alternatives[0]) {
          transcription += data.results[0].alternatives[0].transcript + " ";
        }
      });
      streamResponse.on("end", () => resolve(transcription.trim()));
      streamResponse.on("error", reject);
    });
  } catch (error) {
    console.error("Stream STT Error:", error.message);
    throw error;
  }
}

/**
 * Quick speech recognition (most common use)
 * @param {Buffer|string} audio - Audio buffer or file path
 * @param {string} lang - Language code (default: 'es')
 * @returns {Promise<string>}
 */
export async function listen(audio, lang = "es") {
  const languageMap = {
    es: "es-ES",
    en: "en-US",
    fr: "fr-FR",
    de: "de-DE",
    it: "it-IT",
    pt: "pt-PT",
    ja: "ja-JP",
    ko: "ko-KR",
    zh: "zh-CN",
  };

  const languageCode = languageMap[lang] || "es-ES";

  let audioBuffer = audio;

  if (typeof audio === "string") {
    audioBuffer = await readFile(audio);
  }

  return speechToText(audioBuffer, {
    language: languageCode,
    encoding: "MP3",
    sampleRate: 16000,
    punctuation: true,
  });
}

export default { speechToText, transcribeFile, transcribeStream, listen };
