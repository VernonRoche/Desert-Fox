import { createMachine, interpret } from "xstate";
import { StateMachine } from "../main/GameManager/StateMachine/StateMachine";
import { TurnPhases } from "../main/GameManager/StateMachine/States";
import { resetIds } from "../main/idManager";

describe("State Machine tests", function () {
  this.afterAll(() => {
    resetIds();
  });

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
      if (testService.state.value.toString() !== "first_player_movement") {
        throw new Error(
          "State machine transitions not working. state is " +
            testService.state.value.toString() +
            " instead of first_player_movement",
        );
      }
      testService.send("NEXT");
      if (testService.state.value.toString() !== "first_player_combat") {
        reject(
          new Error(
            "State machine transitions not working. The phase is " +
              testService.state.value.toString() +
              " instead of first_player_combat",
          ),
        );
      }
      resolve();
    });
  });
  testService.send("RESET");
  it("Testing the turn counter before a phase loop", function () {
    if (testService.state.context.turn !== 1) {
      throw new Error(
        "Turn counter not working correctly. It is " +
          testService.state.context.turn +
          " instead of 1",
      );
    }
  });
  it("Testing the loop of phases", function () {
    for (let i = 0; i < 9; i++) {
      testService.send("NEXT");
      console.log(testService.state.value.toString());
      if (testService.state.value.toString() === "turn_maker") console.log("turn maker");
    }
    if (testService.state.value.toString() !== "first_player_movement") {
      throw new Error(
        "State machine not looping properly. The phase is " +
          testService.state.value.toString() +
          " instead of first_player_movement",
      );
    }
  });
  testService.send("RESET");
  it("Testing the turn counter after a phase loop", function () {
    testService.send("INC"); // simulating a turn maker phase
    if (testService.state.context.turn !== 2) {
      throw new Error(
        "Turn counter not working correctly. It is " +
          testService.state.context.turn +
          " instead of 2",
      );
    }
  });
});
