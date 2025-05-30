import "./style.css";
import typescriptLogo from "./typescript.svg";
import viteLogo from "/vite.svg";
import { setupButton } from "./dm4.ts";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div>
  <div><h1><i>Lab 4 Dialogue System<div> 
    <div class="card">
      <button id="counter" type="button"></button>
    </div>
  </div>

`;

setupButton(document.querySelector<HTMLButtonElement>("#counter")!);
