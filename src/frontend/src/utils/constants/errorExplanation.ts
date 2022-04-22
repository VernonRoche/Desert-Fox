const globalErrors = {
  invalidargs: "Les arguments de cette commande sont invalides",
  turnerror: "Cette commande n'est pas disponible pendant cette phase",
  invalidhex: "L'id de cette hexagone n'est pas valide",
  invalidturncommand: "Cette commande n'est pas disponible pendant cette phase",
  nogame: "Il n'y a pas de jeu en cours",
};

const moveErrors = {
  invalidunitid: "Cet unit id n'est pas valide",
  invalidunit: "Cette unité n'existe pas ou ne vous appartient pas",
  invalidmove: "Vous ne pouvez pas bouger cette unité a cet hexagone",
};

const doneErrors = {
  wrongplayer: "Ce n'est pas votre tour",
  alreadydone: "Vous avez déjà passé votre tour",
};

const embarkErrors = {
  invalidsupplyunitid: "Cet id d'unité de ((supply id)) n'est pas valide",
  invalidsupplyunit: "Cette unité de ((supply id)) n'existe pas ou ne vous appartient pas",
  invaliddisembark: "Cette unité ne peut pas désembarquer",
  invalidembarkid: "Cet id d'unité ne correspond a aucune unité d'embarquement",
  invalidembarkunit: "Cette unité ne peut pas embarquer",
  invalidembark: "Cette embarquement est impossible",
};

const attackErrors = {
  invalidattackingunitid: "Cet id d'unité attaquante n'est pas valide",
  invaliddefendingunitid: "Cet id d'unité défenseur n'est pas valide",
  invalidattackinghex: "Cet hexagone attaquant n'est pas valide",
  invalidattack: "Cette attaque est impossible",
};

const allErrors: Record<string, string> = {
  ...globalErrors,
  ...moveErrors,
  ...doneErrors,
  ...embarkErrors,
  ...attackErrors,
};

function getError(error: string): string {
  return allErrors[error] ?? error;
}

export default getError;
