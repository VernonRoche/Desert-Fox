# Desert Fox

## Environnement
- [node.js](https://nodejs.org/en/) 16.14.2 minimum est recommandé (dernière version stable au moment du projet)
- yarn est à installer grâce à la commande `npm install -g yarn` (dernière version à ce jour: 1.22.18)

## Installation
- `yarn install`

Permet d'installer toutes les dépendances du projet (listées dans le `package.json` et plus précisement dans le `yarn.lock`).

## Démarrage
- `yarn start`

La commande start se charge de compiler le typescript et de le lancer.

## Tests

- `yarn test`

Lance tous les tests du dossier src/test dans l'ordre alphabétique. Pour celà nous avons nommé les fichiers avec des numéros pour respecter un ordre logique.

## Résumé

```
npm install -g yarn
yarn install
yarn start
```