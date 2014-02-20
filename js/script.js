var staticCardArray = 	[
							['1H', '2H', '3H', '4H', '5H', '6H', '7H', '8H', '9H', '10H', '11H', '12H', '13H'],
							['1D', '2D', '3D', '4D', '5D', '6D', '7D', '8D', '9D', '10D', '11D', '12D', '13D'],
							['1S', '2S', '3S', '4S', '5S', '6S', '7S', '8S', '9S', '10S', '11S', '12S', '13S'],
							['1C', '2C', '3C', '4C', '5C', '6C', '7C', '8C', '9C', '10C', '11C', '12C', '13C']
						];
var	gameCardArray = [], //contains shuffled card order, emptied as put on field
	resetCardArray = [], //contains the shuffled card order, remains
	cardColumnArray = [[],[],[],[],[],[],[], [], [],  [],[],[],[]], //contains the cards in the playing field in the order they are stored
/*                      Columns1-7          unplayed  storedCards*/
	undoCardColumnArray = [[],[],[],[],[],[],[], [], [],  [],[],[],[]],
	possibleCardLocations = ['columnOne', 'columnTwo', 'columnThree', 'columnFour', 'columnFive', 'columnSix', 'columnSeven', 'unflippedCards', 'flippedCards', 'storedHearts', 'storedDiamonds', 'storedSpades', 'storedClubs']; //contains what cards are where and the order they are stored, the first 7 are the 7 columns of the play board, the last one is the unflipped card pile
	
var doConfirmBox= false, //this is variable to determine whether a confirm box will be displayed, initially false so it doesn't display instantly
	firstTimeLoad = true, //variable that is set if the page is being first loaded, used for confirm box function
	oneCardDraw = true;

var cardSpacing = 12.5, //distance between each card in a stack
	cashMoneyPerCard = 15, //prize money per card
	cardWidth = 82,
	cardHeight = 114.75
	threeDrawCardSpacing = 15;

var draggedCardPosObject = 0,
	hoveredOverCard = 0,
	cashMoney = 0;

var unflippedIndex = possibleCardLocations.indexOf('unflippedCards'),
	flippedIndex = unflippedIndex + 1;

var cardPictureOrder = ['H', 'S', 'D', 'C'];

/*
======================================= jQuery Variables =================================================
*/

var $body = $('#body'),
	$page = $('#page'),
	$cardDrawButton = $('#cardDrawButton'),
	$scoreBarButton = $('.scoreBarButton'),
	$flippedCards = $('#flippedCards'),
	$unflippedCards = $('#unflippedCards'),
	$unflippedCardCounter = $('#unflippedCardCounter'),
	$confirmBox = $('#confirmBox'),
	$youWin = $('#youWin');
	
/*
======================================== Encapsluated Functions ==========================================
*/
var ScoreBarButtonClicks = {
	newGame: function() {
		if (!$confirmBox.is(':visible')) {//if the confirm box is not visible then allow it do stuff
			gameCardArray = shuffleDeck();
			resetCardArray = arrayCopy(gameCardArray);
			
			var drawButtonValue = $cardDrawButton.attr('value');
			
			oneCardDraw = /^1/.test(drawButtonValue) ? true : false; //if the value of the button starts with 1, then set oneCardDraw to true, if not than false, meaning it will do three card draw
			
			if (doConfirmBox) { 
				popUpConfirmBox();
			} else {
				layoutCardsForNewGame();
			}
		}
	},
	resetGame: function() {
		if (!$('#confirmBox').is(':visible')) {
			gameCardArray = arrayCopy(resetCardArray); //copies the reset array to the gamecard array, meaning it will 
			
			if (doConfirmBox) {
				popUpConfirmBox();
			} else {
				layoutCardsForNewGame();
			}
		}
	},
	undo: function() {
		/*Undoes the last move completed, this could possibly be done by creating a second version of the card
		column array that stores the cards in the format they were before the most recent move. When someone presseses
		undo, it would then go through the two version of the array, find the difference, and then move that card back to 
		where it was while reverting it to it's same classes etc. The classes might involve actually saving an object
		variable after each move saying what card it was (ie the jquery object that contains all the classes etc it had
			before it was moved.*/
		var indicesWithDifferences = [],
			undoLengths = [],
			normalLengths = [],
			addedToIndex = 0,
			cardsToUndo = [],
			$cardsToUndo = [],
			cardsToDraw = oneCardDraw ? 1 : 3;

		for (var i = 0; i < cardColumnArray.length; i++) {
			if (undoCardColumnArray[i].length != cardColumnArray[i].length) {
				indicesWithDifferences.push(i);
				undoLengths.push(undoCardColumnArray[i].length);
				normalLengths.push(cardColumnArray[i].length);
			}
		}

		if (indicesWithDifferences[1]) {
			var numOfCards = Math.abs(undoLengths[0] - normalLengths[0]);

			if (normalLengths[0] > undoLengths[0]) {
				addedToIndex = indicesWithDifferences[0];
			} else {
				addedToIndex = indicesWithDifferences[1];
			}

			var subtractedFromIndex = addedToIndex == indicesWithDifferences[1] ? indicesWithDifferences[0] : indicesWithDifferences[1];

			for (var i = 0; i < numOfCards; i++) {
				cardsToUndo.unshift(cardColumnArray[addedToIndex][cardColumnArray[addedToIndex].length - 1 - i ]);
				$cardsToUndo.unshift($('#' + cardsToUndo[0]));
			}

			var targetCard = cardColumnArray[subtractedFromIndex][cardColumnArray[subtractedFromIndex].length - 1],
				$targetCard = $('#' + targetCard);

			$.makeArray($cardsToUndo);

			if (!targetCard) {
				$targetCard = $('#' + possibleCardLocations[subtractedFromIndex]);
			} else {
				var targetCardNumber = parseInt(targetCard),
					targetCardSuit = targetCard.slice(-1),
					targetCardSuitColor = determineSuitColor($targetCard),
					topUndoCardNumber = parseInt(cardsToUndo[0]),
					topUndoCardSuit = cardsToUndo[0].slice(-1),
					topUndoCardSuitColor = determineSuitColor($cardsToUndo[0]);
			}

			if ($targetCard.parent().attr('id') == 'unflippedCards' || $targetCard.attr('id') == 'unflippedCards') {
				var empty = true,
					unflippedCardsPosObject = $unflippedCards.offset();
				console.log('osadasd');
					
				if (!oneCardDraw) {
					var $prevCard = $cardsToUndo[0].prev();
					$prevCard.removeClass('cantClick');
					setDraggable($prevCard);
					$cardsToUndo.reverse();
				}

				$targetCard.removeClass('empty');

				for (var i = 0; i < cardsToUndo.length; i++) {		
					cardColumnArray[subtractedFromIndex].push(cardColumnArray[addedToIndex].pop());
						
					if ($targetCard.parent().attr('id') == 'unflippedCards') {
						$targetCard.parent().append($cardsToUndo[i]);
					} else {
						$targetCard.append($cardsToUndo[i]);
					}
						
					$cardsToUndo[i].removeClass('flipped')
						.removeClass('cantClick')
						.removeClass('clicked')
						.addClass('unflipped')
						.css({ top: unflippedCardsPosObject.top, left: unflippedCardsPosObject.left,
							'z-index': $targetCard.prevAll().andSelf().length + i 
						});
	
					setUnflippedImage($cardsToUndo[i]);

					if ($cardsToUndo[i].hasClass('ui-draggable')) {
						$cardsToUndo[i].draggable('destroy');
					}
				}
				moveCardsToPlayable();	
				updateCardCounter();					
			} else if ($targetCard.attr('id') == 'flippedCards') {
				var flippedCardsPosObject = $flippedCards.offset()
				for (var i = $cardsToUndo.length - 1, j = 0; i >= 0; i--, j++) {
					//$targetCard.after($cardsToUndo[i]);
					$cardsToUndo[i].css({top: flippedCardsPosObject.top, left: flippedCardsPosObject.left, 'z-index': j })
						.removeClass('unflipped')
						.addClass('flipped');
						
					setCardImage($cardsToUndo[i]);
					cardColumnArray[subtractedFromIndex].push(cardColumnArray[addedToIndex].pop());
					$targetCard.append($cardsToUndo[i]);
				}
				console.log('dogfuck');

				$targetCard.prev().addClass('empty');
				updateCardCounter();

				if (!oneCardDraw) {
					var	$currentlyFlippedCards = $flippedCards.children();
						
					$currentlyFlippedCards.each(function() {
						var $eachThis = $(this);
						$eachThis.css({'left': flippedCardsPosObject.left + (cardsToDraw - 1) * threeDrawCardSpacing})
							.addClass('cantClick');
					});
						
					moveCardsToPlayable();
					
					var $playablabeCard = $currentlyFlippedCards.last().removeClass('cantClick');
					setDraggable($playablabeCard);
				}
			} else if (targetCardNumber == (topUndoCardNumber + 1) && targetCardSuitColor != topUndoCardSuitColor) {
				
				if ($cardsToUndo[1]) {
					moveCard($cardsToUndo, $targetCard);
				} else {
					moveCard($cardsToUndo[0], $targetCard);
				}
					
				console.log('vaginas');
			} else if (/^stored/.test($targetCard.attr('id'))) {
				var empty = false,
					stored = true;
				moveCard($cardsToUndo, $targetCard, empty, stored);
				console.log('hairydongs');
			} else if ($targetCard.hasClass('bottom')) {
				if ($cardsToUndo[1]) {
					moveCard($cardsToUndo, $targetCard);
				} else {
					moveCard($cardsToUndo[0], $targetCard);
				}
				console.log('ddddd');
				$targetCard.removeClass('flipped')
					.addClass('unflipped');
				setUnflippedImage($targetCard);
			}
		}
	},
	changeDraw: function() {	
		var $cardDrawButton = $('#cardDrawButton');
		if ($cardDrawButton.attr('value') == '1-Card Draw (D)') {
			$cardDrawButton.attr('value', '3-Card Draw (D)');	
		} else {
			$cardDrawButton.attr('value', '1-Card Draw (D)');
		}
	}
}
var DragEvents = {
	dragStart: function($draggedThis) {
		draggedCardPosObject = $draggedThis.offset();
		$('div.clicked').removeClass('clicked');
	},
	dragging: function($draggedThis) {
		var $stackedCards = $draggedThis.nextAll()
		$stackedCards.each(function(i) {
			var $eachThis = $(this),
				changingDraggedCardPosObject = $draggedThis.offset(),
				draggedZIndex = parseInt($draggedThis.css('z-index'));
			$eachThis.css({ 
				'top': changingDraggedCardPosObject.top + ((i + 1) * cardSpacing), 
				'left': changingDraggedCardPosObject.left,
				'z-index': draggedZIndex + i + 1
			});
		});
	},
	dragStop: function(event, $draggedThis) {
		var draggedCardNumber = parseInt($draggedThis.attr('value')),
			draggedCardSuit = $draggedThis.attr('value').slice(-1),
			draggedCardColor = determineSuitColor($draggedThis),
			oppositeDraggedCardColor = draggedCardColor == 'red' ? 'black' : 'red';

		var draggedColumnIndex = possibleCardLocations.indexOf($draggedThis.parent().attr('id'));

		var	className = (draggedCardNumber + 1) + oppositeDraggedCardColor;
		
		if (draggedCardNumber == 13) {
			$('#cardsArea').find('div.empty').each(function() {
				var $eachThis = $(this),
					empty = true;
				
				handleDragMoves($draggedThis, $eachThis, empty);
			})
		}

		if (draggedCardNumber == 1) {
			$('#storedCards').find('div[value=' + draggedCardSuit + ']').each(function() {
				var $eachThis = $(this),
					empty = true,
					stored = true;

				handleDragMoves($draggedThis, $eachThis, empty, stored);
			});
		} else {
			$('.bottom.' + className).each(function() {
				var $eachThis = $(this);

				handleDragMoves($draggedThis, $eachThis);
			});

			var storedValue = (draggedCardNumber - 1) + draggedCardSuit;
			$('#' + storedValue + '.stored').each(function() {
				var $eachThis = $(this),
					empty = false,
					stored = true;
				handleDragMoves($draggedThis, $eachThis, empty, stored);
				checkForWin();
			});
		}
		
		var newDraggedColumnIndex = possibleCardLocations.indexOf($draggedThis.parent().attr('id'));
		
		if (draggedColumnIndex == newDraggedColumnIndex) {
			$draggedThis.nextAll().andSelf().each(function(i) {
				var $eachThis = $(this);
				$eachThis.animate({top: draggedCardPosObject.top + (i * cardSpacing), left: draggedCardPosObject.left});
				var zIndex = $eachThis.prevAll().length;
				$eachThis.css({'z-index': zIndex});	
			});
		}	    	
	}
}

/*
======================================= JQUERY EVENTS/ MAIN CODE =====================================================
*/		

ScoreBarButtonClicks.newGame(); //load the cards onto the field and shuffle the deck
setCardCounterPosition($unflippedCards, $unflippedCardCounter); //positions the card counter on the page

$body.keydown(function(event) {
	var keyPressed = event.which;
	switch (keyPressed) {
		case 78: 	
			ScoreBarButtonClicks.newGame(); //if N/n, a newGame is started with new deck order
			break;
		case 82: 
			ScoreBarButtonClicks.resetGame(); //if R/r, the game is reset, ie same deck order
			break;
		case 85: 	
			ScoreBarButtonClicks.undo(); //if U/u, undos the last move
			break;
		case 68: 	
			ScoreBarButtonClicks.changeDraw(); //changes between 1 and 3 card draw for the next game
			break;   
	}
});

$scoreBarButton.click(function(event) {
	var $this = $(this);
	switch ($this.attr('id')) {
		case 'newGameButton': 	
			ScoreBarButtonClicks.newGame(); //same as above just for clicking the buttons
			break;
		case 'resetGameButton': 
			ScoreBarButtonClicks.resetGame();
			break;
		case 'undoButton': 		
			ScoreBarButtonClicks.undo();
			break;
		case 'cardDrawButton': 	
			ScoreBarButtonClicks.changeDraw();
			break;
	}
});

$('#acceptConfirmation').click(function() {
	if ($('#turnOffConfirmations').prop('checked')) { //if the turn off the conf thing is checked, it turns it off
		doConfirmBox = false;
	}

	layoutCardsForNewGame(); //function that laysout all the cards for a new game
	$confirmBox.hide();
});

$('#refuseConfirmation').click(function() {
	$confirmBox.hide();
});

$page.delegate('div.flipped', 'click', function(event) {
	event.stopPropagation(); 

	var $this = $(this), //the card clicked now
		$divClicked = $('div.clicked')
		$previousCard = $divClicked.prev(); //the card clicked last
		

	if (!/^stored/.test($this.parent().attr('id')) && $this.parent().attr('id') != 'flippedCards' && 
			!$this.hasClass('cantClick'))  {

		$('div.clicked').removeClass('clicked'); //removes clicked status from last card		

		if ($divClicked.length > 0) { //if there is a clicked card it runs this stuff
			var clickedSuitColor = determineSuitColor($divClicked), //returns red or black
				clickedCardNumber = parseInt($divClicked.text()); //used to compare the numbers of the card

			var targetSuitColor = determineSuitColor($this), 
				targetCardNumber = parseInt($this.text());

			if (targetCardNumber == (clickedCardNumber + 1) && targetSuitColor != clickedSuitColor) {
				//if the target card is one higher than the last card, and the opposite color, it moves it 		
				if ($previousCard.attr('value') == $this.attr('value')) { //if the previous card is the clicked card, it will just click on that card
					$this.addClass('clicked');
				} else if (!$divClicked.hasClass('bottom') && $divClicked.parent().attr('id') != 'flippedCards') { //if the previously clicked card is not the bottom card and it's parent is not flipped cards, it will do a multi card move of all cards below it
					handleMultiCardMove($divClicked, $this);
				} else {
					moveCard($divClicked, $this); //otherwise it just moves it
				}	
			} else {
				$this.addClass('clicked'); //otherwise it adds the clicked class to the new card
			}
		} else {
			$this.addClass('clicked'); //otherwise it adds the clicked class to the new card
		}
	} else {
		console.log('ranggg');
		if (!/^stored/.test($this.parent().attr('id'))) {
			console.log('ssss');
			$('div.clicked').removeClass('clicked'); //removes clicked status from last card
			$this.addClass('clicked');
		}
	}
});

$page.click(function() {
	$('div.clicked').removeClass('clicked'); //if the mouse is clicked anywhere else, it declicks the card
});

$page.delegate('div.empty', 'click', function() { //if the card is clicked on an empty column and the last card is a king, it will move it, otherwise not
	var $this = $(this),
		$divClicked = $('div.clicked');

	var clickedCardNumber = parseInt($divClicked.text()); 
	
	if (clickedCardNumber == 13 /*&& $this.children().length == 0*/) {
		var empty = true; //if the target place to move things is without cards, the move cards thing needs to be changed because of the lack of parent, and difference of positioning
		
		if (!$divClicked.hasClass('bottom') && $divClicked.parent().attr('id') != 'flippedCards') {
			handleMultiCardMove($divClicked, $this, empty);
		} else {
			moveCard($divClicked, $this, empty);
		}
	}
});
	
$('#storedCards').find('div').click(function() { //if the the empty storedCards place is clicked, and the card is an ace and the right suit it will move it
	var $this = $(this),
		$divClicked = $('div.clicked');
	
	if ($divClicked.length > 0) { //if there is a clicked card it does this stuff
		var targetCardSuit = $this.attr('value'), //the empty divs have the suit letter as a value
			clickedCardNumber = parseInt($divClicked.text()),
			clickedCurrentCard = $divClicked.attr('value'),
			clickedCardSuit = clickedCurrentCard.slice(-1); //determines suit by taking the last leter
		
		if (clickedCardNumber == 1 && clickedCardSuit == targetCardSuit) {
			var empty = true,
				stored = true;
			moveCard($divClicked, $this, empty, stored);
			$divClicked.css({ 'z-index': 30 }); //30 chosen randomly so that card is always on top, increase by the card number
		} 
	}
});
	
$page.delegate('div.stored', 'click', function() { //if a stored card is clicked after another is clicked, if it's the same suit and one card lower, it moves
	var $this = $(this),
		$divClicked = $('div.clicked');

	var targetCardSuit = $this.attr('value').slice(-1),
		targetCardNumber = parseInt($this.attr('value')),
		clickedCardNumber = parseInt($divClicked.attr('value')),
		clickedCurrentCard = $divClicked.attr('value'),
		clickedCardSuit = clickedCurrentCard.slice(-1);

	if (clickedCardNumber == (targetCardNumber + 1) && clickedCardSuit == targetCardSuit) {
		var empty = false, //false because the target is not empty, needed for parameter order
			stored = true; //used to pass to the moveCard function to fix the positioning of the cards, ie no stacking
		moveCard($divClicked, $this, empty, stored);
		console.log('rat');
		checkForWin();					
	} 
});

$unflippedCards.click(function(event) {
	var $this = $(this),
		$divClicked = $('div.clicked');
	$divClicked.removeClass('clicked');
	
	undoCardColumnArray = twoDimArrayCopy(cardColumnArray);

	if ($this.hasClass('empty')) { //if the unflipped card stack is empty, it moves all the remaining flipped cards back in and flips them over again
		$this.removeClass('empty');
		var count = 1,
			unflippedCardsPosObject = $unflippedCards.offset();

		while (cardColumnArray[flippedIndex].length > 0) {
			var cardToMove = cardColumnArray[flippedIndex].pop(),
				$cardToMove = $('div.card[value=' + cardToMove + ']');

			$cardToMove.prependTo($('#' + possibleCardLocations[unflippedIndex]));
			$cardToMove.removeClass('flipped')
				.addClass('unflipped')
				.removeClass('cantClick')
				.text('')
				.css({'z-index': count, 
					'top': unflippedCardsPosObject.top,
					'left': unflippedCardsPosObject.left
				});

			if ($cardToMove.hasClass('ui-draggable')) {
				$cardToMove.draggable('destroy');
			}

			setUnflippedImage($cardToMove);
			cardColumnArray[unflippedIndex].push(cardToMove);
			count++;
		}
	} else {
		event.stopPropagation(); //stops the click being continued on, this is to keep the cards from being clicked as they are drawn
		var cardsToDraw = oneCardDraw ? 1 : 3,
			flippedCardsPosObject = $flippedCards.offset();

		
		if (!oneCardDraw) {
			var	$currentlyFlippedCards = $flippedCards.children();

			$currentlyFlippedCards.each(function() {
				var $eachThis = $(this);
				$eachThis.css({'left': flippedCardsPosObject.left + (cardsToDraw - 1) * threeDrawCardSpacing})
					.removeClass('clicked')
					.addClass('cantClick');
				if ($eachThis.hasClass('ui-draggable')) {
					$eachThis.draggable('destroy');
				}
			});		
		}
		if (cardColumnArray[unflippedIndex].length < 3 && !oneCardDraw) {
			cardsToDraw = cardColumnArray[unflippedIndex].length;
		}

		for (var i = 0; i < cardsToDraw; i++) {
			console.log('hairy monkey');
			var	cardToFlip = cardColumnArray[unflippedIndex].pop(), //the card value for the card to flip
				$cardToFlip = $('div.card[value=' + cardToFlip + ']'); //determines the card to flip
			$cardToFlip.appendTo($('#' + possibleCardLocations[flippedIndex])); //appends the card to the flipped card stack
			
			var zIndex = cardColumnArray[flippedIndex].length; //sets z-index to how many cards in the flipped index

			$cardToFlip.removeClass('unflipped')
				.addClass('flipped')
				.css({'z-index': zIndex,
					'top': flippedCardsPosObject.top,
					'left': flippedCardsPosObject.left + (cardsToDraw - 1 - i) * (threeDrawCardSpacing)
				});

			if (cardsToDraw == 1 && !oneCardDraw) {
				var $prevCard = $cardToFlip.prev();
				$prevCard.animate({ 'left': flippedCardsPosObject.left + threeDrawCardSpacing }, 200);
			}

			if (!oneCardDraw){
				if (i == cardsToDraw - 1) {
					$cardToFlip.addClass('clicked');
					setDraggable($cardToFlip);
				} else {
					$cardToFlip.addClass('cantClick');
				}
			} else {
				$cardToFlip.addClass('clicked');
				setDraggable($cardToFlip);
			}
			
			
			setCardImage($cardToFlip); 					
			cardColumnArray[flippedIndex].push(cardToFlip); //moves the card to the right column in the game array
				
			if (cardColumnArray[unflippedIndex].length == 0) { //if no more cards, set it as empty
				$('#unflippedCards').addClass('empty');				
			}
		}
	}
	updateCardCounter();
});

$(window).resize(function() {

	// ADD SOMETHING TO ACCOUNT FOR 3 CARD DRAW POSITIONS
	$('div.card').each(function() {
		var $this = $(this),
			$parent = $this.parent(),
			parentId = $parent.attr('id'),
			parentPosObject = $parent.offset(),
			$previousSiblings = $this.prevAll()
			numberOfPrevSibs = $previousSiblings.length;

	if (parentId == 'unflippedCards' || parentId == 'flippedCards' || /^stored/.test(parentId)) {
		$this.css({'left': parentPosObject.left, 'top': parentPosObject.top});
	} else if (/^column/.test(parentId)) {
		$this.css({'left': parentPosObject.left, 'top': parentPosObject.top + cardSpacing*numberOfPrevSibs});
	}

	setCardCounterPosition($unflippedCards, $unflippedCardCounter);
	});
});

/*
============================================ FUNCTIONS ===================================================
*/

function shuffleDeck() {
	var tempCardArray = [],
		tempGameCardArray = [];
	
	tempCardArray = twoDimArrayCopy(staticCardArray); //creates a temporary that be used to shuffle the deck

	while (tempGameCardArray.length < 52) { 
		var suitIndex = Math.floor(Math.random() * tempCardArray.length), //random suit
			cardIndex = Math.floor(Math.random() * tempCardArray[suitIndex].length), //random card from that suit
			cardToAdd = tempCardArray[suitIndex].splice(cardIndex, 1); //removes a card from temp array
		
		cardToAdd = cardToAdd[0]; //if not included, each entry is an array of 1, converts to just a value
		
		if (tempCardArray[suitIndex].length == 0) {
			tempCardArray.splice(suitIndex, 1);	 //if the suit is empty, remove the suit from the array		
		}
		tempGameCardArray.push(cardToAdd); //temporary card order for the game
	}
	return tempGameCardArray;
}

function arrayCopy(oldArray) { //copies one array to another
	var targetArray = [];
	targetArray = oldArray.slice();
	
	return targetArray;
}

function twoDimArrayCopy(oldArray) { //copies one two-dim array to another
	var targetArray = new Array();
	
	for(var i = 0; i < oldArray.length; i++) {
	    targetArray.push(oldArray[i].slice());
	}
	
	return targetArray;
}

function determineClassOfCardToSuitColor(currentCard) {
	var suit = currentCard.slice(-1); //removes the last part of the current card value to determines its suit
	
	if (suit == 'H' || suit == 'D') {
		return 'red';
	} else if (suit == 'C' || suit == 'S') {
		return 'black';
	}
}

function layoutCardsForNewGame() {
	clearCardsFromBoard(); //removes current cards from the boardc
	var counter = 0;
	console.log(gameCardArray);
	var $unflippedCardCounter = $('#unflippedCardCounter'),
		$flippedCards = $('#flippedCards');
	while (gameCardArray.length > 0) {
		var $cardDiv = $('<div class="card"></div>'),
			currentCard = gameCardArray.pop()
			currentCardNumber = parseInt(currentCard);
		$cardDiv.attr('value', currentCard);
		var suitColor = determineClassOfCardToSuitColor(currentCard);
		$cardDiv.addClass(suitColor)
			.addClass(currentCardNumber + suitColor);

		switch (counter) {
			case 0:
			case 2:
			case 5:
			case 9:
			case 14:
			case 20:
			case 27: 	
				var flippedStatus = 'flipped', //if in the game field and the last cards in the stack, they're bottom and flipped
					bottomStatus = 'bottom';
				break;
			default: 	
				var flippedStatus = 'unflipped', //if not flipped, they're unflipped
					bottomStatus = '';
				break;
		}

		switch (counter) {
			case 0:
			case 1:
			case 3:
			case 6:
			case 10:
			case 15:
			case 21:
			case 28: 	
				var columnCounter = 0; //if the starting card for each counter, it sets the columnCounter back to 0, ie o for each stack
				break;
		}
		if (flippedStatus == 'unflipped') {
			setUnflippedImage($cardDiv);
		}
		$cardDiv.addClass(flippedStatus)
			.addClass(bottomStatus)
			.addClass('unscored');
		
		var columnIndex = 0;
		
		if (counter < 1) { //sets the column index for the cards
			columnIndex = 0;
		} else if (counter < 3) {
			columnIndex = 1;
		} else if (counter < 6) {
			columnIndex = 2;
		} else if (counter < 10) {
			columnIndex = 3;
		} else if (counter < 15) {
			columnIndex = 4;
		} else if (counter < 21) {
			columnIndex = 5;
		} else if (counter < 28) {
			columnIndex = 6;
		} else {
			columnIndex = 7;
		}
		
		var $cardLocationInDOM = $('#' + possibleCardLocations[columnIndex]);
		
		$cardDiv.attr('id', currentCard);
		$cardLocationInDOM.append($cardDiv);
		
		var posObject = $cardLocationInDOM.offset(), //files the position of the card stack base
			$cardInDOM = $('#' + currentCard);
		
		if (columnIndex < 7) { //if in the game field, stack the cards on top of each other depending on its counter
			$cardInDOM.css({top: posObject.top + cardSpacing*columnCounter});
		}
		$cardInDOM.css({'z-index': columnCounter});
		
		if (columnIndex != unflippedIndex && $cardInDOM.hasClass('flipped')) { //if it's not the unflipped section, make them draggable
			setDraggable($cardInDOM);
		} 
		cardColumnArray[columnIndex].push(currentCard); //add card to the card column array in the right column
		counter++;
		columnCounter++;
		cashMoney = 0; //restarts the money total
		
		updateCardCounter(); //updates the counter for the number of cards in the stack at the time of new game
		updateCashMoney(cashMoney);
	}
	undoCardColumnArray = twoDimArrayCopy(cardColumnArray);
	console.log(cardColumnArray);

	var $flippedCards = $('div.flipped');
 	$flippedCards.each(function() {
		var $this = $(this);
		setCardImage($this);
	});	
		
	if (firstTimeLoad) {
		firstTimeLoad = false;
		doConfirmBox = true;
	}
}

function setCardImage($card) {
	var cardNumber = parseInt($card.attr('value')),
		cardSuit = $card.attr('value').slice(-1), //adds the value of the card to the text to make it identifible until the image is put in
		suitIndex = cardPictureOrder.indexOf(cardSuit);

	$card.text($card.attr('value'));
	$card.css({'background': 'url("images/cards1066.png") ' + -cardWidth*(cardNumber-1) + 'px ' + -cardHeight * (suitIndex)+ 'px'});
}

function clearCardsFromBoard() { //empties the three arrays where cards could be then resets the card column array
	$('#cardsArea').children().empty(); 
	$('#unplayedCards').children().empty();
	$('#storedCards').children().empty();
	
	cardColumnArray = [[],[],[],[],[],[],[], [], [],  [],[],[],[]]; 
}

function popUpConfirmBox() {
	var $confirmBox = $('#confirmBox');
	$confirmBox.show();
	$('#acceptConfirmation').focus();

	var width = $confirmBox.width(),
		pageWidth = $body.width(),
		pageHeight = $('#page').height(),
		confirmBoxHeight = $confirmBox.height();
	
	$confirmBox.css({'top': (pageHeight - confirmBoxHeight)/2, 'left': (pageWidth - width)/2}); //puts boxes in the middle of the page
}

function determineSuitColor($card) {
	if ($card.hasClass('red')) {
		return 'red';
	} else if ($card.hasClass('black')) {
		return 'black';
	}
}

function moveCard($divClicked, $this, empty, stored) {
	undoCardColumnArray = twoDimArrayCopy(cardColumnArray);

	if ($divClicked[1]) { //if divClicked is an array with at least 2 cards... do this shit
		var $previousCard = $divClicked[0].prev();

		if (!$previousCard.length) {
			$divClicked[0].parent().addClass('empty');
		}

		var clickedColumnIndex = possibleCardLocations.indexOf($divClicked[0].parent().attr('id')),
			indexOfClicked = cardColumnArray[clickedColumnIndex].indexOf($divClicked[0].attr('value'));
		
		var targetColumnID = empty ? $this.attr('id') : $this.parent().attr('id'), //if empty then the clicked is the parent already, if not then you need the parent
			targetColumnIndex = possibleCardLocations.indexOf(targetColumnID);

		for (var i = 0; i < $divClicked.length; i++) { //goes through each card to move
			var cardToMove = cardColumnArray[clickedColumnIndex].splice(indexOfClicked, 1);
			
			cardToMove = cardToMove[0]; //turns the array of 1 into a single value
			cardColumnArray[targetColumnIndex].push(cardToMove);

			var posObjectOfTarget = $this.offset(),
				startPos = $divClicked[i].offset(),
				extraDistance = cardSpacing * (1 + i); //extra spacing distance in top depending on which card it is

			if (empty) {
				extraDistance = cardSpacing * i; //if empty, then first card is in same position as the target
				$this.append($divClicked[i]); //again if empty, you don't want to find the parent first thing
				$this.removeClass('empty');
			} else {
				$this.parent().append($divClicked[i]);
				$this.removeClass('bottom');
			}
			
			if (i == $divClicked.length - 1) {
				$divClicked[i].addClass('bottom');
			}

			var zIndex = $divClicked[i].prevAll().length;

			$divClicked[i].css({top: startPos.top, left: startPos.left, 'z-index': zIndex});//REASON: this keeps the card from being moved from the top corner of the page
			$divClicked[i].animate({top: posObjectOfTarget.top + extraDistance, 
				left: posObjectOfTarget.left}, 
				300
			);
		}
	} else {
		var posObjectOfTarget = $this.offset(),
			startPos= $divClicked.offset(),
			extraDistance = cardSpacing;
		
		if (empty || stored) { //if empty or stored, the extradistance is nothing
			extraDistance = 0;
		}
		
		var clickedColumnIndex = possibleCardLocations.indexOf($divClicked.parent().attr('id')),
			cardToMove= cardColumnArray[clickedColumnIndex].pop();
	
		var targetColumnID = empty ? $this.attr('id') : $this.parent().attr('id'),
			targetColumnIndex = possibleCardLocations.indexOf(targetColumnID);
		
		cardColumnArray[targetColumnIndex].push(cardToMove);

		var $previousCard = $divClicked.prev();
		
		if ($previousCard.hasClass('cantClick')) {
			$previousCard.removeClass('cantClick');
			$previousCard.prev().andSelf().animate({'left': '-=' + threeDrawCardSpacing}, 200);
			setDraggable($previousCard);
		}

		if (!$previousCard.length) { //essentially if there is no previous card, then the stack will be empty after, therefore, add the empty class
			$divClicked.parent().addClass('empty');
		}

		if (empty) {
			$this.append($divClicked);
			$this.removeClass('empty');
		} else {
			$this.after($divClicked);
			$this.removeClass('bottom');
		}
		$divClicked.addClass('bottom');

		var zIndex = $divClicked.prevAll().length;
		zIndex = stored ? zIndex + 30 : zIndex;

		$divClicked.css({top: startPos.top, left: startPos.left, 'z-index': zIndex});
		$divClicked.animate({top: posObjectOfTarget.top + extraDistance, 
			left: posObjectOfTarget.left}, 
			300
		);
		
	}
	console.log(undoCardColumnArray);
	console.log(cardColumnArray);
	
	if (stored && $divClicked.hasClass('unscored')) {
		cashMoney += cashMoneyPerCard;
		updateCashMoney(cashMoney);
	}

	if (stored) {
		$divClicked.removeClass('bottom')
			.removeClass('unscored')
			.addClass('stored');
	}

	if ($previousCard.hasClass('unflipped')) { //if previous card was unflipped, you flip it and set it to bottom
		$previousCard.removeClass('unflipped')
			.addClass('flipped')
			.addClass('bottom');
		setCardImage($previousCard);
		setDraggable($previousCard);
	} else if ($previousCard.hasClass('flipped') && !$previousCard.hasClass('bottom')) { //if flipped and not bottom, set to bottom
		$previousCard.addClass('bottom');
	} 
}

function handleMultiCardMove($divClicked, $this, empty) {
	var cardsBelow = [];

	$divClicked.nextAll().andSelf().each(function() { //creates an array of all the cards below and including the card in the stack
		var $thisEach = $(this);
		cardsBelow.push($thisEach);
	});
	
	cardsBelow = $.makeArray(cardsBelow); //turns it into a true useable array
	moveCard(cardsBelow, $this, empty);
}

function handleDragMoves($draggedThis, $eachThis, empty, stored) {
	var eachThisPosObject = $eachThis.offset(),
		eachThisWidth = $eachThis.width(),
		eachThisHeight = $eachThis.height();

	if (event.pageX >= eachThisPosObject.left && event.pageX <= (eachThisPosObject.left + eachThisWidth) 
		 && event.pageY >= eachThisPosObject.top && event.pageY <= (eachThisPosObject.top + eachThisHeight)) {
					
		if (empty && stored) {
			moveCard($draggedThis, $eachThis, empty, stored);
			$draggedThis.css({'z-index': 30}); 	
		} else if (empty && !stored) {
			if (!$draggedThis.hasClass('bottom') && $draggedThis.parent().attr('id') != 'flippedCards') {
				handleMultiCardMove($draggedThis, $eachThis, empty);
			} else {
				moveCard($draggedThis, $eachThis, empty);
			} 			
		} else if (!empty && stored) {
			moveCard($draggedThis, $eachThis, empty, stored); 	
		} else {
			if (!$draggedThis.hasClass('bottom') && $draggedThis.parent().attr('id') != 'flippedCards') {
				handleMultiCardMove($draggedThis, $eachThis, empty);
			} else {
				moveCard($draggedThis, $eachThis, empty);
			} 		
		}
	} 
}

function setDraggable($card) {
	$card.draggable({ 
		distance: 15,  
		containment: "#page", 
		scroll: false, 
		start: function() {
			var $draggedThis = $(this);
			DragEvents.dragStart($draggedThis);
		},
		drag: function() {
			var $draggedThis = $(this);
			DragEvents.dragging($draggedThis);
		},
		stop: function(event) {
			var $draggedThis = $(this);
			DragEvents.dragStop(event, $draggedThis);
	  	}
	});
}

function updateCashMoney(cashMoney) {
	var $cashMoney = $('#cashMoney');
	
	$cashMoney.text(cashMoney);
}

function setCardCounterPosition($unflippedCards, $unflippedCardCounter) {
	var unflippedCardsPosObject = $unflippedCards.offset(),
		unflippedCardsHeight = $unflippedCards.height(),
		cardCounterHeight = $unflippedCardCounter.height(),
		cardCounterTop = unflippedCardsPosObject.top + unflippedCardsHeight - cardCounterHeight/2,
		cardCounterLeft = unflippedCardsPosObject.left - cardCounterHeight/2;
	
	$unflippedCardCounter.css({top: cardCounterTop, left: cardCounterLeft, 'line-height': '1.5em'}); //sets position of card counter and centers the number
}

function updateCardCounter() {
	$unflippedCardCounter.text(cardColumnArray[unflippedIndex].length);
}

function setUnflippedImage($card) {
	$card.css({ 'background': "url('images/card_backs/mythosTrimmed82.png') 0px 0px", });
}

function moveCardsToPlayable() {
	if (!oneCardDraw) {
		$flippedCards.children().last().prev().andSelf().each(function(i) {
			var $eachThis = $(this);
			$eachThis.animate({'left': '-=' + threeDrawCardSpacing * (i+1)}, 200);
		});
	}
}

function checkForWin(storedHeartsIndex) {
	var storedHeartsIndex = possibleCardLocations.indexOf('storedHearts');

	if (cardColumnArray[storedHeartsIndex].length == 13 &&
		cardColumnArray[storedHeartsIndex+1].length == 13 &&
		cardColumnArray[storedHeartsIndex+2].length == 13 &&
		cardColumnArray[storedHeartsIndex+3].length == 13
	) {
		var youWinWidth = $youWin.width(),
			pageWidth = $body.width(),
			pageHeight = $('#page').height(),
			youWinHeight = $confirmBox.height();
	
		$youWin.css({'top': (pageHeight - youWinHeight)/2, 'left': (pageWidth - youWinWidth)/2})
			.show();
	}
}