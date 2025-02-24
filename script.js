
  // ---------------------------
  // Get Canvas and Context
  // ---------------------------
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");

  // ---------------------------
  // Game Variables and Objects
  // ---------------------------
  let score = 0;
  let lives = 3;
  let gameActive = false; // Controls whether the game loop should continue

  // Ball properties
  const ballRadius = 8;
  let ballX = canvas.width / 2;
  let ballY = canvas.height - 30;
  let ballDX = 2;
  let ballDY = -2;

  // Paddle properties
  const paddleHeight = 10;
  const paddleWidth = 75;
  let paddleX = (canvas.width - paddleWidth) / 2;
  const paddleSpeed = 5;

  // Keyboard controls
  let rightPressed = false;
  let leftPressed = false;

  // ---------------------------
  // Define the Heart Brick Pattern with Square Bricks
  // ---------------------------
  const heartPattern = [
    [0, 1, 1, 0, 0, 1, 1, 0],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0]
  ];
  const brickRowCount = heartPattern.length;
  const brickColumnCount = heartPattern[0].length;
  const brickSize = 30; // Square bricks: width and height
  const brickPadding = 2;
  // Move the heart pattern a little lower in the canvas:
  const brickOffsetTop = canvas.height * 0.15;
  // Center the heart pattern horizontally on the canvas.
  const heartWidth =
    brickColumnCount * brickSize + (brickColumnCount - 1) * brickPadding;
  const heartStartX = (canvas.width - heartWidth) / 2;

  // Create bricks array and count total bricks
  let totalBricks = 0;
  const bricks = [];
  for (let r = 0; r < brickRowCount; r++) {
    bricks[r] = [];
    for (let c = 0; c < brickColumnCount; c++) {
      if (heartPattern[r][c] === 1) {
        const brickX = heartStartX + c * (brickSize + brickPadding);
        const brickY = brickOffsetTop + r * (brickSize + brickPadding);
        bricks[r][c] = { x: brickX, y: brickY, status: 1 };
        totalBricks++;
      } else {
        bricks[r][c] = { status: 0 };
      }
    }
  }

  // ---------------------------
  // Event Listeners for Controls
  // ---------------------------
  document.addEventListener("keydown", keyDownHandler, false);
  document.addEventListener("keyup", keyUpHandler, false);

  function keyDownHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight") {
      rightPressed = true;
    } else if (e.key === "Left" || e.key === "ArrowLeft") {
      leftPressed = true;
    }
  }

  function keyUpHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight") {
      rightPressed = false;
    } else if (e.key === "Left" || e.key === "ArrowLeft") {
      leftPressed = false;
    }
  }

  // ---------------------------
  // Drawing Functions
  // ---------------------------
  function drawBricks() {
    for (let r = 0; r < brickRowCount; r++) {
      for (let c = 0; c < brickColumnCount; c++) {
        const b = bricks[r][c];
        if (b.status === 1) {
          ctx.fillStyle = "white";
          ctx.fillRect(b.x, b.y, brickSize, brickSize);
        }
      }
    }
  }

  function drawBall() {
    ctx.beginPath();
    ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.closePath();
  }

  function drawPaddle() {
    ctx.fillStyle = "white";
    ctx.fillRect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
  }

  function drawScore() {
    ctx.font = "14px sans-serif";
    ctx.fillStyle = "white";
    ctx.fillText("Score: " + score, 8, 20);
  }

  function drawLives() {
    const lifeCircleRadius = 6;
    const lifeCircleSpacing = 10;
    const numLives = lives;
    // Calculate total width occupied by the circles.
    const totalWidth =
      numLives * (lifeCircleRadius * 2) + (numLives - 1) * lifeCircleSpacing;
    let startX = (canvas.width - totalWidth) / 2 + lifeCircleRadius;
    for (let i = 0; i < numLives; i++) {
      ctx.beginPath();
      ctx.arc(
        startX + i * (2 * lifeCircleRadius + lifeCircleSpacing),
        15,
        lifeCircleRadius,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = "white";
      ctx.fill();
      ctx.closePath();
    }
  }

  // ---------------------------
  // Overlay Handling
  // ---------------------------
  function showOverlay(message) {
    const overlay = document.getElementById("overlay");
    const overlayMessage = document.getElementById("overlayMessage");
    overlayMessage.textContent = message;
    overlay.style.display = "flex";
  }

  // ---------------------------
  // Improved Brick Collision Detection
  // ---------------------------
  function collisionDetection() {
    for (let r = 0; r < brickRowCount; r++) {
      for (let c = 0; c < brickColumnCount; c++) {
        const b = bricks[r][c];
        if (b.status === 1) {
          // Brick center
          const brickCenterX = b.x + brickSize / 2;
          const brickCenterY = b.y + brickSize / 2;

          // Distance from ball center to brick center
          const distX = ballX - brickCenterX;
          const distY = ballY - brickCenterY;

          // Sum of half-sizes plus ball radius
          const combinedHalfWidth = brickSize / 2 + ballRadius;
          const combinedHalfHeight = brickSize / 2 + ballRadius;

          // Check overlap in both x and y directions
          if (Math.abs(distX) < combinedHalfWidth && Math.abs(distY) < combinedHalfHeight) {
            // We have a collision; determine the smaller overlap
            const overlapX = combinedHalfWidth - Math.abs(distX);
            const overlapY = combinedHalfHeight - Math.abs(distY);

            if (overlapX < overlapY) {
              // Bounce off left or right
              ballDX = -ballDX;
            } else if (overlapY < overlapX) {
              // Bounce off top or bottom
              ballDY = -ballDY;
            } else {
              // Perfect corner collision -> flip both
              ballDX = -ballDX;
              ballDY = -ballDY;
            }

            // Add slight random variation
            ballDX += (Math.random() - 0.5) * 0.1;
            ballDY += (Math.random() - 0.5) * 0.1;

            // Mark brick as hit
            b.status = 0;
            score++;

            // Check win condition
            if (score === totalBricks) {
              gameActive = false;
              showOverlay("YOU WIN, CONGRATS!");
              return;
            }
          }
        }
      }
    }
  }

  // ---------------------------
  // Main Game Loop
  // ---------------------------
  function draw() {
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Redraw background
    ctx.fillStyle = "red";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw game elements
    drawBricks();
    drawBall();
    drawPaddle();
    drawScore();
    drawLives();

    // Check for brick collisions
    collisionDetection();

    // Bounce off left/right walls
    if (ballX + ballDX > canvas.width - ballRadius || ballX + ballDX < ballRadius) {
      ballDX = -ballDX;
    }
    // Bounce off top wall
    if (ballY + ballDY < ballRadius) {
      ballDY = -ballDY;
    }
    // Check paddle collision or life lost
    else if (ballY + ballDY > canvas.height - ballRadius) {
      if (ballX > paddleX && ballX < paddleX + paddleWidth) {
        // Paddle bounce
        ballDY = -ballDY;

        // Calculate the relative impact point
        const hitPoint = ballX - (paddleX + paddleWidth / 2);
        // Convert it to a reasonable multiplier
        ballDX = hitPoint * 0.1;

        // Optional small random variations
        ballDX += (Math.random() - 0.5) * 0.1;
        ballDY += (Math.random() - 0.5) * 0.02;

        // Reset ball position just above the paddle
        ballY = canvas.height - paddleHeight - ballRadius - 1;
      } else {
        // Lose a life
        lives--;
        if (lives <= 0) {
          gameActive = false;
          showOverlay("GAME OVER");
          return;
        } else {
          // Reset position
          ballX = canvas.width / 2;
          ballY = canvas.height - 30;
          ballDX = 2;
          ballDY = -2;
          paddleX = (canvas.width - paddleWidth) / 2;
        }
      }
    }

    // Update ball position
    ballX += ballDX;
    ballY += ballDY;

    // Update paddle position
    if (rightPressed && paddleX < canvas.width - paddleWidth) {
      paddleX += paddleSpeed;
    } else if (leftPressed && paddleX > 0) {
      paddleX -= paddleSpeed;
    }

    // Keep animating if game is active
    if (gameActive) {
      requestAnimationFrame(draw);
    }
  }

  // ---------------------------
  // Start the Game When the Button is Clicked
  // ---------------------------
  document.getElementById("centerButton").addEventListener("click", function () {
    this.style.display = "none";
    gameActive = true;
    draw();
  });

  // ---------------------------
  // Restart the Game When "Play Again" is Clicked
  // ---------------------------
  document.getElementById("playAgainButton").addEventListener("click", function () {
    this.style.display = "none";
    const overlay = document.getElementById("overlay");
    overlay.style.display = "none";
    // Reset global game variables
    score = 0;
    lives = 3;
    // Recreate bricks or reset status if needed
    for (let r = 0; r < brickRowCount; r++) {
      for (let c = 0; c < brickColumnCount; c++) {
        if (heartPattern[r][c] === 1) {
          bricks[r][c].status = 1;
        } else {
          bricks[r][c].status = 0;
        }
      }
    }
    // Reset ball and paddle
    ballX = canvas.width / 2;
    ballY = canvas.height - 30;
    ballDX = 2;
    ballDY = -2;
    paddleX = (canvas.width - paddleWidth) / 2;

    // Reactivate the game
    gameActive = true;
    draw();
  });
