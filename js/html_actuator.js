////////////////////////////////
// From http://stackoverflow.com/questions/5448545/how-to-retrieve-get-parameters-from-javascript

function getSearchParameters() {
      var prmstr = decodeURI(window.location.search.substr(1)).replace(/\+/g, " ");
      return prmstr != null && prmstr != "" ? transformToAssocArray(prmstr) : {};
}

function transformToAssocArray( prmstr ) {
    var params = {};
    var prmarr = prmstr.split("&");
    for ( var i = 0; i < prmarr.length; i++) {
        var tmparr = prmarr[i].split("=");
        params[tmparr[0]] = tmparr[1];
    }
    return params;
}

var params = getSearchParameters();

// End
////////////////////////////////

function HTMLActuator() {
  this.tileContainer    = document.querySelector(".tile-container");
  this.scoreContainer   = document.querySelector(".score-container");
  this.bestContainer    = document.querySelector(".best-container");
  this.messageContainer = document.querySelector(".game-message");

  this.score = 0;

  document.querySelector(".title").textContent = params.t;
  document.querySelector(".tile-name").textContent = params.v2048;

  if (params.t && params.t !== undefined) {
    document.querySelector(".var-t")     .value = params.t;
    document.querySelector(".var-v1")    .value = params.v1;
    document.querySelector(".var-v2")    .value = params.v2;
    document.querySelector(".var-v3")    .value = params.v3;
    document.querySelector(".var-v4")   .value = params.v4;
    document.querySelector(".var-v5")   .value = params.v5;
    document.querySelector(".var-v6")   .value = params.v6;
    document.querySelector(".var-v7")  .value = params.v7;
    document.querySelector(".var-v8")  .value = params.v8;
    document.querySelector(".var-v9")  .value = params.v9;
    document.querySelector(".var-v10") .value = params.v10;
    document.querySelector(".var-v11") .value = params.v11;
    document.querySelector(".var-v12") .value = params.v12;
    document.querySelector(".var-m")     .value = params.m;
    document.querySelector(".var-w")     .value = params.w;
    document.querySelector(".var-o")     .value = params.o;
  } else {
    document.querySelector(".var-form").submit();
  }
}

HTMLActuator.prototype.actuate = function (grid, metadata) {
  var self = this;

  window.requestAnimationFrame(function () {
    self.clearContainer(self.tileContainer);

    grid.cells.forEach(function (column) {
      column.forEach(function (cell) {
        if (cell) {
          self.addTile(cell);
        }
      });
    });

    self.updateScore(metadata.score);
    self.updateBestScore(metadata.bestScore);

    if (metadata.terminated) {
      if (metadata.over) {
        self.message(false); // You lose
      } else if (metadata.won) {
        self.message(true); // You win!
      }
    }

  });
};

// Continues the game (both restart and keep playing)
HTMLActuator.prototype.continue = function () {
  this.clearMessage();
};

HTMLActuator.prototype.clearContainer = function (container) {
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
};

HTMLActuator.prototype.addTile = function (tile) {
  var self = this;

  var wrapper   = document.createElement("div");
  var inner     = document.createElement("div");
  var position  = tile.previousPosition || { x: tile.x, y: tile.y };
  var positionClass = this.positionClass(position);

  // We can't use classlist because it somehow glitches when replacing classes
  var classes = ["tile", "tile-" + tile.value, positionClass];

  if (tile.value > 12) classes.push("tile-super");

  this.applyClasses(wrapper, classes);

  inner.classList.add("tile-inner");

       if (tile.value == 1   ) inner.textContent = params.v1
  else if (tile.value == 2   ) inner.textContent = params.v2
  else if (tile.value == 3   ) inner.textContent = params.v3
  else if (tile.value == 4  ) inner.textContent = params.v4
  else if (tile.value == 5  ) inner.textContent = params.v5
  else if (tile.value == 6  ) inner.textContent = params.v6
  else if (tile.value == 7 ) inner.textContent = params.v7
  else if (tile.value == 8 ) inner.textContent = params.v8
  else if (tile.value == 9 ) inner.textContent = params.v9
  else if (tile.value == 10) inner.textContent = params.v10
  else if (tile.value == 11) inner.textContent = params.v11
  else if (tile.value == 12) inner.textContent = params.v12
  else                         inner.textContent = params.m;

       if (inner.textContent.length > 4) inner.classList.add("tile-len-5")
  else if (inner.textContent.length > 3) inner.classList.add("tile-len-4")
  else if (inner.textContent.length > 2) inner.classList.add("tile-len-3")
  else                                   inner.classList.add("tile-len-2");

  if (tile.previousPosition) {
    // Make sure that the tile gets rendered in the previous position first
    window.requestAnimationFrame(function () {
      classes[2] = self.positionClass({ x: tile.x, y: tile.y });
      self.applyClasses(wrapper, classes); // Update the position
    });
  } else if (tile.mergedFrom) {
    classes.push("tile-merged");
    this.applyClasses(wrapper, classes);

    // Render the tiles that merged
    tile.mergedFrom.forEach(function (merged) {
      self.addTile(merged);
    });
  } else {
    classes.push("tile-new");
    this.applyClasses(wrapper, classes);
  }

  // Add the inner part of the tile to the wrapper
  wrapper.appendChild(inner);

  // Put the tile on the board
  this.tileContainer.appendChild(wrapper);
};

HTMLActuator.prototype.applyClasses = function (element, classes) {
  element.setAttribute("class", classes.join(" "));
};

HTMLActuator.prototype.normalizePosition = function (position) {
  return { x: position.x + 1, y: position.y + 1 };
};

HTMLActuator.prototype.positionClass = function (position) {
  position = this.normalizePosition(position);
  return "tile-position-" + position.x + "-" + position.y;
};

HTMLActuator.prototype.updateScore = function (score) {
  this.clearContainer(this.scoreContainer);

  var difference = score - this.score;
  this.score = score;

  this.scoreContainer.textContent = this.score;

  if (difference > 0) {
    var addition = document.createElement("div");
    addition.classList.add("score-addition");
    addition.textContent = "+" + difference;

    this.scoreContainer.appendChild(addition);
  }
};

HTMLActuator.prototype.updateBestScore = function (bestScore) {
  this.bestContainer.textContent = bestScore;
};

HTMLActuator.prototype.message = function (won) {
  var type    = won ? "game-won" : "game-over";
  var message = won ? params.w : params.o;

  this.messageContainer.classList.add(type);
  this.messageContainer.getElementsByTagName("p")[0].textContent = message;
};

HTMLActuator.prototype.clearMessage = function () {
  // IE only takes one value to remove at a time.
  this.messageContainer.classList.remove("game-won");
  this.messageContainer.classList.remove("game-over");
};
