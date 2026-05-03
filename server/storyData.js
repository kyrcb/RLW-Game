const storyData = [
  // ── PHASE 1 ─────────────────────────────────────────────────────────────────
  {
    phase: 1,
    phaseIntroLore: [
      { tl: "London, labingwalo at walumpu't siyam.", en: "London, 1889." },
      { tl: "Ikaw ay si Dr. Jose Rizal — manunulat, doktor, at rebolusyonaryong intelektwal.", en: "You are Dr. Jose Rizal — writer, doctor, and revolutionary intellectual." },
      { tl: "Nailathala na ang Noli Me Tangere, na naglalarawan ng kasalukuyang kalagayan ng iyong bayang sinakop.", en: "Noli Me Tangere has been published, diagnosing the present ills of your colonized homeland." },
      { tl: "Ngunit natutukoy mo ang mas malalim na sugat: ang iyong mga kababayan ay hindi alam kung sino sila noon.", en: "But you identify a deeper wound: your people do not know who they were before." },
      { tl: "Isang dakilang misyon ang naghihintay sa iyo.", en: "A momentous mission awaits you." }
    ],
    scenario: "You are Jose Rizal in 1889. Noli Me Tangere has sketched the present state of your colonized homeland. But you realize something more fundamental is missing — your people have no true history of themselves. The history they know was written entirely by their colonizers, full of distortions and deliberate falsehoods. To fairly judge the present and plan for the future, your people must first be awakened to who they truly were.",
    question: "What is Rizal's primary goal in this historic undertaking?",
    options: [
      "Write another novel immediately to expose the friars' current abuses.",
      "Awaken a consciousness of the past and rectify what had been falsified by colonizers.",
      "Organize an armed rebellion against the Spanish colonial government from Europe."
    ],
    correctOptionIndex: 1,
    consequences: [
      {
        imagePath: '/cq_p1_0.png',
        text: "Another novel will expose current wounds — but without historical consciousness, your people cannot understand the root. Rizal knew: 'To be without history is to be without a soul.' The present cannot be judged without first knowing the past."
      },
      {
        imagePath: '/cq_1.png',
        text: "Correct. Rizal's primary goal was to 'awaken a consciousness of the past' and 'rectify what had been falsified by centuries of colonial rule.' As he wrote: 'It was necessary first to post you on the past, so that you can fairly judge the present.' This foundational mission drives everything that follows."
      },
      {
        imagePath: '/cq_p1_2.png',
        text: "Armed rebellion without historical consciousness is a fire without fuel. Rizal believed that a people who do not know their own dignified past cannot fight with conviction for their future. First, restore the history. Then, let the people decide."
      }
    ]
  },

  // ── PHASE 2 ─────────────────────────────────────────────────────────────────
  {
    phase: 2,
    phaseIntroLore: [
      { tl: "Ang British Museum ay nagtatago ng libu-libong chronicle ng Pilipinas — bawat isa ay may sariling kinikilingan.", en: "The British Museum holds thousands of chronicles about the Philippines — each with its own bias." },
      { tl: "Para sa siglo at kalahati, ang relihiyosong mga historyador ay nangibabaw sa salaysay.", en: "For a century and a half, religious historians have dominated the narrative." },
      { tl: "Sila ay mas nag-ukol ng oras sa kasaysayan ng simbahan kaysa sa kasaysayan ng mamamayan.", en: "They dealt more with church history than with the history of the Filipino people." },
      { tl: "Kailangan mo ng ibang boses — isang boses na walang relihiyosong kinikilingan.", en: "You need a different voice — one free of religious interpretation." }
    ],
    scenario: "At the British Museum, you search through Spanish chronicles about the early Philippines. Religious historians — Dominicans, Augustinians, Franciscans — have written most of the available accounts. But their chronicles are full of what Rizal will call 'pious lies': miraculous interventions, saint's lives, and church-centric narratives that deal more with religion than with the actual lives of the Filipino people. You need an objective, secular account.",
    question: "Which chronicle do you choose to annotate as the foundation of your historical counterattack?",
    options: [
      "A Dominican friar's chronicle focusing on religious missions and miracle stories.",
      "\"Sucesos de las Islas Filipinas\" by Antonio de Morga, a lawyer and Lieutenant Governor of the Philippines.",
      "An Augustinian priest's account of his missionary journeys across the archipelago."
    ],
    correctOptionIndex: 1,
    consequences: [
      {
        imagePath: '/cq_p2_0.png',
        text: "The Dominican chronicle is saturated with 'pious lies' — miraculous interventions, divine favors, and religious exaggerations. Like all religious historians, it deals more with church history than with the history of the Filipino people themselves. This cannot be your foundation."
      },
      {
        imagePath: '/cq_2.png',
        text: "Antonio de Morga was not a priest — he was a lawyer and Lieutenant Governor of the Philippines, a layman whose account is devoid of religious interpretations of events as 'pious lies.' This is exactly why Rizal chose him: Morga's Sucesos de las Islas Filipinas is the most objective secular chronicle available, written by an eyewitness official, not a missionary with an agenda."
      },
      {
        imagePath: '/cq_p2_2.png',
        text: "The Augustinian chronicle shares the same fundamental flaw as all religious accounts — it prioritizes the Church's triumphant narrative over the everyday reality of the Filipino people. Rizal needs a layman's account, free from the agenda of religious orders."
      }
    ]
  },

  // ── PHASE 3 ─────────────────────────────────────────────────────────────────
  {
    phase: 3,
    phaseIntroLore: [
      { tl: "Ang aklat na hinahanap mo ay lipas-panahon na — ang mga kopya nito ay nakakalat sa buong mundo.", en: "The book you seek is ancient — its copies scattered across the globe." },
      { tl: "Si Antonio de Morga ay hindi isang propesyonal na historyador.", en: "Antonio de Morga was not a professional historian." },
      { tl: "Siya ay isang abugado at Teniente Gobernador ng Pilipinas — isang taong nakita ang mga pangyayari nang personal.", en: "He was a lawyer and Lieutenant Governor of the Philippines — a man who witnessed events firsthand." },
      { tl: "Ang kanyang akda ay nailathala nang matagal na bago ipinanganak si Rizal.", en: "His work was published long before Rizal was even born." }
    ],
    scenario: "You have chosen Morga's Sucesos de las Islas Filipinas. Now you must locate the original edition. Antonio de Morga was a lawyer by training, serving as Lieutenant Governor of the Philippines — a secular official, not a priest. His Sucesos is unique: written by a firsthand government witness rather than a missionary. But this book is rare and old. You need to find when and where the original was published to locate an authentic copy.",
    question: "When and where was the original Sucesos de las Islas Filipinas first published?",
    options: [
      "1889 in London, England — the same year Rizal begins his research.",
      "1890 in Madrid, Spain — the heart of the Spanish publishing world.",
      "1609 in Mexico City, New Spain — over 280 years before Rizal's time."
    ],
    correctOptionIndex: 2,
    consequences: [
      {
        imagePath: '/cq_p3_0.png',
        text: "1889 is the year Rizal begins his research — not the publication date of Morga's original. The Sucesos is far older than that. You are searching in the wrong century."
      },
      {
        imagePath: '/cq_p3_1.png',
        text: "Madrid was indeed Spain's publishing center, but Morga's work was published in the colonial territories — far from the Iberian Peninsula. Look across the Atlantic, toward the Spanish colonies in the Americas."
      },
      {
        imagePath: '/cq_3.png',
        text: "Correct. The original Sucesos de las Islas Filipinas was published in 1609 in Mexico City, New Spain — over 280 years before Rizal finds it. This ancient text, written by a colonial official who actually governed the Philippines, becomes Rizal's most powerful instrument for reclaiming Filipino history."
      }
    ]
  },

  // ── PHASE 4 ─────────────────────────────────────────────────────────────────
  {
    phase: 4,
    phaseIntroLore: [
      { tl: "Isa sa mga natitirang kopya ng 1609 na edisyon ni Morga ay nahahanap sa malalaking archive ng British Museum.", en: "One of the surviving copies of Morga's 1609 edition rests in the vast archives of the British Museum." },
      { tl: "Malayo sa mga Espanyol na sensor, maaari kang magtrabaho nang malaya.", en: "Far from Spanish censors, you can work freely." },
      { tl: "Ngunit ang pananaliksik ay maaaring isagawa sa iba't ibang lungsod sa Europa.", en: "But research could be conducted in several European cities." },
      { tl: "Ang tamang pagpipilian ng lokasyon ay magpapasya kung makukumpleto mo ang iyong gawain.", en: "The right choice of location will determine whether your work can be completed." }
    ],
    scenario: "You need to locate a reliable copy of Morga's original 1609 Sucesos and conduct rigorous historical research to support your annotations. European archives and libraries hold different materials. You must choose where to base your research. The Spanish authorities in Manila would never give you free access to documents that challenge their colonial narrative. The question is: which European institution holds the resources you need?",
    question: "Where does Rizal conduct the bulk of his research for the annotations?",
    options: [
      "The archives in Manila, Philippines — closest to the subject of study.",
      "The Bibliothèque nationale in Paris, France — the largest library in continental Europe.",
      "The British Museum in London, England — which holds a rare copy of the 1609 edition."
    ],
    correctOptionIndex: 2,
    consequences: [
      {
        imagePath: '/cq_p4_0.png',
        text: "The Philippine archives are controlled by Spanish colonial authorities. Rizal — already under surveillance as the author of Noli Me Tangere — would never be given free access to materials that undermine the colonial narrative. Manila is not safe for this work."
      },
      {
        imagePath: '/cq_p4_1.png',
        text: "Paris has extraordinary resources, but the rare 1609 original edition of Morga's Sucesos that Rizal specifically needs is housed in London. The British Museum's collection is unrivaled for this particular text."
      },
      {
        imagePath: '/cq_4.png',
        text: "The British Museum in London holds the precious 1609 copy of Morga's Sucesos. Here, protected by British neutrality and far from Spanish censors, Rizal freely conducts his groundbreaking research — cross-referencing Morga with other historical sources to build his meticulous annotations."
      }
    ]
  },

  // ── PHASE 5 ─────────────────────────────────────────────────────────────────
  {
    phase: 5,
    phaseIntroLore: [
      { tl: "Ang pananaliksik ay natapos na. Ang manuskrito ay handa na — ngunit ang pag-imprenta sa Europa ay nagkakahalaga ng isang kapalaran.", en: "Research is complete. The manuscript is ready — but printing in 19th-century Europe costs a fortune." },
      { tl: "Kinopya ni Rizal ang buong teksto ng Morga nang kamay — isang pagpapahirap sa katawan at panalapi.", en: "Rizal hand-copied the entire Morga text — a brutal toll on both body and finances." },
      { tl: "Ang katotohanan ay nakasulat na. Ngunit ang katotohanan na hindi naipakalat ay katumbas ng katahimikan.", en: "The truth is written. But truth that is not published is the same as silence." }
    ],
    scenario: "Your annotations are complete. The manuscript is ready. But publishing a book in 19th-century Europe demands significant capital — far beyond Rizal's means as an exiled Filipino intellectual living on modest earnings. He has hand-copied Morga's archaic Spanish text entirely by hand, already straining his health. Now he must find a way to fund the printing.",
    question: "How will you fund the publication of the annotated Sucesos?",
    options: [
      "Petition the Spanish colonial government for an academic research grant.",
      "Exhaust your own savings and endure poverty in a cold European winter.",
      "Accept the financial support of Antonio Regidor, a wealthy and patriotic Filipino in London."
    ],
    correctOptionIndex: 2,
    consequences: [
      {
        imagePath: '/cq_p5_0.png',
        text: "The Spanish government financing a book that proves Filipinos had a rich, advanced civilization before conquest — and exposes colonial lies? Unsurprisingly, the petition is denied. You have wasted precious time chasing an impossible option."
      },
      {
        imagePath: '/cq_p5_1.png',
        text: "You drain your savings completely. Cold, hungry, and ill in a European winter, you cannot cover the enormous printing costs alone. The manuscript sits unpublished. The sacrifice is real, but the math is impossible."
      },
      {
        imagePath: '/cq_5.png',
        text: "Antonio Regidor, a successful and deeply patriotic Filipino based in London, steps forward to fund the publication. The annotated Sucesos will be printed in Paris in 1890. Filipino solidarity — across borders and across social classes — makes history possible."
      }
    ]
  },

  // ── PHASE 6 ─────────────────────────────────────────────────────────────────
  {
    phase: 6,
    phaseIntroLore: [
      { tl: "Sa hawak na panulat, nahaharap si Rizal sa kumplikadong gawain ng anotasyon.", en: "With pen in hand, Rizal faces the complex task of annotation." },
      { tl: "Ang kanyang mga tala ay mahuhulog sa dalawang kategorya.", en: "His notes will fall into two broad categories." },
      { tl: "Ang una ay mga tuwid na historikal na pagwawasto — katotohanan laban sa katotohanan.", en: "The first: straightforward historical corrections — fact against fact." },
      { tl: "Ang ikalawa ay mas mapanganib — tuwirang hinarap ang mga relihiyosong chronicle na puno ng mga 'pious lies.'", en: "The second is more charged — directly confronting the religious chronicles filled with 'pious lies.'" }
    ],
    scenario: "Rizal's annotations fall into two distinct categories. The first consists of straightforward historical notes — correcting Morga's factual errors using archaeological evidence, comparative sources, and firsthand accounts. The second category carries a strong anti-clerical bias: Rizal directly challenges the Dominican historian Diego de Aduarte, whose chronicles are full of religious exaggerations and fabrications. Morga's work, being devoid of 'pious lies' and miraculous interpretations, gives Rizal the secular foundation he needs for this challenge.",
    question: "How does Rizal approach the religious chronicles in his annotations?",
    options: [
      "He avoids all religious topics entirely to prevent Spanish censors from targeting the book.",
      "He attacks every religious order — Dominicans, Augustinians, Jesuits — with equal ferocity.",
      "He critiques specific chroniclers with evidence, particularly Dominican historian Diego de Aduarte, while showing relative leniency toward the Jesuits."
    ],
    correctOptionIndex: 2,
    consequences: [
      {
        imagePath: '/cq_p6_0.png',
        text: "Avoiding the religious falsehoods would leave the most dangerous lies untouched. The Dominican chronicles claiming miraculous divine interventions and denying Filipino civilization are the very distortions Rizal must confront. Silence is complicity."
      },
      {
        imagePath: '/cq_p6_1.png',
        text: "Indiscriminate attacks on all religious orders would destroy Rizal's credibility and give his enemies an easy target. Scholarship demands precision. Not all orders were equally guilty of falsifying history, and Rizal knows this."
      },
      {
        imagePath: '/cq_6.png',
        text: "Rizal's anti-clerical annotations are pointed and specific — particularly targeting Dominican historian Diego de Aduarte, whose work he uses Morga to directly discredit. Yet Rizal is noticeably more lenient toward the Jesuits, who provided his early education at Ateneo de Manila. Even in scholarship, the human heart leaves its mark."
      }
    ]
  },

  // ── PHASE 7 ─────────────────────────────────────────────────────────────────
  {
    phase: 7,
    phaseIntroLore: [
      { tl: "Ang Sucesos ni Morga ay may walong kabanata. Ang una hanggang pitong kabanata ay nagtatala ng mga pulitikal na pangyayari.", en: "Morga's Sucesos has eight chapters. The first seven chronicle political events." },
      { tl: "Ngunit ang ikawalong kabanata ay natatangi — ito ay isang etnograpikong larawan ng mga sinaunang Pilipino.", en: "But the eighth chapter stands apart — an ethnographic portrait of the ancient Filipinos." },
      { tl: "Dito natutulog ang pinakamahalagang katibayan na maaaring gamitin ni Rizal.", en: "Here lies the most vital evidence Rizal can wield." },
      { tl: "Ang katanungan ay: alin sa mga kabanata ang magbubunyag ng tunay na identidad ng iyong bayan?", en: "The question is: which chapter reveals the true identity of your people?" }
    ],
    scenario: "You are examining Morga's eight chapters. The first seven focus on Spanish political events: the terms of Governor-Generals, Spanish military campaigns, and colonial administration. But Chapter 8 is different — it is a detailed ethnographic description of pre-Hispanic Filipino society: their customs, social structure, religious practices, trade systems, and daily life. Rizal recognizes that Chapter 8, used as a secondary source, is the ethnographic heart of his entire counter-narrative.",
    question: "Which chapter of Morga's Sucesos does Rizal focus on most intensely for its ethnographic value?",
    options: [
      "Chapter 1, about the arrival of the first Spanish ships in the Philippine archipelago.",
      "Chapter 4, about the term of Governor-General Dr. Santiago de Vera.",
      "Chapter 8, which describes the customs, practices, religion, and social structure of Pre-Hispanic Filipinos."
    ],
    correctOptionIndex: 2,
    consequences: [
      {
        imagePath: '/cq_p7_0.png',
        text: "Chapter 1 tells Spain's arrival story — it is the colonizer's triumphant beginning, not the Filipino people's truth. The evidence of pre-colonial civilization lies not in the arrival of ships, but in what those ships found waiting for them."
      },
      {
        imagePath: '/cq_p7_1.png',
        text: "Chapter 4 chronicles the political term of a Spanish governor — useful for administrative history, but irrelevant to Rizal's goal of proving the richness of pre-Hispanic Filipino civilization. The people's story is not found in the governor's records."
      },
      {
        imagePath: '/cq_7.png',
        text: "Chapter 8 is the ethnographic heart of Morga's Sucesos — describing the practices, customs, religion, trade, and social structure of Pre-Hispanic Filipinos in remarkable detail. As a secondary source, Rizal uses it to prove that Filipinos possessed a sophisticated civilization centuries before any European set foot on their shores. This single chapter becomes the backbone of Filipino historical identity."
      }
    ]
  },

  // ── PHASE 8 ─────────────────────────────────────────────────────────────────
  {
    phase: 8,
    phaseIntroLore: [
      { tl: "Ang anotadong Sucesos ay naiimprenta na sa Paris noong 1890.", en: "The annotated Sucesos is printed in Paris in 1890." },
      { tl: "Ito ang unang kasaysayan ng Pilipinas na isinulat mula sa pananaw ng isang Pilipino.", en: "It is the first history of the Philippines written from the viewpoint of a Filipino." },
      { tl: "Si Rizal ay may espesyal na pagmamahal para sa isang relihiyosong orden na nagbigay sa kanya ng kanyang maagang edukasyon sa Ateneo de Manila.", en: "Rizal holds a special fondness for the religious order that gave him his early education at Ateneo de Manila." },
      { tl: "Ngunit ang katotohanan ng kanyang aklat ay hindi maaaring itago ng sinuman — kahit ng mga nagmamahal sa kanya.", en: "But the truth of his book cannot be hidden by anyone — not even those who love him." }
    ],
    scenario: "The annotated Sucesos is published. Rizal has been notably generous toward the Jesuits in his annotations — they educated him at Ateneo de Manila and he holds a genuine soft spot for them, even as he critiques the broader colonial religious establishment. Now the book must reach the Philippines. But the Spanish colonial government recognizes immediately what this document means: the first history of the Philippines written from the viewpoint of a Filipino — not a colonizer.",
    question: "What happens when Rizal's annotated Sucesos reaches the Philippines in the late 19th century?",
    options: [
      "The Spanish authorities praise the scholarly rigor of the annotations and allow free distribution.",
      "The book is immediately banned, all copies are confiscated, and the circulation is forcibly stopped.",
      "The book is quietly ignored — the authorities assume it will have no significant impact."
    ],
    correctOptionIndex: 1,
    consequences: [
      {
        imagePath: '/cq_p8_0.png',
        text: "Spanish authorities praising a book that proves Filipinos had an advanced civilization before conquest — and that exposes centuries of colonial falsification? The colonial government is many things, but it is not that naive. The reaction is swift and severe."
      },
      {
        imagePath: '/cq_8.png',
        text: "The Spanish colonial government immediately recognizes the existential danger of Rizal's annotated Sucesos. It is banned outright. Copies are confiscated at ports and burned. The circulation is forcibly stopped. But the truth, once written, cannot be fully destroyed — and its author is already a marked man."
      },
      {
        imagePath: '/cq_p8_2.png',
        text: "The authorities are not fools. A book proving that Filipinos possessed a rich, sophisticated civilization before the Spanish arrived — written by Jose Rizal, already the most dangerous intellectual in the colony — is anything but harmless. The crackdown is immediate and brutal."
      }
    ]
  }
];

const gameIntroLore = [
  { tl: "London, labingwalo at walumpu't siyam.", en: "London, 1889." },
  { tl: "Ikaw ay si Dr. Jose Rizal.", en: "You are Dr. Jose Rizal." },
  { tl: "Ang iyong nobelang Noli Me Tangere ay nagbunyag ng kasalukuyang kahirapan ng iyong bayang sinakop.", en: "Your novel Noli Me Tangere has exposed the present sufferings of your colonized homeland." },
  { tl: "Ngunit natutukoy mo ang mas malalim na sugat: ang iyong mga kababayan ay hindi alam kung sino sila noon — bago dumating ang mga Kastila.", en: "But you identify a deeper wound: your people do not know who they were — before the Spanish arrived." },
  { tl: "Ang kasaysayan na alam nila ay isinulat ng kanilang mga mananakop, puno ng mga kasinungalingan at pagbabaluktot.", en: "The history they know was written by their conquerors, filled with lies and distortions." },
  { tl: "Naniniwala kang ang isang taong alipin na hindi kilala ang kanyang sariling dangal ay hindi makalalaban para sa kalayaan.", en: "You believe that a people who do not know their own dignity cannot fight for their freedom." },
  { tl: "Ang isang dakilang adhikain ang naghihintay sa iyo — ang ibalik ang nawalang kasaysayan ng Pilipinas.", en: "A monumental mission awaits you — to restore the lost history of the Philippines." }
];

const gameOutroLore = [
  { tl: "Ang gawain ay natapos na.", en: "The work is done." },
  { tl: "Ang anotadong Sucesos de las Islas Filipinas — ang unang kasaysayan ng Pilipinas mula sa pananaw ng isang Pilipino — ay naiimprenta na sa Paris noong 1890.", en: "The annotated Sucesos de las Islas Filipinas — the first Philippine history written from the viewpoint of a Filipino — is printed in Paris in 1890." },
  { tl: "Ipinagbawal ito ng mga Kastila. Kinumpiska at sinunog ang mga kopya. Ngunit hindi nila mapipigilan ang apoy ng katotohanan.", en: "The Spanish banned it. Copies were confiscated and burned. But they could not extinguish the fire of truth." },
  { tl: "Noong 1925, itinuro ng historyador na si Austin Craig na bago ang gawain ni Rizal, walang kasaysayan ng Pilipinas na isinulat mula sa pananaw ng indio.", en: "In 1925, historian Austin Craig observed that before Rizal's work, there was no history of the Philippines written from the viewpoint of the indio." },
  { tl: "Para sa unang pagkakataon, isang Pilipino ang nagsalita para sa kanyang sariling bayan sa wika ng iskolarship.", en: "For the first time, a Filipino had spoken for his own people in the language of scholarship." },
  { tl: "Ang mga anotasyon ni Rizal ay nagsalita para sa mga ninunong walang boses — at salamat sa inyong katapatan, mga dalubhasa, ang tinig na iyon ay patuloy na maririnig.", en: "Rizal's annotations spoke for the voiceless ancestors — and thanks to your devotion, scholars, that voice continues to be heard." }
];

module.exports = { storyData, gameIntroLore, gameOutroLore };
