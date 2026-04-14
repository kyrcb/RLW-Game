// storyData.js
// CLAUDE: Use this array to manage the flow of the game.
// The Host UI will display the `scenario` and `question`.
// The Players UI will see the `options` and can vote.
// The logic needs to look at the votes, pick the most voted option, and check against `correctOptionIndex`.
// Instead of a single consequence, read from the `consequences` array using the winning option index.

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
    consequences: [
      {
        imagePath: '/cq_p1_0.png',
        text: "You begin frantically drafting a second novel. While exposing current abuses seems urgent, without a solid understanding of their history, Filipinos cannot fairly judge their present nor plan for their future. You realize your efforts might be premature."
      },
      {
        imagePath: '/cq_1.png',
        text: "A wise path. As you wrote, 'it was necessary first to post you on the past. So only you can fairly judge the present.' This foundational history will give your people the context they desperately need."
      },
      {
        imagePath: '/cq_p1_2.png',
        text: "You attempt to organize a bloody rebellion across the sea. You lack the resources, funding, and the masses back home are disjointed. Without historical consciousness uniting them first, the rebellion is doomed to fail."
      }
    ]
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
    consequences: [
      {
        imagePath: '/cq_p2_0.png',
        text: "You read the religious chronicle. It is heavily biased, focusing on the spread of Christianity rather than the authentic lifestyle and culture of the native Filipinos. It lacks the ethnographic honesty you need."
      },
      {
        imagePath: '/cq_2.png',
        text: "You deem it necessary to rely on a non-religious, first-hand account. Morga was a layman who relied on personal experiences and eye-witness documentation, making it an invaluable primary source."
      },
      {
        imagePath: '/cq_p2_2.png',
        text: "The modern account is cleanly written but completely detached from reality. The European historian relies purely on second-hand assumptions instead of having walked the soil or witnessed the culture directly."
      }
    ]
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
    consequences: [
      {
        imagePath: '/cq_p3_0.png',
        text: "You petition the authorities. Unsurprisingly, the Spanish government refuses to finance a book that empowers Filipino national identity. You have wasted precious time."
      },
      {
        imagePath: '/cq_p3_1.png',
        text: "You ruthlessly drain your own savings. You grow physically ill from starvation in a cold European winter. While your dedication is absolute, the printing costs are ultimately too astronomical to bear alone."
      },
      {
        imagePath: '/cq_3.png',
        text: "The reality of publishing in 19th-century Europe is harsh. Fortunately, Antonio Regidor, a wealthy countryman, supports you financially, proving the power of Filipino solidarity."
      }
    ]
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
    consequences: [
      {
        imagePath: '/cq_p4_0.png',
        text: "You focus on the arrival of the Spanish ships. While historically significant for Europe, it does nothing to rebuild the lost ancestry and heritage of the Filipinos before the conquest."
      },
      {
        imagePath: '/cq_p4_1.png',
        text: "You study the political term of Governor de Vera. It is an interesting account of Spanish political maneuvering, but it completely misses the everyday customs and traditions of your people."
      },
      {
        imagePath: '/cq_4.png',
        text: "While political events are important, Chapter 8 is the most essential because it specifically describes the practices, customs, and religions of Pre-Hispanic Filipinos. This is what you need to show Filipinos their true ancestral heritage."
      }
    ]
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
    consequences: [
      {
        imagePath: '/cq_p5_0.png',
        text: "You dream of a day where all young Filipinos freely study their true history in bright classrooms. Sadly, the grim 19th-century colonial reality proves far more tyrannical."
      },
      {
        imagePath: '/cq_5.png',
        text: "The Spanish authorities saw the danger of Filipinos learning about their rich pre-colonial past. They immediately banned the annotation, confiscated copies, and stopped its circulation."
      },
      {
        imagePath: '/cq_p5_2.png',
        text: "You assume the book goes unnoticed. But the authorities are not fools; they recognize the immense danger of an educated, historically-aware populace and actively seek to destroy the text."
      }
    ]
  }
];

module.exports = storyData;
