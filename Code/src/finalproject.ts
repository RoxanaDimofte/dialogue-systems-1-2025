import { assign, createActor, setup } from "xstate";
import { Settings, speechstate } from "speechstate";
import { createBrowserInspector } from "@statelyai/inspect";
import { KEY } from "./azure";
import { DMContext, DMEvents } from "./typesfp";

const inspector = createBrowserInspector();

const azureCredentials = {
  endpoint:
    "https://northeurope.api.cognitive.microsoft.com/sts/v1.0/issuetoken",
  key: KEY,
}; 

const settings: Settings = { 
  azureCredentials: azureCredentials,
  azureRegion: "northeurope",
  asrDefaultCompleteTimeout: 0,
  asrDefaultNoInputTimeout: 5000,
  locale: "en-US",
  ttsDefaultVoice: "en-US-DavisNeural",
};

interface PERSON {
    name: string; 
    alive: boolean;
    age: number;
    gender: string;
    category: string; // that is, the profession
    nationality: string;
    eyeColour: string; 
    tall: boolean; // is your famous person tall?
    whitePerson: boolean;
    hairColour: string;
    playsInstruments: boolean;
    oscarWinner: boolean;
    GrammyAwards: boolean;
    soloArtist: boolean;
    importantFilms: boolean; // does your famous person play in important films?
    hasKids: boolean;
    nobelPrize: boolean;
    ballondOr: boolean;
}

// grammar of the celebrities and their correspondent attributes.

const people: PERSON[]=[
    {name: "Taylor Swift", alive: true, age: 34, gender: "woman", category: "singer", nationality: "american", eyeColour: "blue", tall: true, whitePerson: true, hairColour: "blonde", playsInstruments: true, GrammyAwards: true, oscarWinner: false, soloArtist: true, importantFilms: false, hasKids: false, nobelPrize: false, ballondOr: false},
    {name: "Harry Styles", alive: true, age: 31, gender: "man", category: "singer", nationality: "british", eyeColour: "green", tall: true, whitePerson: true, hairColour: "brunette", playsInstruments: true, GrammyAwards: true, oscarWinner: false, soloArtist: true, importantFilms: false, hasKids: false, nobelPrize: false, ballondOr: false},
    {name: "Cillian Murphy", alive: true, age: 48, gender: "man", category: "actor", nationality: "irish", eyeColour: "blue", tall: false, whitePerson: true, hairColour: "brunette", playsInstruments: true, GrammyAwards: false, oscarWinner: true, soloArtist: false, importantFilms: true, hasKids: true, nobelPrize: false, ballondOr: false},
    {name: "Angelina Jolie", alive: true, age: 49, gender: "woman", category: "actor", nationality: "american", eyeColour: "blue", tall: true, whitePerson: true, hairColour: "blonde", playsInstruments: false, GrammyAwards: false, oscarWinner: true, soloArtist: false, importantFilms: true, hasKids: true, nobelPrize: false, ballondOr: false},
    {name: "Greta Thungberg", alive: true, age: 22, gender: "woman", category: "activist", nationality: "swedish", eyeColour: "blue", tall: false, whitePerson: true, hairColour: "blonde", playsInstruments: false, GrammyAwards: false, oscarWinner: false, soloArtist: false, importantFilms: false, hasKids: false, nobelPrize: false, ballondOr: false},
    {name: "Michael Jackson", alive: false, age: 50, gender: "man", category: "singer", nationality: "american", eyeColour: "brown", tall: true, whitePerson: false, hairColour: "black", playsInstruments: true, GrammyAwards: true, oscarWinner: false, soloArtist: true, importantFilms: false, hasKids: true, nobelPrize: false, ballondOr: false},
    {name: "Whitney Houston", alive: false, age: 48, gender: "woman", category: "singer", nationality: "american", eyeColour: "brown", tall: true, whitePerson: false, hairColour: "brunette", playsInstruments: true, GrammyAwards: true, oscarWinner: false, soloArtist: true, importantFilms: false, hasKids: true, nobelPrize: false, ballondOr: false},
    {name: "Cristiano Ronaldo", alive: true, age: 40, gender: "man", category: "athlete", nationality: "portuguese", eyeColour: "brown", tall: true, whitePerson: true, hairColour: "brunette", playsInstruments: false, GrammyAwards: false, oscarWinner: false, soloArtist: false, importantFilms: false, hasKids: true, nobelPrize: false, ballondOr: true},
    {name: "Justin Bieber", alive: true, age: 31, gender: "man", category: "singer", nationality: "canadian", eyeColour: "brown", tall: true, whitePerson: true, hairColour: "blonde", playsInstruments: true, GrammyAwards: true, oscarWinner: false, soloArtist: true, importantFilms: false, hasKids: true, nobelPrize: false, ballondOr: false},
    {name: "Albert Einstein", alive: false, age: 76, gender: "man", category: "scientist", nationality: "german", eyeColour: "brown", tall: false, whitePerson: true, hairColour: "gray", playsInstruments: false, GrammyAwards: false, oscarWinner: false, soloArtist: false, importantFilms: false, hasKids: true, nobelPrize: true, ballondOr: false},
]

const affirmativeResponses = ["yes", "affirmative", "yeah", "I think so", "sure", "aha", "Probably", "Maybe"];
const negativeResponses = ["no", "negative", "nah", "I don't think so", "nope", "neh", "I don't know", "I'm not sure"];
/*'Probably' and 'maybe', pragmatically speaking, can be considered an affirmative response due to their positives nuances. 
 'I don't know' and 'I'm not sure' have more negative connotations.*/

const genderFamousPerson = ["woman", "man", "non-binary"];
const categoryFamousPerson = ["singer", "actor", "athlete", "activist", "scientist"];
const nationalityFamousPerson = ["american", "canadian", "swedish", "british", "german", "portuguese", "irish"];
const eyecolourFamousPerson = ["blue", "brown", "green", "blue eyes", "brown eyes", "green eyes"];
const haircolourFamousPerson = [ "blonde", "brunette", "black", "gray", "blonde hair", "black hair", "gray hair"];
const ageFamousPerson= [20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 60, 76];

// all necessary functions

function isAffirmative(utterance: string) {
    return affirmativeResponses.includes(utterance.toLowerCase());
  }
  
function isNegative(utterance: string) {
    return negativeResponses.includes(utterance.toLowerCase());
  }

function isGender(utterance: string){
    return genderFamousPerson.includes(utterance.toLowerCase());
}

function isCategory(utterance: string){
    return categoryFamousPerson.includes(utterance.toLowerCase());
}

function isNationality(utterance: string){
  return nationalityFamousPerson.includes(utterance.toLowerCase());
}

function getEyeColour(utterance: string){
    return eyecolourFamousPerson.includes(utterance.toLowerCase());
}

function getHairColour(utterance: string){
    return haircolourFamousPerson.includes(utterance.toLowerCase());
}

function getAge(utterance: string): boolean {
  const age = parseInt(utterance, 10); // parseInt() parses a string and return an integer
  return !isNaN(age) && ageFamousPerson.includes(age);
}

// function that tracks all the user's answers in order to get the correct guess

function makeGuess(answers: Partial<PERSON>): string | null {
    for (let i = 0; i < people.length; i++) {
        let match = true;
        for (const key in answers) {
            if (key != "name" && answers[key as keyof PERSON] !== people[i][key as keyof PERSON]) {
                match = false;
                console.log(key, people[i].name)
            }
        }
        if (match) {
            return people[i].name; 
        }
    }
    return "Unknown!"; 
}

const dmMachine = setup({
  types: {
    /** you might need to extend these */
    context: {} as DMContext,
    events: {} as DMEvents,
  },
  actions: {
    /** define your actions here */
    "spst.speak": ({ context }, params: { utterance: string }) =>
      context.spstRef.send({
        type: "SPEAK",
        value: {
          utterance: params.utterance,
        },
      }),
    "spst.listen": ({ context }) =>
      context.spstRef.send({
        type: "LISTEN",
      }),
  },
}).createMachine({
  context: ({ spawn }) => ({
    spstRef: spawn(speechstate, { input: settings }),
    lastResult: null,
    gender: "", 
    category: "", 
    nationality: "", 
    context: null,
    name: "", 
    alive: false,
    eyecolour:"",
    haircolour:"",
    GrammyAwards: false,
    OscarAwards: false,
    whitePerson: false,
    age: 0,
    tall: false,
    soloArtist: false,
    instruments:false,
    BallondOr: false,
    NobelPrize: false,
    importantFilm: false,
    hasKids: false,
   }), 

   id: "DM",
    initial: "Prepare",
    states: {
      Prepare: {
        entry: ({ context }) => context.spstRef.send({ type: "PREPARE" }),
        on: { ASRTTS_READY: "WaitToStart" },
      },
      WaitToStart: {
        on: { CLICK: "Greeting" },
      },
      Greeting: {
        entry: {type: "spst.speak", params: {utterance: "Hello! Let's play Guess the Celebrity!"}},
        on: {SPEAK_COMPLETE: "AskUser"},
      },
  
      AskUser: {
        initial: "Prompt",
        on: {
          LISTEN_COMPLETE: [
            {
              target: "ProcessUser",
              guard: ({ context }) => !!context.lastResult,
            },
            { target: ".NoInput" },
          ],
        },
        states: {
          Prompt: {
            entry: { type: "spst.speak", params: { utterance: "Do you want to play?" } },
            on: { SPEAK_COMPLETE: "Listen" },
          },
          NoInput: {
            entry: {
              type: "spst.speak",
              params: { utterance: "I can't hear you!" },
            },
            on: { SPEAK_COMPLETE: "Listen" },
          },
          Listen: {
            entry: { type: "spst.listen" },
            on: {
              RECOGNISED: {
                actions: assign(({ event })=> ({lastResult: 
                  event.value})),
              },
              ASR_NOINPUT: {
                actions: assign({ lastResult: null }),
              },
            },
          },
        },
      },
      ProcessUser: {
        always: [
            {
              guard: ({ context }) => isAffirmative(context.lastResult![0].utterance),
              target: "NextQuestionAlive",
            },
            {
              guard: ({ context }) => isNegative(context.lastResult![0].utterance),
              target: "#EndOfGame",
            },
            { target: "NextQuestionAlive.Prompt" },
          ],
        },
      NextQuestionAlive: {
        initial: "Prompt",
        on: {
          LISTEN_COMPLETE: [
            {
            target: "ProcessNextQuestionAlive",
            guard: ({context}) => !!context.lastResult,
            },
            {target: ".NoInput"},
          ],
        },
        states: {
          Prompt: {
            entry: {type: "spst.speak", params: {utterance: "Is your celebrity alive?" }},
            on: {SPEAK_COMPLETE: "Listen"},  
          },
          NoInput: {
            entry: {type: "spst.speak", params: {utterance: "Can you repeat?"}},
            on: {SPEAK_COMPLETE: "Listen"},
          },
          Listen: {
            entry: {type: "spst.listen"},
            on: {
              RECOGNISED: {
                actions: assign(({event})=>({lastResult: event.value})),
              },
              ASR_NOINPUT: {
                actions: assign({lastResult: null}),
              },
            },
          },
        },
      },
      ProcessNextQuestionAlive: {   
        always: [
        {
          guard: ({ context }) => isAffirmative(context.lastResult![0].utterance),
          actions: assign({alive: true}),
          target: "NextQuestionGender",
        },
        {
          guard: ({ context }) => isNegative(context.lastResult![0].utterance),
          actions: assign({alive: false}),
          target: "NextQuestionGender",
        },
        { target: "NextQuestionGender.Prompt" },
      ],
    },
      NextQuestionGender: {
        initial: "Prompt",
        on: {
          LISTEN_COMPLETE: [
            {
              target: "ProcessNextQuestionGender",
              guard: ({context})=> !!context.lastResult,
            },
            {target: ".NoInput"},
          ],
        },
        states: {
          Prompt: {
            entry: { type: "spst.speak", params: {utterance: "What gender is your celebrity?"} },
            on: {SPEAK_COMPLETE: "Listen"},
          },
          NoInput: {
            entry: {type: "spst.speak", params: {utterance: "Can you repeat?"}},
            on: {SPEAK_COMPLETE: "Listen"},
          },
          Listen: {
            entry: {type: "spst.listen"},
            on: {
              RECOGNISED: {
                actions: assign(({event})=> ({lastResult: event.value})),
              },
              ASR_NOINPUT: {
                actions: assign({lastResult: null}),
              },
            },
          },
        },
      },
      ProcessNextQuestionGender: {
        always: [
          {
            guard: ({context})=> isGender(context.lastResult![0].utterance),
            actions: assign(({context})=> ({ gender: context.lastResult![0].utterance.toLowerCase() })),
            target: "NextQuestionNationality",
          },
          { target: "NextQuestionGender.Prompt"},
        ],
      },
      NextQuestionNationality: {
        initial: "Prompt",
        on: {
          LISTEN_COMPLETE: [
            {
              target: "ProcessNextQuestionNationality",
              guard: ({context}) => !!context.lastResult,
            },
            {target: ".NoInput"},
          ],
        },
        states: {
          Prompt: {
            entry: {type: "spst.speak", params:{utterance: "What nationality is your celebrity?"}},
            on: {SPEAK_COMPLETE: "Listen"},  
          },
          NoInput: {
            entry: {type: "spst.speak", params: {utterance: "Can you repeat?"}},
            on: {SPEAK_COMPLETE: "Listen"},
          },
          Listen: {
            entry: {type: "spst.listen"},
            on: {
              RECOGNISED: {
                actions: assign(({event})=>({lastResult: event.value})),
              },
              ASR_NOINPUT: {
                actions: assign({lastResult: null}),
              },
            },
          },
        },
      },
      ProcessNextQuestionNationality: {
        always: [
          {
            guard: ({context})=> isNationality(context.lastResult![0].utterance),
            actions: assign(({context})=> ({ nationality: context.lastResult![0].utterance.toLowerCase() })),
            target: "NextQuestionEyeColour",
          },
          { target: "NextQuestionNationality.Prompt"},
        ],
      },
      NextQuestionEyeColour: {
        initial: "Prompt",
        on: {
          LISTEN_COMPLETE: [
            {
              target: "ProcessNextQuestionEyeColour",
              guard: ({context}) => !!context.lastResult,
            },
            {target: ".NoInput"},
          ],
        },
        states: {
          Prompt: {
            entry: {type: "spst.speak", params:{utterance: "What colour are their eyes?"}},
            on: {SPEAK_COMPLETE: "Listen"},  
          },
          NoInput: {
            entry: {type: "spst.speak", params: {utterance: "Can you repeat?"}},
            on: {SPEAK_COMPLETE: "Listen"},
          },
          Listen: {
            entry: {type: "spst.listen"},
            on: {
              RECOGNISED: {
                actions: assign(({event})=>({lastResult: event.value})),
              },
              ASR_NOINPUT: {
                actions: assign({lastResult: null}),
              },
            },
          },
        },
      },
      ProcessNextQuestionEyeColour: {
        always: [
          {
            guard: ({context})=> getEyeColour(context.lastResult![0].utterance),
            actions: assign(({context})=> ({ eyecolour: context.lastResult![0].utterance.toLowerCase() })),
            target: "NextQuestionHairColour",
          },
          { target: "NextQuestionEyeColour.Prompt"},
        ],
      },
      NextQuestionHairColour: {
        initial: "Prompt",
        on: {
          LISTEN_COMPLETE: [
            {
              target: "ProcessNextQuestionHairColour",
              guard: ({context}) => !!context.lastResult,
            },
            {target: ".NoInput"},
          ],
        },
        states: {
          Prompt: {
            entry: {type: "spst.speak", params:{utterance: "What colour is their hair?"}},
            on: {SPEAK_COMPLETE: "Listen"},  
          },
          NoInput: {
            entry: {type: "spst.speak", params: {utterance: "Can you repeat?"}},
            on: {SPEAK_COMPLETE: "Listen"},
          },
          Listen: {
            entry: {type: "spst.listen"},
            on: {
              RECOGNISED: {
                actions: assign(({event})=>({lastResult: event.value})),
              },
              ASR_NOINPUT: {
                actions: assign({lastResult: null}),
              },
            },
          },
        },
      },
      ProcessNextQuestionHairColour: {
        always: [
          {
            guard: ({context})=> getHairColour(context.lastResult![0].utterance),
            actions: assign(({context})=> ({ haircolour: context.lastResult![0].utterance.toLowerCase() })),
            target: "NextQuestionHeight",
          },
          { target: "NextQuestionHairColour.Prompt"},
        ],
      },
      NextQuestionHeight: {
        initial: "Prompt",
        on: {
          LISTEN_COMPLETE: [
            {
              target: "ProcessNextQuestionHeight",
              guard: ({context}) => !!context.lastResult,
            },
            {target: ".NoInput"},
          ],
        },
        states: {
          Prompt: {
            entry: {type: "spst.speak", params:{utterance: "Is your celebrity tall?"}},
            on: {SPEAK_COMPLETE: "Listen"},  
          },
          NoInput: {
            entry: {type: "spst.speak", params: {utterance: "Can you repeat?"}},
            on: {SPEAK_COMPLETE: "Listen"},
          },
          Listen: {
            entry: {type: "spst.listen"},
            on: {
              RECOGNISED: {
                actions: assign(({event})=>({lastResult: event.value})),
              },
              ASR_NOINPUT: {
                actions: assign({lastResult: null}),
              },
            },
          },
        },
      },
      ProcessNextQuestionHeight: {
        always: [
            {
              guard: ({ context }) => isAffirmative(context.lastResult![0].utterance),
              actions: assign({tall: true}),
              target: "NextQuestionWhitePerson",
            },
            {
              guard: ({ context }) => isNegative(context.lastResult![0].utterance),
              actions: assign({tall: false}),
              target: "NextQuestionWhitePerson",
            },
          { target: "NextQuestionHeight.Prompt"},
        ],
      },
      NextQuestionWhitePerson: {
        initial: "Prompt",
        on: {
          LISTEN_COMPLETE: [
            {
              target: "ProcessNextQuestionWhitePerson",
              guard: ({context}) => !!context.lastResult,
            },
            {target: ".NoInput"},
          ],
        },
        states: {
          Prompt: {
            entry: {type: "spst.speak", params:{utterance: "Is your celebrity a white person?"}},
            on: {SPEAK_COMPLETE: "Listen"},  
          },
          NoInput: {
            entry: {type: "spst.speak", params: {utterance: "Can you repeat?"}},
            on: {SPEAK_COMPLETE: "Listen"},
          },
          Listen: {
            entry: {type: "spst.listen"},
            on: {
              RECOGNISED: {
                actions: assign(({event})=>({lastResult: event.value})),
              },
              ASR_NOINPUT: {
                actions: assign({lastResult: null}),
              },
            },
          },
        },
      },
      ProcessNextQuestionWhitePerson: {
        always: [
            {
              guard: ({ context }) => isAffirmative(context.lastResult![0].utterance),
              actions: assign({whitePerson: true}),
              target: "NextQuestionAge",
            },
            {
              guard: ({ context }) => isNegative(context.lastResult![0].utterance),
              actions: assign({whitePerson: false}),
              target: "NextQuestionAge",
            },
          { target: "NextQuestionWhitePerson.Prompt"},
        ],
      },
      NextQuestionAge: {
        initial: "Prompt",
        on: {
          LISTEN_COMPLETE: [
            {
              target: "ProcessNextQuestionAge",
              guard: ({context}) => !!context.lastResult,
            },
            {target: ".NoInput"},
          ],
        },
        states: {
          Prompt: {
            entry: {type: "spst.speak", params:{utterance: "How old is your celebrity?"}},
            on: {SPEAK_COMPLETE: "Listen"},  
          },
          NoInput: {
            entry: {type: "spst.speak", params: {utterance: "Can you repeat?"}},
            on: {SPEAK_COMPLETE: "Listen"},
          },
          Listen: {
            entry: {type: "spst.listen"},
            on: {
              RECOGNISED: {
                actions: assign(({event})=>({lastResult: event.value})),
              },
              ASR_NOINPUT: {
                actions: assign({lastResult: null}),
              },
            },
          },
        },
      },
      ProcessNextQuestionAge: {
        always: [
            {
                guard: ({context})=> getAge(context.lastResult![0].utterance),
                actions: assign(({context})=> ({age: parseInt(context.lastResult![0].utterance) })),
                target: "NextQuestionKids",
              },
          { target: "NextQuestionAge.Prompt"},
        ],
      }, 
      NextQuestionKids: {
        initial: "Prompt",
        on: {
          LISTEN_COMPLETE: [
            {
              target: "ProcessNextQuestionKids",
              guard: ({context}) => !!context.lastResult,
            },
            {target: ".NoInput"},
          ],
        },
        states: {
          Prompt: {
            entry: {type: "spst.speak", params:{utterance: "Does your celebrity have kids?"}},
            on: {SPEAK_COMPLETE: "Listen"},  
          },
          NoInput: {
            entry: {type: "spst.speak", params: {utterance: "Can you repeat?"}},
            on: {SPEAK_COMPLETE: "Listen"},
          },
          Listen: {
            entry: {type: "spst.listen"},
            on: {
              RECOGNISED: {
                actions: assign(({event})=>({lastResult: event.value})),
              },
              ASR_NOINPUT: {
                actions: assign({lastResult: null}),
              },
            },
          },
        },
      },
      ProcessNextQuestionKids: {
        always: [
            {
              guard: ({ context }) => isAffirmative(context.lastResult![0].utterance),
              actions: assign({hasKids: true}),
              target: "#NextQuestionCategory",
            },
            {
              guard: ({ context }) => isNegative(context.lastResult![0].utterance),
              actions: assign({hasKids: false}),
              target: "#NextQuestionCategory",
            },
          { target: "NextQuestionKids.Prompt"},
        ],
      },
      NextQuestionCategory: {
        id: "NextQuestionCategory",
        initial: "Prompt",
        on: {
          LISTEN_COMPLETE: [
            {
              target: "ProcessNextQuestionCategory",
              guard: ({context})=> !!context.lastResult,
            },
            {target: ".NoInput"},
          ],
        },
        states: {
          Prompt: {
            entry: { type: "spst.speak", params: {utterance: "In what category does your celebrity fit in?"} },
            on: {SPEAK_COMPLETE: "Listen"},
          },
          NoInput: {
            entry: {type: "spst.speak", params: {utterance: "Can you repeat?"}},
            on: {SPEAK_COMPLETE: "Listen"},
          },
          Listen: {
            entry: {type: "spst.listen"},
            on: {
              RECOGNISED: {
                actions: assign(({event})=> ({lastResult: event.value})),
              },
              ASR_NOINPUT: {
                actions: assign({lastResult: null}),
              },
            },
          },
        },
      },
      ProcessNextQuestionCategory: {
        always: [ // when specifying the category, the machine does not go over all the questions since many of them do not apply to other categories
          {
            guard: ({ context }) => context.lastResult && context.lastResult[0] && context.lastResult[0].utterance.toLowerCase()==="singer",
            actions: assign(({context}) => ({category: context.lastResult![0].utterance.toLowerCase()})),
            target: "GrammyAwards",
          },
          {
            guard: ({ context }) => context.lastResult && context.lastResult[0] && context.lastResult[0].utterance.toLowerCase()==="actor",
            actions: assign (({context})=> ({category: context.lastResult![0].utterance.toLowerCase()})),
            target: "OscarAwards",
          },
          {
            guard: ({context}) => context.lastResult && context.lastResult[0] && context.lastResult[0].utterance.toLowerCase()==="athlete",
            actions: assign(({context})=> ({category: context.lastResult![0].utterance.toLowerCase()})),
            target: "BallondOr",
          },
          {
            guard: ({context}) => context.lastResult && context.lastResult[0] && context.lastResult[0].utterance.toLowerCase()==="scientist",
            actions: assign(({context})=> ({category: context.lastResult![0].utterance.toLowerCase()})),
            target: "NobelPrize",
          },
          {
            guard: ({context}) => context.lastResult && context.lastResult[0] && context.lastResult[0].utterance.toLowerCase()==="activist",
            actions: assign(({context})=> ({category: context.lastResult![0].utterance.toLowerCase()})),
            target: "NobelPrize",
          },
          { target: "NextQuestionCategory.Prompt"}
        ],
      },
      GrammyAwards: {
        initial: "Prompt",
        on: {
          LISTEN_COMPLETE: [
            {
              target: "ProcessGrammyAwards",
              guard: ({context}) => !!context.lastResult,
            },
            {target: ".NoInput"},
          ],
        },
        states: {
          Prompt: {
            entry: {type: "spst.speak", params:{utterance: "Has your celebrity ever won Grammys?"}},
            on: {SPEAK_COMPLETE: "Listen"},  
          },
          NoInput: {
            entry: {type: "spst.speak", params: {utterance: "Can you repeat?"}},
            on: {SPEAK_COMPLETE: "Listen"},
          },
          Listen: {
            entry: {type: "spst.listen"},
            on: {
              RECOGNISED: {
                actions: assign(({event})=>({lastResult: event.value})),
              },
              ASR_NOINPUT: {
                actions: assign({lastResult: null}),
              },
            },
          },
        },
      },
      ProcessGrammyAwards: {
        always: [
            {
              guard: ({ context }) => isAffirmative(context.lastResult![0].utterance),
              actions: assign({GrammyAwards: true}),
              target: "NextQuestionSoloArtist",
            },
            {
              guard: ({ context }) => isNegative(context.lastResult![0].utterance),
              actions: assign({GrammyAwards: false}),
              target: "NextQuestionSoloArtist",
            },
          { target: "GrammyAwards.Prompt"},
        ],
      },
      NextQuestionSoloArtist: {
        initial: "Prompt",
        on: {
          LISTEN_COMPLETE: [
            {
              target: "ProcessNextQuestionSoloArtist",
              guard: ({context}) => !!context.lastResult,
            },
            {target: ".NoInput"},
          ],
        },
        states: {
          Prompt: {
            entry: {type: "spst.speak", params:{utterance: "Is your celebrity a solo artist?"}},
            on: {SPEAK_COMPLETE: "Listen"},  
          },
          NoInput: {
            entry: {type: "spst.speak", params: {utterance: "Can you repeat?"}},
            on: {SPEAK_COMPLETE: "Listen"},
          },
          Listen: {
            entry: {type: "spst.listen"},
            on: {
              RECOGNISED: {
                actions: assign(({event})=>({lastResult: event.value})),
              },
              ASR_NOINPUT: {
                actions: assign({lastResult: null}),
              },
            },
          },
        },
      },
      ProcessNextQuestionSoloArtist: {
        always: [
            {
              guard: ({ context }) => isAffirmative(context.lastResult![0].utterance),
              actions: assign({soloArtist: true}),
              target: "#NextQuestionPlaysInstrument",//modify
            },
            {
              guard: ({ context }) => isNegative(context.lastResult![0].utterance),
              actions: assign({soloArtist: false}),
              target: "#NextQuestionPlaysInstrument", //modify
            },
          { target: "NextQuestionSoloArtist.Prompt"},
        ],
      },
      NextQuestionPlaysInstrument: {
        id: "NextQuestionPlaysInstrument",
        initial: "Prompt",
        on: {
          LISTEN_COMPLETE: [
            {
              target: "ProcessNextQuestionPlaysInstrument",
              guard: ({context}) => !!context.lastResult,
            },
            {target: ".NoInput"},
          ],
        },
        states: {
          Prompt: {
            entry: {type: "spst.speak", params:{utterance: "Does your celebrity play any instruments?"}},
            on: {SPEAK_COMPLETE: "Listen"},  
          },
          NoInput: {
            entry: {type: "spst.speak", params: {utterance: "Can you repeat?"}},
            on: {SPEAK_COMPLETE: "Listen"},
          },
          Listen: {
            entry: {type: "spst.listen"},
            on: {
              RECOGNISED: {
                actions: assign(({event})=>({lastResult: event.value})),
              },
              ASR_NOINPUT: {
                actions: assign({lastResult: null}),
              },
            },
          },
        },
      },
      ProcessNextQuestionPlaysInstrument: {
        always: [
            {
              guard: ({ context }) => isAffirmative(context.lastResult![0].utterance),
              actions: assign({instruments: true}),
              target: "TryMakeGuess",
            },
            {
              guard: ({ context }) => isNegative(context.lastResult![0].utterance),
              actions: assign({instruments: false}),
              target: "TryMakeGuess",
            },
          { target: "NextQuestionPlaysInstrument.Prompt"},
        ],
      },
      OscarAwards: {
        initial: "Prompt",
        on: {
          LISTEN_COMPLETE: [
            {
              target: "ProcessOscarAwards",
              guard: ({context}) => !!context.lastResult,
            },
            {target: ".NoInput"},
          ],
        },
        states: {
          Prompt: {
            entry: {type: "spst.speak", params:{utterance: "Has your celebrity ever won an Oscar?"}},
            on: {SPEAK_COMPLETE: "Listen"},  
          },
          NoInput: {
            entry: {type: "spst.speak", params: {utterance: "Can you repeat?"}},
            on: {SPEAK_COMPLETE: "Listen"},
          },
          Listen: {
            entry: {type: "spst.listen"},
            on: {
              RECOGNISED: {
                actions: assign(({event})=>({lastResult: event.value})),
              },
              ASR_NOINPUT: {
                actions: assign({lastResult: null}),
              },
            },
          },
        },
      },
      ProcessOscarAwards: {
        always: [
            {
              guard: ({ context }) => isAffirmative(context.lastResult![0].utterance),
              actions: assign({OscarAwards: true}),
              target: "NextQuestionImportantFilm",
            },
            {
              guard: ({ context }) => isNegative(context.lastResult![0].utterance),
              actions: assign({OscarAwards: false}),
              target: "NextQuestionImportantFilm",
            },
          { target: "OscarAwards.Prompt"},
        ],
      },
      NextQuestionImportantFilm: {
        initial: "Prompt",
        on: {
          LISTEN_COMPLETE: [
            {
              target: "ProcessNextQuestionImportantFilm",
              guard: ({context}) => !!context.lastResult,
            },
            {target: ".NoInput"},
          ],
        },
        states: {
          Prompt: {
            entry: {type: "spst.speak", params:{utterance: "Has your celebrity played in an important film?"}},
            on: {SPEAK_COMPLETE: "Listen"},  
          },
          NoInput: {
            entry: {type: "spst.speak", params: {utterance: "Can you repeat?"}},
            on: {SPEAK_COMPLETE: "Listen"},
          },
          Listen: {
            entry: {type: "spst.listen"},
            on: {
              RECOGNISED: {
                actions: assign(({event})=>({lastResult: event.value})),
              },
              ASR_NOINPUT: {
                actions: assign({lastResult: null}),
              },
            },
          },
        },
      },
      ProcessNextQuestionImportantFilm: {
        always: [
            {
              guard: ({ context }) => isAffirmative(context.lastResult![0].utterance),
              actions: assign({importantFilm: true}),
              target: "TryMakeGuess",
            },
            {
              guard: ({ context }) => isNegative(context.lastResult![0].utterance),
              actions: assign({importantFilm: false}),
              target: "TryMakeGuess", 
            },
          { target: "NextQuestionImportantFilm.Prompt"},
        ],
      },
      BallondOr: {
        initial: "Prompt",
        on: {
          LISTEN_COMPLETE: [
            {
              target: "ProcessBallondOr",
              guard: ({context}) => !!context.lastResult,
            },
            {target: ".NoInput"},
          ],
        },
        states: {
          Prompt: {
            entry: {type: "spst.speak", params:{utterance: "Has your celebrity won a Ballon d'Or?"}},
            on: {SPEAK_COMPLETE: "Listen"},  
          },
          NoInput: {
            entry: {type: "spst.speak", params: {utterance: "Can you repeat?"}},
            on: {SPEAK_COMPLETE: "Listen"},
          },
          Listen: {
            entry: {type: "spst.listen"},
            on: {
              RECOGNISED: {
                actions: assign(({event})=>({lastResult: event.value})),
              },
              ASR_NOINPUT: {
                actions: assign({lastResult: null}),
              },
            },
          },
        },
      },
      ProcessBallondOr: {
        always: [
            {
              guard: ({ context }) => isAffirmative(context.lastResult![0].utterance),
              actions: assign({BallondOr: true}),
              target: "TryMakeGuess",
            },
            {
              guard: ({ context }) => isNegative(context.lastResult![0].utterance),
              actions: assign({BallondOr: false}),
              target: "TryMakeGuess",
            },
          { target: "BallondOr.Prompt"},
        ],
      },
      NobelPrize: {
        initial: "Prompt",
        on: {
          LISTEN_COMPLETE: [
            {
              target: "ProcessNobelPrize",
              guard: ({context}) => !!context.lastResult,
            },
            {target: ".NoInput"},
          ],
        },
        states: {
          Prompt: {
            entry: {type: "spst.speak", params:{utterance: "Has your celebrity won a Nobel Prize?"}},
            on: {SPEAK_COMPLETE: "Listen"},  
          },
          NoInput: {
            entry: {type: "spst.speak", params: {utterance: "Can you repeat?"}},
            on: {SPEAK_COMPLETE: "Listen"},
          },
          Listen: {
            entry: {type: "spst.listen"},
            on: {
              RECOGNISED: {
                actions: assign(({event})=>({lastResult: event.value})),
              },
              ASR_NOINPUT: {
                actions: assign({lastResult: null}),
              },
            },
          },
        },
      },
      ProcessNobelPrize: {
        always: [
            {
              guard: ({ context }) => isAffirmative(context.lastResult![0].utterance),
              actions: assign({NobelPrize: true}),
              target: "TryMakeGuess",
            },
            {
              guard: ({ context }) => isNegative(context.lastResult![0].utterance),
              actions: assign({NobelPrize: false}),
              target: "TryMakeGuess",
            },
          { target: "NobelPrize.Prompt"},
        ],
      },
      TryMakeGuess: {
        id: "TryMakeGuess",
        initial: "Prompt",
        on: {
          LISTEN_COMPLETE: [
            {
              target: "ProcessTryMakeGuess",
              guard: ({context}) => !!context.lastResult,
            },
            {target: ".NoInput"},
          ],
        },
        states: {
          Prompt: { //the function is called
            entry: {type: "spst.speak", params: ({context}) => ({utterance:`Is your celebrity ${makeGuess({gender: context.gender, nationality: context.nationality, alive: context.alive, age: context.age, category: context.category, eyeColour: context.eyecolour,
              tall: context.tall, hairColour:context.haircolour, playsInstruments: context.instruments,  GrammyAwards: context.GrammyAwards, oscarWinner: context.OscarAwards, soloArtist: context.soloArtist, hasKids: context.hasKids, importantFilms: context.importantFilm,
              nobelPrize: context.NobelPrize, ballondOr: context.BallondOr, name: context.name})}?`})}, 
            on: {SPEAK_COMPLETE: "Listen"},  
          },
          NoInput: {
            entry: {type: "spst.speak", params: {utterance: "Can you repeat?"}},
            on: {SPEAK_COMPLETE: "Listen"},
          },
          Listen: {
            entry: {type: "spst.listen"},
            on: {
              RECOGNISED: {
                actions: assign(({event})=>({lastResult: event.value})),
              },
              ASR_NOINPUT: {
                actions: assign({lastResult: null}),
              },
            },
          },
        },
      },
      ProcessTryMakeGuess: {
        always: [
            {
              guard: ({ context }) => isAffirmative(context.lastResult![0].utterance),
              target: "#EndOfGame",
            },
            {
              guard: ({ context }) => isNegative(context.lastResult![0].utterance),
              target: "#GameOver",
            }, // a counter could be added in order for the machine to make a new guess if the data set was bigger.
        ],
      },
      GameoOver:{
        id: "GameOver",
        entry: {
          type: "spst.speak",
          params: {
            utterance: `Sorry! I could not guess correctly. Maybe next time!`,
          },
        },
        on: { SPEAK_COMPLETE: "Done"},
      },
      EndOfGame: {
        id: "EndOfGame",
        entry: {
          type: "spst.speak",
          params: {
            utterance: `Great! Thank you for playing!`,
          },
        },
        on: { SPEAK_COMPLETE: "Done" },
      },
      Done: {
        on: {
          CLICK: "Greeting",
        },
      },
    },
  });
  //
  const dmActor = createActor(dmMachine, {
    inspect: inspector.inspect,
  }).start();
  
  dmActor.subscribe((state) => {
    console.group("State update");
    console.log("State value:", state.value);
    console.log("State context:", state.context);
    console.groupEnd();
  });
  
  export function setupButton(element: HTMLButtonElement) {
    element.addEventListener("click", () => {
      dmActor.send({ type: "CLICK" });
    });
    dmActor.subscribe((snapshot) => {
      const meta: { view?: string } = Object.values(
        snapshot.context.spstRef.getSnapshot().getMeta(),
      )[0] || {
        view: undefined,
      };
      element.innerHTML = `${meta.view}`;
    });
  }
