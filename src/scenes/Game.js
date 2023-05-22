import symbolsSpriteJson from "../assets/symbols-sprite.json";
import Reel from "../components/Reel.js";
import Button from "../components/Button.js";

export default class MainScene extends Phaser.Scene {
  constructor() {
    super({
      key: "MainScene",
    });

    this.imageSize = 50;
    this.cols = 3; // reels to thow
    this.rows = 4; // rows to thow
    this.x = 20;
    this.y = 20;

    this.reels = [
      {
        rows: this.rows, // rows shown
        size: this.imageSize, // image size TODO
        yBounce: this.imageSize / 2, // y distance to do the bounce back
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
        size: this.imageSize, // image size TODO
        x: this.x + this.imageSize, // x Position of the reel
        y: this.y, // y Position of the reel
        yBounce: this.imageSize / 2, // y distance to do the bounce back
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

    this.status = "initialized";
  }

  /** @returns {void} */
  editorCreate() {
    const container = this.add.container(this.x, this.y);
    const container2 = this.add.container(this.x + this.imageSize, this.y);

    const reel = new Reel(container, this.reels[0]);
    const reel2 = new Reel(container2, this.reels[1]);

    this.scale.on("resize", this.resize, this);

    const button = new Button(200, 400, "Start Game", this, () => {
      this.spinningLoop.play();
      reel.startSpin();
      reel2.startSpin(500);
    });

    this.spinningLoop = this.sound.add("spinningLoop", { loop: true, volume: 0.5 });
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
  }

  preload() {
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
