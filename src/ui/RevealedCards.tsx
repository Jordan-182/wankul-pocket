"use client";

import styles from "./RevealedCards.module.css";
import { OpenedCard, useOpenedCards } from "@/context/OpenedCardsContext";
import { useState, useEffect } from "react";
import { useCollectionContext } from "@/context/CollectionContext";
import { useRouter, useParams } from "next/navigation";

export default function RevealedCards() {
  const { openedCards } = useOpenedCards();
  const [pageLoaded, setPageLoaded] = useState(false);
  const { collection } = useCollectionContext();
  const router = useRouter();
  const params = useParams();
  const boosterId =
    typeof params.id === "string" ? parseInt(params.id, 10) : null;

  useEffect(() => {
    setPageLoaded(true);
  }, []);

  const [revealedIds, setRevealedIds] = useState<string[]>([]);

  const handleReveal = (id: string) => {
    if (!revealedIds.includes(id)) {
      setRevealedIds((prev) => [...prev, id]);
    }
  };

  return (
    <>
      <ul className={styles.revealedCards}>
        {openedCards.map((card: OpenedCard, index: number) => {
          const collectionCard = collection?.find((c) => c.id === card.id);
          const quantity = collectionCard ? collectionCard.quantity : 0;
          const camelCaseRarity = card.rarity
            .toLowerCase()
            .split(" ")
            .map((word, i) =>
              i === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)
            )
            .join("");
          const isRevealed = revealedIds.includes(index.toString());

          return (
            <li
              key={index}
              className={`${styles.card} ${
                pageLoaded ? styles.fadeIn : styles.hiddenBeforeFade
              }`}
              style={pageLoaded ? { animationDelay: `${index * 0.12}s` } : {}}
              onClick={() => handleReveal(index.toString())}
            >
              <div
                className={`${styles.cardInner} ${
                  isRevealed ? styles.revealed : ""
                }`}
              >
                <div className={styles.cardFront}>
                  <img
                    src="/cardVerso.png"
                    alt="Card Back"
                    className={`${styles.cardImage}`}
                  />
                </div>
                <div className={styles.cardBack}>
                  <img
                    src={card.image_path}
                    alt={card.name}
                    className={`${styles.cardImage} ${
                      styles[camelCaseRarity] || ""
                    }`}
                  />
                  <p className={styles.new}>{quantity === 0 ? "NEW" : ""}</p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      {revealedIds.length === openedCards.length ? (
        <div className={styles.allRevealed}>
          <button
            onClick={() =>
              boosterId !== null && router.push(`/booster/${boosterId}`)
            }
          >
            Retour
          </button>
          <button onClick={() => router.push(`/collection`)}>Collection</button>
        </div>
      ) : (
        <button
          className={styles.revealAllButton}
          onClick={() =>
            setRevealedIds(openedCards.map((_, idx) => idx.toString()))
          }
        >
          Tout découvrir
        </button>
      )}
    </>
  );
}
