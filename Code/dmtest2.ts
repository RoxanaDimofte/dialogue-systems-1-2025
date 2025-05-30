/*
function getPerson(context: DMContext): string | null {
    if (context.interpretation && 
        context.interpretation.entities && 
        context.interpretation.entities.length > 0) {
      const personEntity = context.interpretation.entities.find(
        entity => entity.category === 'person'
      );
      if (personEntity) {
        return personEntity.text;
      }
    }
    return null;
  }

  function getMeetingTime(context: DMContext): string | null {
    if (context.interpretation && 
        context.interpretation.entities && 
        context.interpretation.entities.length > 0) {
      const timeEntity = context.interpretation.entities.find(
        entity => entity.category === 'meeting_time'
      );
      if (timeEntity) {
        return timeEntity.text;
      }
    }
    return null;
  }

const dmMachine = setup({
  types: {
    context: {} as DMContext,
    events: {} as DMEvents,
  },
  actions: {
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
        value: { nlu: true }
      }),

    setWhoPerson: assign({
        person: ({ context }) => getPerson(context)
      }),

    setMeetingDetails: assign({
        person: ({ context }) => getPerson(context),
        meeting_time: ({ context }) => getMeetingTime(context)
      })
  },

}).createMachine({
  context: ({ spawn }) => ({
    spstRef: spawn(speechstate, { input: settings }),
    lastResult: null,
    interpretation: null,
    person: null,
    meeting_time: null,
    famousPeople: null,
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
      initial: "Prompt",

      on: {
        LISTEN_COMPLETE: [
          {
            target: "WhoIsX",
            guard: ({ context }) => context.interpretation?.topIntent === "who_is_x",
            actions: { type: "setWhoPerson"}
          },
          { 
            target: "Meeting",
            guard: ({ context }) => context.interpretation?.topIntent === "create_a_meeting",
            actions: { type: "setMeetingDetails" }
          },
          { 
            target: ".NoInput" 
          },
        ],
      },

      states: {

        Prompt: {
          entry: { type: "spst.speak", params: { utterance: `At your service.` } },
          on: { SPEAK_COMPLETE: "Ask" },
        },

        NoInput: {
          entry: {
            type: "spst.speak",
            params: { utterance: `I can't hear you!` },
          },
          on: { SPEAK_COMPLETE: "Ask" },
        },

        Ask: {

          entry: { type: "spst.listen" },

          on: {
            RECOGNISED: {
              actions: assign(({ event }) => {
                return { lastResult: event.value, interpretation: event.nluValue };
              }),
            },
            ASR_NOINPUT: {
              actions: assign({ lastResult: null }),

            },
          },
        },
      },
    },

    WhoIsX: {
      entry: {
        type: "spst.speak",
        params: ({ context }) => {
          const personName = context.person;

          if (personName && famousPeople[personName]) {
            return { utterance: famousPeople[personName] };
          } else {
            return { 
              utterance: personName 
                ? `You tell me, who is ${personName}.` 
                : "I tried to fetch a person and failed miserably." 
            };
          }
        },
      },
      on: { SPEAK_COMPLETE: "Done" },
    },

    Done: {
      on: {
        CLICK: "Greeting",
      },
    },

    Meeting: {
      entry: {
        type: "spst.speak",
        params: ({ context }) => {
          const person = context.person;
          const time = context.meeting_time;

          if (person && time) {
            return { utterance: `I've scheduled a meeting with ${person}, ${time}.` };
          } else if (person) {
            return { utterance: `I need to know when to schedule the meeting with ${person}. Restarting the system.` };
          } else if (time) {
            return { utterance: `I need to know who to schedule the meeting with at ${time}. Restarting the system.` };
          } else {
            return { utterance: "I need more information to schedule a meeting. Restarting the system." };
          }
        },
      },
      on: { SPEAK_COMPLETE: "Done" },

    }
  },
});

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
  */