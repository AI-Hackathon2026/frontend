import { AVATAR_MAX_LEVEL, LEVEL_COLORS } from "../../constants/avatar.constants";
import type { AvatarData } from "../../utils/avatarData";
import { AvatarSvg } from "./AvatarSvg";

interface AvatarCardProps {
  avatar: AvatarData;
  routineSummary: string;
  difficulty: string;
  leveledUp?: boolean;
}

export function AvatarCard({
  avatar,
  routineSummary,
  difficulty,
  leveledUp = false,
}: AvatarCardProps) {
  const color = LEVEL_COLORS[avatar.level] ?? LEVEL_COLORS[1];

  return (
    <div className="avatar-card">
      <div className="avatar-card-visual">
        <AvatarSvg level={avatar.level} size={96} animate={leveledUp} />
        <div
          className="avatar-card-difficulty"
          style={{
            background: `${color}22`,
            borderColor: `${color}66`,
            color,
          }}
        >
          {difficulty}
        </div>
      </div>

      <div className="avatar-card-info">
        <div className="avatar-card-title-row">
          <span className="avatar-card-label">{avatar.label}</span>
          <span className="avatar-card-level">Lv.{avatar.level}</span>
        </div>

        <div className="avatar-card-xp">
          <div className="avatar-card-xp-header">
            <span>
              {avatar.level < AVATAR_MAX_LEVEL ? "다음 레벨까지" : "최고 레벨 달성"}
            </span>
            <span className="avatar-card-xp-value">
              {avatar.level < AVATAR_MAX_LEVEL
                ? `${avatar.xpToNext.current} / ${avatar.xpToNext.required} XP`
                : "MAX"}
            </span>
          </div>
          <div className="avatar-card-xp-track">
            <div
              className="avatar-card-xp-fill"
              style={{ width: `${avatar.xpToNext.percent}%` }}
            />
          </div>
        </div>

        {routineSummary && (
          <p className="avatar-card-summary">{routineSummary}</p>
        )}
      </div>
    </div>
  );
}
