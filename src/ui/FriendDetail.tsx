import { getFriendDetails } from "@/lib/friends/getFriendDetails";
import { CardsModel } from "@/model/CardsModel";
import Image from "next/image";
import { ReactNode, useEffect, useState } from "react";
import styles from "./FriendDetail.module.css";

interface FriendDetails {
  username: string;
  user_image_path: string;
  cards: CardsModel[];
}

interface FriendDetailProps {
  friendProfilId: string;
  children: ReactNode;
}

export function FriendDetail({ friendProfilId, children }: FriendDetailProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [friendDetails, setFriendDetails] = useState<FriendDetails | null>(
    null
  );

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  useEffect(() => {
    if (!friendProfilId || !isModalOpen) return;

    getFriendDetails(friendProfilId)
      .then((data) => {
        setFriendDetails(data || null);
      })
      .catch((error) => {
        console.error("Error fetching friend details:", error);
        setFriendDetails(null);
      });
  }, [friendProfilId, isModalOpen]);

  const cardsByRarity =
    friendDetails?.cards.reduce((acc, card) => {
      acc[card.rarity] = (acc[card.rarity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

  return (
    <>
      <div onClick={openModal}>{children}</div>

      {isModalOpen && (
        <div className={styles.overlay} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={closeModal}>
              ×
            </button>

            {friendDetails ? (
              <div className={styles.modalContent}>
                <Image
                  src={friendDetails.user_image_path}
                  alt={friendDetails.username}
                  className={styles.friendImage}
                  height={80}
                  width={80}
                />
                <h3>{friendDetails.username}</h3>
                <div>
                  <h3>Collection ({friendDetails.cards.length} cartes)</h3>
                  {Object.entries(cardsByRarity).map(([rarity, count]) => (
                    <p key={rarity}>
                      <strong>{rarity}:</strong> &nbsp;{count}
                    </p>
                  ))}
                </div>

                <div className={styles.cardsGrid}>
                  {friendDetails.cards.map((card) => (
                    <div key={card.id} className={styles.cardItem}>
                      <Image
                        src={card.image_path}
                        alt={`Carte ${card.id}`}
                        className={styles.cardImage}
                        height={100}
                        width={71}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className={styles.modalContent}>
                <p>Votre ami n&apos;a encore aucune carte à sa collection</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
