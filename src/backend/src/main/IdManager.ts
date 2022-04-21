// Class which allows for each entity to have a unique identifier.
let id = 0;

export function getNewId() {
  return id++;
}
export function resetIds() {
  id = 0;
}
