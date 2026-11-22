/**
 * MET values (metabolic equivalents) for common activities, taken from the
 * Compendium of Physical Activities. Calories = MET x weight (kg) x hours.
 */
export const ACTIVITIES: { name: string; met: number }[] = [
  { name: "Walking, easy pace", met: 2.8 },
  { name: "Walking, brisk", met: 4.3 },
  { name: "Walking uphill or hiking", met: 6.0 },
  { name: "Running, steady (6 mph)", met: 9.8 },
  { name: "Jogging", met: 7.0 },
  { name: "Cycling, leisurely", met: 4.0 },
  { name: "Cycling, moderate", met: 6.8 },
  { name: "Cycling, vigorous", met: 10.0 },
  { name: "Exercise bike, moderate", met: 6.8 },
  { name: "Swimming, leisurely", met: 6.0 },
  { name: "Swimming laps, vigorous", met: 9.8 },
  { name: "Weight training", met: 3.5 },
  { name: "Circuit training or HIIT", met: 8.0 },
  { name: "Yoga", met: 2.5 },
  { name: "Pilates", met: 3.0 },
  { name: "Aerobics or dance class", met: 6.5 },
  { name: "Dancing", met: 5.0 },
  { name: "Rowing machine, moderate", met: 7.0 },
  { name: "Elliptical trainer", met: 5.0 },
  { name: "Stair climbing", met: 8.8 },
  { name: "Football (soccer), casual", met: 7.0 },
  { name: "Tennis", met: 7.3 },
  { name: "Badminton", met: 5.5 },
  { name: "Golf, walking", met: 4.8 },
  { name: "Gardening", met: 3.8 },
  { name: "Housework, general", met: 3.3 },
  { name: "Playing with children", met: 4.0 },
];
