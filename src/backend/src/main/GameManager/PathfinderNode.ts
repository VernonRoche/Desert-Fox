import HexID from "../Map/HexID";

class PathfinderNode {
  name: HexID;
  neighbourNodes: PathfinderNode[];
  weight: number;

  constructor(theName: HexID, theNodes: PathfinderNode[], theWeight: number) {
    this.name = theName;
    this.neighbourNodes = theNodes;
    this.weight = theWeight;
  }
}

export default PathfinderNode;
