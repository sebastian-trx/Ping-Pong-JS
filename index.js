(function () {
  self.Board = function (width, height) {
    this.width = width;
    this.height = height;
    this.playing = false;
    this.gameOver = false;
    this.bars = [];
    this.ball = null;
    this.playing = false;
  };

  self.Board.prototype = {
    get elements() {
      let elements = this.bars.map((bar) => {
        return bar;
      });
      elements.push(this.ball);
      return elements;
    },
  };
})();

(function () {
  self.Ball = function (x, y, radio, board) {
    this.x = x;
    this.y = y;
    this.radio = radio;
    this.board = board;
    this.speedY = 0;
    this.speedX = 3;
    this.speed = 3;
    this.direction = 1;
    this.bounceAngle = 0;
    this.maxBounceAngle = Math.PI / 12;

    board.ball = this;
    this.kind = "circle";
  };

  self.Ball.prototype = {
    move: function () {
      this.x += this.speedX * this.direction;
      this.y += this.speedY;
    },

    get width() {
      return this.radio * 2;
    },

    get height() {
      return this.radio * 2;
    },

    collision: function (bar) {

      let relativeIntersectY = bar.y + bar.height / 2 - this.y;
      let normalizedIntersectY = relativeIntersectY / (bar.height / 2);

      this.bounceAngle = normalizedIntersectY * this.maxBounceAngle;
      this.speedY = this.speed * -Math.sin(this.bounceAngle);
      this.speedX = this.speed * Math.cos(this.bounceAngle);

      if (this.x > this.board.width / 2) this.direction = -1;
      else this.direction = 1;
    },
  };
})();

(function () {
  self.Bar = function (x, y, width, height, board) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.board = board;
    this.board.bars.push(this);
    this.kind = "rectangle";
    this.speed = 10;
  };

  self.Bar.prototype = {
    down: function () {
      this.y += this.speed;
    },

    up: function () {
      this.y -= this.speed;
    },

    toString: function () {
      return "x: " + this.x + " y: " + this.y;
    },
  };
})();

(function () {
  self.BoardView = function (canvas, board) {
    this.canvas = canvas;
    this.canvas.width = board.width;
    this.canvas.height = board.height;
    this.board = board;
    this.ctx = canvas.getContext("2d");
  };

  self.BoardView.prototype = {
    clean: function () {
      this.ctx.clearRect(0, 0, this.board.width, this.board.height);
    },

    draw: function () {
      for (let i = this.board.elements.length - 1; i >= 0; i--) {
        let elemento = this.board.elements[i];
        draw(this.ctx, elemento);
      }
    },

    checkCollisions: function () {
      for (let i = 0; i < this.board.bars.length; i++) {
        let bar = this.board.bars[i];
        if (hit(bar, this.board.ball)) {
          this.board.ball.collision(bar);
        }
      }
    },

    play: function () {
      if (this.board.playing) {
        this.clean();
        this.draw();
        this.checkCollisions();
        this.board.ball.move();
      }
    },
  };

  function hit(a, b) {
    let hit = false;

    if (b.x + b.width >= a.x && b.x < a.x + a.width) {
      if (b.y + b.height >= a.y && b.y < a.y + a.height) {
        hit = true;
      }
    }

    if (b.x <= a.x && b.x + b.width >= a.x + a.width) {
      if (b.y <= a.y && b.y + b.height >= a.y + a.height) {
        hit = true;
      }
    }

    if (a.x <= b.x && a.x + a.width >= b.x + b.width) {
      if (a.y <= b.y && a.y + a.height >= b.y + b.height) {
        hit = true;
      }
    }
    return hit;
  }

  function draw(ctx, element) {
    switch (element.kind) {
      case "rectangle":
        ctx.fillRect(element.x, element.y, element.width, element.height);
        break;

      case "circle":
        ctx.beginPath();
        ctx.arc(element.x, element.y, element.radio, 0, 7);
        ctx.fill();
        ctx.closePath();
        break;
    }
  }
})();

let board = new Board(800, 400);
let canvas = document.getElementById("canvas");
let bar = new Bar(20, 150, 40, 100, board);
let bar_2 = new Bar(735, 150, 40, 100, board);
let boardView = new BoardView(canvas, board);
let ball = new Ball(400, 200, 10, board);

document.addEventListener("keydown", function (ev) {
  if (ev.key === "w") {
    ev.preventDefault();
    bar.up();
  }

  if (ev.key === "s") {
    ev.preventDefault();
    bar.down();
  }

  if (ev.key === "ArrowUp") {
    ev.preventDefault();
    bar_2.up();
  }

  if (ev.key === "ArrowDown") {
    ev.preventDefault();
    bar_2.down();
  }

  if (ev.key === " ") {
    ev.preventDefault();
    board.playing = !board.playing;
  }
});

boardView.draw();
window.requestAnimationFrame(controller);

function controller() {
  boardView.play();
  window.requestAnimationFrame(controller);
}
