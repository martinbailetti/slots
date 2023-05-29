export const symbolsConfig = new Map([
  [
    "coin",
    {
      idleAnimation: "coinIdleAnimation",
      winnerAnimation: "coinWinnerAnimation",
    },
  ],
  ["apple", {}],
  ["lemon", {}],
  ["blueberries", {}],
  ["cherry", {}],
  ["strawberry", {}],
  ["grapes", {}],
  ["watermelon", {}],
  ["orange", {}],
  ["coconut", {}],
  ["banana", {}],
]);


export const reelsLayoutConfig = {
    marginBottomMin:400,
    rows:4,
    display:"space-evenly", // space-around space-between space-evenly
    container: {
        windowPercentWidth:0.8,
        y:20,
    }
}

export const reelTweenConfig = {
  accelerate: {
    duration: 500,
    spins: 0.5,
  },
  main: {
    duration: 3000,
    spins: 13,
  },
  decelerate: {
    duration: 700,
  },
  bounce: {
    duration: 500,
    imagePercentHeight: 0.5,
    finalYCorrection: 0.1,
  },
};


export const decimalPrecision = 4;
