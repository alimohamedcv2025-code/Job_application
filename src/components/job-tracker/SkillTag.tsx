interface SkillTagProps {
  skill: string;
}

export function SkillTag({ skill }: SkillTagProps) {
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
      {skill.trim()}
    </span>
  );
}
