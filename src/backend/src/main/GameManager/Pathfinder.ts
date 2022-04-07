import HexID from "../Map/HexID";
import PathfinderNode from "./PathfinderNode";
import Player from "./Player";
import GameMap from "../Map/GameMap";

class Pathfinder {
  private _nodes: any;
  private _map: GameMap;
  constructor(map: GameMap) {
    this._nodes = {};
    this._map = map;
    for (const hex of map.getHexes().values()) {
      const node: PathfinderNode = new PathfinderNode(hex.getID(), hex.getTerrain().getWeight());
      for (const neighbour of hex.getNeighbours()) {
        node.addNeighbourNode(
          new PathfinderNode(neighbour.getID(), neighbour.getTerrain().getWeight()),
        );
      }
      this._nodes[hex.getID().toString()] = node;
    }
  }

  addNode(node: PathfinderNode): void {
    this._nodes[node.name.toString()] = node;
  }

  findPointsOfShortestWay(start: HexID, finish: HexID): HexID[] {
    let nextNode: HexID = finish;
    const arrayWithNode: HexID[] = [];
    while (nextNode !== start) {
      let minWeigth: number = Number.MAX_VALUE;
      let minNode: HexID = new HexID(-1, -1);
      for (const i of this._nodes[nextNode.toString()].neighbourNodes) {
        if (i.weight + this._nodes[i.name.toString()].weight < minWeigth) {
          minWeigth = this._nodes[i.name.toString()].weight;
          minNode = i.name;
        }
      }
      arrayWithNode.push(minNode);
      nextNode = minNode;
    }
    return arrayWithNode;
  }

  findShortestWay(
    start: HexID,
    finish: HexID,
    player: Player,
  ): { pathNodes: HexID[]; weight: number } {
    const nodes: any = {};

    for (const i in this._nodes) {
      if (this._nodes[i].name === start) {
        this._nodes[i].weight = 0;
      } else {
        this._nodes[i].weight = Number.MAX_VALUE;
      }
      nodes[this._nodes[i].name] = this._nodes[i].weight;
    }

    while (Object.keys(nodes).length !== 0) {
      const sortedVisitedByWeight: string[] = Object.keys(nodes).sort(
        (a, b) => this._nodes[a].weight - this._nodes[b].weight,
      );
      const currentNode: PathfinderNode = this._nodes[sortedVisitedByWeight[0]];
      for (const j of currentNode.neighbourNodes) {
        let calculateWeight: number = currentNode.weight + j.weight;
        if (!this._map.hexBelongsToPlayer(j.name, player)) {
          calculateWeight += 1000;
        }
        if (calculateWeight < this._nodes[j.name.toString()].weight) {
          this._nodes[j.name.toString()].weight = calculateWeight;
        }
      }
      delete nodes[sortedVisitedByWeight[0]];
    }
    const finishWeight: number = this._nodes[finish.toString()].weight;
    const arrayWithVertex: HexID[] = this.findPointsOfShortestWay(start, finish).reverse();
    arrayWithVertex.push(finish);
    return { pathNodes: arrayWithVertex, weight: finishWeight };
  }
}

export default Pathfinder;
