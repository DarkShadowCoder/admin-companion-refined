# Admin Hub Companion

Je veux que tu termine le codes de l'application web suivante: https://github.com/DarkShadowCoder/admin-companion-hub.git
 en te basant sur la description en annexe et en te referants a la description de ce qui a deja ete fait et sur le schema de la base de données zender_test


Voici où en est le travail, et ce qu'il reste.
Fait dans cette session

Code du dépôt GitHub réimporté dans le projet (il manquait entièrement : fonctions serveur admin.functions.ts/admin.server.ts, intégrations Supabase, shell admin, hooks, routes /, /login, /admin, /admin/transactions).
Installation de @supabase/supabase-js.
Correction des types optionnels des inputValidator (incompatibles avec exactOptionalPropertyTypes).
Nouveau composant partagé src/components/admin/data-table.tsx.
Nouveaux écrans : /admin/transactions/$id (détail complet : infos, preuves client, preuves d'exécution + ajout, décisions confirmer/rejeter/annuler, affectation partenaire, historique), /admin/users, /admin/users/$id (profil, wallet, ajustement, transactions, grand livre), /admin/wallets, /admin/partners (CRUD), /admin/momo (CRUD).
Reste à faire (les fonctions serveur existent déjà, il ne manque que les écrans) : /admin/settlements (listSettlements + saveSettlement), /admin/tariffs (listTariffs + saveTariff), /admin/batches (listBatches + processBatch), /admin/kmerdiaspora (getKmerDiaspora + moderateContent), /admin/audit (listAudit), /admin/settings (listAdmins + setAdminActive) — puis vérification du build (des erreurs de type sur les liens Link vers ces routes subsistent tant que les fichiers ne sont pas créés).

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/8f6482fe-3f1b-4524-87ff-a45f8812ada9).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
