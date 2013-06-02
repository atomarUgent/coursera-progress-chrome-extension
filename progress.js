var url = document.location.pathname.split("/");
var className = url[1];
var sectionName = url.slice(2, url.length).join("/") + document.location.search;


var lessons = document.querySelectorAll(".viewed, .unviewed");


// Watch document.location changes to update watched status when moving
// between videos inside the player
setInterval(function() {
  var path = document.location.pathname.split("/");
  if (path.length == 4) {
    var lessonId = path[3];
    if (path[2] == "lecture" && lessonId != "index") {
      // we're in the player
      var elem = document.querySelector("[data-lecture-id='" + lessonId + "']");
      if (elem) {
        updateCheckmarkFromLesson(elem, true);
        updateLesson(lessonId, true);
      }
    }
  }
}, 5000);


var gray = "color:rgb(221,221,221)";
var green = "color:rgb(0,128,0)";


var updateCheckmark = function(elem, watched) {
  elem.setAttribute("style", watched ? green : gray);
};


var updateLesson = function(lessonId, watched) {
  chrome.storage.sync.get(className, function(store) {
    var progress = {};
    if (store[className]) {
      progress = store[className];
    } else {
      store[className] = progress;
    }
    if (!progress[sectionName]) {
      progress[sectionName] = [];
    }
    progress[sectionName][lessonId] = watched;
    chrome.storage.sync.set(store);
  });
}


var makeCheckMarkClickHandler = function(lessonId) {
  return function(e) {
    var watched = this.getAttribute("style") == gray;
    updateCheckmark(this, watched);
    updateLesson(lessonId, watched);
    return false;
  };
}


var updateCheckmarkFromLesson = function(elem, lessonId) {
  var icon = elem.parentNode.querySelector(".icon-ok[style]");
  if (icon.getAttribute("style") == gray) {
    updateCheckmark(icon, /*watched*/ true)
    updateLesson(lessonId, /*watched*/ true);
  }
}


var updateFold = function(list, header, unwatched) {
  if (unwatched) {
    list.style.display = "block";
    var arrows = header.getElementsByClassName("icon-chevron-right");
    if (arrows.length != 0) {
      arrows[0].className = "icon-chevron-down";
    }
    header.className = header.className.replace("contracted", "expanded");
  } else {
    list.style.display = "none";
    var arrows = header.getElementsByClassName("icon-chevron-down");
    if (arrows.length != 0) {
      arrows[0].className = "icon-chevron-right";
    }
    header.className = header.className.replace("expanded", "contracted");
  }
}


var updateFolds = function(data) {
  var itemList = document.getElementsByClassName("course-item-list-section-list");
  var headerList = document.getElementsByClassName("course-item-list-header");
  for (var i = 0; i < itemList.length; i++) {
    var elem = itemList[i];
    var header = headerList[i];
    var lessons = elem.getElementsByClassName("icon-ok");
    var unwatched = false;
    for (var j = 0; j < lessons.length; j++) {
      if (lessons[j].getAttribute("style") == gray) {
        unwatched = true;
        break;
      }
    }
    updateFold(elem, header, unwatched);
  }
}


// Update the page based on stored data and return that data combined
// with any additional watched status information gathered from the DOM
var updatePage = function(data) {
  if (!data[className]) {
    data[className] = {};
    data[className][sectionName] = {};
  } else if (!data[className][sectionName]) {
    data[className][sectionName] = {};
  }
  for (var i = 0; i < lessons.length; i++) {
    var lesson = lessons[i];
    var lessonId = "" + i;
    var idElem = lessons[i].querySelector("[data-lecture-id]");
    if (idElem) {
      lessonId = idElem.getAttribute("data-lecture-id");
    }
    var watched = true;
    var storedValue = data[className][sectionName][lessonId];
    if (lesson.className.match("unviewed")) {
      var span = document.createElement("span");
      span.className = "icon-ok";
      span.setAttribute("style", gray);
      lesson.insertBefore(span, lesson.firstChild);
      watched = !!storedValue;
    } else if (storedValue != undefined) {
      watched = storedValue;
    }
    data[className][sectionName][lessonId] = watched;
    updateCheckmark(lesson.firstChild, watched);
    lesson.firstChild.addEventListener("click", makeCheckMarkClickHandler(lessonId));
  }
  updateFolds(data);
  return data;
};


chrome.storage.sync.get(null, function(data) {
  var combinedData = updatePage(data);
  if (lessons.length > 0) {  // avoid storing non-lesson pages
    chrome.storage.sync.set(combinedData);
  }
});
