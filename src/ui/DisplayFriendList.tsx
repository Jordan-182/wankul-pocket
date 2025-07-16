"use client";

import { useUserContext } from "@/context/UserContext";
import { FriendsModel } from "@/model/FriendsModel";
import { getEveryFriends } from "@/service/FriendsService";
import Image from "next/image";
import { useEffect, useState, useTransition } from "react";
import styles from "./DisplayFriendList.module.css";
import { FriendDetail } from "./FriendDetail";
import TradeFromFriendList from "./TradeFromFriendList";
import Loader from "./Loader";
import Unfriend from "./Unfriend";
import { publicRoutes } from "@/data/ROUTES";

export default function DisplayFriendList() {
  const { user } = useUserContext();
  const userProfilId = user?.profil_id;
  const [friends, setFriends] = useState<FriendsModel[]>([]);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!userProfilId) return;

    startTransition(async () => {
      try {
        const friends = await getEveryFriends(userProfilId);
        setFriends(friends);
      } catch (error) {
        console.error("Error fetching friends:", error);
        setFriends([]);
      }
    });
  }, [userProfilId]);

  return (
    <div className={styles.container}>
      <h2>Liste d&apos;amis</h2>
      {isPending && <Loader />}
      {!isPending && (
        <ul className={styles.friendList}>
          {friends.map((friend) => {
            const isMe = friend.user_profil_id === userProfilId;
            const username = isMe
              ? friend.friend_username || "Unknown"
              : friend.user_username || "Unknown";
            const friendProfilId = isMe
              ? friend.friend_profil_id
              : friend.user_profil_id;
            return (
              <div key={friend.id} className={styles.friendDetail}>
                <FriendDetail friendProfilId={friendProfilId}>
                  <li className={styles.friendItem}>
                    <Image
                      src={card.image_path}
                      alt={card.name}
                      className={styles.cardImage}
                      height={100}
                      width={72}
                      unoptimized={true}
                      onError={(e) => {
                        console.error(`❌ Image failed to load:`, {
                          name: card.name,
                          path: card.image_path,
                          id: card.id,
                        });
                      }}
                      onLoad={() => {
                        console.log(`✅ Image loaded: ${card.name}`);
                      }}
                    />

                    <p>{username}</p>
                    <div
                      className={styles.unfriendButton}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <TradeFromFriendList friendId={friend.id.toString()} />
                      <Unfriend userId={friend.id} />
                    </div>
                  </li>
                </FriendDetail>
              </div>
            );
          })}
        </ul>
      )}
    </div>
  );
}
