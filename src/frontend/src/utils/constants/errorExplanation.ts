const moveErrors = {
  turnerror: "Cette commande n'est pas disponible pendant cette phase",
  invalidargs: "Les arguments de cette commande sont invalides",
  invalidunitid: "Cet unit id n'est pas valide",
  invalidunit: "Cette unité n'existe pas ou ne vous appartient pas",
  invalidhex: "L'id de cette hexagon n'est pas valide",
  invalidmove: "Vous ne pouvez pas bouger cette unité a cet hexagon",
  invalidturncommand: "Cette commande n'est pas disponible pendant cette phase",
};

const doneErrors = {
  wrongplayer: "Ce n'est pas votre tour",
  alreadydone: "Vous avez déjà passé votre tour",
};

export const allErrors: Record<string, string> = {
  ...moveErrors,
  ...doneErrors,
};
