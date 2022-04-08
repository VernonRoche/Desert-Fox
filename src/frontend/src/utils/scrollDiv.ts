export default function runScrollDiv(htmlDocument: Document, gameScreen: HTMLElement) {
  if (gameScreen === null) return;
  gameScreen.scrollTop = 100;
  gameScreen.scrollLeft = 150;

  let pos = { top: 0, left: 0, x: 0, y: 0 };

  const mouseMoveHandler = function (e: MouseEvent) {
    // How far the mouse has been moved
    const dx = e.clientX - pos.x;
    const dy = e.clientY - pos.y;

    // Scroll the element
    gameScreen.scrollTop = pos.top - dy;
    gameScreen.scrollLeft = pos.left - dx;
  };

  const mouseUpHandler = function () {
    htmlDocument.removeEventListener("mousemove", mouseMoveHandler);
    htmlDocument.removeEventListener("mouseup", mouseUpHandler);

    gameScreen.style.cursor = "grab";
    gameScreen.style.removeProperty("user-select");
  };

  const mouseDownHandler = function (e: MouseEvent) {
    pos = {
      // The current scroll
      left: gameScreen.scrollLeft,
      top: gameScreen.scrollTop,
      // Get the current mouse position
      x: e.clientX,
      y: e.clientY,
    };

    htmlDocument.addEventListener("mousemove", mouseMoveHandler);
    htmlDocument.addEventListener("mouseup", mouseUpHandler);
  };

  htmlDocument.addEventListener("mousedown", mouseDownHandler);
}
