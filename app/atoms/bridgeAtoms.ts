import { atom } from "jotai";
import type { EditableIssueData } from "@/app/components/bridge/EditableIssueTable";
import type { FigmaStickyNote } from "types/figma";

// 付箋の選択状態を管理するatom
export const selectedNotesAtom = atom<Set<string>>(new Set<string>());

// 編集中のIssueデータを管理するatom
export const editedIssuesAtom = atom<EditableIssueData[]>([]);

// Figmaから取得した全付箋データ（必要に応じて）
export const allStickyNotesAtom = atom<FigmaStickyNote[]>([]);
