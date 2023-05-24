import symbolsSpriteJson from "../assets/symbols-sprite.json";
import Reel from "../components/Reel.js";
import Button from "../components/Button.js";

export default class MainScene extends Phaser.Scene {
  constructor() {
    super({
      key: "MainScene",
    });

    this.background = null;
    this.backgroundCenter = null;
    this.reels = [];
    this.imageSize = 0;
    this.rows = 4; // rows to thow
    this.reelsX = 20;
    this.reelsY = 20;
    this.reelsWidthPercent = 0.8;
    this.reelsDisplay = "space-evenly"; // space-around space-between space-evenly
    this.reelsSpacing = 0.1;
    this.layout = {
      reelsRect: {},
    };

    this.minBottomSpace = 400;

    this.reelsEnded = 0;

    this.reelsConfig = [
      {
        rows: this.rows, // rows shown
        yBounce: 0.5, // y distance to do the bounce back
        symbols: [
          "apple",
          "lemon",
          "banana",
          "blueberries",
          "cherry",
          "strawberry",
          "coconut",
          "grapes",
        ], // list of symbol names for the reel previously loaded
        winnerSymbols: ["lemon", "orange", "strawberry", "watermelon"], // list of winner symbol names previously loaded
      },
      {
        rows: this.rows, // rows shown
        yBounce: 0.5, // y distance to do the bounce back
        symbols: [
          "blueberries",
          "strawberry",
          "lemon",
          "apple",
          "coconut",
          "banana",
          "cherry",
        ], // list of symbol names for the reel previously loaded
        winnerSymbols: ["watermelon", "strawberry", "orange", "lemon"], // list of winner symbol names previously loaded
      },
      {
        rows: this.rows, // rows shown
        yBounce: 0.5, // y distance to do the bounce back
        symbols: [
          "blueberries",
          "strawberry",
          "lemon",
          "apple",
          "coconut",
          "banana",
          "cherry",
        ], // list of symbol names for the reel previously loaded
        winnerSymbols: ["watermelon", "strawberry", "orange", "lemon"], // list of winner symbol names previously loaded
      },
    ];

    this.status = "ready";
  }

  reelEnded() {
    this.reelsEnded++;
    if (this.reelsEnded === this.reelsConfig.length) {
      console.log("reelEnded", this.reelsEnded);
      this.status = "ready";
    }
  }
  prepareLayout() {
    const { width, height } = this.sys.game.canvas;

    const reelWidth = width * this.reelsWidthPercent;
    this.imageSize = reelWidth / this.reelsConfig.length;

    const reelHeight = this.rows * this.imageSize;

    if (height - reelHeight < this.minBottomSpace) {
      this.imageSize = (height - this.minBottomSpace) / this.rows;
    }

    let spaceX =
      (reelWidth - this.imageSize * this.reelsConfig.length) /
      (this.reelsConfig.length - 1);

    if (this.reelsDisplay === "space-evenly") {
      spaceX =
        (reelWidth - this.imageSize * this.reelsConfig.length) /
        (this.reelsConfig.length + 1);
    } else if (this.reelsDisplay === "space-around") {
      spaceX = (reelWidth - this.imageSize * this.reelsConfig.length) / 2;
    }

    this.layout.reelsRect = {
      x: (width * (1 - this.reelsWidthPercent)) / 2,
      y: this.reelsY,
      width: reelWidth,
      height: this.rows * this.imageSize,
      spaceX: spaceX,
    };
  }

  /** @returns {void} */
  editorCreate() {
    const { width, height } = this.sys.game.canvas;

    this.background = this.add.tileSprite(
      width / 2,
      height / 2,
      width,
      height,
      "background"
    );

    this.prepareLayout();

    this.backgroundCenter = this.add.tileSprite(
      width / 2,
      this.layout.reelsRect.height / 2 + this.reelsY,
      this.layout.reelsRect.width,
      this.layout.reelsRect.height,
      "backgroundCenter"
    );

    this.reels = this.reelsConfig.map((reel, index) => {
      let spaceX = index > 0 ? this.layout.reelsRect.spaceX * index : 0;

      if (this.reelsDisplay === "space-evenly") {
        spaceX = this.layout.reelsRect.spaceX * (index + 1);
      } else if (this.reelsDisplay === "space-around") {
        spaceX = this.layout.reelsRect.spaceX;
      }

      const container = this.add.container(
        this.layout.reelsRect.x + this.imageSize * index + spaceX,
        this.reelsY
      );

      return new Reel(container, reel);
    });

    this.scale.on("resize", this.resize, this);

    const button = new Button(
      width / 2,
      this.layout.reelsRect.height + this.reelsY + 30,
      "Start Spin",
      this,
      () => {
        if (this.status === "ready") {
          this.reelsEnded = 0;
          this.status = "spinning";
          this.spinningLoop.play();
          this.reels.forEach((reel, index) => {
            reel.startSpin(500 * index);
          });
        }
      }
    );
    const buttonStop = new Button(
      width / 2,
      this.layout.reelsRect.height + this.reelsY + 70,
      "Stop Spin",
      this,
      () => {
        if (this.status === "spinning") {
          this.spinningLoop.stop();
          this.reels.forEach((reel, index) => {
            reel.stopSpin(500 * index);
          });
        }
      }
    );

    this.spinningLoop = this.sound.add("spinningLoop", {
      loop: true,
      volume: 0.1,
    });
    this.events.emit("scene-awake");
  }

  create() {
    this.editorCreate();
  }

  resize(gameSize, baseSize, displaySize, resolution) {
    console.log("gameSize", gameSize);
    console.log("baseSize", baseSize);
    console.log("displaySize", displaySize);
    console.log("resolution", resolution);
    console.log("this.sys.game.canvas", this.sys.game.canvas);

    const { width, height } = this.sys.game.canvas;

    this.prepareLayout();
    this.background.x = width / 2;
    this.background.y = height / 2;
    this.background.width = width;
    this.background.height = height;

    this.backgroundCenter.x = width / 2;
    this.backgroundCenter.y = this.layout.reelsRect.height / 2 + this.reelsY;
    this.backgroundCenter.width = this.layout.reelsRect.width;
    this.backgroundCenter.height = this.layout.reelsRect.height;


  
  }

  preload() {
    this.load.image("background", "src/assets/images/bg.jpg");
    this.load.image("backgroundCenter", "src/assets/images/bg-center.jpg");
    this.load.audio("boing", ["src/assets/audio/boing.mp3"]);
    this.load.audio("start", ["src/assets/audio/giggle5.mp3"]);
    this.load.audio("spinningLoop", ["src/assets/audio/bassloop.mp3"]);
    this.load.atlas(
      "symbols",
      "src/assets/symbols-sprite.png",
      symbolsSpriteJson
    );
  }
}
