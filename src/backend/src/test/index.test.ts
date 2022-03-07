describe("test if boolean is true", function () {
  it("should be true", function () {
    const bool = true;
    if (bool) {
      // everything is good, leave test
      return;
    } else {
      // bad, throw error
      throw new Error("not true");
    }
  });
  it("should be false", function () {
    const bool = false;
    if (!bool) {
      // everything is good, leave test
      return;
    } else {
      // bad, throw error
      throw new Error("not false");
    }
  });
});
