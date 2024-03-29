import Player from "./Player";
import GameMap from "../Map/GameMap";
import Hex from "../Map/Hex";
import HexID from "../Map/HexID";
import { TerrainTypes } from "../Map/Terrain";

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
    startHexID: HexID,
    endHexID: HexID,
    player: Player,
    unitType = "foot",
    supplyCheck = false,
  ): { hexPath: HexID[]; sumOfWeight: number } {
    const startHex = this._map.findHex(startHexID);
    const endHex = this._map.findHex(endHexID);
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
    visitedNodes.add(startHex.getId().toString());

    let currentNode = startHex;
    //loop through nodes
    while (true) {
      //get the shortest path so far from start to currentNode
      const dist = smallestWeights.get(currentNode);
      if (dist === undefined) {
        throw new Error("dist is undefined");
      }

      //iterate over current child's nodes and process
      const neighbourHexes = currentNode.getNeighbours();
      for (const neighbourHex of neighbourHexes) {
        //add node to queue if not already visited
        if (
          !visitedNodes.has(neighbourHex.getId().toString()) &&
          !nodesToVisitQueue.includes(neighbourHex)
        ) {
          nodesToVisitQueue.push(neighbourHex);
        }

        //check the distance from startHex to currentNode + thisNode
        let thisDist;
        if (!supplyCheck) thisDist = dist + neighbourHex.getTerrain().getWeight();
        // checking if it's mountain for supply units
        else
          thisDist =
            dist + (neighbourHex.getTerrain().terrainType === TerrainTypes.MOUNTAIN ? 1000 : 1);
        //check if we are moving through enemy hex
        if (!this._map.hexBelongsToPlayer(neighbourHex.getId(), player)) {
          thisDist += 1000;
        }
        // check if we enter enemy zone of control
        if (!supplyCheck && !(unitType === "motorized")) {
          for (const potentialZOCHex of neighbourHex.getNeighbours()) {
            if (!this._map.hexBelongsToPlayer(potentialZOCHex.getId(), player)) {
              for (const enemyUnit of potentialZOCHex.getUnits()) {
                if (!enemyUnit.isDisrupted()) {
                  thisDist += 1;
                  break;
                }
              }
              break;
            }
          }
        } else if (supplyCheck) {
          for (const potentialZOCHex of neighbourHex.getNeighbours()) {
            if (!this._map.hexBelongsToPlayer(potentialZOCHex.getId(), player)) {
              thisDist += 1000;
              break;
            }
          }
        }

        //if we already have a distance to neighbourHex, compare with this distance
        if (prevNodes.has(neighbourHex)) {
          //get the recorded smallest distance
          const altDist = smallestWeights.get(neighbourHex);
          if (altDist === undefined) {
            throw new Error("altDist is undefined");
          }

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
      visitedNodes.add(currentNode.getId().toString());

      //exit if done
      if (nodesToVisitQueue.length === 0) {
        break;
      }

      //pull the next node to visit, if any
      const temp = nodesToVisitQueue.shift();
      if (temp === undefined) {
        throw new Error("nodes to visit is empty");
      }
      currentNode = temp;
    }

    //get the shortest path into an array
    const path: HexID[] = [];

    currentNode = endHex;
    while (currentNode !== startHex) {
      path.push(currentNode.getId());

      const temp = prevNodes.get(currentNode);
      if (temp === undefined) {
        throw new Error("current node is undefined");
      }
      currentNode = temp;
    }
    path.push(startHex.getId());

    //reverse the path so it starts with startHex
    path.reverse();
    const cost = smallestWeights.get(endHex);
    if (cost === undefined) {
      throw new Error("cost is undefined");
    }
    return { hexPath: path, sumOfWeight: cost };
  }
}

export default Pathfinder;
