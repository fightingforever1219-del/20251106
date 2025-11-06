let quizTable;
let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let quizState = 'start'; // 'start', 'quiz', 'result'

let optionButtons = [];
let startButton;
let restartButton;

let particles = [];
let feedback = { text: '', color: [0, 0, 0], timer: 0 };

// 動畫相關變數
let stars = [];
let raindrops = [];

function preload() {
  quizTable = loadTable('quiz.csv', 'csv', 'header');
}

function setup() {
  createCanvas(800, 600);
  noCursor(); // 隱藏預設游標

  // 解析CSV題庫
  for (let row of quizTable.getRows()) {
    questions.push({
      question: row.getString('question'),
      options: [
        row.getString('optionA'),
        row.getString('optionB'),
        row.getString('optionC'),
        row.getString('optionD')
      ],
      answer: row.getString('answer')
    });
  }
  
  if (questions.length === 0) {
    console.error("Error: No questions loaded from quiz.csv. Please check the file and its content.");
    quizState = 'error'; // Set a new state to handle this error
  }

  // 建立開始按鈕
  startButton = createButton('開始測驗');
  startButton.position(width / 2 - 70, height / 2);
  startButton.mousePressed(startQuiz);

  // 建立重新開始按鈕 (初始隱藏)
  restartButton = createButton('重新開始');
  restartButton.position(width / 2 - 70, height / 2 + 100);
  restartButton.hide();
  restartButton.mousePressed(restartQuiz);

  // 建立選項按鈕
  for (let i = 0; i < 4; i++) {
    let btn = createButton('');
    btn.position(width / 2 - 200, 250 + i * 60);
    btn.size(400, 50);
    btn.hide();
    btn.mousePressed(() => checkAnswer(btn.value()));
    optionButtons.push(btn);
  }
}

function draw() {
  background(240, 245, 255);

  // 繪製所有狀態共通的特效
  drawParticles();
  drawCursor();

  switch (quizState) {
    case 'start':
      drawStartScreen();
      break;
    case 'quiz':
      drawQuizScreen();
      break;
    case 'result':
      drawResultScreen();
      break;
    case 'error':
      drawErrorScreen();
      break;
  }
}

function startQuiz() {
  quizState = 'quiz';
  startButton.hide();
  displayQuestion();
}

function restartQuiz() {
  quizState = 'start';
  currentQuestionIndex = 0;
  score = 0;
  stars = [];
  raindrops = [];
  restartButton.hide();
  startButton.show();
}

function drawStartScreen() {
  textAlign(CENTER, CENTER);
  textSize(32);
  fill(50, 50, 150);
  text('p5.js 互動測驗系統', width / 2, height / 2 - 50);
}

function drawErrorScreen() {
  restartButton.show();
  textAlign(CENTER, CENTER);
  textSize(24);
  fill(200, 0, 0);
  text('載入題目失敗，請檢查 quiz.csv 檔案。', width / 2, height / 2 - 50);
}

function drawQuizScreen() {
  // 顯示問題
  let q = questions[currentQuestionIndex];
  textAlign(CENTER, CENTER);
  textSize(24);
  fill(0);
  text(q.question, width / 2, 150);

  // 顯示作答回饋
  if (feedback.timer > 0) {
    fill(feedback.color);
    textSize(36);
    text(feedback.text, width / 2, height - 50);
    feedback.timer--;
  }
}

function drawResultScreen() {
  restartButton.show();
  let percentage = (score / questions.length) * 100;
  
  textAlign(CENTER, CENTER);
  textSize(48);
  fill(0);
  text(`你的分數: ${percentage.toFixed(1)}`, width / 2, height / 2 - 50);

  if (percentage >= 80) {
    praiseAnimation();
  } else {
    encouragementAnimation();
  }
}

function displayQuestion() {
  if (currentQuestionIndex >= questions.length) {
    quizState = 'result';
    optionButtons.forEach(btn => btn.hide());
    return;
  }
  let q = questions[currentQuestionIndex];
  if (!q || !q.options) {
    console.error("Question or options are undefined for index:", currentQuestionIndex, q);
    quizState = 'error';
    return;
  }
  for (let i = 0; i < 4; i++) {
    optionButtons[i].html(q.options[i]);
    optionButtons[i].value(q.options[i].substring(0, 1)); // 'A', 'B', 'C', 'D'
    optionButtons[i].show();
  }
}

function checkAnswer(selectedOption) {
  createExplosion(mouseX, mouseY);
  let correct = questions[currentQuestionIndex].answer;
  if (selectedOption === correct) {
    score++;
    showFeedback('答對了！', color(0, 150, 0));
  } else {
    showFeedback('答錯了...', color(200, 0, 0));
  }

  setTimeout(() => {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
      displayQuestion();
    } else {
      quizState = 'result';
      optionButtons.forEach(btn => btn.hide());
    }
  }, 1000); // 延遲一秒後跳至下一題
}

function showFeedback(message, col) {
  feedback.text = message;
  feedback.color = col;
  feedback.timer = 60; // 顯示1秒 (60幀)
}

// --- 特效與動畫 ---

function drawCursor() {
  fill(255, 150, 0, 150);
  noStroke();
  ellipse(mouseX, mouseY, 20, 20);
  particles.push(new Particle(mouseX, mouseY, color(255, 200, 0, 100)));
}

function drawParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    particles[i].show();
    if (particles[i].isFinished()) {
      particles.splice(i, 1);
    }
  }
}

function createExplosion(x, y) {
  for (let i = 0; i < 30; i++) {
    particles.push(new Particle(x, y, color(random(200, 255), random(100, 255), 0), true));
  }
}

class Particle {
  constructor(x, y, col, isExplosion = false) {
    this.x = x;
    this.y = y;
    this.col = col;
    this.lifespan = isExplosion ? 100 : 50;
    if (isExplosion) {
      this.vel = p5.Vector.random2D().mult(random(1, 5));
    } else {
      this.vel = createVector(0, 0);
    }
  }

  update() {
    this.x += this.vel.x;
    this.y += this.vel.y;
    this.lifespan -= 2;
  }

  show() {
    noStroke();
    fill(red(this.col), green(this.col), blue(this.col), this.lifespan);
    ellipse(this.x, this.y, 10, 10);
  }

  isFinished() {
    return this.lifespan < 0;
  }
}

function praiseAnimation() {
  if (stars.length < 100) {
    stars.push(new Star());
  }
  for (let star of stars) {
    star.update();
    star.show();
  }
}

class Star {
  constructor() {
    this.x = random(width);
    this.y = random(height);
    this.size = random(2, 8);
    this.alpha = random(100, 255);
  }
  update() {
    this.alpha -= 2;
    if (this.alpha < 0) {
      this.x = random(width);
      this.y = random(height);
      this.alpha = 255;
    }
  }
  show() {
    noStroke();
    fill(255, 255, 0, this.alpha);
    ellipse(this.x, this.y, this.size, this.size);
  }
}

function encouragementAnimation() {
  if (raindrops.length < 200) {
    raindrops.push(new Raindrop());
  }
  for (let drop of raindrops) {
    drop.update();
    drop.show();
  }
  textAlign(CENTER, CENTER);
  textSize(24);
  fill(100);
  text("別灰心，繼續努力！", width / 2, height / 2 + 20);
}

class Raindrop {
  constructor() {
    this.x = random(width);
    this.y = random(-height, 0);
    this.len = random(10, 20);
    this.speed = random(4, 10);
  }
  update() {
    this.y += this.speed;
    if (this.y > height) {
      this.y = random(-200, -100);
    }
  }
  show() {
    stroke(138, 180, 255);
    strokeWeight(2);
    line(this.x, this.y, this.x, this.y + this.len);
  }
}
