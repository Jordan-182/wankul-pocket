import { CardsModel } from "@/model/CardsModel";
import Image from "next/image";
import styles from "./CardModal.module.css";

type CardModalProps = {
  card: CardsModel;
  onClose: () => void;
};

export default function CardModal({ card, onClose }: CardModalProps) {
  const applyTransform = (
    el: HTMLDivElement,
    x: number,
    y: number,
    width: number,
    height: number
  ) => {
    const midX = width / 2;
    const midY = height / 2;

    const angleY = (x - midX) / 8;
    const angleX = -(y - midY) / 8;

    const shadowX = (x - midX) / 5;
    const shadowY = (y - midY) / 5;

    el.children[0].setAttribute(
      "style",
      `transform: rotateX(${angleX}deg) rotateY(${angleY}deg) scale(1.05); transition: transform 0.1s ease; box-shadow: ${-shadowX}px ${-shadowY}px 30px rgba(0, 0, 0, 0.25)`
    );
  };

  const updateHoloLayer = (
    el: HTMLDivElement,
    x: number,
    y: number,
    width: number,
    height: number
  ) => {
    const holo = el.querySelector(`.${styles.holoLayer}`) as HTMLElement;
    if (holo) {
      const posX = (x / width) * 100;
      const posY = (y / height) * 100;
      holo.style.backgroundPosition = `${posX}% ${posY}%`;
    }
  };

  const resetTransform = (el: HTMLDivElement) => {
    el.children[0].setAttribute(
      "style",
      "transform: rotateX(0deg) rotateY(0deg) scale(1); transition: transform 0.3s ease; box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.1)"
    );
    const holo = el.querySelector(`.${styles.holoLayer}`) as HTMLElement;
    if (holo) {
      holo.style.backgroundPosition = `50% 50%`;
    }
  };
  const handleMove = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const el = event.currentTarget;
    const rect = el.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    applyTransform(el, x, y, rect.width, rect.height);
    updateHoloLayer(el, x, y, rect.width, rect.height);
  };

  const handleTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    const el = event.currentTarget;
    const touch = event.touches[0];
    const rect = el.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    applyTransform(el, x, y, rect.width, rect.height);
    updateHoloLayer(el, x, y, rect.width, rect.height);
  };

  const resetMove = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    resetTransform(event.currentTarget);
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    resetTransform(event.currentTarget);
  };

  return (
    <section className={styles.modal}>
      <button
        onClick={onClose}
        className={styles.closeBtn}
        aria-label="Close modal"
      >
        ✖
      </button>
      <div
        className={styles.card}
        onMouseMove={handleMove}
        onMouseLeave={resetMove}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className={styles.contentCard}>
          <Image
            src={card.image_path}
            alt={card.name}
            width={300}
            height={419}
          />
          <div className={card.is_holo ? styles.holoLayer : styles.none}></div>
          <div className={card.is_holo ? styles.illusion : styles.none}></div>
        </div>
      </div>
      <div className={styles.cardInfo}>
        <h2>{card.name}</h2>
        <p className={styles.quote}>{card.quote}</p>
        <p>Rareté : {card.rarity}</p>
        <p>Clan : {card.clan}</p>
        {card.quantity === 1 ? (
          <p>Possédée en {card.quantity} exemplaire</p>
        ) : (
          <p>Possédée en {card.quantity} exemplaires</p>
        )}
      </div>
    </section>
  );
}
