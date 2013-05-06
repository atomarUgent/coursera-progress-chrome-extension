var extension_name = "coursera_progress";

if (!chrome.storage.sync[extension_name]) {
  chrome.storage.sync[extension_name] = {};
}

chrome.runtime.onConnect.addListener(function(port) {
  console.assert(port.name == extension_name);
  port.onMessage.addListener(function(msg) {
    var store = chrome.storage.sync.coursera_progress[msg.className];
    if (!store) {
      store = {};
      store[msg.sectionName] = [];
      chrome.storage.sync.coursera_progress[msg.className] = store;
    } else if (!store[msg.sectionName]) {
      store[msg.sectionName] = [];
    }
    if (msg["type"] == "data") {
      port.postMessage({"data": store[msg.sectionName]});
    } else {
      if (!store[msg.sectionName][msg.lessonId]) {
        store[msg.sectionName][msg.lessonId] = {};
      }
      store[msg.sectionName][msg.lessonId]["watchedStatus"] = msg["watchedStatus"];
      store[msg.sectionName][msg.lessonId]["timestamp"] = new Date().getTime();
    }
  });
});
