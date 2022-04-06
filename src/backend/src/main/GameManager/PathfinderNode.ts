import HexID from "../Map/HexID";

class PathfinderNode {
  name: HexID;
  neighbourNodes: PathfinderNode[];
  weight: number;

  constructor(theName: HexID, theWeight: number) {
    this.name = theName;
    this.neighbourNodes = [];
    this.weight = theWeight;
  }

  public addNeighbourNode(node: PathfinderNode): void {
    this.neighbourNodes.push(node);
  }
}

export default PathfinderNode;
