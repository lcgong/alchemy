import { createElement } from "react";
import { render } from "react-dom";
import App from "./App";
import registerServiceWorker from "./registerServiceWorker";

render(createElement(App), document.getElementById("root"));
registerServiceWorker();
