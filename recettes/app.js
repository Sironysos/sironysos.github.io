/*
 * Blog de recettes - logique 100% front-end (aucun backend).
 * Charge les fichiers JSON, valide les données de façon défensive,
 * affiche la grille et gère les filtres. Le contenu est inséré via
 * textContent / createElement pour éviter toute injection (XSS).
 */

"use strict";

/* ------------------------------------------------------------------ */
/* Utilitaires                                                         */
/* ------------------------------------------------------------------ */

// Normalise une chaîne : minuscules, sans accent, espaces réduits.
function normaliser(valeur) {
  return String(valeur == null ? "" : valeur)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

// N'autorise que des URL d'image sûres (relatives, http(s) ou data:image).
function urlImageSure(url) {
  const valeur = String(url == null ? "" : url).trim();
  if (valeur === "") return "";
  if (/^\s*javascript:/i.test(valeur)) return "";
  return valeur;
}

function estTexteNonVide(valeur) {
  return typeof valeur === "string" && valeur.trim() !== "";
}

// Charge un JSON avec gestion d'erreur lisible.
async function chargerJSON(chemin) {
  let reponse;
  try {
    reponse = await fetch(chemin, { cache: "no-cache" });
  } catch (e) {
    throw new Error("Impossible de contacter le fichier « " + chemin + " ».");
  }
  if (!reponse.ok) {
    throw new Error(
      "Fichier « " + chemin + " » introuvable (code " + reponse.status + ")."
    );
  }
  const texte = await reponse.text();
  try {
    return JSON.parse(texte);
  } catch (e) {
    throw new Error("Le fichier « " + chemin + " » contient un JSON invalide.");
  }
}

/* ------------------------------------------------------------------ */
/* Validation défensive des données                                    */
/* ------------------------------------------------------------------ */

function validerTags(donnees) {
  const map = new Map(); // slug -> libelle
  const liste = donnees && Array.isArray(donnees.tags) ? donnees.tags : [];
  for (const t of liste) {
    if (!t || typeof t !== "object") continue;
    const slug = normaliser(t.slug).replace(/\s+/g, "-");
    if (slug === "") continue;
    const libelle = estTexteNonVide(t.libelle) ? t.libelle.trim() : slug;
    if (!map.has(slug)) map.set(slug, libelle);
  }
  return map;
}

function validerSaisons(donnees) {
  const parMois = {}; // "1".."12" -> Set de noms normalisés
  const source =
    donnees && donnees.mois && typeof donnees.mois === "object"
      ? donnees.mois
      : {};
  for (let m = 1; m <= 12; m++) {
    const arr = Array.isArray(source[String(m)]) ? source[String(m)] : [];
    parMois[m] = new Set(
      arr.filter((x) => estTexteNonVide(x)).map((x) => normaliser(x))
    );
  }
  return parMois;
}

// Renvoie { recettes: [...valides], ignorees: n }
function validerRecettes(donnees, tagsMap) {
  const brut =
    donnees && Array.isArray(donnees.recettes) ? donnees.recettes : [];
  const valides = [];
  let ignorees = 0;

  brut.forEach((r, index) => {
    if (!r || typeof r !== "object") {
      ignorees++;
      return;
    }
    if (!estTexteNonVide(r.titre)) {
      console.warn("[recettes] Recette ignorée (titre manquant), index", index);
      ignorees++;
      return;
    }

    const id = estTexteNonVide(r.id) ? r.id.trim() : "recette-" + index;

    // Tags : on ne garde que des chaînes, normalisées.
    const tags = Array.isArray(r.tags)
      ? r.tags
          .filter((t) => estTexteNonVide(t))
          .map((t) => normaliser(t).replace(/\s+/g, "-"))
      : [];

    // Ingrédients : objets { quantite, unite, nom } ; nom obligatoire.
    const ingredients = Array.isArray(r.ingredients)
      ? r.ingredients
          .filter((i) => i && typeof i === "object" && estTexteNonVide(i.nom))
          .map((i) => ({
            quantite:
              i.quantite == null || i.quantite === ""
                ? ""
                : String(i.quantite),
            unite: estTexteNonVide(i.unite) ? i.unite.trim() : "",
            nom: i.nom.trim(),
          }))
      : [];

    // Étapes : uniquement des textes non vides.
    const etapes = Array.isArray(r.etapes)
      ? r.etapes.filter((e) => estTexteNonVide(e)).map((e) => e.trim())
      : [];

    valides.push({
      id: id,
      titre: r.titre.trim(),
      photo: urlImageSure(r.photo),
      tags: tags,
      ingredients: ingredients,
      etapes: etapes,
    });
  });

  return { recettes: valides, ignorees: ignorees };
}

/* ------------------------------------------------------------------ */
/* Rendu (création d'éléments DOM, sûr contre le XSS)                  */
/* ------------------------------------------------------------------ */

function creerPastilleTag(slug, tagsMap) {
  const span = document.createElement("span");
  span.className = "tag-pill";
  span.textContent = tagsMap.get(slug) || slug;
  return span;
}

function creerCarte(recette, tagsMap) {
  const li = document.createElement("li");
  li.className = "card";

  const lien = document.createElement("a");
  lien.className = "card-link";
  lien.href = "recette.html?id=" + encodeURIComponent(recette.id);

  const media = document.createElement("div");
  media.className = "card-media";
  if (recette.photo) {
    const img = document.createElement("img");
    img.src = recette.photo;
    img.alt = "Photo de la recette : " + recette.titre;
    img.loading = "lazy";
    media.appendChild(img);
  }

  const body = document.createElement("div");
  body.className = "card-body";

  const titre = document.createElement("h3");
  titre.className = "card-title";
  titre.textContent = recette.titre;
  body.appendChild(titre);

  if (recette.tags.length) {
    const tagsWrap = document.createElement("div");
    tagsWrap.className = "card-tags";
    recette.tags.forEach((slug) =>
      tagsWrap.appendChild(creerPastilleTag(slug, tagsMap))
    );
    body.appendChild(tagsWrap);
  }

  lien.appendChild(media);
  lien.appendChild(body);
  li.appendChild(lien);
  return li;
}

/* ------------------------------------------------------------------ */
/* Application - page liste (index.html)                               */
/* ------------------------------------------------------------------ */

async function initListe() {
  const grille = document.getElementById("grid");
  const zoneEtat = document.getElementById("etat");
  const compteur = document.getElementById("results-count");

  const etat = {
    tagsSelectionnes: new Set(),
    ingredient: "",
    saisonSeulement: false,
  };

  let recettes = [];
  let tagsMap = new Map();
  let saisonsParMois = {};

  function afficherEtat(message, type) {
    zoneEtat.textContent = "";
    zoneEtat.hidden = false;
    zoneEtat.className = "state" + (type === "error" ? " error" : "");
    zoneEtat.textContent = message;
  }

  function masquerEtat() {
    zoneEtat.hidden = true;
  }

  try {
    afficherEtat("Chargement des recettes…", "info");
    const [dTags, dSaisons, dRecettes] = await Promise.all([
      chargerJSON("tags.json").catch(() => ({ tags: [] })),
      chargerJSON("saisons.json").catch(() => ({ mois: {} })),
      chargerJSON("recettes.json"),
    ]);

    tagsMap = validerTags(dTags);
    saisonsParMois = validerSaisons(dSaisons);
    const resultat = validerRecettes(dRecettes, tagsMap);
    recettes = resultat.recettes;

    if (recettes.length === 0) {
      afficherEtat(
        "Aucune recette valide n'a été trouvée dans recettes.json.",
        "error"
      );
      return;
    }
    masquerEtat();
  } catch (erreur) {
    console.error("[recettes]", erreur);
    afficherEtat(
      "Erreur de chargement : " +
        (erreur && erreur.message ? erreur.message : "inconnue"),
      "error"
    );
    return;
  }

  construireFiltres();
  appliquerFiltres();

  /* --- Construction des filtres --- */
  function construireFiltres() {
    // Tags présents dans les recettes uniquement.
    const tagsUtilises = new Set();
    recettes.forEach((r) => r.tags.forEach((t) => tagsUtilises.add(t)));

    const conteneurTags = document.getElementById("filtre-tags");
    conteneurTags.textContent = "";
    Array.from(tagsUtilises)
      .sort((a, b) =>
        (tagsMap.get(a) || a).localeCompare(tagsMap.get(b) || b, "fr")
      )
      .forEach((slug) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "chip";
        btn.textContent = tagsMap.get(slug) || slug;
        btn.setAttribute("aria-pressed", "false");
        btn.addEventListener("click", () => {
          if (etat.tagsSelectionnes.has(slug)) {
            etat.tagsSelectionnes.delete(slug);
            btn.setAttribute("aria-pressed", "false");
          } else {
            etat.tagsSelectionnes.add(slug);
            btn.setAttribute("aria-pressed", "true");
          }
          appliquerFiltres();
        });
        conteneurTags.appendChild(btn);
      });

    // Ingrédients : liste unique (affichage d'origine, valeur normalisée).
    const parNorme = new Map();
    recettes.forEach((r) =>
      r.ingredients.forEach((i) => {
        const cle = normaliser(i.nom);
        if (cle && !parNorme.has(cle)) parNorme.set(cle, i.nom);
      })
    );

    const select = document.getElementById("filtre-ingredient");
    select.textContent = "";
    const optDefaut = document.createElement("option");
    optDefaut.value = "";
    optDefaut.textContent = "Tous les ingrédients";
    select.appendChild(optDefaut);

    Array.from(parNorme.keys())
      .sort((a, b) => parNorme.get(a).localeCompare(parNorme.get(b), "fr"))
      .forEach((cle) => {
        const opt = document.createElement("option");
        opt.value = cle;
        opt.textContent = parNorme.get(cle);
        select.appendChild(opt);
      });

    select.addEventListener("change", () => {
      etat.ingredient = select.value;
      appliquerFiltres();
    });

    // Saison du mois courant.
    const noms = [
      "janvier", "février", "mars", "avril", "mai", "juin",
      "juillet", "août", "septembre", "octobre", "novembre", "décembre",
    ];
    const moisCourant = new Date().getMonth() + 1;
    document.getElementById("mois-courant").textContent = noms[moisCourant - 1];

    const caseSaison = document.getElementById("filtre-saison");
    caseSaison.addEventListener("change", () => {
      etat.saisonSeulement = caseSaison.checked;
      appliquerFiltres();
    });

    // Réinitialisation.
    document.getElementById("reset").addEventListener("click", () => {
      etat.tagsSelectionnes.clear();
      etat.ingredient = "";
      etat.saisonSeulement = false;
      select.value = "";
      caseSaison.checked = false;
      conteneurTags
        .querySelectorAll(".chip")
        .forEach((c) => c.setAttribute("aria-pressed", "false"));
      appliquerFiltres();
    });
  }

  /* --- Logique de filtrage --- */
  function recetteEstDeSaison(recette) {
    const moisCourant = new Date().getMonth() + 1;
    const ingredientsSaison = saisonsParMois[moisCourant] || new Set();
    // Règle : au moins un ingrédient de saison suffit.
    return recette.ingredients.some((i) =>
      ingredientsSaison.has(normaliser(i.nom))
    );
  }

  function appliquerFiltres() {
    const filtrees = recettes.filter((r) => {
      // Tags : la recette doit posséder tous les tags sélectionnés.
      for (const slug of etat.tagsSelectionnes) {
        if (!r.tags.includes(slug)) return false;
      }
      // Ingrédient précis.
      if (etat.ingredient) {
        const present = r.ingredients.some(
          (i) => normaliser(i.nom) === etat.ingredient
        );
        if (!present) return false;
      }
      // Saison.
      if (etat.saisonSeulement && !recetteEstDeSaison(r)) return false;
      return true;
    });

    grille.textContent = "";
    if (filtrees.length === 0) {
      afficherEtat(
        "Aucune recette ne correspond à ces filtres. Essayez d'en retirer.",
        "info"
      );
    } else {
      masquerEtat();
      filtrees.forEach((r) => grille.appendChild(creerCarte(r, tagsMap)));
    }

    const n = filtrees.length;
    compteur.textContent =
      n + " recette" + (n > 1 ? "s" : "") + " sur " + recettes.length;
  }
}

/* ------------------------------------------------------------------ */
/* Application - page détail (recette.html)                            */
/* ------------------------------------------------------------------ */

async function initDetail() {
  const zone = document.getElementById("recette");
  const zoneEtat = document.getElementById("etat");

  function afficherEtat(message, type) {
    zoneEtat.hidden = false;
    zoneEtat.className = "state" + (type === "error" ? " error" : "");
    zoneEtat.textContent = message;
  }

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!estTexteNonVide(id)) {
    afficherEtat("Aucune recette demandée.", "error");
    return;
  }

  let recettes = [];
  let tagsMap = new Map();
  try {
    const [dTags, dRecettes] = await Promise.all([
      chargerJSON("tags.json").catch(() => ({ tags: [] })),
      chargerJSON("recettes.json"),
    ]);
    tagsMap = validerTags(dTags);
    recettes = validerRecettes(dRecettes, tagsMap).recettes;
  } catch (erreur) {
    console.error("[recettes]", erreur);
    afficherEtat(
      "Erreur de chargement : " +
        (erreur && erreur.message ? erreur.message : "inconnue"),
      "error"
    );
    return;
  }

  const recette = recettes.find((r) => r.id === id);
  if (!recette) {
    afficherEtat("Recette introuvable.", "error");
    return;
  }

  zoneEtat.hidden = true;
  document.title = recette.titre + " — Recettes";
  rendreDetail(zone, recette, tagsMap);
}

function rendreDetail(zone, recette, tagsMap) {
  zone.textContent = "";

  if (recette.photo) {
    const hero = document.createElement("div");
    hero.className = "recipe-hero";
    const img = document.createElement("img");
    img.src = recette.photo;
    img.alt = "Photo de la recette : " + recette.titre;
    hero.appendChild(img);
    zone.appendChild(hero);
  }

  const h1 = document.createElement("h1");
  h1.textContent = recette.titre;
  zone.appendChild(h1);

  if (recette.tags.length) {
    const tagsWrap = document.createElement("div");
    tagsWrap.className = "card-tags";
    recette.tags.forEach((slug) =>
      tagsWrap.appendChild(creerPastilleTag(slug, tagsMap))
    );
    zone.appendChild(tagsWrap);
  }

  // Ingrédients
  const secIng = document.createElement("section");
  secIng.className = "recipe-section";
  const hIng = document.createElement("h2");
  hIng.textContent = "Ingrédients";
  secIng.appendChild(hIng);

  if (recette.ingredients.length) {
    const ul = document.createElement("ul");
    ul.className = "ingredients-list";
    recette.ingredients.forEach((i) => {
      const li = document.createElement("li");
      const qty = document.createElement("span");
      qty.className = "ingredient-qty";
      qty.textContent = [i.quantite, i.unite].filter((x) => x).join(" ");
      const nom = document.createElement("span");
      nom.textContent = i.nom;
      if (qty.textContent) li.appendChild(qty);
      li.appendChild(nom);
      ul.appendChild(li);
    });
    secIng.appendChild(ul);
  } else {
    const p = document.createElement("p");
    p.textContent = "Aucun ingrédient renseigné.";
    secIng.appendChild(p);
  }
  zone.appendChild(secIng);

  // Étapes
  const secEt = document.createElement("section");
  secEt.className = "recipe-section";
  const hEt = document.createElement("h2");
  hEt.textContent = "Préparation";
  secEt.appendChild(hEt);

  if (recette.etapes.length) {
    const ol = document.createElement("ol");
    ol.className = "steps-list";
    recette.etapes.forEach((e) => {
      const li = document.createElement("li");
      const span = document.createElement("span");
      span.textContent = e;
      li.appendChild(span);
      ol.appendChild(li);
    });
    secEt.appendChild(ol);
  } else {
    const p = document.createElement("p");
    p.textContent = "Aucune étape renseignée.";
    secEt.appendChild(p);
  }
  zone.appendChild(secEt);
}

/* ------------------------------------------------------------------ */
/* Amorçage selon la page                                              */
/* ------------------------------------------------------------------ */

document.addEventListener("DOMContentLoaded", () => {
  const page = document.body.getAttribute("data-page");
  if (page === "detail") {
    initDetail();
  } else {
    initListe();

    // Bascule de la colonne de filtres sur mobile.
    const toggle = document.getElementById("filters-toggle");
    const filtres = document.getElementById("filters");
    if (toggle && filtres) {
      toggle.addEventListener("click", () => {
        const ouvert = filtres.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", ouvert ? "true" : "false");
      });
    }
  }
});
