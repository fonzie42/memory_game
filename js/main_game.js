const DEFAULT_PROPERTIES = {
    LEVEL_DECK_SIZE: {
        EASY: 6,
        REGULAR: 10,
        HARD: 15
    },

    CARD_AMOUNT_MODIFIER: {
        REGULAR: 2,
        HARD: 3,
        VERYHARD: 4
    },

    STANDARDPLAYERS: 1
};

const IDS = {
    INFO: {
        CONTAINER: "gamestatuscontainer"
    },

    GAME_PROPERTIES: {
        ID: "gamePropertiesContainer",
        FORM: "gamePropertiesForm",
    },

    CARD_CONTAINERS:{
        DECK: "cardDeck",
        TABLE: "cardTable",
    }
};

const CLASSES = {
    GAME: {
        PROPERTIES_HIDDEN: "gameProperties--hidden",
        STATUS_HIDDEN: "gameStatus--hidden",
        DECK: "deck",
    },

    PLAYER: {
        CARD: "playerCard",
        ACTIVE: "playerCard--active",
        CROWN: "crown",
        CROWN_HIDDEN: "crown--hidden"
    },

    CARD: {
        CARD: "card",
        TITLE: "card__title",
        TITLE_PREFIX: "card__title--",
        FLIPPED: "flippedCard"
    },

    CARD_FACE: {
        DISABLED_CARD: "card__face--disabled",
        FACE: "card__face",
        FRONT: "card__face--front",
        FRONT_STANDARD_IMG: "card__face--backgroundStandard",
        BACKGROUND_PREFIX: "card__face--background",
        BACK_STANDARD_BG: "card__face--backgroundGray",
        BACK: "card__face--back"
    },
};

const STRINGS = {
    PLAYER: "Player ",
    MISTAKES: "Mistakes: ",
    SUCCESSES: "Successes: "
};

const GAME_PATHS = {

    CROWN: "images/assets/crown.svg"
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

    getCurrentCard(){
        return this.currentCard;
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
        this.cards[this.getCurrentCard()] = card;
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
            if (cards[i-1].getCardIdentifier() !== cards[i].getCardIdentifier()){
                differenceInCards++;
            }
        }

        return differenceInCards === 0;
    }

    isGameOver(){
        return this.remainingCards === 0;
    }

    increaseCurrentCard(){
        let cardAmount = this.getCardAmount(),
            currentCard = this.getCurrentCard();

        this.currentCard = (currentCard === cardAmount - 1) ? 0 : currentCard + 1;
    }

    increaseGameMistakes(){
        this.mistakes++;
    }

    increaseCardsFlipped(){
        this.cardsFlipped++;
    }

    decreaseRemainingCards(){
        this.remainingCards = this.remainingCards - this.getCardAmount();
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
        this.updateCorrectCardsChosen();
        this.handleGameOver(this.isGameOver());
    }

    updateWrongCardsChosen(){
        let cards = this.getCards();
        setTimeout(this.unflipCurrentCards.bind(null, cards), 1000);
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
        let DOMdeck = document.getElementById(IDS.CARD_CONTAINERS.DECK);
        DOMdeck.remove();    
    }

    removePlayersCards(){
        let container = document.getElementById(IDS.INFO.CONTAINER);
        let children = container.children;
        let childrenCount = children.length
        for (let i=0; i < childrenCount; i++){
            container.removeChild(children[0]);
        }
    }

    hideGameProperties(){
        let gameInitializer = document.getElementById(IDS.GAME_PROPERTIES.ID);
        gameInitializer.classList.add(CLASSES.GAME.PROPERTIES_HIDDEN);
    }

    showGamePropertiesForm(){
        let gameInitializer = document.getElementById(IDS.GAME_PROPERTIES.ID);
        gameInitializer.classList.remove(CLASSES.GAME.PROPERTIES_HIDDEN);
    }

    hideGameStatus(){
        let gameInitializer = document.getElementById(IDS.INFO.CONTAINER);
        gameInitializer.classList.add(CLASSES.GAME.STATUS_HIDDEN);
    }

    showGameStatus(){
        let gameInitializer = document.getElementById(IDS.INFO.CONTAINER);
        gameInitializer.classList.remove(CLASSES.GAME.STATUS_HIDDEN);
    }

    initializePlayers(playersAmount){
        this.createPlayersArray(playersAmount);
        let currentPlayer = this.getCurrentPlayer()
        setTimeout(currentPlayer.addCurrentPlayerStyle.bind(currentPlayer), 900);    
        this.appendPlayersInfo(this.getPlayers());
    }

    appendPlayersInfo(players){
        let gameStatusContainer = document.getElementById(IDS.INFO.CONTAINER);
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
            let backFace = cards[i].getCardBackFace();
            cardBackFaces.push(backFace);
        }

        setTimeout(this.updateBackFaceStyle.bind(null, cardBackFaces), 1000);
        this.disableCurrentCards();
        this.removeCurrentCardsInfo();
    }

    disableCurrentCards(){
        let cards = this.getCards(),
            cardAmount = this.getCardAmount();

        for (let i=0; i < cardAmount; i++){
            let cardElement = cards[i].getDOMElement();
            cardElement.removeEventListener("click", startRound);
        }
    }

    updateBackFaceStyle(cardBackFaces){
        for (let i=0; i < cardBackFaces.length; i++){
            cardBackFaces[i].classList.add(CLASSES.CARD_FACE.DISABLED_CARD);
        }
    }

    unflipCurrentCards(cards){
        for (let i=0; i < cards.length; i++){
            cards[i].flip();
        }
    }

    isCardInGameData(card){
        let isCardInList = false,
            cards = this.getCards(),
            cardAmount = this.getCardAmount(),
            i=0;
        while (i < cardAmount && !isCardInList){
            cards[i] === card ? isCardInList = true : i++;
        }

        return isCardInList;
    }


    isCardPlayerFlipped(card){
        let DOMCard = card.getDOMElement(),
            isCardFlipped = DOMCard.classList.contains(CLASSES.CARD.FLIPPED),
            isInCurrentCardsList = this.isCardInGameData(card);
        return (isCardFlipped && isInCurrentCardsList);
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
        mistakes.textContent = STRINGS.MISTAKES + "0";
        return mistakes;
    }

    createSuccessesElement(){
        let successes = document.createElement("p");
        successes.textContent = STRINGS.SUCCESSES + "0";
        return successes;
    }

    createWinnerToken(){
        let winnerCrown = document.createElement("img");
        winnerCrown.src = GAME_PATHS.CROWN;
        winnerCrown.classList.add(CLASSES.PLAYER.CROWN, CLASSES.PLAYER.CROWN_HIDDEN);
        return winnerCrown;
    }

    createPlayerCard(){
        let playerCard = document.createElement("DIV");
        playerCard.classList.add(CLASSES.PLAYER.CARD);

        let cardTitle = document.createElement("h2");
        cardTitle.textContent = STRINGS.PLAYER + this.getIdentifier();
        
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
        playerCard.classList.remove(CLASSES.PLAYER.ACTIVE)
    }

    addCurrentPlayerStyle(){
        let playerCard = this.getCard();
        playerCard.classList.add(CLASSES.PLAYER.ACTIVE)
    }

    setWinnerStyle(){
        let winnerToken = this.getWinnerToken();
        winnerToken.classList.remove(CLASSES.PLAYER.CROWN_HIDDEN);
    }


    updatePlayerMistakes() {
        let DOMMistakes = this.getMistakesElement();
        let mistakes = this.getPlayerMistakes();
        let defaultText = STRINGS.MISTAKES;
        DOMMistakes.textContent = defaultText + mistakes;
    }

    updatePlayerSuccesses() {
        let DOMSuccesses = this.getSuccessesElement();
        let successes = this.getPlayerSuccesses();
        let defaultText = STRINGS.SUCCESSES;
        DOMSuccesses.textContent = defaultText + successes;

    }
}

class Card {
    constructor(cardProperties){
        this.cardBackFace = this.createBackFace(cardProperties);
        this.cardFrontFace = this.createFrontFace();
        this.cardElement = this.createCardElement();
        this.cardIdentifier = this.createCardIdentifier(cardProperties.cardIdentifier);
    }

    getCardIdentifier(){

        return this.cardIdentifier;
    }

    getCardBackFace(){

        return this.cardBackFace;
    }

    getCardFrontFace(){

        return this.cardFrontFace;
    }

    getDOMElement(){
        return this.cardElement;
    }

    createCardIdentifier(identifier){

        this.cardIdentifier = identifier;
    }

    createCardElement(){
        let card = document.createElement("DIV");
        card.classList.add(CLASSES.CARD.CARD);
        card.addEventListener('click', startRound.bind(null, this));
        card.appendChild(this.getCardFrontFace());
        card.appendChild(this.getCardBackFace());
        return card;
    }

    createFrontFace(){
        let frontFace = document.createElement("DIV");
        frontFace.classList.add(CLASSES.CARD_FACE.FACE);
        frontFace.classList.add(CLASSES.CARD_FACE.FRONT);
        frontFace.classList.add(CLASSES.CARD_FACE.FRONT_STANDARD_IMG);
        frontFace.classList.add(CLASSES.CARD_FACE.BACK_STANDARD_BG);
        return frontFace;
    }

    createBackFace(cardProperties){
        let backFace = document.createElement("DIV");

        backFace.classList.add(CLASSES.CARD_FACE.FACE);
        backFace.classList.add(CLASSES.CARD_FACE.BACK);
        let backgroundColor = CLASSES.CARD_FACE.BACKGROUND_PREFIX + cardProperties.backgroundColor;
        backFace.classList.add(backgroundColor)
        backFace.appendChild(this.createBackFaceImage(cardProperties.image));

        let cardTitle = document.createElement("P");
        let titleColor = CLASSES.CARD.TITLE_PREFIX + cardProperties.backgroundColor;
        cardTitle.classList.add(CLASSES.CARD.TITLE);
        cardTitle.classList.add(titleColor);
        cardTitle.textContent = cardProperties.cardTitle;

        backFace.appendChild(cardTitle);
        return backFace;
    }

    createBackFaceImage(image){
        let backFaceImage = document.createElement("IMG");
        backFaceImage.src=image;
        return backFaceImage;
    }

    isCardDisabled(){
        let backFace = this.getCardBackFace();
        return backFace.classList.contains(CLASSES.CARD_FACE.DISABLED_CARD);
    }

    flip(){
        let DOMCard = this.getDOMElement();
        DOMCard.classList.toggle(CLASSES.CARD.FLIPPED);
    }
}

var currentGame = {};
var globalDeck = [];

function initializeGame(){
    resetGameData();
    let form = document.getElementById(IDS.GAME_PROPERTIES.FORM);
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

    return !level || typeof level !== "string" ? DEFAULT_PROPERTIES.LEVEL_DECK_SIZE.REGULAR : DEFAULT_PROPERTIES.LEVEL_DECK_SIZE[level];
}

function getPlayersFromString(player){

    return !player || typeof player !== "string" ? DEFAULT_PROPERTIES.STANDARDPLAYERS : parseInt(player);
}

function getDeckFromName(deckName){

    return decks[deckName] || decks["landscaping"];
}

function getCardAmountFromString(cardAmountText){

    return cardAmountText != '' ? DEFAULT_PROPERTIES.CARD_AMOUNT_MODIFIER[cardAmountText] : DEFAULT_PROPERTIES.CARD_AMOUNT_MODIFIER.REGULAR;
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

function startRound(card){
    let isCardAlreadyFliped = !card.cardElement.classList.contains(CLASSES.CARD.FLIPPED);
    if (isCardAlreadyFliped) {
        card.flip();
        currentGame.nextGameState(card);
    }
}

function getDOMDeck(){
    const DOMdeck = document.getElementById(IDS.CARD_CONTAINERS.DECK);

    if (DOMdeck != undefined){
        removeDeck();
    }

    return createDOMDeck()
}

function createDOMDeck(){
    let DOMTable = document.getElementById(IDS.CARD_CONTAINERS.TABLE);
    let DOMdeck = document.createElement("DIV");
    DOMdeck.classList.add(CLASSES.GAME.DECK);
    DOMdeck.id = IDS.CARD_CONTAINERS.DECK;    
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
            let card = new Card(cardStyle);
            gameDeck.push(card);
        }
        k++;
    }

    gameDeck = shuffleArray(gameDeck);
    globalDeck = gameDeck;
    appendGameDeckToDom(gameDeck, DOMdeck);

    return gameDeck.length;
}

function _createDebugDeck(deckName){
    let deck = getDeckFromName(deckName);
    let gameDeck = [];
    let DOMdeck = getDOMDeck();

    for (let i=0; i < deck.deckSize; i++){
        let cardStyle = deck.cards[i];
        let card = new Card(cardStyle);
        gameDeck.push(card);
    }

    appendGameDeckToDom(gameDeck, DOMdeck);
}


function appendGameDeckToDom(gameDeck, gameSpace){
    for (let i=0; i <gameDeck.length; i++){
        gameSpace.appendChild(gameDeck[i].getDOMElement());
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

function flipAllAvailableCards(){
    for (let i = 0; i < globalDeck.length; i++) {
        if (!globalDeck[i].isCardDisabled() && !currentGame.isCardPlayerFlipped(globalDeck[i])){
            globalDeck[i].flip();    
        }
    }
}
