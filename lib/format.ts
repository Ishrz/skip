export function formatDuration(value: number | null | undefined) {
  const totalSeconds = Math.max(0, Math.round(value ?? 0));

  if (totalSeconds === 0) {
    return "0m";
  }

  const hours = Math.floor(totalSeconds / 3600);
  let minutes = Math.round((totalSeconds % 3600) / 60);
  let roundedHours = hours;

  if (minutes === 60) {
    roundedHours += 1;
    minutes = 0;
  }

  if (roundedHours > 0) {
    return minutes > 0 ? `${roundedHours}h ${minutes}m` : `${roundedHours}h`;
  }

  return `${Math.max(1, minutes)}m`;
}

export function formatStudentCount(value: number | null | undefined) {
  const count = Math.max(0, Math.round(value ?? 0));

  if (count < 1000) {
    return `${count}`;
  }

  const thousands = count / 1000;
  const rounded =
    thousands >= 10
      ? Math.round(thousands)
      : Number(thousands.toFixed(1));

  return `${rounded}k`;
}

export function formatLevel(value: string | null | undefined) {
  if (!value) {
    return "";
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
}
