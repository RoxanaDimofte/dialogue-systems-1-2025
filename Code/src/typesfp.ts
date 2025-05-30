import { Hypothesis, SpeechStateExternalEvent } from "speechstate";
import { AnyActorRef } from "xstate";

export interface DMContext {
  spstRef: AnyActorRef;
  lastResult: any | null;
  //currentCategory: string; // a lo mejor te tocara cambiarlo
  //randomQuestionCounter: number; // TO EDIT Probably
  gender: string | undefined; // TO EDIT
  category: string; // TO EDIT
  nationality: string | undefined;
  alive:  boolean;
  name: string | undefined;
  eyecolour: string | undefined;
  haircolour: string | undefined;
  GrammyAwards: boolean;
  OscarAwards: boolean;
  age: number;
  whitePerson: boolean;
  tall: boolean;
  soloArtist: boolean;
  instruments: boolean;
  importantFilm: boolean;
  NobelPrize: boolean;
  BallondOr: boolean;
  hasKids: boolean;
}

export type DMEvents = SpeechStateExternalEvent | { type: "CLICK" } | { type: "CLICK_TEST"};