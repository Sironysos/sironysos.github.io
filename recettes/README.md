# Blog de recettes — guide de maintenance

Ce dossier contient une application **100 % statique** (aucun serveur, aucune
base de données, aucune connexion). Tout se gère en modifiant des fichiers
directement sur GitHub.

## Arborescence

```
index.html              ← page d'accueil du site (contient le lien vers l'app)
recettes/
  index.html            ← page principale de l'application (grille + filtres)
  recette.html          ← page de détail d'une recette
  app.js                ← logique (chargement, validation, filtres)
  style.css             ← styles
  recettes.json         ← VOS RECETTES  ⬅️ à modifier
  tags.json             ← liste officielle des tags ⬅️ à modifier
  saisons.json          ← ingrédients de saison par mois ⬅️ à modifier
  images/               ← photos de couverture
```

Sur GitHub Pages, publiez la racine du dépôt : l'accueil sera `index.html` et
l'application `recettes/index.html`.

---

## Ajouter une recette

1. Ouvrez `recettes/recettes.json` sur GitHub (bouton crayon « Edit »).
2. Ajoutez un objet dans le tableau `"recettes"`. Copiez un bloc existant pour
   ne pas vous tromper :

```json
{
  "id": "gratin-de-courgettes",
  "titre": "Gratin de courgettes",
  "photo": "images/gratin-courgettes.png",
  "tags": ["plat", "vegetarien", "ete"],
  "ingredients": [
    { "quantite": 4, "unite": "pièce", "nom": "courgette" },
    { "quantite": 20, "unite": "cl", "nom": "crème fraîche" }
  ],
  "etapes": [
    "Coupez les courgettes en rondelles.",
    "Disposez dans un plat, ajoutez la crème et enfournez 30 minutes."
  ]
}
```

Règles importantes :

- **`id`** : unique, en minuscules, sans espace ni accent (utilisé dans l'URL).
- **`titre`** : obligatoire (une recette sans titre est ignorée).
- **`photo`** : chemin d'une image du dossier `images/` (ex. `images/mon-plat.png`)
  ou une URL complète `https://…`. Pour ajouter une photo, glissez le fichier
  dans `recettes/images/` sur GitHub puis indiquez son nom ici.
- **`tags`** : uniquement des `slug` présents dans `tags.json` (voir plus bas).
- **`ingredients`** : chaque ligne = `quantite` + `unite` + `nom`.
- **`etapes`** : une phrase par étape (la numérotation est automatique).
- N'oubliez pas la **virgule** entre deux recettes, et vérifiez que le JSON reste
  valide (pas de virgule après le dernier élément).

## Modifier une recette

Éditez directement l'objet correspondant dans `recettes.json`, puis
enregistrez (commit). La modification est visible dès que GitHub Pages a
publié.

## Supprimer une recette

Supprimez l'objet `{ … }` complet de la recette dans `recettes.json`
(et la virgule associée). Vous pouvez aussi supprimer sa photo dans `images/`.

---

## Gérer les tags (éviter les doublons)

Les tags sont centralisés dans `recettes/tags.json` :

```json
{ "slug": "ete", "libelle": "Été" }
```

- **`slug`** = identifiant technique : **minuscules, sans accent, sans espace**
  (utilisez un tiret `-` si besoin, ex. `plat-unique`).
- **`libelle`** = texte affiché à l'écran (accents autorisés).

**Règle simple pour ne jamais avoir de doublons :**

1. Avant de taguer une recette, vérifiez si le tag existe déjà dans `tags.json`.
2. S'il existe, réutilisez **exactement son `slug`** dans la recette.
3. S'il n'existe pas, ajoutez d'abord une entrée dans `tags.json`, puis
   utilisez son `slug`.

> L'application normalise automatiquement la casse et les espaces, donc
> `"Été"`, `"ete"` ou `" ETE "` sont traités comme le même tag `ete`. Garder un
> seul `slug` par notion évite toute confusion.

Seuls les tags réellement utilisés par au moins une recette apparaissent dans
la colonne de filtres.

---

## Ingrédients de saison

Le fichier `recettes/saisons.json` liste, pour chaque mois (`1` = janvier …
`12` = décembre), les ingrédients considérés « de saison ».

- Écrivez les noms en **minuscules, au singulier** (les accents sont ignorés à
  la comparaison, mais restez cohérent).
- Une recette apparaît dans le filtre « de saison » si **au moins un** de ses
  ingrédients figure dans la liste du mois courant.
- Pour que la correspondance fonctionne, le `nom` de l'ingrédient dans la
  recette doit correspondre à l'entrée de saison (ex. `"tomate"` ↔ `"tomate"`).

---

## Robustesse

- Si un fichier JSON est invalide ou introuvable, un message d'erreur clair
  s'affiche à la place de la grille.
- Les recettes mal formées (sans titre, etc.) sont automatiquement ignorées
  sans casser l'affichage des autres.
- Tout le contenu des JSON est affiché de façon sécurisée (protection contre
  l'injection de code / XSS).
