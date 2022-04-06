import HexID from "../Map/HexID";
import PathfinderNode from "./PathfinderNode";

class Pathfinder {
  nodes: any;
  constructor() {
    this.nodes = {};
  }

  addNode(node: PathfinderNode): void {
    this.nodes[node.name.toString()] = node;
  }

  findPointsOfShortestWay(start: HexID, finish: HexID): HexID[] {
    let nextNode: HexID = finish;
    const arrayWithNode: HexID[] = [];
    while (nextNode !== start) {
      let minWeigth: number = Number.MAX_VALUE;
      let minNode: HexID = new HexID(-1, -1);
      for (const i of this.nodes[nextNode.toString()].neighbourNodes) {
        if (i.weight + this.nodes[i.name.toString()].weight < minWeigth) {
          minWeigth = this.nodes[i.name.toString()].weight;
          minNode = i.name;
        }
      }
      arrayWithNode.push(minNode);
      nextNode = minNode;
    }
    return arrayWithNode;
  }

  findShortestWay(start: HexID, finish: HexID): { pathNodes: HexID[]; weight: number } {
    const nodes: any = {};

    for (const i in this.nodes) {
      if (this.nodes[i].name === start) {
        this.nodes[i].weight = 0;
      } else {
        this.nodes[i].weight = Number.MAX_VALUE;
      }
      nodes[this.nodes[i].name] = this.nodes[i].weight;
    }

    while (Object.keys(nodes).length !== 0) {
      const sortedVisitedByWeight: string[] = Object.keys(nodes).sort(
        (a, b) => this.nodes[a].weight - this.nodes[b].weight,
      );
      const currentNode: PathfinderNode = this.nodes[sortedVisitedByWeight[0]];
      for (const j of currentNode.neighbourNodes) {
        const calculateWeight: number = currentNode.weight + j.weight;
        if (calculateWeight < this.nodes[j.name.toString()].weight) {
          this.nodes[j.name.toString()].weight = calculateWeight;
        }
      }
      delete nodes[sortedVisitedByWeight[0]];
    }
    const finishWeight: number = this.nodes[finish.toString()].weight;
    const arrayWithVertex: HexID[] = this.findPointsOfShortestWay(start, finish).reverse();
    arrayWithVertex.push(finish);
    return { pathNodes: arrayWithVertex, weight: finishWeight };
  }
}

export default Pathfinder;
