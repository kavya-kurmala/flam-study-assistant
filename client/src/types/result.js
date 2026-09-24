/**
 * The structured shape requested from the LLM and enforced by
 * lib/validateResult.js before anything reaches the UI.
 *
 * @typedef {Object} StudyCard
 * @property {string} id
 * @property {string} question
 * @property {string} answer
 * @property {string[]} options - includes the exact answer text plus distractors
 *
 * @typedef {Object} StudySet
 * @property {StudyCard[]} cards
 */

export {}
