// ===============================
// AUTO AGE DIFFICULTY SYSTEM
// ===============================

let playerProfile = {
    skillScore: 0,
    levelsPlayed: 0,
    avgTime: 0,
    mistakes: 0,
    retries: 0,
    intersections: 0,
    category: "auto"
};

// ===============================
// UPDATE AFTER LEVEL
// ===============================
function updatePlayerProfile(stats) {

    playerProfile.levelsPlayed++;

    playerProfile.avgTime =
        (playerProfile.avgTime + stats.time) / 2;

    playerProfile.mistakes += stats.mistakes;
    playerProfile.retries += stats.retries;
    playerProfile.intersections += stats.intersections;

    calculateSkillScore();
}

// ===============================
function calculateSkillScore() {

    let score = 100;

    score -= playerProfile.avgTime * 0.5;
    score -= playerProfile.mistakes * 2;
    score -= playerProfile.retries * 3;
    score -= playerProfile.intersections * 4;

    if (score < 0) score = 0;
    if (score > 100) score = 100;

    playerProfile.skillScore = score;

    assignCategory();
}

// ===============================
function assignCategory() {

    let s = playerProfile.skillScore;

    if (s < 20) {
        playerProfile.category = "kids_no_numbers";
    }
    else if (s < 40) {
        playerProfile.category = "kids";
    }
    else if (s < 60) {
        playerProfile.category = "teens";
    }
    else if (s < 80) {
        playerProfile.category = "adults";
    }
    else {
        playerProfile.category = "expert";
    }

    applyCategorySettings();
}

// ===============================
function applyCategorySettings() {

    switch(playerProfile.category) {

        case "kids_no_numbers":
            gameSettings.useNumbers = false;
            gameSettings.nodeCount = randomRange(4,6);
            gameSettings.lineWidth = 6;
            gameSettings.nodeSize = 28;
            gameSettings.allowFixedNodes = false;
            gameSettings.softColors = false;
            break;

        case "kids":
            gameSettings.useNumbers = true;
            gameSettings.nodeCount = randomRange(5,7);
            gameSettings.lineWidth = 5;
            gameSettings.nodeSize = 24;
            gameSettings.allowFixedNodes = false;
            gameSettings.softColors = false;
            break;

        case "teens":
            gameSettings.useNumbers = true;
            gameSettings.nodeCount = randomRange(6,9);
            gameSettings.lineWidth = 4;
            gameSettings.nodeSize = 22;
            gameSettings.allowFixedNodes = true;
            gameSettings.softColors = true;
            break;

        case "adults":
            gameSettings.useNumbers = true;
            gameSettings.nodeCount = randomRange(8,11);
            gameSettings.lineWidth = 3;
            gameSettings.nodeSize = 20;
            gameSettings.allowFixedNodes = true;
            gameSettings.softColors = true;
            break;

        case "expert":
            gameSettings.useNumbers = true;
            gameSettings.nodeCount = randomRange(10,12);
            gameSettings.lineWidth = 2;
            gameSettings.nodeSize = 18;
            gameSettings.allowFixedNodes = true;
            gameSettings.softColors = true;
            break;
    }

    generateNewBackground();
}

// ===============================
function randomRange(min,max) {
    return Math.floor(Math.random()*(max-min+1))+min;
}