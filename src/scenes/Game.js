import symbolsSpriteJson from "../assets/symbols-sprite.json";
import Reel from "../components/Reel.js";
import Button from "../components/Button.js";

export default class MainScene extends Phaser.Scene {
  constructor() {
    super({
      key: "MainScene",
    });

    this.imageSize = 0;
    this.rows = 4; // rows to thow
    this.reelsX = 20;
    this.reelsY = 20;
    this.reelsSpacing = 0.1;
    
    this.reelsEnded = 0;

    this.reels = [
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
    ];

    this.status = "ready";
  }

  reelEnded() {
    this.reelsEnded++;
    if(this.reelsEnded===this.reels.length){
      console.log("reelEnded", this.reelsEnded);
      this.status = "ready";
    }
  }
  getReelsRect() {
    return {
      width: this.reels.length * this.imageSize,
      height: this.rows * this.imageSize,
    };
  }

  /** @returns {void} */
  editorCreate() {
    const { width, height } = this.sys.game.canvas;



    var background = this.add.tileSprite(width/2, height/2, width, height, "background");



    this.imageSize = width / 4;

    const container = this.add.container(this.reelsX, this.reelsY);
    const container2 = this.add.container(
      this.reelsY + this.imageSize + this.reelsSpacing * this.imageSize,
      this.reelsY
    );

    const reel = new Reel(container, this.reels[0]);
    const reel2 = new Reel(container2, this.reels[1]);

    this.scale.on("resize", this.resize, this);
    const rect = this.getReelsRect();
    const button = new Button(
      width / 2,
      rect.height + this.reelsY + 30,
      "Start Spin",
      this,
      () => {
        if ((this.status === "ready")) {
          this.reelsEnded = 0;
          this.status = "spinning";
          this.spinningLoop.play();
          reel.startSpin();
          reel2.startSpin(500);
        }
      }
    );
    const buttonStop = new Button(
      width / 2,
      rect.height + this.reelsY + 70,
      "Stop Spin",
      this,
      () => {
        if ((this.status === "spinning")) {
          this.spinningLoop.stop();
          reel.stopSpin();
          reel2.stopSpin(500);
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
  }

  preload() {
    this.load.image("background", "src/assets/images/bg.jpg");
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
