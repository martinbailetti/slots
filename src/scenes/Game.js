import symbolsSpriteJson from "../assets/symbols-sprite.json";
import resourcesSpriteJson from "../assets/resources-sprite.json";
import Reel from "../components/Reel.js";
import Button from "../components/Button.js";
import { symbolsConfig, reelsLayoutConfig } from "../config/Config.js";

import { fakeWinners } from "../fake/Fake.js";
import { getDecimal } from "../utils/mainSceneUtils";

export default class MainScene extends Phaser.Scene {
  constructor() {
    super({
      key: "MainScene",
    });
    this.button = null;
    this.stopped = false;
    this.gamesCount = 0;
    this.background = null;
    this.backgroundCenter = null;
    this.reels = [];
    this.imageSize = 0;
    reelsLayoutConfig.rows = 4; // rows to thow
    this.reelsDisplay = reelsLayoutConfig.display;
    this.layout = {
      reelsRect: {},
    };
    this.buttons = {
      start: null,
      stop: null,
    };

    this.reelsEnded = 0;

    this.reelsConfig = [
      {
        symbols: [
          { texture: "apple" },
          { texture: "lemon" },
          { texture: "coin" },
          { texture: "blueberries" },
          { texture: "cherry" },
          { texture: "strawberry" },
          { texture: "coin" },
          { texture: "grapes" },
        ],
      },
      {
        symbols: [
          { texture: "blueberries" },
          { texture: "coin" },
          { texture: "lemon" },
          { texture: "apple" },
          { texture: "coconut" },
          { texture: "coin" },
          { texture: "cherry" },
        ],
      },
      {
        symbols: [
          { texture: "coin" },
          { texture: "strawberry" },
          { texture: "coin" },
          { texture: "apple" },
          { texture: "coconut" },
          { texture: "banana" },
          { texture: "cherry" },
        ],
      },
      {
        symbols: [
          { texture: "blueberries" },
          { texture: "strawberry" },
          { texture: "cherry" },
          { texture: "coin" },
          { texture: "coconut" },
          { texture: "apple" },
          { texture: "lemon" },
        ],
      },
    ];

    this.status = "ready";
  }

  reelEnded() {
    this.reelsEnded++;
    if (this.reelsEnded === this.reelsConfig.length) {
      console.log("reelEnded", this.reelsEnded);
      this.gamesCount++;
      this.drawButton("buttonGreen");
      this.status = "ready";
      this.reels.forEach((reel) => reel.showWinnerAnimations());
    }
  }
  prepareLayout() {
    const { width, height } = this.sys.game.canvas;

    const reelWidth = width * reelsLayoutConfig.container.windowPercentWidth;
    this.imageSize = reelWidth / this.reelsConfig.length;

    const reelHeight = reelsLayoutConfig.rows * this.imageSize;

    if (height - reelHeight < reelsLayoutConfig.marginBottomMin) {
      this.imageSize =
        (height - reelsLayoutConfig.marginBottomMin) / reelsLayoutConfig.rows;
    }

    this.imageSize = this.imageSize;

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

    spaceX = spaceX;

    this.layout.reelsRect = {
      x: (width * (1 - reelsLayoutConfig.container.windowPercentWidth)) / 2,
      y: reelsLayoutConfig.container.y,
      width: reelWidth,
      height: reelsLayoutConfig.rows * this.imageSize,
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
      this.layout.reelsRect.height / 2 + reelsLayoutConfig.container.y,
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
        reelsLayoutConfig.container.y
      );

      return new Reel(container, reel, index);
    });

    this.scale.on("resize", this.resize, this);

    this.spinningLoop = this.sound.add("spinningLoop", {
      loop: true,
      volume: 0.1,
    });

    this.drawButton("buttonGreen");

    this.events.emit("scene-awake");

    /*     const config = {
      key: "racoonAnimation",
      frames: this.anims.generateFrameNumbers("racoonSprite", {
        start: 0,
        end: 13,
        first: 0,
      }),
      frameRate: 10,
      repeat: -1,
    };

    this.anims.create(config);

    const racoon = this.add
      .sprite(
        this.imageSize / 2,
        this.imageSize / 2 + this.imageSize ,
        "racoonSprite"
      )
      .play("racoonAnimation");
 */
  }

  drawButton(buttonId) {
    if (this.button) {
      this.button.destroy();
    }
    const { width, height } = this.sys.game.canvas;
    this.button = this.add.image(
      width / 2,
      this.layout.reelsRect.height +
        this.layout.reelsRect.y +
        (height - this.layout.reelsRect.height + this.layout.reelsRect.y) / 2,
      "resources",
      buttonId
    );
    this.button.displayWidth = width / 4;
    this.button.displayHeight = width / 4;

    this.button
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => {
        console.log("pointerdown");
        if (this.status === "spinning" && !this.stopped) {
          console.log("this.status === spinning && !this.stopped");
          this.stopped = true;
          this.drawButton("buttonYellow");
          this.spinningLoop.stop();
          this.reels.forEach((reel, index) => {
            reel.stopSpin(500 * index);
          });
        } else if (this.status === "ready") {
          console.log("this.status === ready");
          this.stopped = false;
          this.drawButton("buttonRed");
          this.reelsEnded = 0;
          this.status = "spinning";
          this.spinningLoop.play();
          this.reels.forEach((reel, index) => {
            reel.startSpin(
              fakeWinners[this.gamesCount % 2][index],
              500 * index
            );
          });
        }
      })
      .on("pointerup", () => {
        if (this.status === "spinning" && this.stopped) {
          this.drawButton("buttonYellow");
        } else {
          this.drawButton("buttonRed");
        }
      });
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
    this.backgroundCenter.y =
      this.layout.reelsRect.height / 2 + reelsLayoutConfig.container.y;
    this.backgroundCenter.width = this.layout.reelsRect.width;
    this.backgroundCenter.height = this.layout.reelsRect.height;

    this.reels.forEach((reel, index) => {
      let spaceX = index > 0 ? this.layout.reelsRect.spaceX * index : 0;

      if (this.reelsDisplay === "space-evenly") {
        spaceX = this.layout.reelsRect.spaceX * (index + 1);
      } else if (this.reelsDisplay === "space-around") {
        spaceX = this.layout.reelsRect.spaceX;
      }
      console.log("reel, index", reel.x, reel.y, reel, index);
      reel.setContainerPosition(
        this.layout.reelsRect.x + this.imageSize * index + spaceX,
        reelsLayoutConfig.container.y
      );
      reel.resize();
    });

    this.button.x = width / 2;
    this.button.y =
      height -
      reelsLayoutConfig.marginBottomMin +
      reelsLayoutConfig.marginBottomMin / 2;
    this.button.displayWidth = width / 4;
    this.button.displayHeight = width / 4;
  }

  preload() {
    this.load.spritesheet("coinsSprite", "src/assets/sprite-coins-all.png", {
      frameWidth: 150,
      frameHeight: 150,
    });
    this.load.spritesheet("racoonSprite", "src/assets/sprite-racoon.png", {
      frameWidth: 228,
      frameHeight: 300,
    });

    this.load.image("background", "src/assets/images/bg.jpg");
    this.load.image("backgroundCenter", "src/assets/images/bg-center.jpg");
    this.load.audio("boing", ["src/assets/audio/boing.mp3"]);
    this.load.audio("start", ["src/assets/audio/giggle5.mp3"]);
    this.load.audio("spinningLoop", ["src/assets/audio/bassloop.mp3"]);
    this.load.atlas(
      "symbols",
      "src/assets/symbols3-sprite.png",
      symbolsSpriteJson
    );
    this.load.atlas(
      "resources",
      "src/assets/sprite-resources.png",
      resourcesSpriteJson
    );
  }
}
