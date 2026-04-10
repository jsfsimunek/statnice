const topics = [
  {
    id: "physical",
    title: "Fyzická geografie",
    summary: "Základní procesy Země, reliéf, klima, hydrosféra a biogeografie.",
    points: [
      "Vysvětli rozdíl mezi endogenními a exogenními procesy a uveď příklady.",
      "Popiš hlavní klimatické pásy a faktory, které ovlivňují jejich rozmístění.",
      "Zopakuj oběh vody na Zemi a vazbu mezi klimatem, vodstvem a krajinou."
    ],
    flashcards: [
      {
        question: "Co je to desková tektonika?",
        answer: "Pohyb litosférických desek po astenosféře, který ovlivňuje vznik pohoří, vulkanismus i zemětřesení."
      },
      {
        question: "Jaký je rozdíl mezi zvětráváním a erozí?",
        answer: "Zvětrávání horninu rozrušuje na místě, eroze materiál odnáší a přemisťuje."
      }
    ],
    quizzes: [
      {
        question: "Který proces přímo souvisí se vznikem vrásových pohoří?",
        options: ["Sedimentace", "Subdukce a kolize desek", "Deflace", "Meandrování řek"],
        correct: 1
      },
      {
        question: "Který typ srážek vzniká výstupem vzduchu po návětrném svahu?",
        options: ["Frontální", "Konvekční", "Orografické", "Monzunové"],
        correct: 2
      }
    ]
  },
  {
    id: "human",
    title: "Socioekonomická geografie",
    summary: "Obyvatelstvo, sídla, hospodářství, doprava a globalizační procesy.",
    points: [
      "Zopakuj demografické ukazatele a fáze demografické revoluce.",
      "Srovnej primární, sekundární, terciární a kvartérní sektor hospodářství.",
      "Ujasni si vliv urbanizace, suburbanizace a metropolizace na krajinu."
    ],
    flashcards: [
      {
        question: "Co měří HDI?",
        answer: "Index lidského rozvoje kombinuje délku života, vzdělání a ekonomickou úroveň."
      },
      {
        question: "Co je to aglomerace?",
        answer: "Územní soustředění měst a osídlení, které je propojené hospodářsky i funkčně."
      }
    ],
    quizzes: [
      {
        question: "Který proces znamená přesun obyvatelstva a funkcí z jádra města do zázemí?",
        options: ["Polarizace", "Suburbanizace", "Industrializace", "Desertifikace"],
        correct: 1
      },
      {
        question: "Který sektor je typicky založený na službách a informačních činnostech?",
        options: ["Primární", "Sekundární", "Terciární a kvartérní", "Těžební"],
        correct: 2
      }
    ]
  },
  {
    id: "regions",
    title: "Regionální geografie světa",
    summary: "Evropa, Asie, Afrika, Amerika i Oceánie v přírodních a společenských souvislostech.",
    points: [
      "Projdi si hlavní makroregiony a jejich fyzickogeografické i ekonomické znaky.",
      "Věnuj pozornost jádrovým a periferním oblastem a jejich vývoji.",
      "Ujasni si významné integrační procesy, konfliktní oblasti a dopravní osy."
    ],
    flashcards: [
      {
        question: "Proč je jihovýchodní Asie významná v globální ekonomice?",
        answer: "Kvůli hustému osídlení, výrobním kapacitám, námořním trasám a rychlému růstu měst."
      },
      {
        question: "Co je Sahel?",
        answer: "Přechodná polopouštní oblast jižně od Sahary s vysokou klimatickou i sociální zranitelností."
      }
    ],
    quizzes: [
      {
        question: "Který stát je považován za jádro Mercosuru?",
        options: ["Chile", "Brazílie", "Peru", "Bolívie"],
        correct: 1
      },
      {
        question: "Který region je nejvíce spojený s monzunovým klimatem?",
        options: ["Skandinávie", "Střední Asie", "Jižní a jihovýchodní Asie", "Patagonie"],
        correct: 2
      }
    ]
  },
  {
    id: "cartography",
    title: "Kartografie a GIS",
    summary: "Mapová díla, měřítko, generalizace, dálkový průzkum Země a geoinformatika.",
    points: [
      "Zopakuj rozdíl mezi mapou, plánem a glóbem a kdy se co používá.",
      "Vysvětli kartografické zkreslení a typy mapových zobrazení.",
      "Projdi si základy GIS vrstev, práce s daty a využití DPZ."
    ],
    flashcards: [
      {
        question: "Co udává měřítko mapy?",
        answer: "Poměr mezi vzdáleností na mapě a skutečnou vzdáleností v terénu."
      },
      {
        question: "K čemu slouží GIS?",
        answer: "K ukládání, analýze, vizualizaci a prostorovému vyhodnocování geografických dat."
      }
    ],
    quizzes: [
      {
        question: "Které zobrazení nejvíce zkresluje plochy ve vysokých zeměpisných šířkách?",
        options: ["Mercatorovo", "Azimutální", "Lambertovo", "Kuželové ekvidistantní"],
        correct: 0
      },
      {
        question: "Co je rastr v GIS?",
        options: ["Síť bodů a čar", "Tabulka atributů", "Pravidelná mřížka buněk s hodnotami", "Pouze typ mapové legendy"],
        correct: 2
      }
    ]
  }
];

const state = {
  selectedTopicIndex: 0,
  currentFlashcardIndex: 0,
  currentQuizIndex: 0,
  reviewCount: 0,
  correctCount: 0
};

const topicList = document.querySelector("#topic-list");
const selectedTopicTitle = document.querySelector("#selected-topic-title");
const selectedTopicSummary = document.querySelector("#selected-topic-summary");
const selectedTopicPoints = document.querySelector("#selected-topic-points");
const reviewCount = document.querySelector("#review-count");
const correctCount = document.querySelector("#correct-count");
const successRate = document.querySelector("#success-rate");
const flashcard = document.querySelector("#flashcard");
const flashcardQuestion = document.querySelector("#flashcard-question");
const flashcardAnswer = document.querySelector("#flashcard-answer");
const quizQuestion = document.querySelector("#quiz-question");
const quizOptions = document.querySelector("#quiz-options");
const quizFeedback = document.querySelector("#quiz-feedback");
const dailyFocus = document.querySelector("#daily-focus");

function renderTopics() {
  topicList.innerHTML = "";

  topics.forEach((topic, index) => {
    const button = document.createElement("button");
    button.className = `topic-button${index === state.selectedTopicIndex ? " active" : ""}`;
    button.type = "button";
    button.innerHTML = `<strong>${topic.title}</strong><p>${topic.summary}</p>`;
    button.addEventListener("click", () => selectTopic(index));
    topicList.appendChild(button);
  });
}

function renderSelectedTopic() {
  const topic = topics[state.selectedTopicIndex];

  selectedTopicTitle.textContent = topic.title;
  selectedTopicSummary.textContent = topic.summary;
  selectedTopicPoints.innerHTML = topic.points.map((point) => `<li>${point}</li>`).join("");
  dailyFocus.textContent = topic.title;
}

function renderFlashcard() {
  const topic = topics[state.selectedTopicIndex];
  const card = topic.flashcards[state.currentFlashcardIndex];

  flashcard.classList.remove("is-flipped");
  flashcardQuestion.textContent = card.question;
  flashcardAnswer.textContent = card.answer;
}

function renderQuiz() {
  const topic = topics[state.selectedTopicIndex];
  const quiz = topic.quizzes[state.currentQuizIndex];

  quizQuestion.textContent = quiz.question;
  quizFeedback.textContent = "Vyber odpověď a zkontroluj, jak si stojíš.";
  quizOptions.innerHTML = "";

  quiz.options.forEach((option, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "quiz-option";
    button.textContent = option;
    button.addEventListener("click", () => handleQuizAnswer(index));
    quizOptions.appendChild(button);
  });
}

function updateStats() {
  reviewCount.textContent = String(state.reviewCount);
  correctCount.textContent = String(state.correctCount);

  const rate =
    state.reviewCount === 0
      ? 0
      : Math.round((state.correctCount / state.reviewCount) * 100);
  successRate.textContent = `${rate} %`;
}

function selectTopic(index) {
  state.selectedTopicIndex = index;
  state.currentFlashcardIndex = 0;
  state.currentQuizIndex = 0;

  renderTopics();
  renderSelectedTopic();
  renderFlashcard();
  renderQuiz();
}

function nextFlashcard(random = false) {
  const cards = topics[state.selectedTopicIndex].flashcards;

  if (random) {
    state.currentFlashcardIndex = Math.floor(Math.random() * cards.length);
  } else {
    state.currentFlashcardIndex = (state.currentFlashcardIndex + 1) % cards.length;
  }

  renderFlashcard();
}

function nextQuizQuestion() {
  const quizzes = topics[state.selectedTopicIndex].quizzes;
  state.currentQuizIndex = (state.currentQuizIndex + 1) % quizzes.length;
  renderQuiz();
}

function handleQuizAnswer(index) {
  const quiz = topics[state.selectedTopicIndex].quizzes[state.currentQuizIndex];
  const optionButtons = [...document.querySelectorAll(".quiz-option")];

  optionButtons.forEach((button, buttonIndex) => {
    button.disabled = true;

    if (buttonIndex === quiz.correct) {
      button.classList.add("correct");
    } else if (buttonIndex === index) {
      button.classList.add("incorrect");
    }
  });

  state.reviewCount += 1;

  if (index === quiz.correct) {
    state.correctCount += 1;
    quizFeedback.textContent = "Správně. Tohle je odpověď, kterou bys měl umět i vysvětlit.";
  } else {
    quizFeedback.textContent = `Špatně. Správná odpověď je: ${quiz.options[quiz.correct]}.`;
  }

  updateStats();
}

document.querySelector("#start-learning").addEventListener("click", () => {
  document.querySelector("#topics").scrollIntoView({ behavior: "smooth", block: "start" });
});

document.querySelector("#show-random-card").addEventListener("click", () => nextFlashcard(true));
document.querySelector("#flip-card").addEventListener("click", () => {
  flashcard.classList.toggle("is-flipped");
});
document.querySelector("#next-card").addEventListener("click", () => nextFlashcard(false));
flashcard.addEventListener("click", () => flashcard.classList.toggle("is-flipped"));
document.querySelector("#next-question").addEventListener("click", nextQuizQuestion);

renderTopics();
renderSelectedTopic();
renderFlashcard();
renderQuiz();
updateStats();
