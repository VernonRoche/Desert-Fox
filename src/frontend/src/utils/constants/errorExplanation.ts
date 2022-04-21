const globalErrors = {
  invalidargs: "Les arguments de cette commande sont invalides",
  turnerror: "Cette commande n'est pas disponible pendant cette phase",
  invalidhex: "L'id de cette hexagon n'est pas valide",
  invalidturncommand: "Cette commande n'est pas disponible pendant cette phase",
};

const moveErrors = {
  invalidunitid: "Cet unit id n'est pas valide",
  invalidunit: "Cette unité n'existe pas ou ne vous appartient pas",
  invalidmove: "Vous ne pouvez pas bouger cette unité a cet hexagon",
};

const doneErrors = {
  wrongplayer: "Ce n'est pas votre tour",
  alreadydone: "Vous avez déjà passé votre tour",
};

const embarkErrors = {
  invalidsupplyunitid: "Cet id d'unité de ((supply id)) n'est pas valide",
  invalidsupplyunit: "Cette unité de ((supply id)) n'existe pas ou ne vous appartient pas",
  invaliddisembark: "Cette unité ne peut pas désembarquer",
};

const allErrors: Record<string, string> = {
  ...globalErrors,
  ...moveErrors,
  ...doneErrors,
  ...embarkErrors,
};

function getError(error: string): string {
  return allErrors[error] ?? error;
}

export default getError;
