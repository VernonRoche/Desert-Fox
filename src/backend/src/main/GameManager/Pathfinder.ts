import HexID from "../Map/HexID";
import PathfinderNode from "./PathfinderNode";
import Player from "./Player";
import GameMap from "../Map/GameMap";

class Pathfinder {
  private _nodes: Map<string, PathfinderNode>;
  private _map: GameMap;
  constructor(map: GameMap) {
    this._nodes = new Map();
    this._map = map;
    for (const hex of map.getHexes().values()) {
      const node: PathfinderNode = new PathfinderNode(hex.getID(), hex.getTerrain().getWeight());
      for (const neighbour of hex.getNeighbours()) {
        node.addNeighbourNode(
          new PathfinderNode(neighbour.getID(), neighbour.getTerrain().getWeight()),
        );
      }
      this._nodes.set(hex.getID().toString(), node);
    }
  }

  addNode(node: PathfinderNode): void {
    this._nodes.set(node.name.toString(), node);
  }

  findPointsOfShortestWay(start: HexID, finish: HexID): HexID[] {
    let nextNode: HexID = finish;
    const arrayWithNode: HexID[] = [];
    while (nextNode !== start) {
      let minWeigth: number = Number.MAX_VALUE;
      let minNode: HexID = new HexID(-1, -1);
      const tmpNode = this._nodes.get(nextNode.toString());
      if (tmpNode) {
        for (const i of tmpNode.neighbourNodes) {
          const neighbourNode = this._nodes.get(i.name.toString());
          if (neighbourNode) {
            if (i.weight + neighbourNode.weight < minWeigth) {
              minWeigth = neighbourNode.weight;
              minNode = i.name;
            }
          }
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
      const iNode = this._nodes.get(i);
      if (iNode) {
        if (iNode.name === start) {
          iNode.weight = 0;
        } else {
          iNode.weight = Number.MAX_VALUE;
        }
        nodes[iNode.name.toString()] = iNode.weight;
      }

      while (Object.keys(nodes).length !== 0) {
        const sortedVisitedByWeight: string[] = Object.keys(nodes).sort((a, b) => {
          const aNode = this._nodes.get(a);
          const bNode = this._nodes.get(b);
          if (aNode && bNode) {
            return aNode.weight - bNode.weight;
          }
          return -1;
        });
        const currentNode = this._nodes.get(sortedVisitedByWeight[0]);
        if (currentNode) {
          for (const j of currentNode.neighbourNodes) {
            let calculateWeight: number = currentNode.weight + j.weight;
            if (!this._map.hexBelongsToPlayer(j.name, player)) {
              calculateWeight += 1000;
            }
            const jNode = this._nodes.get(j.name.toString());
            if (jNode) {
              if (calculateWeight < jNode.weight) {
                jNode.weight = calculateWeight;
              }
            }
          }
        }
        delete nodes[sortedVisitedByWeight[0]];
      }
      const finishNode = this._nodes.get(finish.toString());
      if (finishNode) {
        const finishWeight: number = finishNode.weight;
        const arrayWithVertex: HexID[] = this.findPointsOfShortestWay(start, finish).reverse();
        arrayWithVertex.push(finish);
        return { pathNodes: arrayWithVertex, weight: finishWeight };
      }
    }
    return { pathNodes: [], weight: -1 };
  }
}

export default Pathfinder;
