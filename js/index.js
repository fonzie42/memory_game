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

class Game {
    constructor(){
        this.cardAmount = 2;
        this.players = [];
        this.cards = [];
        this.currentCard = 0;
        this.mistakes = 0;
        this.cardsFlipped = 0;
        this.remainingCards = -1;
        this.currentPlayer = 0;
    }


    getCurrentPlayer(){
        return this.players[this.currentPlayer];
    }

    getPlayers(){
        return this.players;
    }

    getCards(){
        return this.cards;
    }

    getCardAmount(){
        return this.cardAmount;
    }

    getWinner(){
        let players = this.getPlayers(),
            winner = players[0];
        for (let i = 1; i < players.length; i++){
            if (players[i].getPlayerSuccesses() > winner.success){
                winner = players[i];
            }
        }
        return winner;
    }

    setRemainingCards(remainingCards){
        this.remainingCards = remainingCards;
    }

    setCardAmount(cardAmount){
        this.cardAmount = cardAmount || 2;
    }

    addPlayer(player){
        this.players.push(player);
    }

    addCard(card){
        this.cards[this.currentCard] = card;
        this.increaseCurrentCard();
    }

    handleNextPlayer(){
        this.currentPlayer === this.players.length - 1 ? this.currentPlayer = 0 : this.currentPlayer++;
    }

    areAllCardsAllowedFlipped(){
        return this.currentCard === 0;
    }

    areCurrentCardsTheSame(){
        let differenceInCards = 0;
        const cards = this.getCards();
        for (let i=1; i <= this.getCardAmount() - 1; i++){
            if (getCardIdentifier(cards[i-1]) !== getCardIdentifier(cards[i])){
                differenceInCards++;
            }
        }

        return differenceInCards === 0;
    }

    isGameOver(){
        return this.remainingCards === 0;
    }

    increaseCurrentCard(){
        let cardAmount = this.cardAmount,
            currentCard = this.currentCard;

        this.currentCard = (currentCard === cardAmount - 1) ? 0 : currentCard + 1;
    }

    increaseGameMistakes(){
        this.mistakes++;
    }

    increaseCardsFlipped(){
        this.cardsFlipped++;
    }

    decreaseRemainingCards(){
        this.remainingCards = this.remainingCards - this.cardAmount;
    }

    removeCurrentCardsInfo(){
        this.cards = [];
    }

    createPlayersArray(playersAmount){
        for (let i=0; i < playersAmount; i++){
            let player = new Player(i+1);
            this.addPlayer(player);
        }
    }

    handleCorrectCards(){
        let currentPlayer = this.getCurrentPlayer();
        currentPlayer.increasePlayerScore();
        this.decreaseRemainingCards();
        updateCorrectCardsChosen();
        this.handleGameOver(this.isGameOver());
    }

    updateWrongCardsChosen(){
        setTimeout(unflipCurrentCards(this.getCards()), 1000);
        this.removeCurrentCardsInfo();
    }

    handleWrongCards(){
        let currentPlayer = this.getCurrentPlayer();
        currentPlayer.increasePlayerMistakes();
        this.increaseGameMistakes();
        this.updateWrongCardsChosen();
    }

    handleGameOver(isGameOver){
        if (!isGameOver){return;}

        let winner = this.getWinner();
        winner.setWinnerStyle();
        setTimeout(this.resetGameSpace.bind(this), 3400);
    }

    resetGameSpace(){
        this.removeDeck();
        this.removePlayersCards();
        this.showGamePropertiesForm();
        this.hideGameStatus();
    }

    removeDeck(){
        let DOMdeck = document.getElementById(gameIds.cardContainersIds.cardDeck);
        DOMdeck.remove();    
    }

    removePlayersCards(){
        let container = document.getElementById(gameIds.gameInfoIds.container);
        let children = container.children;
        let childrenCount = children.length
        for (let i=0; i < childrenCount; i++){
            container.removeChild(children[0]);
        }
    }

    hideGameProperties(){
        let gameInitializer = document.getElementById(gameIds.gameProperties.id);
        gameInitializer.classList.add(gameClasses.game.propertiesHidden);
    }

    showGamePropertiesForm(){
        let gameInitializer = document.getElementById(gameIds.gameProperties.id);
        gameInitializer.classList.remove(gameClasses.game.propertiesHidden);
    }

    hideGameStatus(){
        let gameInitializer = document.getElementById(gameIds.gameInfoIds.container);
        gameInitializer.classList.add(gameClasses.game.statusHidden);
    }

    showGameStatus(){
        let gameInitializer = document.getElementById(gameIds.gameInfoIds.container);
        gameInitializer.classList.remove(gameClasses.game.statusHidden);
    }

    initializePlayers(playersAmount){
        this.createPlayersArray(playersAmount);
        let currentPlayer = this.getCurrentPlayer()
        setTimeout(currentPlayer.addCurrentPlayerStyle.bind(currentPlayer), 900);    
        this.appendPlayersInfo(this.getPlayers());
    }

    appendPlayersInfo(players){
        let gameStatusContainer = document.getElementById(gameIds.gameInfoIds.container);
        for (let i=0; i <players.length; i++){
            let playerCard = players[i].getCard();
            gameStatusContainer.appendChild(playerCard);
        }
    }

    nextGameState(card){
        this.increaseCardsFlipped();
        this.addCard(card);
        let currentPlayer = this.getCurrentPlayer();

        if (this.areAllCardsAllowedFlipped()){
            let isThePlayCorrect = this.areCurrentCardsTheSame();
            isThePlayCorrect ? this.handleCorrectCards(): this.handleWrongCards();
            if (!isThePlayCorrect) { 
                setTimeout(currentPlayer.removeCurrentPlayerStyle.bind(currentPlayer), 1000);
                this.handleNextPlayer();
                currentPlayer = this.getCurrentPlayer();
                setTimeout(currentPlayer.addCurrentPlayerStyle.bind(currentPlayer), 1000);
            }
        }
    }

    initialize(playersAmount){
        this.hideGameProperties();
        this.showGameStatus();   
        this.initializePlayers(playersAmount);
    }

    updateDeckInfo(cardAmount, deckSize){
        this.setCardAmount(cardAmount);
        this.setRemainingCards(deckSize);
    }

    updateCorrectCardsChosen(){
        let cardBackFaces = [],
            cards = this.getCards(),
            cardAmount = this.getCardAmount();
        for (let i=0; i < cardAmount; i++){
            let backFace = getCardBackFace(cards[i]);
            cardBackFaces.push(backFace);
        }

        setTimeout(updateBackFaceStyle(cardBackFaces), 1000);
        disableCurrentCards();
        this.removeCurrentCardsInfo();
    }

    disableCurrentCards(){
        let cards = this.getCards(),
            cardAmount = this.getCardAmount();

        for (let i=0; i < cardAmount; i++){
            cards[i].removeEventListener("click", startRound);
        }
    }
}

class Player{
    constructor(i){
        this.identifier = i || 1;
        this.mistakes = 0;
        this.success = 0;
        this.mistakesElement = this.createMistakesElement();
        this.successesElement = this.createSuccessesElement();
        this.winnerTokenElement = this.createWinnerToken();
        this.card = this.createPlayerCard();
    }

    getIdentifier() {
        return this.identifier;
    }

    getCard() {
        return this.card;
    }

    getMistakesElement() {
        return this.mistakesElement;
    }

    getSuccessesElement() {
        return this.successesElement;
    }

    getWinnerToken() {
        return this.winnerTokenElement;
    }

    getPlayerMistakes() {
        return this.mistakes;
    }

    getPlayerSuccesses() {
        return this.success;
    }

    createMistakesElement(){
        let mistakes = document.createElement("p");
        mistakes.textContent = gameStrings.mistakes + "0";
        return mistakes;
    }

    createSuccessesElement(){
        let successes = document.createElement("p");
        successes.textContent = gameStrings.successes + "0";
        return successes;
    }

    createWinnerToken(){
        let winnerCrown = document.createElement("img");
        winnerCrown.src = gamePaths.crown;
        winnerCrown.classList.add(gameClasses.player.crown, gameClasses.player.crownHidden);
        return winnerCrown;
    }

    createPlayerCard(){
        let playerCard = document.createElement("DIV");
        playerCard.classList.add(gameClasses.player.playerCard);

        let cardTitle = document.createElement("h2");
        cardTitle.textContent = gameStrings.player + this.getIdentifier();
        
        playerCard.appendChild(cardTitle);
        playerCard.appendChild(this.getMistakesElement());   
        playerCard.appendChild(this.getSuccessesElement());
        playerCard.appendChild(this.getWinnerToken());

        return playerCard;
    }


    increasePlayerMistakes() {
        this.mistakes++;
        this.updatePlayerMistakes();
    }

    increasePlayerScore (){
        this.success++;
        this.updatePlayerSuccesses();
    }

    removeCurrentPlayerStyle(){
        let playerCard = this.getCard();
        playerCard.classList.remove(gameClasses.player.playerActive)
    }

    addCurrentPlayerStyle(){
        let playerCard = this.getCard();
        playerCard.classList.add(gameClasses.player.playerActive)
    }

    setWinnerStyle(){
        let winnerToken = this.getWinnerToken();
        winnerToken.classList.remove(gameClasses.player.crownHidden);
    }


    updatePlayerMistakes() {
        let DOMMistakes = this.getMistakesElement();
        let mistakes = this.getPlayerMistakes();
        let defaultText = gameStrings.mistakes;
        DOMMistakes.textContent = defaultText + mistakes;
    }

    updatePlayerSuccesses() {
        let DOMSuccesses = this.getSuccessesElement();
        let successes = this.getPlayerSuccesses();
        let defaultText = gameStrings.successes;
        DOMSuccesses.textContent = defaultText + successes;

    }

}

var currentGame = {};

function initializeGame(){
    resetGameData();
    let form = document.getElementById(gameIds.gameProperties.form);
    let gameParameters = parseGamePropertiesForm(form);

    currentGame = new Game();
    currentGame.initialize(gameParameters.players);
    
    let deckSize = initializeDeck(gameParameters);
    currentGame.updateDeckInfo(gameParameters.cardAmount, deckSize);
}

function initializeDeck(gameParameters){
    let gameDeckSize = createGameDeck(gameParameters);
    flipAllAvailableCards();
    setTimeout(flipAllAvailableCards, 750);
    return gameDeckSize;
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

function resetGameData(){

    currentGame = {};
}

function resetTextById(DOMId){
    let element = document.getElementById(DOMId);
    element.textContent = "";
}

function getCardIdentifier(card){

    return card.dataset.cardidentifier;
}

function getCardBackFace(card){

    return card.lastChild;
}

function updateBackFaceStyle(cardBackFaces){
    return function (){
        for (let i=0; i < cardBackFaces.length; i++){
            cardBackFaces[i].classList.add(gameClasses.cardFace.disabledCard);
        }
    }
}

function unflipCurrentCards(cards){
    return function(){
        for (let i=0; i < cards.length; i++){
            cards[i].classList.toggle(gameClasses.card.flippedCard);
        }
    }
}

function startRound(){
    let isCardAlreadyFliped = !this.classList.contains(gameClasses.card.flippedCard);
    if (isCardAlreadyFliped) {
        this.classList.toggle(gameClasses.card.flippedCard);
        currentGame.nextGameState(this);
    }
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

    gameDeck = shuffleArray(gameDeck);

    appendGameDeckToDom(gameDeck, DOMdeck);

    return gameDeck.length;
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

// @ colocar na classe
function isCardInGameData(card){
    let isCardInList = false,
        cards = currentGame.getCards(),
        cardAmount = currentGame.getCardAmount(),
        i=0;
    while (i < cardAmount && !isCardInList){
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