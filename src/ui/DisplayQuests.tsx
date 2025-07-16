"use client";

import { useEffect, useTransition, useReducer } from "react";
import styles from "./DisplayQuest.module.css";
import { QuestModel } from "@/model/QuestModel";
import { useQuestProgressContext } from "@/context/QuestProgressContext";
import { useUserContext } from "@/context/UserContext";
import { QuestProgressModel } from "@/model/QuestProgressModel";
import {
  questValidation,
  getAllQuestsByUserId,
  isQuestCompleted as serviceIsQuestCompleted,
} from "@/service/QuestService";
import Loader from "@/ui/Loader";
import RewardAnimation from "./RewardAnimation";
import QuestList from "./QuestList";

interface QuestState {
  quests: QuestModel[];
  completedQuestIds: Set<number>;
  animatingRewards: Map<number, number>;
  currentValidatingQuest: number | null;
  completedQuestsCount: number;
}

type QuestAction =
  | { type: "SET_QUESTS"; payload: QuestModel[] }
  | { type: "START_VALIDATION"; questId: number }
  | { type: "COMPLETE_QUEST"; questId: number; reward: number }
  | { type: "STOP_ANIMATION"; questId: number }
  | { type: "VALIDATION_ERROR"; questId: number }
  | { type: "UPDATE_COMPLETED_COUNT"; count: number };

function questReducer(state: QuestState, action: QuestAction): QuestState {
  switch (action.type) {
    case "SET_QUESTS":
      return { ...state, quests: action.payload };

    case "START_VALIDATION":
      return { ...state, currentValidatingQuest: action.questId };

    case "COMPLETE_QUEST":
      return {
        ...state,
        completedQuestIds: new Set(state.completedQuestIds).add(action.questId),
        animatingRewards: new Map(state.animatingRewards).set(
          action.questId,
          action.reward
        ),
        currentValidatingQuest: null,
      };

    case "STOP_ANIMATION":
      const newRewards = new Map(state.animatingRewards);
      newRewards.delete(action.questId);
      return { ...state, animatingRewards: newRewards };

    case "VALIDATION_ERROR":
      return { ...state, currentValidatingQuest: null };

    case "UPDATE_COMPLETED_COUNT":
      return { ...state, completedQuestsCount: action.count };

    default:
      return state;
  }
}
const initialQuestState: QuestState = {
  quests: [],
  completedQuestIds: new Set(),
  animatingRewards: new Map(),
  currentValidatingQuest: null,
  completedQuestsCount: 0,
};

export default function DisplayQuests() {
  const { progress, refreshProgress } = useQuestProgressContext();
  const { user, updateUserBananas } = useUserContext();
  const [state, dispatch] = useReducer(questReducer, initialQuestState);
  const [isLoadingQuests, startQuestsTransition] = useTransition();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const fetchQuests = async () => {
      if (!user?.email) return;

      startQuestsTransition(async () => {
        try {
          const questsData = await getAllQuestsByUserId(user);
          dispatch({ type: "SET_QUESTS", payload: questsData });

          // Calculer le nombre de quêtes complétées et mettre à jour le QuestProgressContext
          const completedQuestsCount = questsData.filter((quest: QuestModel) =>
            isQuestCompleted(quest)
          ).length;
          refreshProgress(completedQuestsCount);
        } catch (error) {
          console.error("Erreur lors du fetch des quêtes:", error);
        }
      });
    };

    fetchQuests();
  }, [user?.email]);

  useEffect(() => {
    const completedQuestsCount = state.quests.filter((quest: QuestModel) =>
      isQuestCompleted(quest)
    ).length;

    dispatch({ type: "UPDATE_COMPLETED_COUNT", count: completedQuestsCount });
    refreshProgress(completedQuestsCount);
  }, [state.quests]);

  const isQuestCompleted = (quest: QuestModel): boolean => {
    if (!progress || !user) return false;

    const collection = Array.isArray(progress.collection)
      ? progress.collection
      : [];

    const questProgress = new QuestProgressModel(
      user.id,
      progress.bananas,
      progress.friends,
      progress.trades,
      collection
    );

    return serviceIsQuestCompleted(quest, questProgress);
  };

  const validateQuest = async (quest: QuestModel) => {
    if (!user || isPending || state.currentValidatingQuest === quest.id) return;

    startTransition(async () => {
      dispatch({ type: "START_VALIDATION", questId: quest.id });

      try {
        const data = await questValidation(user, quest);
        updateUserBananas(user.bananas + data.reward_added);

        dispatch({
          type: "COMPLETE_QUEST",
          questId: quest.id,
          reward: quest.reward,
        });

        setTimeout(() => {
          dispatch({ type: "STOP_ANIMATION", questId: quest.id });
        }, 2000);

        refreshProgress(state.completedQuestIds.size);
      } catch (error) {
        console.error("Erreur lors de la validation:", error);
        dispatch({ type: "VALIDATION_ERROR", questId: quest.id });
      }
    });
  };

  const questsByCategory = state.quests
    .filter(
      (quest: QuestModel) =>
        !quest.user_id_completed && !state.completedQuestIds.has(quest.id)
    )
    .reduce(
      (
        acc: Record<string, { quest: QuestModel; isCompleted: boolean }>,
        quest: QuestModel
      ) => {
        const category = quest.category;
        const isCompleted = isQuestCompleted(quest);

        if (!acc[category] || quest.reward < acc[category].quest.reward) {
          acc[category] = { quest, isCompleted };
        }

        return acc;
      },
      {} as Record<string, { quest: QuestModel; isCompleted: boolean }>
    );

  const filteredQuests = Object.values(questsByCategory).sort((a, b) => {
    if (a.isCompleted && !b.isCompleted) return -1;
    if (!a.isCompleted && b.isCompleted) return 1;
    return a.quest.reward - b.quest.reward;
  });

  if (isLoadingQuests) {
    return (
      <div className={styles.questContainer}>
        <h1 className={styles.title}>Quêtes</h1>
        <Loader />
      </div>
    );
  }

  return (
    <div className={styles.questContainer}>
      <h1 className={styles.title}>Quêtes</h1>

      {Array.from(state.animatingRewards.entries()).map(([questId, reward]) => (
        <RewardAnimation key={questId} questId={questId} reward={reward} />
      ))}

      <QuestList
        filteredQuests={filteredQuests}
        currentValidatingQuest={state.currentValidatingQuest}
        onQuestClick={validateQuest}
      />
    </div>
  );
}
