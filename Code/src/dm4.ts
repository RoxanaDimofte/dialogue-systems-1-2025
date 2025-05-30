import { assign, createActor, setup } from "xstate";
import { Settings, speechstate } from "speechstate";
import { createBrowserInspector } from "@statelyai/inspect";
import { KEY } from "./azure";
import { NLU_KEY } from "./azure"
import { DMContext, DMEvents } from "./types";

const inspector = createBrowserInspector();


const azureLanguageCredentials = {
  endpoint: "https://language-resource4720.cognitiveservices.azure.com/language/:analyze-conversations?api-version=2024-11-15-preview",
  key: NLU_KEY, 
  deploymentName: "appointment",
  projectName: "appointment1",
};

const azureCredentials = {
  endpoint:
    "https://northeurope.api.cognitive.microsoft.com/sts/v1.0/issuetoken",
  key: KEY,
};

const settings: Settings = {
  azureLanguageCredentials: azureLanguageCredentials /** global activation of NLU */,
  azureCredentials: azureCredentials,
  azureRegion: "northeurope",
  asrDefaultCompleteTimeout: 0,
  asrDefaultNoInputTimeout: 5000,
  locale: "en-GB",
  ttsDefaultVoice: "en-US-DavisNeural",
};

interface YesNoEntry {
  yes?: string;
  no?: string;
}
//const affirmativeAnswers = ["yes", "sure", "affirmative", "yeah", "right"]
//const negativeAnswers = ["no", "negative", "nope", "wrong"]

const YesNo: {[index: string]: YesNoEntry} = {
  yes: {yes: "yes"},
  sure: {yes: "sure"},
  right: {yes: "right"},
  no: {no: "no"},
  nope: {no: "nope"},
  wrong: {no: "wrong"},
}
//const famousPeople: = {
//  "taylor swift": "She is one of the most famous singers in the world. From 2023 to 2024 she was on tour.",
//  "harry styles": "This incredible singer should stop walking around Italy and drop an album!"
//}

const isAffirmative = (utterance: string): boolean => {
  return utterance in YesNo && !!YesNo[utterance].yes;
};
const isNegative = (utterance: string): boolean => {
    return utterance in YesNo && !!YesNo[utterance].no;
};

interface information {
  information?: string;
  name?: string;
}

const famousPeople: {[index: string]: information} = {
  taylor : {name: "taylor swift", information: "She is one of the most famous singers in the world. From 2023 to 2024 she was on a world tour, being one of the events that gathered a record number of people."},
  harry : {name: "harry styles", information:"This incredible singer, former member of the British band One Direction, should stop walking around Italy and drop an album since the last one was in 2022."},
  gaga: {name:"lady gaga" , information: "Lady Gaga is an American singer that recently dropped an album that reminds listeners of the early years in her career. She performed live in Brazil for nearly two million people, breaking a world record "},
  justin: {name: "justin bieber", information: "He is a Canadian singer and song writer that gained fame when he was very young. He's first single 'Baby' is one of the most known songs worldwide."},
  louis: {name: "louis tomlinson", information: "Just like Harry Styles, he is a former member of One Direction. He started to get more popularity back in 2022 when he dropped his second album 'Faith in the Future'. As for now, he will be performing at different festivals during the summer."},
  orlando: {name: "orlando bloom", information: "A British actor that is popular for being one of the main characters in 'Pirates of the Caribbean', but also as the one who played Legolas in 'The Lord of the Rings'. He is married to Katy Perry."},
  michael: {name: "michael jackson", information: "An African-American singer that was known as the king of Pop from the late 1990s to the early 2000s. One of his most known songs is 'Thriller', which is featured also in the 'Just Dance' Wii video game. He tragically passed away in 2009."},
  nadia: {name: "nadia comaneci", information: "Romanian gymnast that currently lives in Canada. She was the first in the Olympics history to get a perfect 10 grade in gymnastics, in 1976, in Montreal."},
  loreen: {name: "loreen", information: "Swedish singer that participated in Eurovision twice, the first time in 2012 and the second time in 2023. In both occasions she brought the contest to Sweden, being the first woman to achieve it."},
  charli: {name: "charli xcx", information: "British singer that first got popular in the 2010s. Last year, 2024, she dropped an album called Brat, which caused a pop culture phenomenon called 'Brat Summer', that was all about being free spirited and partying a lot."},
}
// modify function. add if statements

function getInfo(name: string){
  return (famousPeople[name.toLowerCase()]||{}).information;
}

function getName(nluValue: any) {
  // if statement 1
    if (nluValue !== null) {
        if (nluValue.entities.length > 0) {
            for (let i: number = 0; i < nluValue.entities.length; i++) {
                if (nluValue.entities[i].category == "Name") {
                    return nluValue.entities[i].text
                }
            }
        }
    }
    return " "
};



                    // ADD MORE FUNCTIONS \\   
// function getWhoIsPerson(utterance: string) {
//   return (grammar[utterance.toLowerCase()] || {}).whoisperson;
// }

//function getDay(utterance: string) {
//  return (grammar[utterance.toLowerCase()] || {}).day;
//}


function getTime(nluValue: any) {
  // if statement 
  if (nluValue !== null) {
        if (nluValue.entities.length > 0) {
            for (let i: number = 0; i < nluValue.entities.length; i++) {
                console.log('test time' + nluValue.entities[i].text)
                if (nluValue.entities[i].category == "Time") {
                    return nluValue.entities[i].text
                }
            }
        }
    }
    return null
}

function getDay(nluValue: any) {
  if (nluValue !== null){
    if (nluValue.entities.length > 0) {
      for (let i: number = 0; i < nluValue.entities.length; i++){
        if (nluValue.entities[i].category == "Day"){
          return nluValue.entities[i].text
        }
      }
    }
  }
  return null
}




// from the dm.ts code, edits are needed

const dmMachine = setup({
  types:{
    context: {} as DMContext & {pendingEntities:string[]},
    events: {} as DMEvents,
  },
  actions: {
    "spst.speak": ({ context }, params: { utterance: string }) =>
      context.spstRef.send({ //error
        type: "SPEAK",
        value: {
          utterance: params.utterance,
        },
      }),
    "spst.listen": ({ context }) =>
      context.spstRef.send({
        type: "LISTEN",
        value: { nlu: true } /** Local activation of NLU */,
      }),  
    "extractEntities": function({event, context}) {
        if ("nluValue" in event) {
            if (context.person == null) {
                context.person = getName(event.nluValue);
            }
            if (context.day == null) {
                context.day = getDay(event.nluValue)
            }
            if (context.time == null) {
                context.time = getTime(event.nluValue)
            }
            context.intent =event.nluValue.topIntent // error
            context.lastResult = event.value[0].utterance

      }
    },
  },

}).createMachine({
  context: ({ spawn }) => ({
    spstRef: spawn(speechstate, { input: settings }),
    lastResult: "",
   // nluValue: null,
  //  famousPerson: null,
  //  meet_time: null,
    person: "",
    day: "",
    time: "",
    name: "",
    intent: null,
    yes: null,
    no: null,
    pendingEntities: ["Name", "Day", "Time"],
    information: null,
    isWholeDay: false    
  }),
  id: "DM",
  initial: "Prepare",
  states: {
    Prepare: {
        id: "Prepare",
        entry: ({ context }) => context.spstRef.send({type: "PREPARE"}),
        on: { ASRTTS_READY: "WaitToStart"},
    },
    WaitToStart: {
      id: "WaitToStart",
      on: { CLICK: "Greeting"},
    },
    // link this with azure intent who_is_x
    // then link it with book an appointment 
    Greeting: {
      id: "Greeting",
      initial: "prompt",
      on:{
        LISTEN_COMPLETE: [
          {
            target: "ScheduleAppointment",
            guard: ({context}) => context.intent === "Book an Appointment",
          //  actions: {type: "setBookanAppointment"}
          },          
          {
            target: "WhoisX",
            guard: ({context}) => context.intent=== "Who is x",
          //  actions: { type: "setWhoisx"}
          },
          {
            target: ".NoInput"
          },
        ],
      },
      states: {
          prompt: {
              entry: {type: "spst.speak", params: {utterance: "Hello!What do you want to do?"}},
              on: {SPEAK_COMPLETE: "AskPerson"}
            },
                NoInput: {
                entry: {type: "spst.speak", params: {utterance: "Can you repeat?"}},
                on: {SPEAK_COMPLETE: "prompt"},
                },
            AskPerson: {
              entry: {type: "spst.listen"},
                on: {RECOGNISED: 
                  {
                    actions: ["extractEntities"],
                  },
                  ASR_NOINPUT: {
                  actions: assign({intent: null})
            },
          },
        },
      },
    },
    ScheduleAppointment: {
      id: "ScheduleAppointment",
      initial: "getInformation",
      states: {
        getInformation:{
          always: [
            {guard: ({context})=> !context.person, target: "who"},
            {guard: ({context})=> !context.day, target: "day"},
            {guard: ({context})=> !context.time, target: "getTime"},
            {target: "confirmAppointment"}
          ],
        },
        who: {
          id: "who",
          initial: "prompt",
          states: {
            prompt: {
              entry: {type: "spst.speak", params: {utterance: "Who would you like to meet with?"}},
              on: {SPEAK_COMPLETE: "AskPerson"},
            },
            NoInput:{
              entry: {type: "spst.speak", params: {utterance: "Could you repeat?"}},
              on: {SPEAK_COMPLETE: "AskPerson"},
            },
            AskPerson: {
              entry: {type: "spst.listen"},
              on: {RECOGNISED: {
                actions: ["extractEntities", assign({person: ({event})=> getName(event.nluValue)})]
              },
                LISTEN_COMPLETE: {target: "#ScheduleAppointment.getInformation"},
                ASR_NOINPUT: {target: "NoInput"}
              },
            },
          },
        },
        day: {
          initial: "prompt",
          states: {
            prompt: {
              entry: {type: "spst.speak", params: {utterance: "What day would you like to meet?"}},
              on: {SPEAK_COMPLETE: "AskPerson"},
            },
            NoInput: {
              entry: {type: "spst.speak", params: {utterance: "Sorry, could you repeat?"}},
              on: {SPEAK_COMPLETE: "AskPerson"},
            },
            AskPerson: {
              entry: {type: "spst.listen"},
              on: {RECOGNISED: {
                actions: ["extractEntities", assign({day:({event})=> getDay(event.nluValue)})]},
                LISTEN_COMPLETE: "#ScheduleAppointment.getInformation",
                ASR_NOINPUT: {target: "NoInput"},
              },
            },
          },
        },
        getTime: {
          initial: "wholeDay",
          states: {
            wholeDay: {
              initial: "prompt",
              states: {
                prompt: {
                  entry: {type: "spst.speak", params: {utterance: "Will the appointment last the entire day?"}},
                  on:{SPEAK_COMPLETE: "AskPerson"},
                },
                NoInput: {
                  entry: {type:"spst.speak", params: {utterance: "Sorry, could you repeat?"}},
                  on: {SPEAK_COMPLETE: "prompt"},
                },
                AskPerson: {
                  entry: {type: "spst.listen"},
                  on: {RECOGNISED: [{actions: ["extractEntities", assign({lastResult: ({event})=>event.value[0].utterance})]}],
                      LISTEN_COMPLETE: [
                        {guard: ({context})=> isAffirmative(context.lastResult.toLowerCase()),
                        actions: assign({isWholeDay: true}),
                        target: "#confirmAppointment"
                      },
                      {
                        guard: ({context})=> isNegative(context.lastResult.toLowerCase()),
                        target: "#time",
                      },
                      {target: "NoInput"},
                      ],
                      ASR_NOINPUT: {target: "NoInput"},
                    },
                  },
                },
              },
              time: {
                id: "time",
                initial: "prompt",
                states: {
                  prompt: {
                    entry: {type: "spst.speak", params: {utterance: "At what time would you like to meet?"}},
                    on: {SPEAK_COMPLETE: "AskPerson"},
                  },
                  NoInput: {
                    entry: {type: "spst.speak", params: {utterance: "Sorry, could you repeat?"}},
                  },
                  AskPerson: {
                    entry: {type: "spst.listen"},
                    on: {RECOGNISED: [{actions: ["extractEntities", assign({time:({event})=>getTime(event.nluValue)})]}],
                      LISTEN_COMPLETE: "#ScheduleAppointment.getInformation",
                      ASR_NOINPUT: {target: "NoInput"}
                    },
                  },
                },
              },
          },
        },
        confirmAppointment: {
          id: "confirmAppointment",
          initial: "prompt",
          states: {
            prompt: {
              entry: {type: "spst.speak", params: ({context})=> ({utterance: context.isWholeDay? `Do you want to meet with ${context.person} on ${context.day}?`: `Do you want to meet with ${context.person} on ${context.day}, at ${context.time}?`})
            },
            on: {SPEAK_COMPLETE: "AskPerson"},
            },
            NoInput: {
              entry: {
                type: "spst.speak", params: {utterance: "Sorry, could you repeat?"},
              },
              on: {SPEAK_COMPLETE: "AskPerson"},
            },
            AskPerson: {
              entry: {type: "spst.listen"},
              on: {
                RECOGNISED: [{actions: ["extractEntities", assign({lastResult: ({event})=>event.value[0].utterance})]}],
                LISTEN_COMPLETE: [
                  {guard: ({context})=> isAffirmative(context.lastResult.toLowerCase()),
                  target: "#ScheduleAppointment.confirm"
                },
                  {guard: ({context})=> isNegative(context.lastResult.toLowerCase()),
                  target: "#who",
                },
                {target: "NoInput"},
                ],
                ASR_NOINPUT: {target: "NoInput"},
              },
            },
          },
        },
        confirm:{
          entry: {type: "spst.speak", params: {utterance: "You confirmed you appointment! Have a nice day!"}},
          on: {SPEAK_COMPLETE: "#Prepare" }
        },
      },
    },

    WhoisX: {
      id: "WhoisX",
      initial: "getInformation",
      states: {
        getInformation: {
          always: [
            {guard: ({context})=> !context.person, target: "who"},
            {target: "informationPerson"}
          ],
        },
        who: {
          initial: "prompt",
          states: {
            prompt: {
              entry: {type: "spst.speak", params: {utterance: "Who would you like to know about?"}},
              on: {SPEAK_COMPLETE: "AskPerson"},
            },
            NoInput: {
              entry: {type: "spst.speak", params: {utterance: "Sorry, could you repeat?"}},
              on: {SPEAK_COMPLETE: "AskPerson"},
            },
            AskPerson: {
              entry: {type: "spst.listen"},
              on: {RECOGNISED: {
                  actions: ["extractEntities", assign({person: ({event})=>getName(event.nluValue)})],
                },
                  LISTEN_COMPLETE: [{
                  target: "#WhoisX.getInformation",
                  },
                ],
                ASR_NOINPUT: {target: "NoInput"},
              },
            },
          },
        },
        informationPerson:{
          id: "informationPerson",
          entry: {type: "spst.speak", params: ({context})=>({utterance: `${getInfo(context.person)}`})},
          on: {SPEAK_COMPLETE: "#Prepare"}
        },
      },
    },
  },
});
///// MORE TOWARDS THE END OF THE CODE
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
