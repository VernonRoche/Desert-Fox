import { createMachine, interpret } from "xstate";
import phaseService, { TurnPhases } from "../main/GameManager/StateMachine";

describe("State Machine tests", function () {
  const stateMachine = createMachine(TurnPhases);
  const testService = interpret(stateMachine).start();
  it("Testing initialization", function () {
    if (testService.state.value !== "initial") {
      throw new Error("State machine not initialized correctly");
    }
  });
  it("Reset state machine", function () {
    testService.send("NEXT");
    testService.send("RESET");
    if (testService.state.value.toString() !== "initial") {
      throw new Error(
        "State machine not reset. The phase is " +
          testService.state.value.toString() +
          " instead of initial",
      );
    }
  });
  it("Testing phase transitions", function () {
    return new Promise<void>((resolve, reject) => {
      testService.send("NEXT");
      if (testService.state.value.toString() !== "air_superiority") {
        throw new Error("State machine transitions not working");
      }
      testService.send("NEXT");
      if (testService.state.value.toString() !== "reinforcements") {
        reject(
          new Error(
            "State machine transitions not working. The phase is " +
              testService.state.value.toString() +
              " instead of reinforcements",
          ),
        );
      }
      resolve();
    });
  });
  testService.send("RESET");
  it("Testing the loop of phases", function () {
    for (let i = 0; i < 18; i++) {
      testService.send("NEXT");
    }
    if (testService.state.value.toString() !== "air_superiority") {
      test;
      throw new Error(
        "State machine not looping properly. The phase is " +
          testService.state.value.toString() +
          " instead of air_superiority",
      );
    }
  });
  testService.send("RESET");
});
