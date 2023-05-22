import UserComponent from "./UserComponent";
import {
  createWinnerGroup,
  createGroup,
  createMask,
} from "../utils/mainSceneUtils.js";

export default class Reel extends UserComponent {
  constructor(gameObject, params) {
    super(gameObject);



    this.params = params;
    this.gameObject = gameObject;

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
    this.imageSize = width / 3;
    this.gameObject.y =
      -this.params.symbols.length * this.imageSize + 5 * this.imageSize;

    this.params.symbols.map((texture, index) => {
      const img = this.scene.add.image(
        this.imageSize / 2,
        this.imageSize / 2 + this.imageSize * index,
        "symbols",
        texture
      );
      img.displayWidth = this.imageSize;
      img.displayHeight = this.imageSize;

      this.gameObject.add(img);

      return img;
    });

    this.tweenAccelerate();
  }
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
