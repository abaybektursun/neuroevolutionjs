import Metacar from "metacar";
import * as Net from "./NE/network"
import * as NetTest from "./NE/tests"
import * as NetVis from "./NE/visual"

// Select a level
const level = metacar.level.level1;
// Create the environement
const env = new metacar.env("env", level);
// Load it
//env.load();

// Continuous Control
env.setAgentMotion(metacar.motion.ControlMotion);

env.load().then(() => {

});

//console.log(env.actionSpace());
