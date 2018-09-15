const gameDefaultProperties = {
    levelDeckSize: {
        easy: 6,
        regular: 10,
        hard: 15
    },

    cardAmountModifier: {
        regular: 2,
        hard: 3,
        veryHard: 4
    },

    standardPlayers: 1
};

const gameIds = {
    gameInfoIds: {
        container: "gamestatuscontainer",
        remainingCards: "remainingCardsInfo", 
        mistakes: "mistakesInfo"
    },

    gameProperties: {
        id: "gamePropertiesContainer",
        form: "gamePropertiesForm",
    },

    cardContainersIds:{
        cardDeck: "cardDeck",
        cardTable: "cardTable",
    }
};

const gameClasses = {
    game: {
        propertiesHidden: "gameProperties--hidden",
        statusHidden: "gameStatus--hidden",
        deck: "deck",
    },

    player: {
        playerCard: "playerCard",
        playerActive: "playerCard--active",
        crown: "crown",
        crownHidden: "crown--hidden"
    },

    card: {
        card: "card",
        cardTitle: "card__title",
        cardTitlePrefix: "card__title--",
        flippedCard: "flippedCard"
    },

    cardFace: {
        disabledCard: "card__face--disabled",
        cardFace: "card__face",
        front: "card__face--front",
        frontStandardImg: "card__face--backgroundStandard",
        backgroundPrefix: "card__face--background",
        backStandardBg: "card__face--backgroundGray",
        back: "card__face--back"
    },
};

const gameStrings = {
    player: "Player ",
    mistakes: "Mistakes: ",
    successes: "Successes: "
};

const gamePaths = {
    crown: "images/assets/crown.svg"
}

var gameData = getDefaultGameData();

function getDefaultGameData(){
    return {
        cards: [],
        cardAmount: 2,
        currentCard: 0,
        mistakes: 0,
        cardsFlipped: 0,
        remainingCards: -1,
        currentPlayer: 0,
        players: []
    };
}

function handleNextPlayer(){

    gameData.currentPlayer === gameData.players.length - 1 ? gameData.currentPlayer = 0 : gameData.currentPlayer++;
}

function initializeGame(){
    resetGameData();

    let form = document.getElementById(gameIds.gameProperties.form);
    let gameParameters = parseGamePropertiesForm(form);
    
    hideGameProperties();
    showGameStatus();
    
    initializePlayers(gameParameters.players);
    initializeDeck(gameParameters);

}

function initializeDeck(gameParameters){
    changeCardAmount(gameParameters.cardAmount);
    createGameDeck(gameParameters);
    flipAllAvailableCards();
    setTimeout(flipAllAvailableCards, 750);
}

function changeCardAmount(cardAmount){

    gameData.cardAmount = cardAmount;
}

function appendPlayersInfo(players){
    let gameStatusContainer = document.getElementById(gameIds.gameInfoIds.container);
    for (let i=0; i <players.length; i++){
        let playerCard = players[i].cardStructure.card;
        gameStatusContainer.appendChild(playerCard);
    }
}

function initializePlayers(playersAmount){
    createPlayersArray(playersAmount);
    setTimeout(addCurrentPlayerStyle(getCurrentPlayer()), 900);    
    appendPlayersInfo(getPlayers());
}

function createPlayersArray(playersAmount){
    for (let i=0; i < playersAmount; i++){
        let player = createPlayer(i+1);
        gameData.players.push(player);
    }
}

function createPlayer(i){
    return {
        identifier: i,
        mistakes: 0,
        success: 0,
        cardStructure: createPlayerDOMCard(i)    
    };
}

function hideGameProperties(){
    let gameInitializer = document.getElementById(gameIds.gameProperties.id);
    gameInitializer.classList.add(gameClasses.game.propertiesHidden);
}

function showGamePropertiesForm(){
    let gameInitializer = document.getElementById(gameIds.gameProperties.id);
    gameInitializer.classList.remove(gameClasses.game.propertiesHidden);
}

function hideGameStatus(){
    let gameInitializer = document.getElementById(gameIds.gameInfoIds.container);
    gameInitializer.classList.add(gameClasses.game.statusHidden);
}

function showGameStatus(){
    let gameInitializer = document.getElementById(gameIds.gameInfoIds.container);
    gameInitializer.classList.remove(gameClasses.game.statusHidden);
}

function getLevelFromString(level){

    return !level || typeof level !== "string" ? gameDefaultProperties.levelDeckSize.regular : parseInt(level);
}

function getPlayersFromString(player){

    return !player || typeof player !== "string" ? gameDefaultProperties.standardPlayers : parseInt(player);
}

function getDeckFromName(deckName){

    return decks[deckName] || decks["landscaping"];
}

function getCardAmountFromString(cardAmountText){
    return cardAmountText != '' ? gameDefaultProperties.cardAmountModifier[cardAmountText] : gameDefaultProperties.cardAmountModifier.regular;
}

function parseGamePropertiesForm(form){
    const gameParameters = {
        level : getLevelFromString(form.elements.level.value),
        deck : getDeckFromName(form.elements.deck.value),
        players : getPlayersFromString(form.elements.players.value),
        cardAmount: getCardAmountFromString(form.elements.cardAmount.value)
    };
    
    return gameParameters;
}

function nextGameState(card){
    gameData.cards[gameData.currentCard] = card;
    let currentPlayer = getCurrentPlayer();
    increaseCurrentCard();

    if (areMaxCardsFlipped()){
        let isThePlayCorrect = areCurrentCardsTheSame();
        isThePlayCorrect ? handleCorrectCards(currentPlayer): handleWrongCards(currentPlayer);
        if (!isThePlayCorrect) { 
            setTimeout(removeCurrentPlayerStyle(currentPlayer), 1000);
            handleNextPlayer();
            setTimeout(addCurrentPlayerStyle(getCurrentPlayer()), 1000);
        }
    }
    
}

function getPlayerCard(player){
    return player.cardStructure.card;
}

function removeCurrentPlayerStyle(currentPlayer){
    return function (){
        let playerCard = getPlayerCard(currentPlayer);
        playerCard.classList.remove(gameClasses.player.playerActive)
    }
}

function addCurrentPlayerStyle(currentPlayer){
    return function (){
        let playerCard = getPlayerCard(currentPlayer);
        playerCard.classList.add(gameClasses.player.playerActive)
    }
}

function getCurrentPlayer(){

    return gameData.players[gameData.currentPlayer];
}

function areMaxCardsFlipped(){

    return gameData.currentCard === 0;
}

function increaseCurrentCard(){
    let cardAmount = gameData.cardAmount,
        currentCard = gameData.currentCard;

    gameData.currentCard = (currentCard === cardAmount - 1) ? 0 : currentCard + 1;
}

function handleCorrectCards(currentPlayer){
    increasePlayerScore(currentPlayer);
    updatePlayerSuccesses(currentPlayer);
    decreaseRemainingCards();
    updateCorrectCardsChosen();
    handleGameOver(isGameOver());
}

function handleWrongCards(currentPlayer){
    increasePlayerMistakes(currentPlayer);
    updatePlayerMistakes(currentPlayer);
    increaseGameMistakes();
    updateWrongCardsChosen();
}

function increasePlayerMistakes (player){
    player.mistakes++;
}

function increasePlayerScore (player){
    player.success++;
}

function updatePlayerMistakes(player){
    let DOMMistakes = getMistakesElement(player);
    let mistakes = getPlayerMistakes(player);
    let defaultText = gameStrings.mistakes;
    DOMMistakes.textContent = defaultText + mistakes;
}

function updatePlayerSuccesses(player){
    let DOMSuccesses = getSuccessesElement(player);
    let successes = getPlayerSuccesses(player);
    let defaultText = gameStrings.successes;
    DOMSuccesses.textContent = defaultText + successes;

}

function getMistakesElement(player){
    return player.cardStructure.mistakes;
}
function getSuccessesElement(player){
    return player.cardStructure.successes;
}

function getPlayerMistakes(player){
    return player.mistakes;
}

function getPlayerSuccesses(player){
    return player.success;
}


function handleGameOver(isGameOver){
    if (!isGameOver){return;}
    // showGameOver
    let players = getPlayers();
    let winner = getWinner(players);
    updateWinnerStyle(winner);
    setTimeout(resetGameSpace, 3400);
    resetGameData();

}

function getPlayers(){

    return gameData.players;
}

function getWinner(players){
    return players[0];
}

function getWinnerToken(winner){
    return winner.cardStructure.winnerToken;
}

function updateWinnerStyle(winner){
    let winnerToken = getWinnerToken(winner);
    winnerToken.classList.remove(gameClasses.player.crownHidden);
}

function resetGameSpace(){
    removeDeck();
    removePlayerCards();
    showGamePropertiesForm();
    hideGameStatus();
}

function removePlayerCards(){
    let container = document.getElementById(gameIds.gameInfoIds.container);
    let children = container.children;
    let childrenCount = children.length
    for (let i=0; i < childrenCount; i++){
        container.removeChild(children[0]);
    }
}

function resetGameData(){

    gameData = getDefaultGameData();
}

function resetTextById(DOMId){
    let element = document.getElementById(DOMId);
    element.textContent = "";
}

function isGameOver(){

    return gameData.remainingCards === 0;
}

function decreaseRemainingCards(){

    gameData.remainingCards = gameData.remainingCards- gameData.cardAmount;
}

function increaseGameMistakes(){

    gameData.mistakes++;
}

function updateDOMInfo(){
    let DOMmistakes = document.getElementById(gameIds.gameInfoIds.mistakes);
    DOMmistakes.textContent = gameData.mistakes;
}

function getCardIdentifier(card){

    return card.dataset.cardidentifier;
}

function areCurrentCardsTheSame (){
    let differenceInCards = 0;
    const cards = gameData.cards;
    for (let i=1; i <= gameData.cardAmount - 1; i++){
        if (getCardIdentifier(cards[i-1]) !== getCardIdentifier(cards[i])){
            differenceInCards++;
        }
    }

    return differenceInCards === 0;
}

function getCardBackFace(card){

    return card.lastChild;
}

function updateCorrectCardsChosen(){
    let cardBackFaces = [],
        cards = gameData.cards;
    for (let i=0; i < gameData.cardAmount; i++){
        let backFace = getCardBackFace(cards[i]);
        cardBackFaces.push(backFace);
    }

    setTimeout(updateBackFaceStyle(cardBackFaces), 1000);
    disableCurrentCards();
    removeCurrentCardsInfo();
}

function disableCurrentCards(){
    let cards = gameData.cards;
    for (let i=0; i < gameData.cardAmount; i++){
        cards[i].removeEventListener("click", startRound);
    }
}

function updateBackFaceStyle(cardBackFaces){
    return function (){
        for (let i=0; i < cardBackFaces.length; i++){
            cardBackFaces[i].classList.add(gameClasses.cardFace.disabledCard);
        }
    }
}

function updateWrongCardsChosen(){
    setTimeout(unflipCurrentCards(gameData.cards), 1000);
    removeCurrentCardsInfo();
}

function unflipCurrentCards(cards){
    return function(){
        for (let i=0; i < cards.length; i++){
            cards[i].classList.toggle(gameClasses.card.flippedCard);
        }
    }
}

function removeCurrentCardsInfo(){

    gameData.cards = [];
}

function startRound(){
    let isCardAlreadyFliped = !this.classList.contains(gameClasses.card.flippedCard);
    if (isCardAlreadyFliped) {
        this.classList.toggle(gameClasses.card.flippedCard);
        gameData.cardsFlipped++;
        nextGameState(this);
    }
}

function createPlayerDOMCard(playerNumber){
    let cardStructure = {};
    let playerCard = document.createElement("DIV");
    playerCard.classList.add(gameClasses.player.playerCard);

    let cardTitle = document.createElement("h2");
    if (gameData.players)
    cardTitle.textContent = gameStrings.player + playerNumber;
    playerCard.appendChild(cardTitle);

    let mistakes = document.createElement("p");
    mistakes.textContent = gameStrings.mistakes + "0";
    cardStructure.mistakes = mistakes;
    playerCard.appendChild(mistakes);

    let successes = document.createElement("p");
    successes.textContent = gameStrings.successes + "0";
    cardStructure.successes = successes;
    playerCard.appendChild(successes);

    let winnerCrown = document.createElement("img");
    winnerCrown.src = gamePaths.crown;
    winnerCrown.classList.add(gameClasses.player.crown, gameClasses.player.crownHidden);
    cardStructure.winnerToken = winnerCrown;
    playerCard.appendChild(winnerCrown);

    cardStructure.card = playerCard;
    return cardStructure;
}

function createCard(cardProperties){
    //@TODO IMPROVE
    let card = document.createElement("DIV");
    card.classList.add(gameClasses.card.card);    
    card.setAttribute("data-cardidentifier",cardProperties.cardIdentifier);
    card.addEventListener('click', startRound);  
    
    let cardFront = createFrontFace();
    card.appendChild(cardFront);
    
    let cardBack = createBackFace(cardProperties);
    card.appendChild(cardBack);
    
    return card;
}

function createFrontFace(){
    let frontFace = document.createElement("DIV");
    frontFace.classList.add(gameClasses.cardFace.cardFace);
    frontFace.classList.add(gameClasses.cardFace.front);
    frontFace.classList.add(gameClasses.cardFace.frontStandardImg);
    frontFace.classList.add(gameClasses.cardFace.backStandardBg);
    return frontFace;
}

function createBackFace(cardProperties){
    //@TODO IMPROVE
    let backFace = document.createElement("DIV");

    backFace.classList.add(gameClasses.cardFace.cardFace);
    backFace.classList.add(gameClasses.cardFace.back);
    let backgroundColor = gameClasses.cardFace.backgroundPrefix + cardProperties.backgroundColor;
    backFace.classList.add(backgroundColor)
    backFace.appendChild(createBackFaceImage(cardProperties));

    let cardTitle = document.createElement("P");
    let titleColor = gameClasses.card.cardTitlePrefix + cardProperties.backgroundColor;
    cardTitle.classList.add(gameClasses.card.cardTitle);
    cardTitle.classList.add(titleColor);
    cardTitle.textContent = cardProperties.cardTitle;

    backFace.appendChild(cardTitle);
    return backFace;
}

function createBackFaceImage(cardProperties){
    let backFaceImage = document.createElement("IMG");
    backFaceImage.src=cardProperties.image;
    return backFaceImage;
}

function getDOMDeck(){
    const DOMdeck = document.getElementById(gameIds.cardContainersIds.cardDeck);

    if (DOMdeck != undefined){
        removeDeck();
    }

    return createDOMDeck()
}

function createDOMDeck(){
    let DOMTable = document.getElementById(gameIds.cardContainersIds.cardTable);
    let DOMdeck = document.createElement("DIV");
    DOMdeck.classList.add(gameClasses.game.deck);
    DOMdeck.id = gameIds.cardContainersIds.cardDeck;    
    DOMTable.appendChild(DOMdeck);
    return DOMdeck;
}

function createGameDeck(gameProperties){
    const gameDeckSize = gameProperties.level;
    const deckSize = gameProperties.deck.deckSize;
    const deck = gameProperties.deck;
    let DOMdeck = getDOMDeck();
    let randomCardStyleIndexes = createUnorderedIndicesArray(deckSize);
    let gameDeck = [];
    let k = 0;

    for (let i = 0; i < gameDeckSize; i++){
        for (let j = 0; j < gameProperties.cardAmount; j++){
            let cardStyle = deck.cards[randomCardStyleIndexes[k]];
            let card = createCard(cardStyle);
            gameDeck.push(card);
        }
        k++;
    }
    gameData.remainingCards = gameDeck.length;

    gameDeck = shuffleArray(gameDeck);

    appendGameDeckToDom(gameDeck, DOMdeck);
}

function _createDebugDeck(deckName){
    let deck = getDeckFromName(deckName);
    let gameDeck = [];
    let DOMdeck = getDOMDeck();

    for (let i=0; i < deck.deckSize; i++){
        let cardStyle = deck.cards[i];
        let card = createCard(cardStyle);
        gameDeck.push(card);
    }

    appendGameDeckToDom(gameDeck, DOMdeck);
}


function appendGameDeckToDom(gameDeck, gameSpace){
    for (let i=0; i <gameDeck.length; i++){
        gameSpace.appendChild(gameDeck[i]);
    }
}

function createUnorderedIndicesArray(size){
    let orderedArray = generateOrderedIntArray(size);
    return shuffleArray(orderedArray);
}


function removeDeck(){
    let DOMdeck = document.getElementById(gameIds.cardContainersIds.cardDeck);
    DOMdeck.remove();    
}

function generateOrderedIntArray(size){
    let positionsArray = new Array(size);
    for (let i = 0; i < size; i++){
        positionsArray[i] = i;
    }
    return positionsArray;
}

function shuffleArray(array){
    let currentIndex = array.length, temporaryValue, randomIndex;

    while (0 !== currentIndex) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
    return array;
}

function isCardDisabled(card){
    if (card == undefined){
        return undefined;
    } else {
        let backFace = getCardBackFace(card);
        return backFace.classList.contains(gameClasses.cardFace.disabledCard);
    }
}

function isCardPlayerFlipped(card){
    if (card == undefined){
        return undefined;
    } else {
        let isCardFlipped = card.classList.contains(gameClasses.card.flippedCard),
            isInCurrentCardsList = isCardInGameData(card);
        return (isCardFlipped && isInCurrentCardsList);
    }
}

function isCardInGameData(card){
    let isCardInList = false,
        cards = gameData.cards,
        i=0;
    while (i < gameData.cardAmount && !isCardInList){
        cards[i] === card ? isCardInList = true : i++;
    }

    return isCardInList;
}

function flipAllAvailableCards(){
    let cards = document.getElementsByClassName(gameClasses.card.card);
    for (let i = 0; i < cards.length; i++) {
        if (!isCardDisabled(cards[i]) && !isCardPlayerFlipped(cards[i])){
          cards[i].classList.toggle(gameClasses.card.flippedCard);    
        }
    }
}