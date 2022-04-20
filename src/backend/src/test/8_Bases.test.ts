import { getNewId, resetIds } from "../main/idManager";
import Base from "../main/Infrastructure/Base";
import HexID from "../main/Map/HexID";
import Foot from "../main/Units/Foot";

describe("Base test", function () {
  this.afterAll(() => {
    resetIds();
  });
  const id = 1000;
  const footHexId = new HexID(2, 2);
  const _hexId2 = new HexID(3, 3);
  const foot = new Foot(id, footHexId, 3, 3, 12, 1);
  const _base = new Base(footHexId, true, id);

  it("Base should be correct", function () {
    if (_base.getId() != id) {
      throw new Error("id not correct");
    }
    if (_base.getCurrentPosition() != footHexId) {
      throw new Error("CurrentPosition not correct");
    }
    if (!_base.isPrimary()) {
      throw new Error("Primary not correct");
    }
  });

  it("base send", function () {
    _base.sent();
    if (!_base.canSend()) {
      throw new Error("canSend not correct");
    }
  });

  it("base receive", function () {
    _base.received();
    if (!_base.canReceive()) {
      throw new Error("canReceive not correct");
    }
  });

  it("base reset", function () {
    _base.reset();
    if (_base.canSend()) {
      throw new Error("canSend not correct");
    }
    if (_base.canReceive()) {
      throw new Error("canReceive not correct");
    }
  });

  it("base place", function () {
    _base.place(_hexId2);
    if (_base.getCurrentPosition() === footHexId) {
      throw new Error("CurrentPosition not correct");
    }
  });

  /*it ("base remove dump", function () {
        const dumps: Dump[] = [new Dump(getNewId(), footHexId)];
        _base.removeDump(dumps[1]);
        if (dumps.length != 0) {
            throw new Error("Dump not removed");
        }
    });
*/
});
