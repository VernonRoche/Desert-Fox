import Player from "./Player";
import GameMap from "../Map/GameMap";
import Hex from "../Map/Hex";

class Pathfinder {
  private readonly _map: GameMap;

  constructor(map: GameMap) {
    this._map = map;
  }
  /**
   * Find the shortest path
   * Return an object which contains the path and sum of weights
   */
  public findShortestWay(
    startHex: Hex,
    endHex: Hex,
    player: Player,
    isMotorized: boolean,
  ): { hexPath: Hex[]; sumOfWeight: number } {
    //smallest weights between startHex and all the other nodes
    const smallestWeights = new Map<Hex, number>();
    //for convenience, mark distance from startHex to itself as 0
    smallestWeights.set(startHex, 0);

    //implicit graph of all nodes and previous node in ideal paths
    const prevNodes = new Map<Hex, Hex>();

    //use queue for breadth first search
    //for convenience, we'll use an array, but linked list would be preferred
    const nodesToVisitQueue: Hex[] = [];

    //record visited nodes with a set. The string is the toString of a HexID
    const visitedNodes = new Set<string>();
    visitedNodes.add(startHex.getID().toString());

    let currentNode = startHex;
    console.log("Starting to look for path");
    //loop through nodes
    while (true) {
      //get the shortest path so far from start to currentNode
      const dist = smallestWeights.get(currentNode)!;

      //iterate over current child's nodes and process
      const neighbourHexes = currentNode.getNeighbours();

      for (const neighbourHex of neighbourHexes) {
        //add node to queue if not already visited
        if (!visitedNodes.has(neighbourHex.getID().toString())) {
          console.log("Added node " + neighbourHex.getID() + " to queue");
          nodesToVisitQueue.push(neighbourHex);
        }

        //check the distance from startHex to currentNode + thisNode
        let thisDist = dist + neighbourHex.getTerrain().getWeight();
        //check if we are moving through enemy hex
        if (!this._map.hexBelongsToPlayer(neighbourHex.getID(), player)) {
          thisDist += 1000;
        }
        // check if we enter enemy zone of control
        if (!isMotorized) {
          for (const potentialZOCHex of neighbourHex.getNeighbours()) {
            if (!this._map.hexBelongsToPlayer(potentialZOCHex.getID(), player)) {
              thisDist += 1;
              break;
            }
          }
        }

        //if we already have a distance to neighbourHex, compare with this distance
        if (prevNodes.has(neighbourHex)) {
          //get the recorded smallest distance
          const altDist = smallestWeights.get(neighbourHex)!;

          //if this distance is better, update the smallest distance + prev node
          if (thisDist < altDist) {
            prevNodes.set(neighbourHex, currentNode);
            smallestWeights.set(neighbourHex, thisDist);
          }
        } else {
          //if there is no distance recoded yet, add now
          prevNodes.set(neighbourHex, currentNode);
          smallestWeights.set(neighbourHex, thisDist);
        }
      }

      //mark that we've visited this node
      visitedNodes.add(currentNode.getID().toString());
      console.log("Marked the hex" + currentNode.getID() + "moving on to next");

      //exit if done
      if (nodesToVisitQueue.length === 0) {
        break;
      }

      //pull the next node to visit, if any
      currentNode = nodesToVisitQueue.shift()!;
      console.log("Nodes to still visit " + nodesToVisitQueue.length);
      //console.log("Current Node is now: " + currentNode.getID());
    }

    //get the shortest path into an array
    const path: Hex[] = [];

    currentNode = endHex;
    console.log("Building the path now");
    while (currentNode !== startHex) {
      path.push(currentNode);

      currentNode = prevNodes.get(currentNode)!;
    }
    path.push(startHex);

    //reverse the path so it starts with startHex
    path.reverse();
    const cost = smallestWeights.get(endHex)!;
    return { hexPath: path, sumOfWeight: cost };
  }
}

export default Pathfinder;
