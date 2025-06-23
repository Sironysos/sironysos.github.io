---
layout: default
title: Accueil
---

<div style="text-align: center; margin-bottom: 3rem;">
  <h1 style="font-size: 2.5rem; color: #2d3748; margin-bottom: 1rem;">
    Bienvenue sur CuisINSA ! 👨‍🍳
  </h1>
  <p style="font-size: 1.2rem; color: #718096; max-width: 600px; margin: 0 auto;">
    Découvrez des recettes simples, savoureuses et adaptées à la vie étudiante. 
    Avec des photos, des vidéos et une communauté pour partager vos astuces !
  </p>
</div>

<!-- Section statistiques -->
<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-bottom: 3rem;">
  <div style="text-align: center; padding: 1.5rem; background: linear-gradient(135deg, #ff6b6b, #ffa726); color: white; border-radius: 15px; box-shadow: 0 10px 30px rgba(255,107,107,0.2);">
    <div style="font-size: 2rem; font-weight: bold;">{{ site.posts | size }}</div>
    <div>Recettes disponibles</div>
  </div>
  <div style="text-align: center; padding: 1.5rem; background: linear-gradient(135deg, #667eea, #764ba2); color: white; border-radius: 15px; box-shadow: 0 10px 30px rgba(102,126,234,0.2);">
    <div style="font-size: 2rem; font-weight: bold;">⭐</div>
    <div>Fait par des étudiants</div>
  </div>
  <div style="text-align: center; padding: 1.5rem; background: linear-gradient(135deg, #f093fb, #f5576c); color: white; border-radius: 15px; box-shadow: 0 10px 30px rgba(240,147,251,0.2);">
    <div style="font-size: 2rem; font-weight: bold;">💬</div>
    <div>Communauté active</div>
  </div>
</div>

<!-- Section recettes récentes -->
<div style="margin-bottom: 3rem;">
  <h2 style="font-size: 2rem; color: #2d3748; margin-bottom: 2rem; text-align: center;">
    🔥 Dernières recettes
  </h2>
  
  <div class="recipe-grid">
    {% for post in site.posts limit:6 %}
      <article class="recipe-card">
        {% if post.image %}
          <img src="{{ post.image | relative_url }}" alt="{{ post.title }}" class="recipe-image">
        {% else %}
          <div class="recipe-image" style="display: flex; align-items: center; justify-content: center; font-size: 3rem;">
            🍽️
          </div>
        {% endif %}
        
        <div class="recipe-content">
          <h3 class="recipe-title">{{ post.title }}</h3>
          <div class="recipe-date">📅 {{ post.date | date: "%d %B %Y" }}</div>
          
          {% if post.excerpt %}
            <div class="recipe-excerpt">{{ post.excerpt | strip_html | truncate: 100 }}</div>
          {% endif %}
          
          <div style="margin-top: 1rem;">
            {% if post.video %}
              <span class="tag">🎥 Vidéo</span>
            {% endif %}
            {% if post.difficulty %}
              <span class="tag">{{ post.difficulty }}</span>
            {% endif %}
            {% if post.time %}
              <span class="tag">⏱️ {{ post.time }}</span>
            {% endif %}
          </div>
          
          <a href="{{ post.url | relative_url }}" class="read-more">
            Voir la recette →
          </a>
        </div>
      </article>
    {% endfor %}
  </div>
</div>

<!-- Section appel à l'action -->
<div style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 3rem 2rem; border-radius: 20px; text-align: center; margin-bottom: 3rem;">
  <h2 style="font-size: 2rem; margin-bottom: 1rem;">🤝 Rejoignez la communauté !</h2>
  <p style="font-size: 1.1rem; margin-bottom: 2rem; opacity: 0.9;">
    Partagez vos propres recettes, commentez celles des autres et découvrez de nouvelles saveurs !
  </p>
  <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
    <a href="/about/" class="btn btn-primary" style="background: rgba(255,255,255,0.2); backdrop-filter: blur(10px);">
      En savoir plus
    </a>
    <a href="https://github.com/sironysos/sironysos.github.io" class="btn btn-secondary" style="background: rgba(255,255,255,0.1); color: white; backdrop-filter: blur(10px);">
      Contribuer
    </a>
  </div>
</div>

<!-- Section conseils -->
<div style="margin-bottom: 3rem;">
  <h2 style="font-size: 2rem; color: #2d3748; margin-bottom: 2rem; text-align: center;">
    💡 Conseils pour bien commencer
  </h2>
  
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem;">
    <div style="background: #f7fafc; padding: 2rem; border-radius: 15px; border-left: 5px solid #ff6b6b;">
      <h3 style="color: #2d3748; margin-bottom: 1rem;">🛒 Faire ses courses</h3>
      <p style="color: #4a5568; line-height: 1.6;">
        Privilégiez les produits de base : pâtes, riz, œufs, légumes de saison. 
        Pensez aux épices pour varier les saveurs !
      </p>
    </div>
    
    <div style="background: #f7fafc; padding: 2rem; border-radius: 15px; border-left: 5px solid #667eea;">
      <h3 style="color: #2d3748; margin-bottom: 1rem;">⏰ Gagner du temps</h3>
      <p style="color: #4a5568; line-height: 1.6;">
        Préparez vos légumes à l'avance, cuisinez en grandes quantités 
        et n'hésitez pas à congeler vos préparations.
      </p>
    </div>
    
    <div style="background: #f7fafc; padding: 2rem; border-radius: 15px; border-left: 5px solid #f093fb;">
      <h3 style="color: #2d3748; margin-bottom: 1rem;">👥 Cuisiner ensemble</h3>
      <p style="color: #4a5568; line-height: 1.6;">
        La cuisine en salle commune, c'est plus sympa à plusieurs ! 
        Partagez les frais et découvrez de nouvelles techniques.
      </p>
    </div>
  </div>
</div>