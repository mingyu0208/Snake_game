const canvas = document.getElementById('gameCanvas');
const context = canvas.getContext('2d');
const gameOverScreen = document.getElementById('game-over');
const restartBtn = document.getElementById('restart-btn');

const GRID_SIZE = 20;
const SNAKE_SIZE = GRID_SIZE;
const FOOD_SIZE = GRID_SIZE;

let snake, food, dx, dy, blinkCounter;
let gamePaused = false;
let score = 0;
let highScore = localStorage.getItem('highScore') || 0;

let currentScoreElem = document.getElementById('current-score');
let highScoreElem = document.getElementById('high-score');

function initializeGame() {
    snake = [
        { x: Math.floor(canvas.width / 2 / GRID_SIZE) * GRID_SIZE, y: Math.floor(canvas.height / 2 / GRID_SIZE) * GRID_SIZE },
        { x: Math.floor(canvas.width / 2 / GRID_SIZE) * GRID_SIZE, y: (Math.floor(canvas.height / 2 / GRID_SIZE) + 1) * GRID_SIZE },
    ];
    // 초기 음식 위치와 방향 설정
    food = {
        ...generateFoodPosition(),
        dx: (Math.random() < 0.5 ? 1 : -1) * GRID_SIZE,
        dy: (Math.random() < 0.5 ? 1 : -1) * GRID_SIZE,
    };
}
// 초기 뱀의 방향 설정
dx = 0;
dy = -GRID_SIZE;
blinkCounter = 0;
score = 0;
currentScoreElem.textContent = score;
highScoreElem.textContent = highScore;

initializeGame();

// 뱀의 움직임을 위한 키보드 입력 처리
document.addEventListener('keydown', function (event) {
    switch (event.key) {
        case 'ArrowUp':
            if (dy === 0) {
                dx = 0;
                dy = -GRID_SIZE;
            }
            break;
        case 'ArrowDown':
            if (dy === 0) {
                dx = 0;
                dy = GRID_SIZE;
            }
            break;
        case 'ArrowLeft':
            if (dx === 0) {
                dx = -GRID_SIZE;
                dy = 0;
            }
            break;
        case 'ArrowRight':
            if (dx === 0) {
                dx = GRID_SIZE;
                dy = 0;
            }
            break;
    }
});

// 뱀의 움직임을 위한 모바일 조작 입력 처리
document.getElementById('up-btn').addEventListener('click', function () {
    if (dy === 0) {
        dx = 0;
        dy = -GRID_SIZE;
    }
});
document.getElementById('down-btn').addEventListener('click', function () {
    if (dy === 0) {
        dx = 0;
        dy = GRID_SIZE;
    }
});
document.getElementById('left-btn').addEventListener('click', function () {
    if (dx === 0) {
        dx = -GRID_SIZE;
        dy = 0;
    }
});
document.getElementById('right-btn').addEventListener('click', function () {
    if (dx === 0) {
        dx = GRID_SIZE;
        dy = 0;
    }
});

// 뱀과 충돌하지 않는 음식 위치 생성
function generateFoodPosition() {
    while (true) {
        let newFoodPosition = {
            x: Math.floor(Math.random() * canvas.width / GRID_SIZE) * GRID_SIZE,
            y: Math.floor(Math.random() * canvas.height / GRID_SIZE) * GRID_SIZE,
        };

        let collisionWithSnake = false;
        for (let segment of snake) {
            if (segment.x === newFoodPosition.x && segment.y === newFoodPosition.y) {
                collisionWithSnake = true;
                break;
            }
        }

        // 충돌이 없을 경우 위치 반환
        if (!collisionWithSnake) {
            return newFoodPosition;
        }
    }
}

// 벽이나 자기 자신과의 충돌 검사
function checkCollision() {
    if (snake[0].x < 0 || snake[0].x >= canvas.width || snake[0].y < 0 || snake[0].y >= canvas.height){
        return true;
    }
    for (let i = 1; i < snake.length; i++) {
        if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) {
            return true;
        }
    }
    return false;
}

// 주요 게임 업데이트 함수
function update() {
    if (gamePaused) return;

    // 새로운 뱀의 머리 위치 계산
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    snake.unshift(head);

    // 충돌 검사
    if (checkCollision()) {
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('highScore', highScore);
            highScoreElem.textContent = highScore;
        }
        gameOver();
        return;
    }
    // 뱀이 음식을 먹었는지 확인
    if (head.x === food.x && head.y === food.y) {
        score++;
        currentScoreElem.textContent = score;
        food = {
            ...generateFoodPosition(),
            dx: (Math.random() < 0.5 ? 1 : -1) * GRID_SIZE,
            dy: (Math.random() < 0.5 ? 1 : -1) * GRID_SIZE,
        };

        // 승리 조건 확인 (뱀이 화면을 다 채운 경우)
        if (snake.length === (canvas.width / GRID_SIZE) * (canvas.height / GRID_SIZE)) {
            gameWin();
            return;
        }
    } else {
        snake.pop();
    }

    // 음식 위치 업데이트
    if (blinkCounter % 4 === 0) {
        food.x += food.dx;
        food.y += food.dy;

        // 음식이 벽에 충돌하는 경우 처리
        if (food.x < 0) {
            food.dx = -food.dx;
            food.x = 0;
        }
        if (food.x >= canvas.width) {
            food.dx = -food.dx;
            food.x = canvas.width - GRID_SIZE;
        }
        if (food.y < 0) {
            food.dy = -food.dy;
            food.y = 0;
        }
        if (food.y >= canvas.height) {
            food.dy = -food.dy;
            food.y = canvas.height - GRID_SIZE;
        }
    }
    blinkCounter++;

    draw();
}

// 그리드 그리기
function drawGrid() {
    context.strokeStyle = "#AAA";
    for (let i = 0; i < canvas.width; i += GRID_SIZE) {
        context.beginPath();
        context.moveTo(i, 0);
        context.lineTo(i, canvas.height);
        context.stroke();
    }
    for (let j = 0; j < canvas.height; j += GRID_SIZE) {
        context.beginPath();
        context.moveTo(0, j);
        context.lineTo(canvas.width, j);
        context.stroke();
    }
}
// 게임 객체 그리기 (뱀과 음식)
function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid();
    for (const segment of snake) {
        context.fillStyle = 'green';
        context.fillRect(segment.x, segment.y, SNAKE_SIZE, SNAKE_SIZE);
    }
    context.fillStyle = 'red';
    context.fillRect(food.x, food.y, FOOD_SIZE, FOOD_SIZE);
}

// 게임 종료 처리
function gameOver() {
    gamePaused = true;
    gameOverScreen.style.display = 'flex';
}

// 게임 승리 처리
function gameWin() {
    gamePaused = true;
    gameOverScreen.innerHTML = 'You Win! <button id="restart-btn">Restart Game</button>';
    gameOverScreen.style.display = 'flex';
}

// 게임 재시작
restartBtn.addEventListener('click', function () {
    gamePaused = false;
    gameOverScreen.style.display = 'none';
    initializeGame();
});

// 게임 루프 설정
setInterval(update, 100);

// 윈도우 포커스 잃을 때 게임 일시정지
window.addEventListener('blur', function () {
    gamePaused = true;
});

// 윈도우 포커스 얻을 때 게임 재개
window.addEventListener('focus', function () {
    if (!gameOverScreen.style.display === 'flex') {
        gamePaused = false;
        update();
    }
});
