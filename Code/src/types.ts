import { Hypothesis, SpeechStateExternalEvent } from "speechstate";
import { AnyActorRef } from "xstate";

//*
export interface Intent{
  category: string;
  confidScore: number;
}


export interface Entity{
  category: string;
  text: string;
  confidenceScore: number;
  offset: number;
  length: number;
}

export interface NLUObject{
  entities: Entity[];
  intents: Intent[]; 
  projectKind: string;
  topIntent: string; 
}

// modify
export interface DMContext {
  spstRef: AnyActorRef;
 // lastResult: Hypothesis[] | null ;
  lastResult: string;
  nluValue: NLUObject | null ;
  intent: any,
  confirmation?: Hypothesis[] | null;
  deny?: Hypothesis[] | null;
  person: string;
  day: string;
  time?: string;
  isWholeDay: boolean,
  information: string;
  name: string
}





export type DMEvents = SpeechStateExternalEvent | { type: "CLICK" } | { type: "CLICK_TEST"};
// export type DMEvents = SpeechStateExternalEvent | { type: "CLICK_START" # this cannot be because we cannot have duplicated export type DMEvents
// To add more type to the same event, we just have to create different {} separated by |, easy peasy lemon squeezy.

