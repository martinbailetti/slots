import UserComponent from "./UserComponent";

export default class Reel extends UserComponent {
  constructor(gameObject, params) {
    super(gameObject);

    this.first = true;
    this.params = params;
    this.tweenMainDuration = 5000;
    this.tweenBounceDuration = 500;
    this.tweenAccelerateDuration = 500;
    this.tweenDecelerateDuration = 700;
    this.gameObject = gameObject;
    this.tweenObject = {
      val: 0,
    };
    this.boing = null;
    this.startSound = null;
    this.tweenAccelerateVal = this.scene.imageSize * 4;
    this.spins = 40;
    this.anims = [];
    this.status = "stop";
    this.containerMain = null;
    this.containerMainImgs = null;
    this.containerClone = null;
    this.containerCloneImgs = null;
    this.containerWinner = null;
    this.containerWinnerImgs = null;
    gameObject["__ReelContainer"] = this;
  }

  /** @returns {Reel} */
  static getComponent(gameObject) {
    return gameObject["__ReelContainer"];
  }

  /** @type {Phaser.GameObjects.Container} */
  gameObject;

  /* START-USER-CODE */

  awake() {
    this.boing = this.scene.sound.add("boing", { loop: false });
    this.startSound = this.scene.sound.add("start", { loop: false });

    this._displayReel();
  }

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
    this.gameObject.add(this.containerMain);
    this.gameObject.add(this.containerClone);
    this.gameObject.add(this.containerWinner);

    this.containerMainImgs = this.params.symbols.map((texture, index) => {
      const img = this.scene.add.image(
        this.scene.imageSize / 2,
        this.scene.imageSize / 2 + this.scene.imageSize * index,
        "symbols",
        texture
      );
      img.displayWidth = this.scene.imageSize;
      img.displayHeight = this.scene.imageSize;

      this.containerMain.add(img);

      return img;
    });
    this.containerCloneImgs = this.params.symbols.map((texture, index) => {
      const img = this.scene.add.image(
        this.scene.imageSize / 2,
        this.scene.imageSize / 2 + this.scene.imageSize * index,
        "symbols",
        texture
      );
      img.displayWidth = this.scene.imageSize;
      img.displayHeight = this.scene.imageSize;

      this.containerClone.add(img);

      return img;
    });
    this.containerWinnerImgs = this.params.winnerSymbols.map(
      (texture, index) => {
        const img = this.scene.add.image(
          this.scene.imageSize / 2,
          this.scene.imageSize / 2 + this.scene.imageSize * index,
          "symbols",
          texture
        );
        img.displayWidth = this.scene.imageSize;
        img.displayHeight = this.scene.imageSize;

        this.containerWinner.add(img);

        return img;
      }
    );




    for (let i = 0; i < this.params.rows; i++) {
      if (this.params.symbols[i] === "coin") {

        const config = {
          key: 'starAnimation',
          frames: this.scene.anims.generateFrameNumbers('starSprite', { start: 0, end: 5, first: 0 }),
          frameRate: 15,
          repeat: -1
        };

        this.scene.anims.create(config);

        this.anims[i] = this.scene.add.sprite(this.scene.imageSize / 2, this.scene.imageSize / 2 + this.scene.imageSize * i, 'starSprite').play('starAnimation');
        this.anims[i].displayWidth = this.scene.imageSize;
        this.anims[i].displayHeight = this.scene.imageSize;

        this.gameObject.add(this.anims[i]);



      }
    }

    // CREATE MASK
    const shape = this.scene.make.graphics();

    shape.fillStyle(0xffffff);
    shape.fillRect(
      this.gameObject.x,
      this.gameObject.y,
      this.scene.imageSize,
      this.params.rows * this.scene.imageSize
    );
    const mask = shape.createGeometryMask();
    this.gameObject.setMask(mask);
  };

  startSpin = (delay = 0) => {
    this.containerMain.y = 0;
    this.containerClone.y = -this.params.symbols.length * this.scene.imageSize;
    this.status = "start";
    this.tweenObject = {
      val: 0,
    };

     this.anims.forEach(elm => elm.destroy());

    setTimeout(this._tweenAccelerate, delay);
  };
  stopSpin = (delay = 0) => {
    setTimeout(() => (this.status = "stop"), delay);
  };

  setContainerPosition = (x, y) => {
    this.gameObject.x = x;
    this.gameObject.y = y;
  };
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
      this.params.rows * this.scene.imageSize
    );
    const mask = shape.createGeometryMask();
    this.gameObject.setMask(mask);




  };

  _tweenAccelerate = () => {
    const tween = this.scene.tweens.add({
      targets: this.tweenObject,
      val: this.tweenAccelerateVal,
      ease: "Expo.easeIn",
      duration: this.tweenAccelerateDuration,
      onUpdate: (tween, target) => {
        this.containerMain.y =
          target.val % (this.params.symbols.length * this.scene.imageSize);
        this.containerClone.y =
          this.containerMain.y -
          this.params.symbols.length * this.scene.imageSize;

        if (
          !this.first &&
          this.containerWinner.y < this.params.rows * this.scene.imageSize
        ) {
          this.containerWinner.y = this.containerMain.y;
        }

        if (
          !this.first &&
          this.containerWinner.y >= this.params.rows * this.scene.imageSize
        ) {
          this.containerMain.alpha = 1;
          this.containerClone.alpha = 1;
          for (let i = 0; i < this.containerMainImgs.length; i++) {
            this.containerMainImgs[i].alpha = 1;
            this.containerCloneImgs[i].alpha = 1;
          }
        }
      },
    });

    tween.on("complete", () => {
      this._tweenMain();
    });
  };

  _tweenMain = () => {
    const tween = this.scene.tweens.add({
      targets: this.tweenObject,
      val: this.scene.imageSize * this.params.symbols.length * this.spins,
      ease: "Linear",
      duration: this.tweenMainDuration,
      onUpdate: (tween, target) => {
        // Position Main Container
        this.containerMain.y =
          target.val % (this.params.symbols.length * this.scene.imageSize);
        // Position Clone Container at the topof Main Container
        this.containerClone.y =
          this.containerMain.y -
          this.params.symbols.length * this.scene.imageSize;

        if (
          !this.first &&
          this.containerWinner.y < this.params.rows * this.scene.imageSize
        ) {
          this.containerWinner.y = this.containerMain.y;
        }

        if (
          !this.first &&
          this.containerWinner.y >= this.params.rows * this.scene.imageSize
        ) {
          this.containerMain.alpha = 1;
          this.containerClone.alpha = 1;
          for (let i = 0; i < this.containerMainImgs.length; i++) {
            this.containerMainImgs[i].alpha = 1;
            this.containerCloneImgs[i].alpha = 1;
          }
        }

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

  _tweenDecelerate = () => {
    const decelerateVal =
      Math.ceil(
        this.tweenObject.val /
        (this.scene.imageSize * this.params.symbols.length)
      ) *
      (this.scene.imageSize * this.params.symbols.length) +
      this.scene.imageSize * this.params.symbols.length +
      this.params.yBounce * this.scene.imageSize;
    const tween = this.scene.tweens.add({
      targets: this.tweenObject,
      val: decelerateVal,
      ease: "Quad.easeOut",
      duration: this.tweenDecelerateDuration,
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
          this.params.yBounce * this.scene.imageSize
        ) {
          // If the difference between the current and final values is higher the extra bounce y
          if (
            decelerateVal - target.val >
            this.params.yBounce * this.scene.imageSize
          ) {
            this.containerWinner.y = this.containerClone.y;
            for (let i = 0; i < this.params.winnerSymbols.length; i++) {
              this.containerCloneImgs[i].alpha = 0;
            }
          } else {
            this.containerWinner.y = this.containerMain.y;
            for (let i = 0; i < this.params.winnerSymbols.length; i++) {
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

      this.boing.play();
      this.tweenBounce();
    });
  };

  tweenBounce = () => {
    const finalVal =
      this.tweenObject.val - this.params.yBounce * this.scene.imageSize;
    const tween = this.scene.tweens.add({
      targets: this.tweenObject,
      val: finalVal,
      ease: "Bounce.Out",
      duration: this.tweenBounceDuration,
      onUpdate: (tween, target) => {
        this.containerMain.y =
          target.val % (this.params.symbols.length * this.scene.imageSize);
        this.containerClone.y =
          this.containerMain.y -
          this.params.symbols.length * this.scene.imageSize;

        if (
          finalVal - target.val <=
          this.params.symbols.length * this.scene.imageSize +
          this.params.yBounce * this.scene.imageSize
        ) {
          if (
            finalVal - target.val >
            this.params.yBounce * this.scene.imageSize
          ) {
            this.containerWinner.y = this.containerClone.y;
            this.containerClone.alpha = 0;
          } else {
            this.containerWinner.y = this.containerMain.y;
            this.containerMain.alpha = 0;
            this.containerClone.alpha = 1;
          }
        }
      },
    });

    tween.on("complete", () => {
      console.log("end");

      this.first = false;



      this.scene.reelEnded();
    });
  };
  update(time, delta) { }

  /* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
