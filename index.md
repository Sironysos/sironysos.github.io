---
layout: default
title: Accueil
---

<h1>Bienvenue sur CuisINSA 👨‍🍳</h1>

<p>Retrouvez ici des recettes simples, illustrées, et adaptées aux étudiant•e•s !</p>

<ul>
  {% for post in site.posts %}
    <li>
      <a href="{{ post.url }}">{{ post.title }}</a> — {{ post.date | date: "%d %B %Y" }}
    </li>
  {% endfor %}
</ul>
