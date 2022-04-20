# Frontend Desert Fox

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

La commande start lance le serveur de développement qui se relance automatiquement quand du code est modifié et permet donc d'utiliser le site.

## Développement

Grâce à la recharge automatique du serveur, il est possible de développer en utilisant la commande `yarn start`.

## Compilation pour la production

`yarn build` va créer un dossier `dist` contenant toutes les ressources du site.

## Tests

Les tests de frontend sont très difficile à faire, c'est pour celà qu'avec le temps que nous avions nous avons décidé de ne pas en faire.

## Résumé

```bash
npm install -g yarn
yarn
yarn start
```
