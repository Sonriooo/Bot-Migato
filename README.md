# Bot Discord — Documentation Complète

> Bot Discord professionnel développé en **Node.js** avec **discord.js v14** et **MongoDB**. Architecture modulaire, design premium, +80 commandes réparties en 8 catégories.

---

## Sommaire

- [Prérequis](#prérequis)
- [Installation](#installation)
- [Configuration](#configuration)
- [Architecture du projet](#architecture-du-projet)
- [Système de permissions](#système-de-permissions)
- [Commandes](#commandes)
  - [Public](#public)
  - [Modération](#modération)
  - [Logs](#logs)
  - [Gestion](#gestion)
  - [Giveaway](#giveaway)
  - [Antiraid](#antiraid)
  - [Owner](#owner)
  - [Buyer](#buyer)
- [Événements](#événements)
- [Démarrage](#démarrage)

---

## Prérequis

| Outil       | Version minimale |
|-------------|-----------------|
| Node.js     | v18.0.0+        |
| npm         | v8.0.0+         |
| MongoDB     | v5.0+           |

---

## Installation

```bash
# 1. Cloner ou extraire le projet
cd discord-bot

# 2. Installer les dépendances
npm install

# 3. Copier le fichier d'environnement
cp .env.example .env

# 4. Remplir le fichier .env (voir section Configuration)
nano .env

# 5. Démarrer le bot
npm start

# Ou en mode développement (avec nodemon)
npm run dev
```

---

## Configuration

Renommez `.env.example` en `.env` et remplissez les valeurs :

```env
# Token Discord (obligatoire)
TOKEN=votre_token_discord_ici

# ID du propriétaire du bot (obligatoire)
BOT_OWNER=votre_id_discord

# URI MongoDB (obligatoire)
MONGODB_URI=mongodb://localhost:27017/discord-bot

# Préfixe par défaut
PREFIX=&

# Serveur de support (optionnel)
SUPPORT_SERVER=https://discord.gg/votre-serveur
```

---

## Architecture du projet

```
discord-bot/
├── src/
│   ├── index.js                    # Point d'entrée principal
│   ├── config/
│   │   └── config.js               # Configuration globale (couleurs, emojis, etc.)
│   ├── database/
│   │   └── connect.js              # Connexion MongoDB
│   ├── models/                     # Modèles Mongoose
│   │   ├── Guild.js                # Configuration serveur
│   │   ├── Sanction.js             # Sanctions (ban, kick, warn, mute...)
│   │   ├── Giveaway.js             # Giveaways
│   │   ├── Ticket.js               # Tickets de support
│   │   ├── Buyer.js                # Acheteurs du bot
│   │   ├── Reminder.js             # Rappels
│   │   └── TempVoc.js              # Salons vocaux temporaires
│   ├── handlers/                   # Chargeurs automatiques
│   │   ├── commandHandler.js       # Chargement des commandes
│   │   ├── eventHandler.js         # Chargement des événements
│   │   └── interactionHandler.js   # Chargement des boutons/menus/modals
│   ├── events/                     # Événements Discord
│   │   ├── ready.js
│   │   ├── messageCreate.js        # Traitement commandes + antiraid
│   │   ├── messageDelete.js        # Log + snipe
│   │   ├── messageUpdate.js        # Log édition
│   │   ├── guildMemberAdd.js       # Arrivée + antiraid + bienvenue
│   │   ├── guildMemberRemove.js    # Départ + message
│   │   ├── guildBanAdd.js          # Log ban
│   │   ├── voiceStateUpdate.js     # Log vocal + tempvoc
│   │   └── interactionCreate.js    # Boutons, menus, modals
│   ├── commands/                   # Commandes par catégorie
│   │   ├── Public/
│   │   ├── Moderation/
│   │   ├── Logs/
│   │   ├── Gestion/
│   │   ├── Giveaway/
│   │   ├── Antiraid/
│   │   ├── Owner/
│   │   └── Buyer/
│   ├── buttons/                    # Gestionnaires de boutons
│   │   ├── ticket_create.js
│   │   ├── ticket_close.js
│   │   ├── ticket_claim.js
│   │   └── giveaway_enter.js
│   └── utils/                      # Utilitaires
│       ├── embed.js                # Création d'embeds
│       ├── permissions.js          # Vérification des permissions
│       ├── format.js               # Formatage (durée, temps, etc.)
│       ├── guildUtils.js           # Cache et gestion des guildes
│       ├── pagination.js           # Pagination des embeds
│       ├── sanctionUtils.js        # Gestion des sanctions
│       ├── giveawayUtils.js        # Gestion des giveaways
│       └── reminderUtils.js        # Gestion des rappels
├── .env.example
├── package.json
└── README.md
```

---

## Système de permissions

Le bot utilise un système de permissions à **11 niveaux** (0-10) :

| Niveau | Nom                | Description                              |
|--------|--------------------|------------------------------------------|
| 0      | Membre             | Commandes publiques de base              |
| 1      | Membre+            | Commandes légèrement restreintes         |
| 2      | Modérateur Junior  | Commandes de modération basiques         |
| 3      | Modérateur         | Warn, mute, clear, slowmode              |
| 4      | Modérateur Senior  | Kick, addrole, delrole                   |
| 5      | Administrateur     | Giveaway, embed, poll                    |
| 6      | Administrateur+    | Derank, delete, del, nsfw                |
| 7      | Gestionnaire       | Logs, setmute, ticket, tempvoc           |
| 8      | Co-Owner           | Antiraid, lockdown, backup               |
| 9      | Owner              | Toutes les commandes Owner               |
| 10     | Développeur        | Accès total (bot owner uniquement)       |

Les niveaux sont attribuables via `&addperm` et `&delperm`. Le propriétaire du serveur obtient automatiquement le niveau 9, et le propriétaire du bot le niveau 10.

---

## Commandes

Le préfixe par défaut est `&`. Il est configurable par serveur avec `&setprefix`.

---

### Public

| Commande     | Alias                    | Description                                      | Niveau |
|--------------|--------------------------|--------------------------------------------------|--------|
| `&help`      | `h`, `aide`              | Menu d'aide interactif avec pagination           | 0      |
| `&helpall`   | `ha`, `allcommands`      | Liste toutes les commandes                       | 0      |
| `&ping`      | `latency`, `pong`        | Affiche la latence du bot                        | 0      |
| `&user`      | `userinfo`, `whois`      | Informations sur un utilisateur                  | 0      |
| `&serverinfo`| `si`, `server`           | Informations sur le serveur                      | 0      |
| `&banner`    | `userbanner`             | Affiche la bannière d'un utilisateur             | 0      |
| `&pic`       | `avatar`, `av`           | Affiche l'avatar d'un utilisateur                | 0      |
| `&roleinfo`  | `ri`, `role`             | Informations sur un rôle                         | 0      |
| `&snipe`     | `s`                      | Affiche le dernier message supprimé              | 0      |
| `&support`   | `aide`, `server`         | Lien vers le serveur de support                  | 0      |
| `&calc`      | `calculate`, `math`      | Calculatrice                                     | 0      |
| `&reminder`  | `remind`, `rappel`       | Crée un rappel                                   | 0      |

---

### Modération

| Commande         | Alias                    | Description                                  | Niveau |
|------------------|--------------------------|----------------------------------------------|--------|
| `&ban`           | `bannir`                 | Bannit un membre                             | 5      |
| `&tempban`       | `tban`, `bantemp`        | Bannit temporairement un membre              | 5      |
| `&kick`          | `expulser`, `kk`         | Expulse un membre                            | 4      |
| `&warn`          | `avertir`, `avert`       | Avertit un membre                            | 3      |
| `&tempmute`      | `tmute`, `timeout`       | Mute temporairement un membre                | 3      |
| `&unmute`        | `demute`, `untimeout`    | Retire le mute d'un membre                   | 3      |
| `&unmuteall`     | `demuteall`              | Retire le mute de tous les membres           | 8      |
| `&clear`         | `purge`, `prune`         | Supprime des messages en masse               | 3      |
| `&slowmode`      | `slow`, `ratelimit`      | Définit le slowmode d'un salon               | 3      |
| `&setmute`       | `muterole`               | Configure le rôle de mute                    | 7      |
| `&derank`        | `removeroles`            | Retire tous les rôles d'un membre            | 6      |
| `&addrole`       | `giverole`, `ar`         | Ajoute un rôle à un membre                   | 4      |
| `&delrole`       | `removerole`, `dr`       | Retire un rôle d'un membre                   | 4      |
| `&sanction`      | `sanctions`, `history`   | Historique des sanctions d'un membre         | 3      |
| `&sanction-info` | `sinfo`                  | Détails d'une sanction par ID                | 3      |
| `&del-sanction`  | `delsanction`, `ds`      | Supprime une sanction                        | 6      |
| `&mutelist`      | `muted`                  | Liste les membres mutés                      | 3      |

---

### Logs

| Commande         | Alias              | Description                                   | Niveau |
|------------------|--------------------|-----------------------------------------------|--------|
| `&logs`          | `setlogs`          | Configure le salon de logs général            | 7      |
| `&modlogs`       | `setmodlogs`       | Configure les logs de modération              | 7      |
| `&msglogs`       | `setmsglogs`       | Configure les logs de messages                | 7      |
| `&raidlogs`      | `setraidlogs`      | Configure les logs anti-raid                  | 7      |
| `&rolelogs`      | `setrolelogs`      | Configure les logs de rôles                   | 7      |
| `&voicelogs`     | `setvoicelogs`     | Configure les logs vocaux                     | 7      |
| `&joinmessage`   | `welcome`, `joinmsg` | Configure le message de bienvenue           | 7      |
| `&leavemessage`  | `goodbye`, `leavemsg`| Configure le message de départ             | 7      |

---

### Gestion

| Commande       | Alias                    | Description                                    | Niveau |
|----------------|--------------------------|------------------------------------------------|--------|
| `&ticket`      | `setupticket`            | Déploie le panel de tickets                    | 8      |
| `&close`       | `fermer`                 | Ferme le ticket actuel                         | 3      |
| `&poll`        | `sondage`, `vote`        | Crée un sondage                                | 3      |
| `&embed`       | `createembed`            | Crée un embed personnalisé                     | 5      |
| `&compteur`    | `counter`                | Crée un compteur automatique                   | 7      |
| `&tempvoc`     | `tempvoice`, `tv`        | Configure les salons vocaux temporaires        | 7      |
| `&rolemembers` | `rm`, `inrole`           | Liste les membres d'un rôle                    | 3      |
| `&boosters`    | `boosts`, `nitro`        | Liste les boosters                             | 0      |
| `&banlist`     | `bans`, `banned`         | Liste les membres bannis                       | 5      |
| `&botlist`     | `bots`                   | Liste les bots du serveur                      | 0      |
| `&adminlist`   | `admins`, `mods`         | Liste les administrateurs                      | 0      |
| `&stickers`    | `stickerlist`            | Liste les stickers                             | 0      |
| `&nsfw`        | `age-restrict`           | Active/désactive le mode NSFW                  | 6      |
| `&rename`      | `renommersalon`          | Renomme un salon                               | 5      |
| `&topic`       | `settopic`               | Définit le sujet d'un salon                    | 4      |
| `&add`         | `createrole`             | Crée un nouveau rôle                           | 6      |
| `&del`         | `deletechannel`          | Supprime un salon                              | 7      |
| `&delete`      | `deleterole`             | Supprime un rôle                               | 7      |
| `&category`    | `createcategory`         | Crée une catégorie                             | 7      |
| `&create`      | `createchannel`, `cc`    | Crée un salon (text/voice)                     | 7      |

---

### Giveaway

| Commande    | Alias                | Description                              | Niveau |
|-------------|----------------------|------------------------------------------|--------|
| `&giveaway` | `gw`, `gcreate`      | Lance un giveaway                        | 5      |
| `&greroll`  | `reroll`             | Relance le tirage d'un giveaway terminé  | 5      |
| `&gend`     | `endgiveaway`        | Termine un giveaway immédiatement        | 5      |
| `&glist`    | `giveaways`          | Liste les giveaways actifs               | 3      |
| `&gdelete`  | `gdel`               | Supprime un giveaway                     | 6      |

**Format de lancement :** `&giveaway <durée> <nb>w <prix>`
**Exemple :** `&giveaway 24h 3w Nitro Discord`

---

### Antiraid

| Commande          | Alias              | Description                                    | Niveau |
|-------------------|--------------------|------------------------------------------------|--------|
| `&antiraid`       | `ar`               | Active/désactive le système antiraid           | 8      |
| `&antijoin`       | `massjoin`         | Configure la protection anti mass-join         | 8      |
| `&antibot`        | `anti-bot`         | Active/désactive la protection anti-bot        | 8      |
| `&antispam`       | `anti-spam`        | Configure la protection anti-spam              | 7      |
| `&antilinks`      | `nolinks`          | Active/désactive la suppression des liens      | 6      |
| `&antiinvite`     | `noinvite`         | Active/désactive la suppression des invitations| 6      |
| `&antimentions`   | `nomentions`       | Configure la protection anti mass-mentions     | 6      |
| `&antiraid-status`| `arstatus`         | Affiche la configuration complète              | 5      |
| `&lockdown`       | `lock`, `lockall`  | Verrouille tous les salons                     | 8      |
| `&unlockdown`     | `unlock`           | Déverrouille tous les salons                   | 8      |

---

### Owner

| Commande               | Alias               | Description                                    | Niveau |
|------------------------|---------------------|------------------------------------------------|--------|
| `&setprefix`           | `prefix`            | Change le préfixe du bot                       | 9      |
| `&setcolor`            | `color`, `couleur`  | Change la couleur des embeds                   | 9      |
| `&perms`               | `permissions`       | Affiche les niveaux de permission              | 7      |
| `&addperm`             | `setperm`           | Ajoute un rôle/utilisateur à un niveau         | 9      |
| `&delperm`             | `removeperm`        | Retire un rôle/utilisateur d'un niveau         | 9      |
| `&backup`              | `save`              | Sauvegarde la configuration du serveur         | 9      |
| `&lock-channel`        | `lockchannel`       | Verrouille un salon spécifique                 | 7      |
| `&unlock-channel`      | `unlockchannel`     | Déverrouille un salon spécifique               | 7      |
| `&setticket-role`      | `ticketrole`        | Définit les rôles de support des tickets       | 9      |
| `&setticket-category`  | `ticketcategory`    | Définit la catégorie des tickets               | 9      |
| `&setticket-message`   | `ticketmessage`     | Définit le message du panel de tickets         | 9      |

---

### Buyer

| Commande      | Alias                  | Description                                   | Niveau |
|---------------|------------------------|-----------------------------------------------|--------|
| `&presence`   | `setpresence`          | Change la présence/activité du bot            | 10     |
| `&avatar-bot` | `setavatar`            | Change l'avatar du bot                        | 10     |
| `&theme`      | `settheme`             | Change le thème de couleur                    | 10     |
| `&setbotname` | `botname`              | Change le pseudo du bot                       | 10     |
| `&invite`     | `botinvite`            | Affiche le lien d'invitation                  | 0      |
| `&botinfo`    | `stats`, `about`       | Statistiques du bot                           | 0      |
| `&whitelist`  | `wl`, `addserver`      | Gère la whitelist des serveurs                | 10     |
| `&blacklist`  | `bl`, `botban`         | Gère la blacklist des utilisateurs            | 10     |

---

## Événements

| Événement             | Description                                              |
|-----------------------|----------------------------------------------------------|
| `ready`               | Démarrage du bot, restauration des giveaways/rappels     |
| `messageCreate`       | Traitement des commandes + protections antiraid          |
| `messageDelete`       | Log de suppression + cache snipe                         |
| `messageUpdate`       | Log d'édition de message                                 |
| `guildMemberAdd`      | Log d'arrivée + antiraid + message de bienvenue          |
| `guildMemberRemove`   | Log de départ + message de départ                        |
| `guildBanAdd`         | Log de ban dans les modlogs                              |
| `voiceStateUpdate`    | Log vocal + gestion des salons temporaires               |
| `interactionCreate`   | Gestion des boutons, menus déroulants et modals          |

---

## Démarrage

```bash
# Production
npm start

# Développement (avec rechargement automatique)
npm run dev
```

Le bot se connecte automatiquement à MongoDB et charge toutes les commandes, événements et interactions au démarrage.

---

## Variables d'environnement

| Variable       | Description                        | Obligatoire |
|----------------|------------------------------------|-------------|
| `TOKEN`        | Token du bot Discord               | ✅          |
| `BOT_OWNER`    | ID Discord du propriétaire du bot  | ✅          |
| `MONGODB_URI`  | URI de connexion MongoDB           | ✅          |
| `PREFIX`       | Préfixe par défaut                 | ❌ (défaut: `&`) |
| `SUPPORT_SERVER`| Lien du serveur de support        | ❌          |

---

*Développé avec discord.js v14 — Architecture modulaire professionnelle*
