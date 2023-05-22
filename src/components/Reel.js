import UserComponent from "./UserComponent";

export default class Reel extends UserComponent {
  constructor(gameObject, params) {
    super(gameObject);

    this.params = params;
    this.imageSize = this.params.size;
    this.tweenVal = 0;
    this.gameObject = gameObject;
    this.tweenObject = {
      val: 0,
    };
    this.boing = null;
    this.startSound = null;
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
    const { width, height } = this.scene.sys.game.canvas;

    this.boing = this.scene.sound.add("boing", { loop: false });
    this.startSound = this.scene.sound.add("start", { loop: false });

    this.containerMain = this.scene.add.container(0, 0);
    this.containerClone = this.scene.add.container(
      0,
      -this.params.symbols.length * this.imageSize
    );
    this.containerWinner = this.scene.add.container(
      0,
      -this.params.symbols.length * this.imageSize
    );
    this.gameObject.add(this.containerMain);
    this.gameObject.add(this.containerClone);
    this.gameObject.add(this.containerWinner);

    this.containerMainImgs = this.params.symbols.map((texture, index) => {
      const img = this.scene.add.image(
        this.imageSize / 2,
        this.imageSize / 2 + this.imageSize * index,
        "symbols",
        texture
      );
      img.displayWidth = this.imageSize;
      img.displayHeight = this.imageSize;

      this.containerMain.add(img);

      return img;
    });
    this.containerCloneImgs = this.params.symbols.map((texture, index) => {
      const img = this.scene.add.image(
        this.imageSize / 2,
        this.imageSize / 2 + this.imageSize * index,
        "symbols",
        texture
      );
      img.displayWidth = this.imageSize;
      img.displayHeight = this.imageSize;

      this.containerClone.add(img);

      return img;
    });
    this.containerWinnerImgs = this.params.winnerSymbols.map(
      (texture, index) => {
        const img = this.scene.add.image(
          this.imageSize / 2,
          this.imageSize / 2 + this.imageSize * index,
          "symbols",
          texture
        );
        img.displayWidth = this.imageSize;
        img.displayHeight = this.imageSize;

        this.containerWinner.add(img);

        return img;
      }
    );

    this.tweenVal =
      this.imageSize * this.params.symbols.length * 4 + this.params.yBounce;

    // CREATE MASK
    const shape = this.scene.make.graphics();

    shape.fillStyle(0xffffff);
    shape.fillRect(
      this.gameObject.x,
      this.gameObject.y,
      this.imageSize,
      this.params.rows * this.imageSize
    );
    const mask = shape.createGeometryMask();
    this.gameObject.setMask(mask);
  }

  startSpin = (delay=0) => {
    setTimeout(() => {
      const tween = this.scene.tweens.add({
        targets: this.tweenObject,
        val: this.tweenVal,
        ease: "Linear",
        duration: 3000,
        onUpdate: (tween, target) => {
          this.containerMain.y =
            target.val % (this.params.symbols.length * this.imageSize);
          this.containerClone.y =
            this.containerMain.y - this.params.symbols.length * this.imageSize;

          if (
            this.tweenVal - target.val <=
            this.params.symbols.length * this.imageSize + this.params.yBounce
          ) {
            if (this.tweenVal - target.val > this.params.yBounce) {
              this.containerWinner.y = this.containerClone.y;
              // this.containerClone.alpha = 0;
              for (let i = 0; i < this.params.winnerSymbols.length; i++) {
                this.containerCloneImgs[i].alpha = 0;
              }
            } else {
              this.containerWinner.y = this.containerMain.y;
              //this.containerMain.alpha = 0;
              for (let i = 0; i < this.params.winnerSymbols.length; i++) {
                this.containerMainImgs[i].alpha = 0;
              }
              //  this.containerClone.alpha = 1;
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
      tween.on("start", () => {
        console.log("start");
        this.startSound.play();
      });
    }, delay);
  };

  tweenBounce = () => {
    const tween = this.scene.tweens.add({
      targets: this.tweenObject,
      val: this.tweenVal - this.params.yBounce,
      ease: "Bounce.Out",
      duration: 500,
      onUpdate: (tween, target) => {
        this.containerMain.y =
          target.val % (this.params.symbols.length * this.imageSize);
        this.containerClone.y =
          this.containerMain.y - this.params.symbols.length * this.imageSize;

        if (
          this.tweenVal - target.val <=
          this.params.symbols.length * this.imageSize + this.params.yBounce
        ) {
          if (this.tweenVal - target.val > this.params.yBounce) {
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
      targets: this.gameObject,
      y: this.gameObject.y + this.imageSize * 2,
      ease: "Expo.easeIn",
      duration: 1000,
    });
    tween.on("complete", () => {
      console.log("end");
      this.tweenLinear();
    });
  };
  tweenLinear = () => {
    const tween = this.scene.tweens.add({
      targets: this.gameObject,
      y: -this.imageSize * 5,
      ease: "Linear",
      duration: 1000,
    });
    tween.on("complete", () => {
      console.log("end");
      this.tweenDecelerate();
    });
  };
  tweenDecelerate = () => {
    const tween = this.scene.tweens.add({
      targets: this.gameObject,
      y: 0,
      ease: "Quad.easeOut",
      duration: 1000,
    });
    tween.on("complete", () => {
      console.log("end");
    });
  };

  update(time, delta) {
  }

  /* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
