// tts.js - Text-to-Speech module for FletBox
// Uses Google Cloud Text-to-Speech API

/**
 * # TEXT-TO-SPEECH MODULE
 * - easy way to convert text to audio
 * - supports multiple voices and languages
 * - returns audio buffer or saves to file
 *
 * All methods:
 * - textToSpeech(text, options)
 * - saveAudio(buffer, path)
 *
 * @example
 * import { textToSpeech } from '@flet-box/tts';
 *
 * // Generate audio
 * const audio = await textToSpeech('Hello world', {
 *   language: 'en-US',
 *   voice: 'en-US-Neural2-J',
 *   speed: 1.0
 * });
 *
 * // Save to file
 * await saveAudio(audio, 'output.mp3');
 */

import { TextToSpeechClient } from "@google-cloud/text-to-speech";
import { writeFile } from "fs/promises";

/**
 * Converts text to speech using Google Cloud TTS
 * @param {string} text - Text to convert
 * @param {Object} options - TTS options
 * @param {string} options.language - Language code (default: 'en-US')
 * @param {string} options.voice - Voice name (default: 'en-US-Neural2-J')
 * @param {number} options.speed - Speaking speed (0.25 - 4.0, default: 1.0)
 * @param {number} options.pitch - Voice pitch (-20.0 - 20.0, default: 0.0)
 * @param {string} options.encoding - Audio encoding (default: 'MP3')
 * @returns {Promise<Buffer>} Audio buffer
 */
export async function textToSpeech(text, options = {}) {
  const {
    language = "en-US",
    voice = "en-US-Neural2-J",
    speed = 1.0,
    pitch = 0.0,
    encoding = "MP3",
  } = options;

  try {
    const client = new TextToSpeechClient();

    const request = {
      input: { text },
      voice: { languageCode: language, name: voice },
      audioConfig: {
        audioEncoding: encoding,
        speakingRate: speed,
        pitch: pitch,
      },
    };

    const [response] = await client.synthesizeSpeech(request);
    return response.audioContent;
  } catch (error) {
    console.error("TTS Error:", error.message);
    throw error;
  }
}

/**
 * Saves audio buffer to file
 * @param {Buffer} audioBuffer - Audio data
 * @param {string} path - File path (e.g., 'output.mp3')
 * @returns {Promise<void>}
 */
export async function saveAudio(audioBuffer, path) {
  await writeFile(path, audioBuffer);
  console.log(`✅ Audio saved to: ${path}`);
}

/**
 * Quick speech function (most common use)
 * @param {string} text - Text to speak
 * @param {string} lang - Language code (default: 'es')
 * @returns {Promise<Buffer>}
 */
export async function speak(text, lang = "es") {
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

  const voiceMap = {
    "es-ES": "es-ES-Neural2-D",
    "en-US": "en-US-Neural2-J",
    "fr-FR": "fr-FR-Neural2-A",
    "de-DE": "de-DE-Neural2-B",
    "it-IT": "it-IT-Neural2-A",
    "pt-PT": "pt-PT-Neural2-A",
    "ja-JP": "ja-JP-Neural2-B",
    "ko-KR": "ko-KR-Neural2-A",
    "zh-CN": "zh-CN-Neural2-A",
  };

  const languageCode = languageMap[lang] || "en-US";
  const voiceName = voiceMap[languageCode] || "en-US-Neural2-J";

  return textToSpeech(text, {
    language: languageCode,
    voice: voiceName,
    speed: 1.0,
  });
}

export default { textToSpeech, saveAudio, speak };
