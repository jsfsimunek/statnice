const examDate = new Date("2025-05-18T09:00:00+02:00");
const storageKey = "statnice-geografie-v1";

const topics = [
  {
    id: 1,
    title: "Kartografie jako věda · Biomy · Terénní výuka SE",
    summary:
      "Zařazení kartografie do systému věd, ekologická pravidla v biomech a návrh terénní výuky socioekonomické geografie.",
    parts: {
      A: "Kartografie jako věda, její význam pro geografii a druhy map v různých oborech lidské činnosti.",
      B: "Ekologická pravidla a adaptační mechanismy organismů, srovnání specifických podmínek dvou biomů.",
      C: "Návrh terénní výuky ze socioekonomické geografie: cíl, metody, data a předpokládaný výstup."
    },
    keywords: ["kartografie", "mapy", "biomy", "adaptace", "terénní výuka"],
    practical: [],
    mnemonic: {
      acronym: "KBT",
      visual:
        "Představ si mapu připnutou na kmeni stromu uprostřed dvou rozdílných biomů a vedle ní studenty zapisující data v terénu.",
      comparison: {
        place1: "Tropický deštný les v Amazonii",
        place2: "Tundra severní Kanady",
        explanation:
          "Extrémně odlišné podmínky ukazují, jak prostředí formuje adaptace organismů i témata terénní výuky."
      }
    }
  },
  {
    id: 2,
    title: "Tvary Země · Klimatická změna · Popis obrázku",
    summary:
      "Tvary a rozměry Země, souřadnicové systémy, volba zobrazení a klimatická změna s praktickým popisem obrázku.",
    parts: {
      A: "Tvary a rozměry Země, souřadnicové systémy a matematické základy kartografických děl.",
      B: "Klimatická změna: definice, příčiny a konkrétní projevy v ČR i ve světě.",
      C: "Praktická část: popis zadaného obrázku s použitím geografické terminologie."
    },
    keywords: ["Země", "souřadnice", "zobrazení", "klimatická změna", "obrázek"],
    practical: ["C"],
    mnemonic: {
      acronym: "ZKO",
      visual:
        "Globus se síťí poledníků, z jedné strany rozpálený sluncem a z druhé překrytý fotografií krajiny k odbornému popisu.",
      comparison: {
        place1: "Jižní Morava",
        place2: "Bangladéš",
        explanation:
          "Na jednom tématu uvidíš rozdíl mezi suchem ve střední Evropě a povodňovým rizikem v nízko položené deltě."
      }
    }
  },
  {
    id: 3,
    title: "Obsah mapy · Geologie · Primární a sekundární data",
    summary:
      "Kartografické vyjadřovací prostředky, vrstvy Země a práce s primárními a sekundárními daty v geografii.",
    parts: {
      A: "Obsah mapy, kartografické vyjadřovací prostředky a srovnání obecně zeměpisné a tematické mapy.",
      B: "Vrstvy Země od povrchu do nitra, endogenní a exogenní geologické procesy.",
      C: "Primární a sekundární data v geografii a jejich doložení z portfolia."
    },
    keywords: ["obsah mapy", "tematická mapa", "vrstvy Země", "data", "portfolio"],
    practical: [],
    mnemonic: {
      acronym: "MGD",
      visual:
        "Rozkrojený glóbus leží vedle tematické mapy a výzkumného zápisníku se dvěma složkami: primární a sekundární data.",
      comparison: {
        place1: "Island",
        place2: "Český masiv",
        explanation:
          "Island dobře ukazuje aktivní endogenní procesy, zatímco Český masiv pomáhá vysvětlit starší geologický vývoj."
      }
    }
  },
  {
    id: 4,
    title: "Metody výzkumu · Půda · Myšlenková mapa",
    summary:
      "Metody geografického výzkumu, základní vlastnosti půdy a praktická tvorba myšlenkové mapy.",
    parts: {
      A: "Praktická část: metody geografického výzkumu využitelné pro potřeby společnosti, doložené z portfolia.",
      B: "Půdní pokryv: složení, vlastnosti a význam pro člověka i přírodní procesy.",
      C: "Praktická část: myšlenková mapa na zadané geografické téma."
    },
    keywords: ["výzkum", "metody", "půda", "myšlenková mapa", "portfolio"],
    practical: ["A", "C"],
    mnemonic: {
      acronym: "VPM",
      visual:
        "Výzkumník zapichuje sondu do půdy a z ní se větví barevná myšlenková mapa jako kořenový systém.",
      comparison: {
        place1: "Černozemní oblast jižní Moravy",
        place2: "Lateritové půdy v Brazílii",
        explanation:
          "Kontrast úrodnosti a klimatických podmínek pomáhá zapamatovat si význam půdotvorných faktorů."
      }
    }
  },
  {
    id: 5,
    title: "Věková pyramida · Půdy ČR · Demografická revoluce",
    summary:
      "Praktická práce s věkovou pyramidou, prostorové uspořádání půd v Česku a demografická revoluce.",
    parts: {
      A: "Praktická část: sestrojení a interpretace věkové pyramidy obyvatel Česka včetně srovnání typů.",
      B: "Prostorové uspořádání půd v Česku, horizontální i vertikální rozmístění a půdotvorné procesy.",
      C: "Schéma demografické revoluce a struktura i dynamika obyvatelstva na vybraném světadílu."
    },
    keywords: ["věková pyramida", "Česko", "půdy ČR", "demografie", "prognóza"],
    practical: ["A"],
    mnemonic: {
      acronym: "PPD",
      visual:
        "Pyramida obyvatel se zvedá z české krajiny a její vrstvy se mění v půdní horizonty a časovou osu demografické revoluce.",
      comparison: {
        place1: "Česko",
        place2: "Niger",
        explanation:
          "Rozdíl mezi stárnoucí a velmi mladou populací je ideální pro vysvětlení typů věkových pyramid."
      }
    }
  },
  {
    id: 6,
    title: "Česká kartografická produkce · Environmentální rizika · Vývoj měst",
    summary:
      "Státní mapová díla, environmentální rizika v krajině a vývoj měst od preindustriální po postindustriální fázi.",
    parts: {
      A: "Česká kartografická produkce, státní mapová díla, staré mapy, zdroje a jejich využitelnost.",
      B: "Environmentální rizika spojená s hospodářským využíváním krajiny v různých typech biomů.",
      C: "Fáze vývoje měst a aktuální trendy i problémy rozvoje měst v ČR a ve světě."
    },
    keywords: ["mapová díla", "rizika", "krajina", "města", "urbanizace"],
    practical: [],
    mnemonic: {
      acronym: "KRM",
      visual:
        "Stará česká mapa leží pod moderním městem, kolem něhož jsou barevně vyznačena environmentální rizika.",
      comparison: {
        place1: "Brno",
        place2: "Detroit",
        explanation:
          "Na rozdílném vývoji měst se dobře ukazuje proměna ekonomické základny i urbanistických problémů."
      }
    }
  },
  {
    id: 7,
    title: "Geoinformatika a GIS · Horniny · Sídla a přírodní podmínky",
    summary:
      "Geoinformační technologie, genetické typy hornin a vliv přírodních podmínek na vznik a vývoj sídel.",
    parts: {
      A: "Geoinformatika, GIS, geodatabáze v ČR, mapové servery a využití v praxi i výuce.",
      B: "Hlavní genetické typy hornin a jejich role ve stavbě zemské kůry v souvislosti s globální tektonikou.",
      C: "Vliv přírodních podmínek na vznik a vývoj sídel a prostorovou koncentraci lidských aktivit."
    },
    keywords: ["GIS", "geodatabáze", "horniny", "sídla", "tektonika"],
    practical: [],
    mnemonic: {
      acronym: "GHS",
      visual:
        "Na digitální mapě se objevují vrstvy hornin a nad nimi vyrůstají sídla přesně tam, kde to dovoluje reliéf a voda.",
      comparison: {
        place1: "Nilská delta",
        place2: "Horské oblasti Nepálu",
        explanation:
          "Výborný kontrast mezi příznivými podmínkami pro koncentraci obyvatel a náročným horským osídlením."
      }
    }
  },
  {
    id: 8,
    title: "DPZ · Geomorfologie · Město a venkov",
    summary:
      "Dálkový průzkum Země, geomorfologie a vztahy mezi městem a venkovem v čase i prostoru.",
    parts: {
      A: "DPZ: využití, fyzikální podstata, pravé a nepravé barvy, interpretace snímků.",
      B: "Geomorfologie jako věda, základní skupiny procesů a morfometrie.",
      C: "Funkce města a venkova, jejich proměny, rozdílnost ve světě a vazby město-venkov."
    },
    keywords: ["DPZ", "snímky", "geomorfologie", "město", "venkov"],
    practical: [],
    mnemonic: {
      acronym: "DGM",
      visual:
        "Satelitní snímek se postupně mění v plastický reliéf a ten přechází do mapy města s venkovským zázemím.",
      comparison: {
        place1: "Praha a její zázemí",
        place2: "Rurální oblast v Etiopii",
        explanation:
          "Srovnání ukazuje rozdílnou intenzitu vazeb město-venkov i odlišné využití krajiny."
      }
    }
  },
  {
    id: 9,
    title: "Družicové systémy · Typy reliéfu · Město a venkov s náčrtem",
    summary:
      "Navigační systémy, hlavní typy reliéfu Země a prostorové vztahy města a venkova s náčrtem.",
    parts: {
      A: "Družicové a navigační systémy, princip GPS, typy drah a role ESA i NASA.",
      B: "Tvary reliéfu, příčiny jejich vzniku a přehled hlavních typů reliéfu Země.",
      C: "Funkce města a venkova, proměny v čase a prostoru, doplněné náčrtkem."
    },
    keywords: ["GPS", "družice", "reliéf", "náčrt", "ESA"],
    practical: [],
    mnemonic: {
      acronym: "DRN",
      visual:
        "Satelity kreslí nad Zemí síť, pod nimi vystupuje plastický reliéf a do něj je ručně zakreslené město se zázemím.",
      comparison: {
        place1: "Alpy",
        place2: "Nizozemsko",
        explanation:
          "Na reliéfu těchto oblastí lze dobře ukázat, jak odlišný povrch formuje dopravu, sídla i náčrtek krajiny."
      }
    }
  },
  {
    id: 10,
    title: "Geografie jako věda · Geomorfologické jednotky ČR · Venkov",
    summary:
      "Postavení geografie ve vědách, geomorfologické členění ČR a sociogeografická proměna venkova.",
    parts: {
      A: "Geografie jako věda, objekt a předmět studia, struktura geografických disciplín.",
      B: "Geomorfologické jednotky ČR, jejich rozmístění a příklady v krajině.",
      C: "Proměny sociogeografického uspořádání venkova, příčiny a důsledky."
    },
    keywords: ["geografie", "věda", "ČR", "geomorfologie", "venkov"],
    practical: [],
    mnemonic: {
      acronym: "GGV",
      visual:
        "Učebnice geografie se otevírá nad reliéfní mapou Česka a její stránky pokračují do mozaiky venkovských obcí.",
      comparison: {
        place1: "Haná",
        place2: "Šumava",
        explanation:
          "Pomáhá ukázat, že proměny venkova závisí na fyzickogeografických podmínkách i dostupnosti služeb."
      }
    }
  },
  {
    id: 11,
    title: "Terénní výuka FG · Atmosféra · Zemědělství ve světě",
    summary:
      "Terénní výuka fyzické geografie, stavba atmosféry a lokalizace významných zemědělských oblastí světa.",
    parts: {
      A: "Terénní výuka fyzické geografie pro ZŠ: cíl, výzkumné metody, data a výstup z portfolia.",
      B: "Složení a stavba atmosféry, vertikální zvrstvení a extrémní atmosférické jevy.",
      C: "Významné zemědělské oblasti světa a dopady zemědělské výroby na životní prostředí."
    },
    keywords: ["terénní výuka", "atmosféra", "zvrstvení", "zemědělství", "dopady"],
    practical: [],
    mnemonic: {
      acronym: "TAZ",
      visual:
        "Školní skupina stojí pod vrstevnatou atmosférou a pod ní se střídají intenzivně obdělávané a extenzivní zemědělské oblasti.",
      comparison: {
        place1: "Nizozemsko",
        place2: "Sahel",
        explanation:
          "Kontrast intenzivního a klimaticky omezeného zemědělství usnadňuje vysvětlení dopadů na krajinu."
      }
    }
  },
  {
    id: 12,
    title: "Pohyby Země · Meteorologické charakteristiky · Průmysl",
    summary:
      "Pohyby Země, meteorologické charakteristiky a proměny lokalizačních faktorů průmyslu v čase a prostoru.",
    parts: {
      A: "Pohyby Země: rotační, revoluční, precese a nutace, jejich schéma, důsledky a vliv na člověka.",
      B: "Meteorologické charakteristiky měřené na profesionálních stanicích a jejich geografické rozložení.",
      C: "Proměny lokalizačních faktorů průmyslu ve vybraném regionu."
    },
    keywords: ["rotace", "revoluce", "precese", "meteorologie", "průmysl"],
    practical: [],
    mnemonic: {
      acronym: "RPNU",
      visual:
        "Točící se káča představuje rotaci, kroužení vrcholu precesi a jemné kývání nutaci, zatímco celé těleso obíhá kolem lampy jako Země kolem Slunce.",
      comparison: {
        place1: "Bay of Fundy",
        place2: "Středozemní moře",
        explanation:
          "Silný a slabý příliv je skvělý příklad důsledků pohybů Země a postavení nebeských těles."
      }
    }
  },
  {
    id: 13,
    title: "Výpočty časů · Cirkulace atmosféry · Globalizace a průmysl",
    summary:
      "Praktické výpočty času, všeobecná cirkulace atmosféry a vliv globalizace na průmysl.",
    parts: {
      A: "Praktická část: výpočty místního a pásmového času včetně datové hranice a západu Slunce.",
      B: "Všeobecná cirkulace atmosféry a její důsledky pro diverzitu klimatu a biodiverzitu.",
      C: "Vliv globalizace na moderní trendy průmyslu ve vyspělých zemích světa."
    },
    keywords: ["čas", "datová hranice", "VCA", "globalizace", "průmysl"],
    practical: ["A"],
    mnemonic: {
      acronym: "ČAG",
      visual:
        "Hodiny obíhají kolem Země, nad ní proudí tři cirkulační buňky a pod nimi se přesouvají továrny mezi kontinenty.",
      comparison: {
        place1: "Tokio",
        place2: "Londýn",
        explanation:
          "Dvojice měst pomáhá při výpočtu času i při vysvětlení globalizačních vazeb průmyslu."
      }
    }
  },
  {
    id: 14,
    title: "Terénní výuka kartografie · Klima · Doprava",
    summary:
      "Terénní výuka kartografie, klasifikace klimatu podle Köppena a Alisova a vliv geografických faktorů na dopravu.",
    parts: {
      A: "Terénní výuka kartografie pro ZŠ: návrh z portfolia, cíl, metody, data a výstup.",
      B: "Klima a chod meteorologických charakteristik na vybraném místě světa, klasifikace dle Köppena a Alisova.",
      C: "Vliv geografických faktorů na formování vybraného dopravního systému světa."
    },
    keywords: ["terénní výuka", "kartografie", "Köppen", "klima", "doprava"],
    practical: [],
    mnemonic: {
      acronym: "TKD",
      visual:
        "Žák kreslí mapu počasí v terénu a barevné klimatické pásy se mění v dopravní koridory přes hory, moře i poušť.",
      comparison: {
        place1: "Švýcarsko",
        place2: "Egypt",
        explanation:
          "Jeden příklad ukazuje dopravu ovlivněnou horským reliéfem, druhý zas suchým klimatem a Nilským údolím."
      }
    }
  },
  {
    id: 15,
    title: "Slapové jevy · Oběh vody · Trendy v dopravě",
    summary:
      "Slapy, oběh vody na Zemi a aktuální trendy v dopravě a jejich ekonomické důsledky.",
    parts: {
      A: "Slapové jevy, jejich princip, vliv na pobřeží a důsledky pro lidskou činnost.",
      B: "Zásoby vody na Zemi, malý a velký oběh vody a konkrétní příklady.",
      C: "Aktuální trendy v dopravě a jejich vliv na rozložení ekonomických aktivit."
    },
    keywords: ["slapy", "voda", "oběh", "doprava", "ekonomika"],
    practical: [],
    mnemonic: {
      acronym: "SOD",
      visual:
        "Příliv zvedá pobřeží, z oceánu stoupá vodní pára a po světě se rozbíhají lodní a logistické trasy.",
      comparison: {
        place1: "Bay of Fundy",
        place2: "Singapur",
        explanation:
          "První místo ukazuje extrémní slap, druhé zase globální význam námořní dopravy."
      }
    }
  },
  {
    id: 16,
    title: "Kompozice mapy · Hydrologie toků · Maloobchod a město",
    summary:
      "Kompozice mapy, hydrologické charakteristiky vodního toku a rozmístění maloobchodu ve městě.",
    parts: {
      A: "Interpretace kompozice mapy a její využití pro praxi z portfolia.",
      B: "Vodní tok a jeho hydrologické charakteristiky: průtok, režim, spád, povodí.",
      C: "Rozmístění maloobchodních jednotek v čase a prostoru a vliv na strukturu města."
    },
    keywords: ["kompozice mapy", "hydrologie", "vodní tok", "maloobchod", "město"],
    practical: [],
    mnemonic: {
      acronym: "KHM",
      visual:
        "Mapová kompozice funguje jako výloha obchodu, kterou protéká řeka a kolem ní se shlukují obchodní centra.",
      comparison: {
        place1: "Praha",
        place2: "Los Angeles",
        explanation:
          "Dvě rozdílné městské struktury dobře vysvětlují, jak se mění maloobchod podle dopravní dostupnosti a morfologie města."
      }
    }
  },
  {
    id: 17,
    title: "Případová studie · Reliéf a člověk · Cestovní ruch",
    summary:
      "Geografická případová studie, vztahy mezi reliéfem a lidskými aktivitami a prostorová koncentrace cestovního ruchu.",
    parts: {
      A: "Případová studie z okolí s využitím nástrojů a metod geografie pro analýzu konkrétního problému.",
      B: "Vztahy mezi horninovou stavbou, georeliéfem a lidskými aktivitami v regionech světa.",
      C: "Druhy a formy cestovního ruchu, prostorová koncentrace a trvalá udržitelnost."
    },
    keywords: ["případová studie", "reliéf", "člověk", "cestovní ruch", "udržitelnost"],
    practical: [],
    mnemonic: {
      acronym: "PRC",
      visual:
        "Na terénní mapě se propojuje lokální problém, plastický reliéf a proud turistů směřujících do citlivé krajiny.",
      comparison: {
        place1: "Krkonoše",
        place2: "Benátky",
        explanation:
          "Jeden příklad ukazuje tlak turistů na horskou přírodu, druhý tlak overtourismu v historickém městě."
      }
    }
  },
  {
    id: 18,
    title: "ICT ve výuce zeměpisu · El Niño a proudy · Brno",
    summary:
      "Moderní informační technologie ve výuce, mořské proudění a El Niño a aktuální trendy rozvoje Brna.",
    parts: {
      A: "Moderní informační technologie ve výuce zeměpisu, mobilní aplikace a online GIS s příklady z portfolia.",
      B: "Mořské proudění, vazba na všeobecnou cirkulaci atmosféry a fenomén El Niño.",
      C: "Aktuální trendy rozvoje města Brna z pohledu socioekonomické geografie."
    },
    keywords: ["ICT", "výuka", "El Niño", "mořské proudy", "Brno"],
    practical: [],
    mnemonic: {
      acronym: "IEB",
      visual:
        "Tablet s mapovou aplikací stojí nad oceánem s výrazným prouděním a šipkou mířící k rozvíjejícímu se Brnu.",
      comparison: {
        place1: "Peruánské pobřeží",
        place2: "Brno",
        explanation:
          "Na první pohled nesourodá dvojice pomáhá zapamatovat si fyzickogeografický jev i lokální socioekonomické téma."
      }
    }
  },
  {
    id: 19,
    title: "Tvorba tematické mapy v GIS",
    summary:
      "Celý okruh je praktický: vytvoření tematické mapy v GIS, komentář postupu, data z internetu a kartografické zhodnocení výsledku.",
    parts: {
      A: "Praktická tvorba tematické mapy v GIS včetně práce s daty, kompozicí, metodami a komentářem postupu.",
      B: "Tento okruh nemá samostatnou fyzickogeografickou část, důraz je plně na GIS workflow.",
      C: "Tento okruh nemá samostatnou humánněgeografickou část, hodnotí se hlavně praktické zvládnutí mapy."
    },
    keywords: ["GIS", "tematická mapa", "ArcGIS Pro", "data", "kompozice"],
    practical: ["A"],
    mnemonic: {
      acronym: "GIS",
      visual:
        "Na monitoru se skládá tematická mapa z vrstev, legendy, měřítka a názvu, zatímco student nahlas komentuje každý krok.",
      comparison: {
        place1: "ArcGIS Pro na PC ve škole",
        place2: "Webový mapový server ČÚZK",
        explanation:
          "Srovnání zdroje dat a výstupní tvorby pomáhá držet celý pracovní postup v hlavě."
      }
    }
  }
];

const state = {
  selectedTopicId: topics[0].id,
  topicFilter: "all",
  search: "",
  quizMode: "topic",
  currentFlashcardIndex: 0,
  flashcardOrder: [],
  flashcardFlipped: false,
  currentQuizIndex: 0,
  quizAnswered: false
};

const appState = loadState();

const topicList = document.querySelector("#topic-list");
const topicSearch = document.querySelector("#topic-search");
const filterRow = document.querySelector("#filter-row");
const detailTitle = document.querySelector("#detail-title");
const detailSummary = document.querySelector("#detail-summary");
const partsGrid = document.querySelector("#parts-grid");
const statusSelect = document.querySelector("#status-select");
const notesArea = document.querySelector("#notes-area");
const memoryAcronym = document.querySelector("#memory-acronym");
const memoryVisual = document.querySelector("#memory-visual");
const memoryComparisonTitle = document.querySelector("#memory-comparison-title");
const memoryComparisonBody = document.querySelector("#memory-comparison-body");
const countdownPrimary = document.querySelector("#countdown-primary");
const countdownSecondary = document.querySelector("#countdown-secondary");
const completedCount = document.querySelector("#completed-count");
const inProgressCount = document.querySelector("#in-progress-count");
const masteredCardsCount = document.querySelector("#mastered-cards-count");
const quizAverage = document.querySelector("#quiz-average");
const flashcardsTitle = document.querySelector("#flashcards-title");
const flashcard = document.querySelector("#flashcard");
const flashcardFront = document.querySelector("#flashcard-front");
const flashcardBack = document.querySelector("#flashcard-back");
const flashcardHint = document.querySelector("#flashcard-hint");
const flashcardExample = document.querySelector("#flashcard-example");
const flashcardPosition = document.querySelector("#flashcard-position");
const flashcardMasteredTopic = document.querySelector("#flashcard-mastered-topic");
const flashcardMasteredTotal = document.querySelector("#flashcard-mastered-total");
const quizTitle = document.querySelector("#quiz-title");
const quizType = document.querySelector("#quiz-type");
const quizQuestion = document.querySelector("#quiz-question");
const quizOptions = document.querySelector("#quiz-options");
const quizFeedback = document.querySelector("#quiz-feedback");
const quizScore = document.querySelector("#quiz-score");
const quizFillWrap = document.querySelector("#quiz-fill-wrap");
const quizFillInput = document.querySelector("#quiz-fill-input");
const quizFillSubmit = document.querySelector("#quiz-fill-submit");

function cloneDefaultProgress() {
  return {
    statuses: {},
    notes: {},
    flashcardsKnown: {},
    quizResults: {}
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(storageKey);
    return raw ? { ...cloneDefaultProgress(), ...JSON.parse(raw) } : cloneDefaultProgress();
  } catch {
    return cloneDefaultProgress();
  }
}

function saveState() {
  localStorage.setItem(storageKey, JSON.stringify(appState));
}

function getTopicById(id) {
  return topics.find((topic) => topic.id === id) ?? topics[0];
}

function getStatus(topicId) {
  return appState.statuses[topicId] ?? "not-started";
}

function setStatus(topicId, value) {
  appState.statuses[topicId] = value;
  saveState();
  renderOverviewStats();
  renderTopicList();
}

function setNotes(topicId, value) {
  appState.notes[topicId] = value;
  saveState();
}

function getKnownCards(topicId) {
  return appState.flashcardsKnown[topicId] ?? [];
}

function setKnownCards(topicId, value) {
  appState.flashcardsKnown[topicId] = value;
  saveState();
  renderOverviewStats();
}

function getQuizStats(topicId) {
  return appState.quizResults[topicId] ?? { correct: 0, total: 0 };
}

function updateQuizStats(topicId, isCorrect) {
  const stats = getQuizStats(topicId);
  appState.quizResults[topicId] = {
    correct: stats.correct + (isCorrect ? 1 : 0),
    total: stats.total + 1
  };
  saveState();
  renderOverviewStats();
}

function createFlashcards(topic) {
  const cards = [
    {
      front: `Co je hlavní osa okruhu ${topic.id}?`,
      back: `Okruh propojuje témata: ${topic.title}. U odpovědi vždy ukaž, jak se doplňují části A, B a C.`,
      example: `Mysli na dvojici: ${topic.mnemonic.comparison.place1} vs. ${topic.mnemonic.comparison.place2}.`
    },
    {
      front: "Shrň část A jednou větou.",
      back: topic.parts.A,
      example: `Klíčová slova: ${topic.keywords.slice(0, 2).join(", ")}.`
    },
    {
      front: "Jaký typ znalosti komise čeká v části A?",
      back: "Strukturované vysvětlení pojmů, principů a jejich praktického nebo kartografického využití.",
      example: "Neříkej jen definici. Dodej, k čemu se to používá ve škole, výzkumu nebo praxi."
    },
    {
      front: "Shrň část B jednou větou.",
      back: topic.parts.B,
      example: `Srovnávej konkrétní prostředí, třeba ${topic.mnemonic.comparison.place1}.`
    },
    {
      front: "Jak část B převést do příkladu ze světa?",
      back: "Vezmi jeden fyzickogeografický jev a ukaž ho na dvou rozdílných regionech. Komise ocení konkrétní prostorové rozdíly.",
      example: `${topic.mnemonic.comparison.place1} vs. ${topic.mnemonic.comparison.place2}.`
    },
    {
      front: "Shrň část C jednou větou.",
      back: topic.parts.C,
      example: "Spoj lidskou činnost s konkrétním místem nebo regionem."
    },
    {
      front: "Jaká mnemotechnika patří k tomuto okruhu?",
      back: `${topic.mnemonic.acronym}: ${topic.mnemonic.visual}`,
      example: `Použij obraz: ${topic.mnemonic.visual}`
    },
    {
      front: "Co je bezpečný závěr u zkoušky pro tento okruh?",
      back: "Uzavři odpověď propojením definice, konkrétního příkladu a krátkého srovnání dvou míst nebo dvou procesů.",
      example: topic.mnemonic.comparison.explanation
    }
  ];

  if (topic.practical.length > 0) {
    cards[2] = {
      front: `Které části jsou u okruhu ${topic.id} praktické?`,
      back: `Praktická je část ${topic.practical.join(", ")}. Připrav si konkrétní postup, jak bys úkol řešil.`,
      example: "Komise chce slyšet proces, ne jen výsledek."
    };
  }

  return cards;
}

function createQuiz(topic) {
  return [
    {
      type: "mc",
      question: `Která část okruhu ${topic.id} patří do kartografie, GIS nebo metodologie?`,
      options: ["Část A", "Část B", "Část C", "Žádná z nich"],
      correct: "Část A",
      explanation: "Ve všech okruzích je část A vyhrazená kartografii, GIS nebo metodologii."
    },
    {
      type: "mc",
      question: `Které tvrzení nejlépe vystihuje část B okruhu ${topic.id}?`,
      options: [topic.parts.C, topic.parts.B, topic.parts.A, "Pouze práce s atlasem bez teorie"],
      correct: topic.parts.B,
      explanation: "Část B vždy pokrývá fyzickou geografii nebo přírodní procesy."
    },
    {
      type: "mc",
      question: `Která dvojice míst je v této aplikaci navržená jako srovnávací příklad pro okruh ${topic.id}?`,
      options: [
        `${topic.mnemonic.comparison.place1} vs. ${topic.mnemonic.comparison.place2}`,
        "Praha vs. Vídeň",
        "Sydney vs. Auckland",
        "New York vs. Toronto"
      ],
      correct: `${topic.mnemonic.comparison.place1} vs. ${topic.mnemonic.comparison.place2}`,
      explanation: "Srovnávací dvojice je přímo navázaná na mnemotechniku daného okruhu."
    },
    {
      type: "tf",
      question: `Pravda nebo nepravda: okruh ${topic.id} obsahuje praktickou část.`,
      correct: topic.practical.length > 0 ? "Pravda" : "Nepravda",
      explanation:
        topic.practical.length > 0
          ? `Ano. Praktická je část ${topic.practical.join(", ")}.`
          : "Ne. U tohoto okruhu nejsou v zadání označené praktické části."
    },
    {
      type: "fill",
      question: `Doplň akronym mnemotechniky pro okruh ${topic.id}.`,
      correct: topic.mnemonic.acronym,
      explanation: "Akronym slouží jako rychlá paměťová kotva pro celý okruh."
    }
  ];
}

function getActiveTopic() {
  return getTopicById(state.selectedTopicId);
}

function getQuizPool() {
  if (state.quizMode === "all") {
    return topics.flatMap((topic) =>
      createQuiz(topic).map((question) => ({ ...question, sourceTopicId: topic.id }))
    );
  }

  const activeTopic = getActiveTopic();
  return createQuiz(activeTopic).map((question) => ({ ...question, sourceTopicId: activeTopic.id }));
}

function syncFlashcardOrder() {
  const cards = createFlashcards(getActiveTopic());
  if (state.flashcardOrder.length !== cards.length) {
    state.flashcardOrder = cards.map((_, index) => index);
    state.currentFlashcardIndex = 0;
  }
}

function formatPartLabel(partKey) {
  if (partKey === "A") return "Kartografie / GIS / metodologie";
  if (partKey === "B") return "Fyzická geografie";
  return "Humánní / socioekonomická geografie";
}

function statusLabel(status) {
  if (status === "done") return "hotovo";
  if (status === "in-progress") return "v procesu";
  return "nezačato";
}

function renderCountdown() {
  const now = new Date();
  const diff = examDate.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

  if (days >= 0) {
    countdownPrimary.textContent = `${days} dní`;
    countdownSecondary.textContent = "Odpočet míří k datu 18. 5. 2025, přesně jak je v promptu.";
  } else {
    countdownPrimary.textContent = `${Math.abs(days)} dní po termínu`;
    countdownSecondary.textContent = "Termín 18. 5. 2025 už proběhl, ale web nechává původní datum ze zadání.";
  }
}

function getAggregateQuizStats() {
  return Object.values(appState.quizResults).reduce(
    (acc, item) => ({ correct: acc.correct + item.correct, total: acc.total + item.total }),
    { correct: 0, total: 0 }
  );
}

function renderOverviewStats() {
  const statuses = topics.map((topic) => getStatus(topic.id));
  const done = statuses.filter((status) => status === "done").length;
  const progress = statuses.filter((status) => status === "in-progress").length;
  const mastered = topics.reduce((sum, topic) => sum + getKnownCards(topic.id).length, 0);
  const quizTotals = getAggregateQuizStats();
  const average = quizTotals.total === 0 ? 0 : Math.round((quizTotals.correct / quizTotals.total) * 100);

  completedCount.textContent = String(done);
  inProgressCount.textContent = String(progress);
  masteredCardsCount.textContent = String(mastered);
  flashcardMasteredTotal.textContent = String(mastered);
  quizAverage.textContent = `${average} %`;
}

function renderTopicList() {
  const activeTopic = getActiveTopic();
  const filtered = topics.filter((topic) => {
    const haystack = [topic.title, topic.summary, ...Object.values(topic.parts), ...topic.keywords]
      .join(" ")
      .toLowerCase();
    const matchesSearch = haystack.includes(state.search.toLowerCase());
    const matchesFilter =
      state.topicFilter === "all" ||
      (state.topicFilter === "practical" && topic.practical.length > 0) ||
      topic.parts[state.topicFilter];

    return matchesSearch && matchesFilter;
  });

  topicList.innerHTML = "";

  filtered.forEach((topic) => {
    const button = document.createElement("button");
    const status = getStatus(topic.id);
    const practicalText = topic.practical.length > 0 ? ` · praktické: ${topic.practical.join(", ")}` : "";
    button.className = `topic-card${topic.id === activeTopic.id ? " is-active" : ""}`;
    button.type = "button";
    button.innerHTML = `
      <div class="topic-topline">
        <span class="topic-number">Okruh ${String(topic.id).padStart(2, "0")}</span>
        <div class="tag-row">
          <span class="tag tag-a">A</span>
          <span class="tag tag-b">B</span>
          <span class="tag tag-c">C</span>
          ${topic.practical.length > 0 ? '<span class="tag tag-practical">praktická část</span>' : ""}
        </div>
      </div>
      <h3>${topic.title}</h3>
      <p class="topic-summary">${topic.summary}</p>
      <p class="topic-meta">Stav: ${statusLabel(status)}${practicalText}</p>
    `;
    button.addEventListener("click", () => {
      state.selectedTopicId = topic.id;
      resetFlashcards();
      resetQuiz();
      render();
      document.querySelector("#detail-panel").scrollIntoView({ behavior: "smooth", block: "start" });
    });
    topicList.appendChild(button);
  });

  if (filtered.length === 0) {
    topicList.innerHTML = '<p class="muted">Nic neodpovídá zadanému filtru nebo hledání.</p>';
  }
}

function renderTopicDetail() {
  const topic = getActiveTopic();
  detailTitle.textContent = `Okruh ${String(topic.id).padStart(2, "0")} · ${topic.title}`;
  detailSummary.textContent = topic.summary;
  statusSelect.value = getStatus(topic.id);
  notesArea.value = appState.notes[topic.id] ?? "";
  memoryAcronym.textContent = `Akronym: ${topic.mnemonic.acronym}`;
  memoryVisual.textContent = topic.mnemonic.visual;
  memoryComparisonTitle.textContent = `${topic.mnemonic.comparison.place1} vs. ${topic.mnemonic.comparison.place2}`;
  memoryComparisonBody.textContent = topic.mnemonic.comparison.explanation;

  partsGrid.innerHTML = ["A", "B", "C"]
    .map((partKey) => {
      const practicalTag = topic.practical.includes(partKey)
        ? '<span class="tag tag-practical">praktická</span>'
        : "";
      return `
        <article class="part-card">
          <header>
            <div class="tag-row">
              <span class="tag tag-${partKey.toLowerCase()}">${partKey}</span>
              ${practicalTag}
            </div>
            <strong>${formatPartLabel(partKey)}</strong>
          </header>
          <p>${topic.parts[partKey]}</p>
        </article>
      `;
    })
    .join("");
}

function getCurrentFlashcard() {
  const cards = createFlashcards(getActiveTopic());
  syncFlashcardOrder();
  const cardIndex = state.flashcardOrder[state.currentFlashcardIndex];
  return { cards, card: cards[cardIndex], cardIndex };
}

function renderFlashcard() {
  const topic = getActiveTopic();
  const { cards, card, cardIndex } = getCurrentFlashcard();
  const knownCards = getKnownCards(topic.id);

  flashcardsTitle.textContent = `8 karet pro okruh ${String(topic.id).padStart(2, "0")}`;
  flashcard.classList.toggle("is-flipped", state.flashcardFlipped);
  flashcardFront.textContent = card.front;
  flashcardBack.textContent = card.back;
  flashcardHint.textContent = `Klíčová slova: ${topic.keywords.join(", ")}`;
  flashcardExample.textContent = `Příklad: ${card.example}`;
  flashcardPosition.textContent = `${state.currentFlashcardIndex + 1} / ${cards.length}`;
  flashcardMasteredTopic.textContent = `${knownCards.length} / ${cards.length}`;
  flashcard.dataset.cardIndex = String(cardIndex);
}

function markFlashcard(known) {
  const topic = getActiveTopic();
  const currentIndex = Number(flashcard.dataset.cardIndex);
  const knownCards = new Set(getKnownCards(topic.id));

  if (known) {
    knownCards.add(currentIndex);
  } else {
    knownCards.delete(currentIndex);
  }

  setKnownCards(topic.id, [...knownCards].sort((a, b) => a - b));
  moveFlashcard(1);
}

function moveFlashcard(step) {
  const cards = createFlashcards(getActiveTopic());
  state.currentFlashcardIndex = (state.currentFlashcardIndex + step + cards.length) % cards.length;
  state.flashcardFlipped = false;
  renderFlashcard();
}

function shuffleFlashcards() {
  const order = [...state.flashcardOrder];
  for (let index = order.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [order[index], order[swapIndex]] = [order[swapIndex], order[index]];
  }
  state.flashcardOrder = order;
  state.currentFlashcardIndex = 0;
  state.flashcardFlipped = false;
  renderFlashcard();
}

function resetFlashcards() {
  state.flashcardOrder = [];
  state.currentFlashcardIndex = 0;
  state.flashcardFlipped = false;
}

function renderQuiz() {
  const pool = getQuizPool();
  const question = pool[state.currentQuizIndex % pool.length];
  const stats = state.quizMode === "all" ? getAggregateQuizStats() : getQuizStats(getActiveTopic().id);

  quizTitle.textContent =
    state.quizMode === "all"
      ? "Souhrnný kvíz přes všechny okruhy"
      : `Kvíz k okruhu ${String(getActiveTopic().id).padStart(2, "0")}`;
  quizType.textContent =
    question.type === "mc" ? "Multiple choice" : question.type === "tf" ? "True / False" : "Doplň pojem";
  quizQuestion.textContent = question.question;
  quizFeedback.textContent = "Odpověz a hned uvidíš vysvětlení.";
  quizScore.textContent = `${stats.correct} / ${stats.total}`;
  quizOptions.innerHTML = "";
  quizFillWrap.hidden = question.type !== "fill";
  quizFillInput.value = "";
  quizFillInput.disabled = false;
  quizFillSubmit.disabled = false;
  state.quizAnswered = false;

  if (question.type === "mc" || question.type === "tf") {
    const options = question.type === "tf" ? ["Pravda", "Nepravda"] : question.options;

    options.forEach((option) => {
      const button = document.createElement("button");
      button.className = "quiz-option";
      button.type = "button";
      button.textContent = option;
      button.addEventListener("click", () => submitQuizAnswer(option));
      quizOptions.appendChild(button);
    });
  }
}

function submitQuizAnswer(answer) {
  if (state.quizAnswered) return;

  const pool = getQuizPool();
  const question = pool[state.currentQuizIndex % pool.length];
  const normalizedAnswer = String(answer).trim().toLowerCase();
  const normalizedCorrect = String(question.correct).trim().toLowerCase();
  const isCorrect = normalizedAnswer === normalizedCorrect;
  const buttons = [...document.querySelectorAll(".quiz-option")];

  buttons.forEach((button) => {
    button.disabled = true;
    if (button.textContent.trim().toLowerCase() === normalizedCorrect) {
      button.classList.add("correct");
    } else if (button.textContent.trim().toLowerCase() === normalizedAnswer) {
      button.classList.add("incorrect");
    }
  });

  if (question.type === "fill") {
    quizFillInput.disabled = true;
    quizFillSubmit.disabled = true;
  }

  updateQuizStats(question.sourceTopicId, isCorrect);
  const sourceLabel = `Okruh ${String(question.sourceTopicId).padStart(2, "0")}`;
  quizFeedback.textContent = isCorrect
    ? `Správně. ${sourceLabel}: ${question.explanation}`
    : `Špatně. Správně je "${question.correct}". ${sourceLabel}: ${question.explanation}`;
  state.quizAnswered = true;
  const stats = state.quizMode === "all" ? getAggregateQuizStats() : getQuizStats(getActiveTopic().id);
  quizScore.textContent = `${stats.correct} / ${stats.total}`;
}

function nextQuizQuestion() {
  const pool = getQuizPool();
  state.currentQuizIndex = (state.currentQuizIndex + 1) % pool.length;
  renderQuiz();
}

function resetQuiz() {
  state.currentQuizIndex = 0;
  state.quizAnswered = false;
}

function render() {
  renderCountdown();
  renderOverviewStats();
  renderTopicList();
  renderTopicDetail();
  renderFlashcard();
  renderQuiz();
}

topicSearch.addEventListener("input", (event) => {
  state.search = event.target.value.trim();
  renderTopicList();
});

filterRow.addEventListener("click", (event) => {
  const button = event.target.closest("[data-filter]");
  if (!button) return;

  state.topicFilter = button.dataset.filter;
  document.querySelectorAll("[data-filter]").forEach((chip) => {
    chip.classList.toggle("active", chip.dataset.filter === state.topicFilter);
  });
  renderTopicList();
});

document.querySelector("#jump-to-active").addEventListener("click", () => {
  document.querySelector("#detail-panel").scrollIntoView({ behavior: "smooth", block: "start" });
});

document.querySelector("#draw-random-topic").addEventListener("click", () => {
  const randomTopic = topics[Math.floor(Math.random() * topics.length)];
  state.selectedTopicId = randomTopic.id;
  resetFlashcards();
  resetQuiz();
  render();
  document.querySelector("#detail-panel").scrollIntoView({ behavior: "smooth", block: "start" });
});

statusSelect.addEventListener("change", (event) => {
  setStatus(getActiveTopic().id, event.target.value);
});

notesArea.addEventListener("input", (event) => {
  setNotes(getActiveTopic().id, event.target.value);
});

flashcard.addEventListener("click", () => {
  state.flashcardFlipped = !state.flashcardFlipped;
  renderFlashcard();
});

document.querySelector("#flashcard-shuffle").addEventListener("click", shuffleFlashcards);
document.querySelector("#flashcard-skip").addEventListener("click", () => moveFlashcard(1));
document.querySelector("#mark-known").addEventListener("click", () => markFlashcard(true));
document.querySelector("#mark-unknown").addEventListener("click", () => markFlashcard(false));
document.querySelector("#next-question").addEventListener("click", nextQuizQuestion);

document.querySelectorAll("[data-quiz-mode]").forEach((button) => {
  button.addEventListener("click", () => {
    state.quizMode = button.dataset.quizMode;
    document.querySelectorAll("[data-quiz-mode]").forEach((item) => {
      item.classList.toggle("active", item.dataset.quizMode === state.quizMode);
    });
    resetQuiz();
    renderQuiz();
  });
});

quizFillSubmit.addEventListener("click", () => submitQuizAnswer(quizFillInput.value));
quizFillInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    submitQuizAnswer(quizFillInput.value);
  }
});

document.addEventListener("keydown", (event) => {
  if (
    document.activeElement === notesArea ||
    document.activeElement === topicSearch ||
    document.activeElement === quizFillInput
  ) {
    return;
  }

  if (event.code === "Space") {
    event.preventDefault();
    state.flashcardFlipped = !state.flashcardFlipped;
    renderFlashcard();
  } else if (event.key === "ArrowRight") {
    event.preventDefault();
    moveFlashcard(1);
  } else if (event.key === "ArrowLeft") {
    event.preventDefault();
    moveFlashcard(-1);
  } else if (event.key === "1") {
    event.preventDefault();
    markFlashcard(true);
  } else if (event.key === "2") {
    event.preventDefault();
    markFlashcard(false);
  }
});

render();
