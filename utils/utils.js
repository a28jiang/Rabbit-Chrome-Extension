export const sum = (arr) => {
  let value = 0;
  arr.forEach((element) => {
    value += element;
  });
  return value;
};
