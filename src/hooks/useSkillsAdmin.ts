import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/backend/client";

export interface Skill {
  id: string;
  name: string;
  icon_key: string;
  icon_color: string;
  display_order: number;
  is_visible: boolean;
}

export interface NewSkill {
  name: string;
  icon_key: string;
  icon_color: string;
  display_order: number;
}

type SkillType = "hard" | "soft";

function getTableName(type: SkillType) {
  return type === "hard" ? "hard_skills" : "soft_skills";
}

export function useSkillsAdmin() {
  const [hardSkills, setHardSkills] = useState<Skill[]>([]);
  const [softSkills, setSoftSkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSkills = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [hardResult, softResult] = await Promise.all([
        supabase.from("hard_skills").select("*").order("display_order"),
        supabase.from("soft_skills").select("*").order("display_order"),
      ]);

      if (hardResult.error) throw hardResult.error;
      if (softResult.error) throw softResult.error;

      setHardSkills((hardResult.data || []) as Skill[]);
      setSoftSkills((softResult.data || []) as Skill[]);
    } catch (err: any) {
      console.error("[useSkillsAdmin] fetch error:", err);
      setError(err.message || "Erro ao carregar skills");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  const toggleSkill = useCallback(async (type: SkillType, id: string, visible: boolean) => {
    const table = getTableName(type);
    const { error } = await supabase.from(table).update({ is_visible: visible }).eq("id", id);
    if (error) {
      console.error("[useSkillsAdmin] toggle error:", error);
      throw error;
    }
    // Optimistic update
    if (type === "hard") {
      setHardSkills((prev) => prev.map((s) => (s.id === id ? { ...s, is_visible: visible } : s)));
    } else {
      setSoftSkills((prev) => prev.map((s) => (s.id === id ? { ...s, is_visible: visible } : s)));
    }
  }, []);

  const addSkill = useCallback(async (type: SkillType, skill: NewSkill) => {
    const table = getTableName(type);
    const currentSkills = type === "hard" ? hardSkills : softSkills;

    // Shift existing skills at or after the insert position
    const toShift = currentSkills.filter((s) => s.display_order >= skill.display_order);
    for (const s of toShift) {
      await supabase.from(table).update({ display_order: s.display_order + 1 }).eq("id", s.id);
    }

    const { data, error } = await supabase
      .from(table)
      .insert({ ...skill, is_visible: true })
      .select()
      .single();

    if (error) {
      console.error("[useSkillsAdmin] add error:", error);
      throw error;
    }

    await fetchSkills();
    return data;
  }, [hardSkills, softSkills, fetchSkills]);

  const deleteSkill = useCallback(async (type: SkillType, id: string) => {
    const table = getTableName(type);
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) {
      console.error("[useSkillsAdmin] delete error:", error);
      throw error;
    }
    const setter = type === "hard" ? setHardSkills : setSoftSkills;
    setter((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const moveSkill = useCallback(async (type: SkillType, id: string, direction: "up" | "down") => {
    const skills = type === "hard" ? hardSkills : softSkills;
    const table = getTableName(type);
    const idx = skills.findIndex((s) => s.id === id);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;

    if (swapIdx < 0 || swapIdx >= skills.length) return;

    const a = skills[idx];
    const b = skills[swapIdx];

    await Promise.all([
      supabase.from(table).update({ display_order: b.display_order }).eq("id", a.id),
      supabase.from(table).update({ display_order: a.display_order }).eq("id", b.id),
    ]);

    await fetchSkills();
  }, [hardSkills, softSkills, fetchSkills]);

  return {
    hardSkills,
    softSkills,
    isLoading,
    error,
    fetchSkills,
    toggleSkill,
    addSkill,
    deleteSkill,
    moveSkill,
  };
}
