# Backend Desert Fox

## Environnement

- [node.js](https://nodejs.org/) 16.14.2 minimum est recommandé (dernière version stable au moment du projet)
- `yarn` est fortement conseillé mais pas obligatoire. Yarn s'installe grâce à la commande `npm install -g yarn` (dernière version à ce jour: 1.22.18)

Les dépendences du projet ont été définies dans le `package.json` mais les versions exactes sont gérées dans le `yarn.lock`, il est donc préférable d'utiliser `yarn`.

## Installation

```bash
# avec yarn
yarn
# sans yarn
npm install
```

Permet d'installer toutes les dépendances du projet (listées dans le `package.json` et plus précisement dans le `yarn.lock`).

## Démarrage

```bash
# avec yarn
yarn start
# sans yarn
npm start
```

La commande start se charge de compiler le typescript et de le lancer.

## Développement

```bash
# avec yarn
yarn dev
# sans yarn
npm run dev
```

Cette commande lance un serveur `nodemon` qui va relancer le serveur lorsqu'un fichier source change.

## Tests

```bash
# avec yarn
yarn test
# sans yarn
npm test
```

Lance tous les tests du dossier src/test dans l'ordre alphabétique. Pour celà nous avons nommé les fichiers avec des numéros pour respecter un ordre logique.

Cette commande lance aussi `nyc` qui créé un fichier de coverage pour nos tests. Il se trouve dans le dossier `coverage`.

A l'intérieur de ce dossier, on peut trouver un fichier `coverage/lcov-report/index.html` qui permet une navigation web pour visualiser le rapport de coverage, fichier par fichier si nécessaire.

Sur linux, il est possible de visualiser ce fichier en utilisant `google-chrome` ou `firefox`, ou même `xdg-open` depuis la ligne de commande.

Exemple:

```bash
# Depuis le dossier desert-fox/src/backend
firefox coverage/lcov-report/index.html
```

## Résumé

```bash
npm install -g yarn
yarn
yarn start
```
