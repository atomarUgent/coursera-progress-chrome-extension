var className = document.location.pathname.split("/")[1];

var port = chrome.runtime.connect({name: "coursera_progress"});
port.onMessage.addListener(function(msg) {
  if (msg["data"]) {
    updatePage(msg["data"]);
  }
});

// request initial data from background page
port.postMessage({"type": "data", "className": className});


var lessons = document.querySelectorAll(".viewed, .unviewed");


var gray = "color:rgb(221,221,221)";
var green = "color:rgb(0,128,0)";


var updateLesson = function(elem, lessonId, watched) {
  elem.setAttribute("style", watched ? green : gray);
  port.postMessage({
      "type": "update",
      "className": className,
      "lessonId": lessonId,
      "watchedStatus": watched ? 1 : 0});
}


var makeCheckMarkClickHandler = function(lessonId) {
  return function(e) {
    updateLesson(this, lessonId, this.getAttribute("style") == gray);
    return false;
  };
}


var makeLessonClickHandler = function(lessonId) {
  return function(e) {
    // coursera has a "memory" where they prepend 2 icon-ok's on each video link click
    // grab the last one in the list, which should be ours
    var icons = this.parentNode.getElementsByClassName("icon-ok");
    var icon = icons[icons.length-1];
    if (icon.getAttribute("style") == gray) {
      updateLesson(icon, lessonId, /*watched*/ true);
    }
    return false;
  };
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


var updatePage = function(data) {
  for (var i = 0; i < lessons.length; i++) {
    var lesson = lessons[i];
    var watched = true;
    if (lesson.className.match("unviewed")) {
      var span = document.createElement("span");
      span.className = "icon-ok";
      span.setAttribute("style", gray);
      lesson.insertBefore(span, lesson.firstChild);
      watched = data[i] && (data[i].watchedStatus == 1);
    } else if (data[i] && data[i].watchedStatus != 1) {
      watched = false;
    }
    updateLesson(lesson.firstChild, i, watched);
    lesson.getElementsByTagName("a")[0].addEventListener(
        "click", makeLessonClickHandler(i));
    lesson.firstChild.addEventListener("click", makeCheckMarkClickHandler(i));
  }
  updateFolds(data);
};
