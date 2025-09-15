## ⚠️ Avertissement important pour le seed des boosters

Lorsque vous effectuez un seed pour ajouter de nouveaux boosters (par exemple lors de la sortie de prochaines saisons), il est impératif de toujours conserver un booster fictif avec l'id `0` dans la base de données. Ce booster fictif est utilisé pour associer les cartes hors séries, car toutes les cartes doivent être rattachées à un booster pour pouvoir s'afficher dans la collection.

**Attention :**

- Vérifiez que le seed ne supprime pas ou ne remplace pas le booster fictif d'id `0`.
- Si vous modifiez la logique du seed, assurez-vous que ce booster fictif existe toujours après l'opération.
- Sans ce booster, les cartes hors séries ne seront plus visibles dans la collection !

Gardez ce point en tête à chaque évolution du seed ou ajout de boosters.
