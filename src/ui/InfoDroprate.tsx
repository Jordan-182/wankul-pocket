import styles from "./InfoDroprate.module.css";
import { useState } from "react";
import { CardsModel } from "@/model/CardsModel";
import Loader from "@/ui/Loader";

const RARITY_STYLES: { [key: string]: string } = {
  Terrain: styles.cardTerrain,
  Commune: styles.card45,
  "Peu commune": styles.card30,
  Rare: styles.card10,
  "Ultra rare holo 1": styles.card2_24,
  "Ultra rare holo 2": styles.card1_60,
  "Légendaire Bronze": styles.card0_80,
  "Légendaire Argent": styles.card0_28,
  "Légendaire Or": styles.card0_08,
};

export function InfoDroprate({ cards }: { cards: CardsModel[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const cardsByRarity = cards.reduce((acc, card) => {
    const rarity = card.rarity;
    if (!acc[rarity]) {
      acc[rarity] = [];
    }
    acc[rarity].push(card);
    return acc;
  }, {} as { [key: string]: CardsModel[] });

  const handleOpen = () => {
    setIsLoading(true);
    setIsOpen(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 300);
  };

  return (
    <>
      <button onClick={handleOpen}>Infos</button>
      {isOpen && (
        <div className={styles.overlay} onClick={() => setIsOpen(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button
              className={styles.closeBtn}
              onClick={() => setIsOpen(false)}
            >
              ✖
            </button>
            <div className={styles.modalContent}>
              {isLoading ? (
                <div className={styles.loader}>
                  <Loader />
                </div>
              ) : (
                <>
                  <h2 className={styles.modalTitle}>
                    Informations sur les taux de drop
                  </h2>

                  {cards.length === 0 ? (
                    <p>Aucune carte disponible</p>
                  ) : (
                    Object.entries(cardsByRarity).map(
                      ([rarity, rarityCards]) => {
                        const officialRate = rarityCards[0]?.official_rate || 0;
                        const percentage = `${officialRate}%`;
                        const className =
                          RARITY_STYLES[rarity] || styles.defaultCard;

                        return (
                          <div key={rarity} className={styles.containerCards}>
                            <h3>
                              {rarity} ({percentage})
                            </h3>
                            <ul className={className}>
                              {rarityCards.map((card) => (
                                <li key={card.id}>
                                  <img
                                    src={card.image_path}
                                    alt={card.name}
                                    className={styles.cardImage}
                                  />
                                </li>
                              ))}
                            </ul>
                          </div>
                        );
                      }
                    )
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
