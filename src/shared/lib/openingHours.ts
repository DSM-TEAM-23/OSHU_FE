const FULL_DAY_HOURS = Array.from({ length: 24 }, (_, hour) => hour);

const parseHour = (time?: string) => {
  if (!time) return null;
  const [hourText] = time.trim().split(':');
  const hour = Number(hourText);
  return Number.isInteger(hour) && hour >= 0 && hour <= 23 ? hour : null;
};

export const getOperatingHours = (openingHours?: string) => {
  const [openingTime = '', closingTime = ''] = openingHours?.split('-').map((time) => time.trim()) ?? [];
  const startHour = parseHour(openingTime);
  const endHour = parseHour(closingTime);

  if (startHour === null || endHour === null) {
    return FULL_DAY_HOURS;
  }

  if (startHour === endHour) {
    return FULL_DAY_HOURS;
  }

  if (startHour < endHour) {
    return Array.from({ length: endHour - startHour }, (_, index) => startHour + index);
  }

  return [
    ...Array.from({ length: 24 - startHour }, (_, index) => startHour + index),
    ...Array.from({ length: endHour }, (_, index) => index),
  ];
};
