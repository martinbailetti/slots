import UserComponent from "./UserComponent";
import {
  symbolsConfig,
  reelTweenConfig,
  reelsLayoutConfig,
} from "../config/Config.js";

export default class Reel extends UserComponent {
  constructor(gameObject, params, index) {
    super(gameObject);

    this.index = index;
    this.first = true;
    this.params = params;
    this.gameObject = gameObject;
    this.tweenObject = {
      val: 0,
    };

    this.winnerSymbols = [];
    this.boing = null;
    this.startSound = null;
    this.tweenAccelerateVal =
      this.scene.imageSize *
      reelsLayoutConfig.rows *
      reelTweenConfig.accelerate.spins;
    this.anims = [];
    this.status = "stop";
    this.containerMain = null;
    this.containerMainImgs = null;
    this.containerClone = null;
    this.containerCloneImgs = null;
    this.containerWinner = null;
    this.containerWinnerImgs = [];
    this.containerWinnerBorders = null;
    this.containerWinnerBordersShapes = null;
    gameObject["__ReelContainer"] = this;
  }

  /** @returns {Reel} */
  static getComponent(gameObject) {
    return gameObject["__ReelContainer"];
  }

  /** @type {Phaser.GameObjects.Container} */
  gameObject;

  /* Once created */

  awake() {
    this.boing = this.scene.sound.add("boing", { loop: false });
    this.startSound = this.scene.sound.add("start", { loop: false });

    this._displayReel();
  }

  /*********************************/
  /* Reel layout */
  /*********************************/
  _displayReel = () => {
    this.containerMain = this.scene.add.container(0, 0);
    this.containerClone = this.scene.add.container(
      0,
      -this.params.symbols.length * this.scene.imageSize
    );

    this.containerWinner = this.scene.add.container(
      0,
      -this.params.symbols.length * this.scene.imageSize
    );
    this.containerWinnerBorders = this.scene.add.container(0, 0);

    this.gameObject.add(this.containerMain);
    this.gameObject.add(this.containerClone);
    this.gameObject.add(this.containerWinner);
    this.gameObject.add(this.containerWinnerBorders);

    // Fill the main container with symbols
    this.containerMainImgs = this.params.symbols.map((obj, index) => {
      const img = this.scene.add.image(
        this.scene.imageSize / 2,
        this.scene.imageSize / 2 + this.scene.imageSize * index,
        "symbols",
        obj.texture
      );
      img.displayWidth = this.scene.imageSize;
      img.displayHeight = this.scene.imageSize;

      this.containerMain.add(img);
      if (index < reelsLayoutConfig.rows) {
        /*      img
          .setInteractive({ useHandCursor: true })
          .on("pointerdown", () => console.log("pointerdown", img))
          .on("pointerover", () => console.log("pointerover", img))
          .on("pointerout", () => console.log("pointerout", img)); */
      }
      return img;
    });

    // Fill the clone container  with same symbols
    this.containerCloneImgs = this.params.symbols.map((obj, index) => {
      const img = this.scene.add.image(
        this.scene.imageSize / 2,
        this.scene.imageSize / 2 + this.scene.imageSize * index,
        "symbols",
        obj.texture
      );
      img.displayWidth = this.scene.imageSize;
      img.displayHeight = this.scene.imageSize;

      this.containerClone.add(img);

      return img;
    });

    this._showIdleAnimations();
    // CREATE MASK
    const shape = this.scene.make.graphics();

    const { width } = this.scene.sys.game.canvas;

    shape.fillStyle(0xffffff);
    shape.fillRect(
      0,
      this.gameObject.y,
      width,
      reelsLayoutConfig.rows * this.scene.imageSize
    );
    const mask = shape.createGeometryMask();
    this.gameObject.setMask(mask);
  };

  /* Fill winner container */
  _addWinnerSymbols = () => {
    this.containerWinnerImgs.forEach((elm) => elm.destroy());
    this.containerWinnerImgs = [];

    this.containerWinnerImgs = this.winnerSymbols.map((obj, index) => {
      const img = this.scene.add.image(
        this.scene.imageSize / 2,
        this.scene.imageSize / 2 + this.scene.imageSize * index,
        "symbols",
        obj.texture
      );
      img.displayWidth = this.scene.imageSize;
      img.displayHeight = this.scene.imageSize;

      this.containerWinner.add(img);

      return img;
    });
  };

  /*********************************/
  /* Tweening Methods*/
  /*********************************/

  /* Reel acceleration tween */
  _tweenAccelerate = () => {
    console.log("_tweenAccelerate");
    const tween = this.scene.tweens.add({
      targets: this.tweenObject,
      val: this.tweenAccelerateVal,
      ease: "Expo.easeIn",
      duration: reelTweenConfig.accelerate.duration,
      onUpdate: (tween, target) => {
        this.containerMain.y =
          target.val % (this.params.symbols.length * this.scene.imageSize);
        this.containerClone.y =
          this.containerMain.y -
          this.params.symbols.length * this.scene.imageSize;

        this._setVisibility();
      },
    });

    tween.on("complete", () => {
      this._tweenMain();
    });
  };

  /* Reel linear tween */
  _tweenMain = () => {
    console.log("_tweenMain");
    const tween = this.scene.tweens.add({
      targets: this.tweenObject,
      val:
        this.scene.imageSize *
        this.params.symbols.length *
        reelTweenConfig.main.spins,
      ease: "Linear",
      duration: reelTweenConfig.main.duration,
      onUpdate: (tween, target) => {
        // Position Main Container
        this.containerMain.y =
          target.val % (this.params.symbols.length * this.scene.imageSize);
        // Position Clone Container at the topof Main Container
        this.containerClone.y =
          this.containerMain.y -
          this.params.symbols.length * this.scene.imageSize;

        this._setVisibility();

        if (this.status === "stop") {
          tween.stop();

          this._tweenDecelerate();
        }
      },
    });
    tween.on("complete", () => {
      this._tweenDecelerate();
    });
    tween.on("start", () => {
      this.startSound.play();
    });
  };

  /* Reel deceleration tween */
  _tweenDecelerate = () => {
    const decelerateVal =
      Math.ceil(
        this.tweenObject.val /
          (this.scene.imageSize * this.params.symbols.length)
      ) *
        (this.scene.imageSize * this.params.symbols.length) +
      this.scene.imageSize * this.params.symbols.length +
      reelTweenConfig.bounce.imagePercentHeight * this.scene.imageSize;
    const tween = this.scene.tweens.add({
      targets: this.tweenObject,
      val: decelerateVal,
      ease: "Quad.easeOut",
      duration: reelTweenConfig.decelerate.duration,
      onUpdate: (tween, target) => {
        // Position Main Container
        this.containerMain.y =
          target.val % (this.params.symbols.length * this.scene.imageSize);
        // Position Clone Container at the topof Main Container
        this.containerClone.y =
          this.containerMain.y -
          this.params.symbols.length * this.scene.imageSize;

        // If the difference between the current and final values is less or equal than the height of the symbols reel plus the extra bounce y
        if (
          decelerateVal - target.val <=
          this.params.symbols.length * this.scene.imageSize +
            reelTweenConfig.bounce.imagePercentHeight * this.scene.imageSize
        ) {
          // If the difference between the current and final values is higher the extra bounce y
          if (
            decelerateVal - target.val >
            reelTweenConfig.bounce.imagePercentHeight * this.scene.imageSize
          ) {
            this.containerWinner.y = this.containerClone.y;
            for (let i = 0; i < this.winnerSymbols.length; i++) {
              this.containerCloneImgs[i].alpha = 0;
            }
          } else {
            this.containerWinner.y = this.containerMain.y;
            for (let i = 0; i < this.winnerSymbols.length; i++) {
              this.containerMainImgs[i].alpha = 0;
            }
            this.containerCloneImgs.forEach((element) => {
              element.alpha = 1;
            });
          }
        }
      },
    });

    tween.on("complete", () => {
      console.log("begin bounce");

      this.containerWinner.y = this.containerMain.y;

      this._tweenBounce();
      this.boing.play();
    });
  };

  /* Reel bounce tween */
  _tweenBounce = () => {
    const finalVal =
      this.tweenObject.val -
      reelTweenConfig.bounce.imagePercentHeight * this.scene.imageSize;

    const tween = this.scene.tweens.add({
      targets: this.tweenObject,
      val: finalVal + reelTweenConfig.bounce.finalYCorrection,
      ease: "Bounce.Out",
      duration: reelTweenConfig.bounce.duration,
      onUpdate: (tween, target) => {
        this.containerMain.y =
          target.val % (this.params.symbols.length * this.scene.imageSize);

        this.containerClone.y =
          this.containerMain.y -
          this.params.symbols.length * this.scene.imageSize;

        if (
          finalVal - target.val <=
          this.params.symbols.length * this.scene.imageSize +
            reelTweenConfig.bounce.imagePercentHeight * this.scene.imageSize
        ) {
          this.containerWinner.y = this.containerMain.y;
          this.containerMain.alpha = 0;
          this.containerClone.alpha = 1;
        }
      },
    });

    tween.on("complete", () => {
      console.log("end");

      this.first = false;

      this.anims = [];

      this.scene.reelEnded();
    });
  };

  /* Set the visibility of container and symbols */
  _setVisibility = () => {
    if (
      !this.first &&
      this.containerWinner.y < reelsLayoutConfig.rows * this.scene.imageSize
    ) {
      this.containerWinner.y = this.containerMain.y;
    }

    if (
      !this.first &&
      this.containerWinner.y >= reelsLayoutConfig.rows * this.scene.imageSize &&
      this.containerMain.alpha === 0
    ) {
      this.containerMain.alpha = 1;
      for (let i = 0; i < this.containerMainImgs.length; i++) {
        this.containerMainImgs[i].alpha = 1;
      }

      this._addWinnerSymbols();
    }
  };

  /*********************************/
  /* Symbols animations */
  /*********************************/
  _showIdleAnimations = (winners = false) => {
    for (let i = 0; i < reelsLayoutConfig.rows; i++) {
      const key = winners
        ? this.winnerSymbols[i].texture
        : this.params.symbols[i].texture;
      const symbol = symbolsConfig.get(key);
      if (symbol.idleAnimation) {
        const config = {
          key: symbol.idleAnimation,
          frames: this.scene.anims.generateFrameNumbers("coinsSprite", {
            start: 0,
            end: 5,
            first: 0,
            delay: Math.floor(Math.random() * 1000),
          }),
          frameRate: 6,
          repeat: -1,
        };

        this.scene.anims.create(config);

        this.anims[i] = this.scene.add
          .sprite(
            this.scene.imageSize / 2,
            this.scene.imageSize / 2 + this.scene.imageSize * i,
            "coinsSprite"
          )
          .play(symbol.idleAnimation);
        this.anims[i].displayWidth = this.scene.imageSize;
        this.anims[i].displayHeight = this.scene.imageSize;

        this.gameObject.add(this.anims[i]);
      }
    }
  };
  showWinnerAnimations = () => {
    this.showWinnerBorders();
    for (let i = 0; i < reelsLayoutConfig.rows; i++) {
      const key = this.winnerSymbols[i].texture;
      const symbol = symbolsConfig.get(key);

      if (symbol.winnerAnimation && this.winnerSymbols[i].winner) {
        const config = {
          key: symbol.winnerAnimation,
          frames: this.scene.anims.generateFrameNumbers("coinsSprite", {
            start: 6,
            end: 11,
            first: 6,
          }),
          frameRate: 15,
          repeat: 3,
        };

        this.scene.anims.create(config);

        this.anims[i] = this.scene.add
          .sprite(
            this.scene.imageSize / 2,
            this.scene.imageSize / 2 + this.scene.imageSize * i,
            "coinsSprite"
          )
          .play(symbol.winnerAnimation);

        this.containerWinnerImgs[i].alpha = 0;

        this.anims[i].displayWidth = this.scene.imageSize;
        this.anims[i].displayHeight = this.scene.imageSize;

        const index = i;
        this.anims[i].on("animationcomplete", () => {
          console.log("animationcomplete", index);

          this.containerWinnerBordersShapes.forEach((elm) => elm.destroy());

          this.containerWinnerImgs[index].alpha = 1;
          this.anims[index].destroy();
          this._showIdleAnimations(true);
        });
        this.gameObject.add(this.anims[i]);
      }
    }
  };

  showWinnerBorders = () => {
    this.containerWinnerBordersShapes = [];
    for (let i = 0; i < reelsLayoutConfig.rows; i++) {
      if (this.winnerSymbols[i].winner) {
        const shape = this.scene.make.graphics();
        shape.lineStyle(5, 0xff00ff, 1.0);
        shape.strokeRect(
          0,
          this.scene.imageSize * i,
          this.scene.imageSize,
          this.scene.imageSize
        );
        this.containerWinnerBordersShapes.push(shape);
        this.containerWinnerBorders.add(shape);
      }
    }
  };

  /*********************************/
  /* Public methods */
  /*********************************/

  startSpin = (winnerSymbols, delay = 0) => {
    this.containerMain.y = 0;
    this.containerClone.y = -this.params.symbols.length * this.scene.imageSize;
    this.status = "start";
    this.tweenObject = {
      val: 0,
    };
    this.winnerSymbols = winnerSymbols;

    // Destroy winner borders
    if (this.containerWinnerBordersShapes) {
      this.containerWinnerBordersShapes.forEach((elm) => elm.destroy());
    }

    // Show last winner images
    if (this.containerWinnerImgs) {
      this.containerWinnerImgs.forEach((elm) => (elm.alpha = 1));
    }
    // Destroy animations
    if (this.anims) {
      this.anims.forEach((elm) => elm.destroy());
    }

    if (this.first) {
      this._addWinnerSymbols();
    }

    this.anims.forEach((elm) => elm.destroy());

    setTimeout(this._tweenAccelerate, delay);
  };
  stopSpin = (delay = 0) => {
    setTimeout(() => (this.status = "stop"), delay);
  };

  setContainerPosition = (x, y) => {
    this.gameObject.x = x;
    this.gameObject.y = y;
  };

  /*********************************/
  /* Resize method */
  /*********************************/
  resize = () => {
    this.containerClone.y = -this.params.symbols.length * this.scene.imageSize;
    this.containerMainImgs.forEach((img, index) => {
      img.x = this.scene.imageSize / 2;
      img.y = this.scene.imageSize / 2 + this.scene.imageSize * index;
      img.displayWidth = this.scene.imageSize;
      img.displayHeight = this.scene.imageSize;
    });
    this.containerCloneImgs.forEach((img, index) => {
      img.x = this.scene.imageSize / 2;
      img.y = this.scene.imageSize / 2 + this.scene.imageSize * index;
      img.displayWidth = this.scene.imageSize;
      img.displayHeight = this.scene.imageSize;
    });
    this.containerWinnerImgs.forEach((img, index) => {
      img.x = this.scene.imageSize / 2;
      img.y = this.scene.imageSize / 2 + this.scene.imageSize * index;
      img.displayWidth = this.scene.imageSize;
      img.displayHeight = this.scene.imageSize;
    });

    this.gameObject.clearMask(true);

    const shape = this.scene.make.graphics();

    shape.fillStyle(0xffffff);
    shape.fillRect(
      this.gameObject.x,
      this.gameObject.y,
      this.scene.imageSize,
      reelsLayoutConfig.rows * this.scene.imageSize
    );
    const mask = shape.createGeometryMask();
    this.gameObject.setMask(mask);

    this.anims.forEach((elm, index) => {
      elm.x = this.scene.imageSize / 2;
      elm.y = this.scene.imageSize / 2 + this.scene.imageSize * index;

      elm.displayWidth = this.scene.imageSize;
      elm.displayHeight = this.scene.imageSize;
    });
  };

  update(time, delta) {}
}
