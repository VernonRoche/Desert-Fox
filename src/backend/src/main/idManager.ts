let id = 0;

export function getNewId() {
    return id++;
}
export function resetIds(){
    id = 0;
}