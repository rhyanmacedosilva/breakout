const canvas = document.querySelector("canvas");
canvas.width = 800;
canvas.height = 600;
canvas.style.backgroundColor = "transparent";

const body = document.querySelector("body");
body.style.backgroundColor = "white";
// body.style.margin = 0;

const c = canvas.getContext("2d");

sortRandomColor();

class Ball {
  constructor({ pos, vel, scale, speed, player, blocks }) {
    this.pos = pos;
    this.vel = vel;
    this.scale = scale;
    this.speed = speed;
    this.player = player;
    this.blocks = blocks;
    this.collider = null;

    this.init();
  }

  init() {
    const maxAngle = Math.PI / 4;
    const randomAngle = Math.random() * (maxAngle * 2) - maxAngle;

    this.vel.x = Math.sin(randomAngle);
    this.vel.y = -Math.cos(randomAngle);
  }

  update() {
    this.collider = {
      xL: this.pos.x - this.scale.x,
      xR: this.pos.x + this.scale.x,
      yT: this.pos.y - this.scale.y,
      yB: this.pos.y + this.scale.y,
    };

    this.draw();
    this.detectWalls();
    this.detectPlayer();
    this.detectBlocks();

    this.pos.x += this.vel.x * this.speed;
    this.pos.y += this.vel.y * this.speed;
  }

  draw() {
    c.beginPath();
    c.arc(this.pos.x, this.pos.y, this.scale.x, 0, Math.PI * 2, false);
    c.fill();
  }

  detectBlocks() {
    this.blocks.list.forEach((block) => {
      // Top, Bottom collision
      const headingUp = this.vel.y < 0;
      const inHorizontalRange =
        this.pos.x >= block.pos.x && this.pos.x <= block.pos.x + block.scale.x;
      const hitBlockBottom =
        this.collider.yT <= block.pos.y + block.scale.y &&
        this.collider.yT >= block.pos.y &&
        inHorizontalRange;
      const hitBlockTop =
        this.collider.yB >= block.pos.y &&
        this.collider.yB <= block.pos.y + block.scale.y &&
        inHorizontalRange;

      // Left, Right collision
      const headingRight = this.vel.x > 0;
      const inVerticalRange =
        this.pos.y >= block.pos.y && this.pos.y <= block.pos.y + block.scale.y;
      const hitBlockLeft =
        this.collider.xR >= block.pos.x &&
        this.collider.xR <= block.pos.x + block.scale.x &&
        inVerticalRange;
      const hitBlockRight =
        this.collider.xL <= block.pos.x + block.scale.x &&
        this.collider.xL >= block.pos.x &&
        inVerticalRange;

      if ((hitBlockLeft && headingRight) || (hitBlockRight && !headingRight)) {
        this.vel.x *= -1;
        this.blocks.delete(block.id);
      }

      if ((hitBlockBottom && headingUp) || (hitBlockTop && !headingUp)) {
        this.vel.y *= -1;
        this.blocks.delete(block.id);
      }
    });
  }

  detectPlayer() {
    const hitPlayer =
      this.collider.yB >= this.player.pos.y &&
      this.collider.yB <= this.player.pos.y + this.player.scale.y &&
      this.collider.xL >= this.player.pos.x &&
      this.collider.xR <= this.player.pos.x + this.player.scale.x;
    const headingDown = this.vel.y > 0;

    if (hitPlayer && headingDown) {
      const reflectionAngle = this.calculateReflectionAngle();

      this.vel.x = Math.sin(reflectionAngle);
      this.vel.y = -Math.cos(reflectionAngle);
    }
  }

  calculateReflectionAngle() {
    const halfPlayerWidth = this.player.scale.x / 2;
    const offset = this.pos.x - (this.player.pos.x + halfPlayerWidth);
    const normalizedOffset = offset / halfPlayerWidth;

    const maxReflectionAngle = Math.PI / 4;
    const reflectionAngle = normalizedOffset * maxReflectionAngle;

    return reflectionAngle;
  }

  detectWalls() {
    const hitLWall = this.collider.xL <= 0;
    const hitRWall = this.collider.xR >= canvas.width;
    const hitTWall = this.collider.yT <= 0;
    const hitBWall = this.collider.yB >= canvas.height;

    if (hitLWall || hitRWall) this.vel.x *= -1;
    if (hitTWall || hitBWall) {
      this.vel.y *= -1;
      if (hitBWall) this.blocks.reset();
    }
  }
}

class Blocks {
  constructor({ amount }) {
    this.amount = amount;
    this.list = [];
    this.instantiateList();
  }

  instantiateList() {
    const blockScale = { x: 40, y: 20 };
    const margin = { x: 0, y: 1 };
    const blockPos = { x: margin.x, y: 0 };

    for (let y = 0; y < this.amount.y; y++) {
      for (let x = 0; x < this.amount.x; x++) {
        this.add(
          new Block({
            pos: { x: blockPos.x, y: blockPos.y },
            scale: blockScale,
          })
        );

        blockPos.x += blockScale.x + margin.x;
      }

      blockPos.y += blockScale.y + margin.y;
      blockPos.x = margin.x;
    }
  }

  reset() {
    this.list = [];
    this.instantiateList();
    sortRandomColor();
  }

  add(block) {
    block.id = this.list.length;
    this.list.push(block);
  }

  delete(id) {
    this.list = this.list.filter((block) => block.id != id);

    if (!this.list.length) this.reset();
  }
}

class Block {
  constructor({ pos, scale }) {
    this.pos = pos;
    this.scale = scale;
  }

  update() {
    this.draw();
  }

  draw() {
    c.fillRect(this.pos.x, this.pos.y, this.scale.x, this.scale.y);
  }
}

class Player {
  constructor({ pos, vel, scale, speed }) {
    this.pos = pos;
    this.vel = vel;
    this.scale = scale;
    this.speed = speed;
  }

  update() {
    this.draw();

    !this.detectWalls()
      ? (this.pos.x += this.vel.x * this.speed)
      : (this.vel.x *= -1);
  }

  draw() {
    c.fillRect(this.pos.x, this.pos.y, this.scale.x, this.scale.y);
  }

  detectWalls() {
    const hitLWall = this.pos.x <= 0 && this.vel.x < 0;
    const hitRWall =
      this.pos.x + this.scale.x >= canvas.width && this.vel.x > 0;

    return hitLWall || hitRWall;
  }
}

const player = new Player({
  pos: { x: canvas.width / 2 - 50, y: canvas.height - 60 },
  vel: { x: -1, y: 0 },
  scale: { x: 100, y: 15 },
  speed: 7,
});

const blocks = new Blocks({ amount: { x: 20, y: 10 } });

const ball = new Ball({
  pos: { x: canvas.width / 2, y: player.pos.y - 10 },
  vel: { x: 0, y: 0 },
  scale: { x: 7, y: 7 },
  speed: 7,
  player,
  blocks,
});

function update() {
  c.clearRect(0, 0, canvas.width, canvas.height);
  player.update();
  ball.update();
  blocks.list.forEach((block) => block.update());
  requestAnimationFrame(update);
}

update();

addEventListener("keydown", ({ code }) => {
  switch (code.replace("Key", "")) {
    case "A":
      player.vel.x = -1;
      break;
    case "D":
      player.vel.x = +1;
      break;
  }
});

/*
addEventListener("keyup", ({ code }) => {
  if (["A", "D"].includes(code.replace("Key", ""))) player.vel.x = 0;
});
*/

function sortRandomColor() {
  const colors = ["pink", "lightGreen", "lightBlue", "yellowGreen"];
  const colorIndex = Math.floor(Math.random() * colors.length);
  const randomColor = colors[colorIndex];

  canvas.style.border = `3px solid ${randomColor}`;
  c.fillStyle = randomColor;
}
