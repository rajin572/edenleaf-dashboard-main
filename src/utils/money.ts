export const toPoisha = (taka: number): number => {
  return Math.round(taka * 100);
};

export const fromPoisha = (poisha: number): number => {
  return poisha / 100;
};

export const formatMoney = (poisha: number): string => {
  const taka = fromPoisha(poisha);
  return `৳${taka.toLocaleString('en-BD')}`;
};
