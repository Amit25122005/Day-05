export const activities = { Walking: 3.5, Cycling: 7.5, Running: 9.8, Driving: 2 };
export const caloriesFor = (weight, minutes, activity) => activities[activity] * weight * (minutes / 60);
