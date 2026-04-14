// storyData.js
// CLAUDE: Use this array to manage the flow of the game.
// The Host UI will display the `scenario` and `question`.
// The Players UI will see the `options` and can vote.
// The logic needs to look at the votes, pick the most voted option, and check against `correctOptionIndex`.
// If incorrect, show `consequence`. If correct, move to the next question.

const storyData = [
  {
    phase: 1,
    scenario: "You are Jose Rizal in 1888. You recently published Noli Me Tangere, which sketched the present state of your native land. You realized that to help your people fairly judge the present and estimate progress something must be done.",
    question: "What is your next crucial step?",
    options: [
      "Write another novel immediately to expose the current abuses of the friars.",
      "Study and write about the Philippines' past before the Spanish conquest.",
      "Organize an armed rebellion from Europe."
    ],
    correctOptionIndex: 1,
    consequence: "While exposing current abuses or planning a rebellion might seem urgent, you firmly believe that without a solid understanding of their history, Filipinos cannot fairly judge their present nor plan for their future. As you wrote, 'it was necessary first to post you on the past. So only you can fairly judge the present.'",
  },
  {
    phase: 2,
    scenario: "You decide to look for a reliable source about the early history of the Philippines. You find several Spanish chronicles in the British Museum.",
    question: "Which one do you choose to annotate?",
    options: [
      "A chronicle written by a Spanish friar focusing on religious missions.",
      "\"Sucesos de las Islas Filipinas\" by Antonio de Morga, a layman and lieutenant governor.",
      "A modern historical account written by a European historian who has never been to Asia."
    ],
    correctOptionIndex: 1,
    consequence: "You deem it necessary to rely on a non-religious, first-hand account. You chose Antonio de Morga's work because Morga was a layman (lawyer and lieutenant governor) who relied on personal experiences and eye-witness documentation, making it an invaluable primary source.",
  },
  {
    phase: 3,
    scenario: "You have started replicating Morga's work by hand. However, publishing a book in Europe is expensive.",
    question: "How will you fund the publication of your annotations?",
    options: [
      "Ask for donations from the Spanish government.",
      "Use your own limited savings and skip meals.",
      "Accept financial support from a dependable wealthy countryman named Antonio Regidor."
    ],
    correctOptionIndex: 2,
    consequence: "The reality of publishing in 19th-century Europe is harsh. While you are thrifty, the cost is too high for you alone, and the Spanish government would never fund it. Fortunately, Antonio Regidor, a wealthy countryman, is willing to support you financially.",
  },
  {
    phase: 4,
    scenario: "You are examining the 8 chapters of Morga's work. The first 7 chapters are about political events and the terms of Governor-Generals.",
    question: "Which chapter is the most interesting to you and has vital ethnographic value?",
    options: [
      "Chapter 1, about the discovery of the eastern islands.",
      "Chapter 4, about Dr. Santiago de Vera.",
      "Chapter 8, which describes the Pre-Hispanic Filipinos."
    ],
    correctOptionIndex: 2,
    consequence: "While political events are important, you find Chapter 8 the most essential because it specifically describes the practices, customs, and religions of Pre-Hispanic Filipinos. This ethnographic data is what you need to show Filipinos their true ancestral heritage.",
  },
  {
    phase: 5,
    scenario: "You successfully published the annotated 'Sucesos' and want to share it with your homeland. It has become the first Philippine history from the point of view of a Filipino.",
    question: "What happens to the book when it reaches the Philippines in the late 19th century?",
    options: [
      "It becomes a required textbook for all Filipino students.",
      "The book is banned, copies are confiscated and destroyed, and circulation is stopped.",
      "It is ignored by the Spanish authorities."
    ],
    correctOptionIndex: 1,
    consequence: "The Spanish authorities saw the danger of Filipinos learning about their rich pre-colonial past. They immediately banned the annotation, confiscated copies, and stopped its circulation.",
  }
];

module.exports = storyData;
