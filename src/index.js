import Phaser from 'phaser';

import MainScene from './scenes/Game.js';


const config = {
    type: Phaser.AUTO,
    parent: 'phaser-example',
    scene: MainScene,
    scale: {
        mode: Phaser.Scale.RESIZE
    },
};




const game = new Phaser.Game(config);
