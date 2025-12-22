// ===== ENUMS - Guild Master =====

export const Classe = {
  VILLAGEOIS: 'Villageois',
  MAGE: 'Mage',
  TANK: 'Tank',
  HEALER: 'Prêtre',
  VOLEUR: 'Voleur',
  GUERRIER: 'Guerrier'
};

export const Personality = {
  COURAGEUX: 'Courageux',
  LACHE: 'Lâche',
  LOYAL: 'Loyal',
  OPPORTUNISTE: 'Opportuniste',
  CUPIDE: 'Cupide',
  GENEREUX: 'Généreux',
  HEROIQUE: 'Héroïque',
  NEUTRE: 'Neutre'
};

export const Armes = {
  POING: 'Poing',
  EPEE: 'Épée',
  EPEE_LONGUE: 'Épée Longue',
  DAGUE: 'Dague',
  ARC: 'Arc',
  ARBALETE: 'Arbalète',
  BATON_MAGIQUE: 'Bâton Magique',
  HACHE: 'Hache',
  HACHE_DOUBLE: 'Hache Double',
  MASSE: 'Masse',
  LANCE: 'Lance',
  FAUX: 'Faux',
  MARTEAU_GUERRE: 'Marteau de Guerre',
  KATANA: 'Katana',
  RAPIERE: 'Rapière',
  BOIS: 'Bois',
  MAINS_NUES: 'Mains Nues'
};

export const Armures = {
  AUCUNE: 'Aucune',
  ROBE_MAGE: 'Robe de Mage',
  ARMURE_CUIR: 'Armure de Cuir',
  ARMURE_CUIR_CLOUTE: 'Armure de Cuir Clouté',
  COTTE_MAILLES: 'Cotte de Mailles',
  ARMURE_PLAQUES: 'Armure de Plaques',
  ARMURE_LOURDE: 'Armure Lourde',
  ARMURE_DRACONIQUE: 'Armure Draconique',
  ARMURE_ENCHANTEE: 'Armure Enchantée'
};

export const Accessoires = {
  AUCUN: 'Aucun',
  ANNEAU_FORCE: 'Anneau de Force',
  ANNEAU_PROTECTION: 'Anneau de Protection',
  ANNEAU_VITESSE: 'Anneau de Vitesse',
  AMULETTE_VIE: 'Amulette de Vie',
  AMULETTE_MANA: 'Amulette de Mana',
  AMULETTE_CHANCE: 'Amulette de Chance',
  CEINTURE_ROBUSTESSE: 'Ceinture de Robustesse',
  CEINTURE_AGILITE: 'Ceinture d\'Agilité',
  BOTTES_VITESSE: 'Bottes de Vitesse',
  BOTTES_DISCRETION: 'Bottes de Discrétion',
  GANTS_DEXTERITE: 'Gants de Dextérité',
  GANTS_PUISSANCE: 'Gants de Puissance',
  CAPE_OMBRE: 'Cape d\'Ombre',
  CAPE_PROTECTION: 'Cape de Protection',
  MEDAILLON_HEROS: 'Médaillon du Héros'
};

export const Blessures = {
  AUCUNE: 'Aucune',
  EGRATIGNURE: 'Égratignure',
  COUPURE_LEGERE: 'Coupure Légère',
  COUPURE_PROFONDE: 'Coupure Profonde',
  ENTAILLE: 'Entaille',
  FRACTURE_LEGERE: 'Fracture Légère',
  FRACTURE_GRAVE: 'Fracture Grave',
  BRULURE_LEGERE: 'Brûlure Légère',
  BRULURE_GRAVE: 'Brûlure Grave',
  EMPOISONNE: 'Empoisonné',
  HEMORRAGIE: 'Hémorragie',
  COMMOTION: 'Commotion',
  MEMBRE_BRISE: 'Membre Brisé',
  BLESSURE_CRITIQUE: 'Blessure Critique',
  PARALYSE_PARTIEL: 'Paralysé Partiel',
  AVEUGLE_TEMPORAIRE: 'Aveuglé Temporaire'
};

export const StatutsSpeciaux = {
  AUCUN: 'Aucun',
  MAUDIT: 'Maudit',
  EPUISE: 'Épuisé',
  AFFAIBLI: 'Affaibli',
  RALENTI: 'Ralenti',
  CONFUS: 'Confus',
  EFFRAYE: 'Effrayé',
  ENRAGE: 'Enragé',
  BENI: 'Béni',
  PROTEGE: 'Protégé',
  RENFORCE: 'Renforcé',
  ACCELERE: 'Accéléré',
  CONCENTRE: 'Concentré',
  INVISIBLE: 'Invisible',
  INVULNERABLE: 'Invulnérable',
  REGENERATION: 'Régénération',
  BERSERKER: 'Berserker'
};

export const TypeMission = {
  DONJON: 'Donjon',
  ESCORTE: 'Escorte',
  CHASSE_BOSS: 'Chasse au Boss',
  DEFENSE: 'Défense',
  EXPLORATION: 'Exploration',
  ENQUETE: 'Enquête',
  RAID: 'Raid'
};

export const TagMission = {
  NON_MORTS: 'Non-Morts',
  PIEGES: 'Pièges',
  EMBUSCADE: 'Embuscade',
  LONGUE_MISSION: 'Longue Mission',
  BOSS: 'Boss',
  ELEMENTAIRE: 'Élémentaire',
  MAGIE: 'Magie',
  COMBAT: 'Combat',
  SOCIAL: 'Social',
  STEALTH: 'Discrétion'
};

export const TypeItem = {
  ARME: 'Arme',
  ARMURE: 'Armure',
  ACCESSOIRE: 'Accessoire',
  POTION: 'Potion'
};

export const Rarete = {
  COMMUN: 'Commun',
  RARE: 'Rare',
  EPIQUE: 'Épique',
  LEGENDAIRE: 'Légendaire'
};

export const StatutMission = {
  SUCCES_COMPLET: 'Succès Complet',
  SUCCES_PARTIEL: 'Succès Partiel',
  ECHEC: 'Échec'
};

export const EtatPartie = {
  EN_COURS: 'En Cours',
  VICTOIRE: 'Victoire',
  DEFAITE: 'Défaite'
};

// Mapping classe -> arme par défaut
export const ArmeParDefaut = {
  [Classe.VILLAGEOIS]: Armes.BOIS,
  [Classe.MAGE]: Armes.BATON_MAGIQUE,
  [Classe.TANK]: Armes.EPEE,
  [Classe.HEALER]: Armes.BATON_MAGIQUE,
  [Classe.VOLEUR]: Armes.DAGUE,
  [Classe.GUERRIER]: Armes.EPEE_LONGUE
};

// Mapping classe -> armure par défaut
export const ArmureParDefaut = {
  [Classe.VILLAGEOIS]: Armures.AUCUNE,
  [Classe.MAGE]: Armures.ROBE_MAGE,
  [Classe.TANK]: Armures.ARMURE_PLAQUES,
  [Classe.HEALER]: Armures.ROBE_MAGE,
  [Classe.VOLEUR]: Armures.ARMURE_CUIR,
  [Classe.GUERRIER]: Armures.COTTE_MAILLES
};
