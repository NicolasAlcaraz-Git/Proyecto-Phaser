// URL to explain PHASER scene: https://rexrainbow.github.io/phaser3-rex-notes/docs/site/scene/

export default class Game extends Phaser.Scene {
  constructor() {
    super("game"); 
    this.countdown = 30; //Inicializa el temporizador con 30 segundos
  }

  init() {
    // this is called before the scene is created
    // init variables
    // take data passed from other scenes
    // data object param {}
  }

  preload() {
    // load assets
    this.load.image("sky", "./public/assets/sky.png");
    this.load.image("ground", "./public/assets/platform.png");
    this.load.image("star", "./public/assets/star.png");
    this.load.image("bomb", "./public/assets/bomb.png");
    this.load.image("gameover", "./public/assets/gameover.png"); //Cargar la imagen de gameover
    this.load.spritesheet("dude", "./public/assets/dude.png", {
      frameWidth: 32,
      frameHeight: 48,
    });
  }

  create() {
    //Reinicia el temporizador al valor inicial de 30 segundos
    this.countdown = 30;

    // Crea el fondo
    this.add.image(400, 300, "sky");

    this.platforms = this.physics.add.staticGroup();

    this.platforms.create(400, 568, "ground").setScale(2).refreshBody();

    this.platforms.create(600, 400, "ground");
    this.platforms.create(50, 250, "ground");
    this.platforms.create(750, 220, "ground");

    this.player = this.physics.add.sprite(100, 450, "dude");

    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);

    //Reinicia el texto del temporizador al valor inicial de 30 segundos
    this.timerText = this.add.text(this.cameras.main.width - 20, 16, `Time: ${this.countdown}`, {
      fontSize: '32px',
      fill: '#000'
    }).setOrigin(1, 0);

    //Código para reducir el temporizador cada segundo
    this.time.addEvent({
      delay: 1000, //Reduce el tiempo cada segundo
      callback: () => {
        if (this.gameOver) return; //Interrumpe el tiempo si el juego ha terminado
        this.countdown--;
        this.timerText.setText(`Time: ${this.countdown}`);
        if (this.countdown <= 0) {
          this.triggerGameOver();
        }
      },
      callbackScope: this,
      loop: true
    });

    //Reinicia la escena al presionar la tecla R
    this.input.keyboard.on('keydown-R', () => {
      this.scene.restart();
  });

    this.anims.create({
      key: "left",
      frames: this.anims.generateFrameNumbers("dude", { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "turn",
      frames: [{ key: "dude", frame: 4 }],
      frameRate: 20,
    });

    this.anims.create({
      key: "right",
      frames: this.anims.generateFrameNumbers("dude", { start: 5, end: 8 }),
      frameRate: 10,
      repeat: -1,
    });

    this.cursors = this.input.keyboard.createCursorKeys();

    this.stars = this.physics.add.group({
      key: "star",
      repeat: 11,
      setXY: { x: 12, y: 0, stepX: 70 },
    });

    this.stars.children.iterate(function (child) {
      child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    });

    this.bombs = this.physics.add.group();

    this.score = 0;
    this.gameOver = false;

    this.scoreText = this.add.text(16, 16, `Score: ${this.score}`, {
      fontSize: "32px",
      fill: "#000",
    });

    this.physics.add.collider(this.player, this.platforms);

    this.physics.add.collider(this.stars, this.platforms);

    this.physics.add.overlap(
      this.player,
      this.stars,
      this.collectStar,
      null,
      this
    );

    this.physics.add.collider(
      this.player,
      this.bombs,
      this.hitBomb,
      null,
      this
    );
  }

  update() {
    // update game objects
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160);

      this.player.anims.play("left", true);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160);

      this.player.anims.play("right", true);
    } else {
      this.player.setVelocityX(0);

      this.player.anims.play("turn");
    }

    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-330);
    }
  }

  collectStar(player, star) {
    star.disableBody(true, true);

    this.score += 10;
    this.scoreText.setText(`Score: ${this.score}`);

    if (this.stars.countActive(true) === 0) {
      //  A new batch of stars to collect
      this.stars.children.iterate(function (child) {
        child.enableBody(true, child.x, 0, true, true);
      });

      var x =
        this.player.x < 400
          ? Phaser.Math.Between(400, 800)
          : Phaser.Math.Between(0, 400);

      var bomb = this.bombs.create(x, 16, "bomb");
      bomb.setBounce(1);
      bomb.setCollideWorldBounds(true);
      bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
      bomb.allowGravity = false;
    }
  }

  hitBomb(player, bomb) { //Se cambió el nombre de la función a hitBomb
    this.triggerGameOver(); //Llama a la función triggerGameOver al chocar con una bomba
  }

triggerGameOver() { //Se cambió el nombre de la función a triggerGameOver
  if (this.gameOver) return; //Evita que se ejecute varias veces
  this.gameOver = true; //Marca el juego como terminado

  this.physics.pause();
  this.player.setTint(0xff0000); 
  this.player.anims.play("turn"); 

  this.add.image(400, 300, "gameover").setScale(1.0); //Muestra la imagen de gameover
}
}