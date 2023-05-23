import UserComponent from "./UserComponent";

export default class Reel extends UserComponent {
  constructor(gameObject, params) {
    super(gameObject);

    this.params = params;
    this.tweenVal = 0;
    this.tweenMainDuration = 3000;
    this.tweenBounceDuration = 500;
    this.tweenAccelerateDuration = 500;
    this.tweenDecelerateDuration = 10000;
    this.gameObject = gameObject;
    this.tweenObject = {
      val: 0,
    };
    this.boing = null;
    this.startSound = null;
    this.tweenAccelerateVal = this.scene.imageSize * 1;
    this.spins = 3;
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
    this.tweenVal =
      this.scene.imageSize * this.params.symbols.length * this.spins;

    setTimeout(this.tweenAccelerate, delay);
  };
  stopSpin = (delay = 0) => {
    setTimeout(() => {}, delay);
  };
  tweenMain = () => {
    const tween = this.scene.tweens.add({
      targets: this.tweenObject,
      val: this.tweenVal,
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

        /*         // If the difference between the current and final values is less or equal than the height of the symbols reel plus the extra bounce y 
        if (
          this.tweenVal - target.val <=
          this.params.symbols.length * this.scene.imageSize + this.params.yBounce*this.scene.imageSize
        ) {

          
          // If the difference between the current and final values is higher the extra bounce y 
          if (this.tweenVal - target.val > this.params.yBounce*this.scene.imageSize) {
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
        } */
      },
    });
    tween.on("complete", () => {
      console.log("end");

      this.tweenDecelerate();

      //  this.boing.play();
      //   this.tweenBounce();
    });
    tween.on("start", () => {
      console.log("start");
      this.startSound.play();
    });
  };

  tweenBounce = () => {
    const tween = this.scene.tweens.add({
      targets: this.tweenObject,
      val: this.tweenObject.val - this.params.yBounce * this.scene.imageSize,
      ease: "Bounce.Out",
      duration: this.tweenBounceDuration,
      onUpdate: (tween, target) => {
        this.containerMain.y =
          target.val % (this.params.symbols.length * this.scene.imageSize);
        this.containerClone.y =
          this.containerMain.y -
          this.params.symbols.length * this.scene.imageSize;

        if (
          this.tweenVal - target.val <=
          this.params.symbols.length * this.scene.imageSize +
            this.params.yBounce * this.scene.imageSize
        ) {
          if (
            this.tweenVal - target.val >
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
  };

  tweenAccelerate = () => {
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
      },
    });

    tween.on("complete", () => {
      console.log("end");
      this.tweenMain();
    });
  };

  tweenDecelerate = () => {
    const decelerateVal =
      this.tweenObject.val +
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
      console.log("end");
      this.containerWinner.y = this.containerMain.y;

      this.boing.play();
      this.tweenBounce();
    });
  };

  update(time, delta) {}

  /* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
