const fs = require('fs');
const path = require('path');

function filterFunc(hex) {
    const value = hex.hexId.substring(2, 4); 
    console.log(value);
    const valid = (value <= 32);
    if(!valid){
        console.log(hex.hexId + ' ESST PAS VALIDE');
    }
     return valid;
}

const json = fs.readFileSync('map.json', 'utf8');
const map = JSON.parse(json);
const mapWithRemoved = map.filter(filterFunc);
const mapRest = map.filter((hex) => !filterFunc(hex));
//fs.writeFileSync('mapbis.json', JSON.stringify(mapWithRemoved, null, 4));
mapRest.map((hex) => {
    const hexIdX = hex.hexId.substring(2, 4);
    const hexIdY = hex.hexId.substring(0, 2);
    const newHexIdX = +hexIdX - 32;
    hex.hexId = hexIdY + ((newHexIdX < 10) ? "0" : "") + newHexIdX;
    return hex;
});
fs.writeFileSync('maptris.json', JSON.stringify(mapRest, null, 4));