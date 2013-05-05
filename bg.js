var extension_name = "coursera_progress";

if (!chrome.storage.sync[extension_name]) {
  chrome.storage.sync[extension_name] = {};
}

chrome.runtime.onConnect.addListener(function(port) {
  console.assert(port.name == extension_name);
  port.onMessage.addListener(function(msg) {
    var store = chrome.storage.sync.coursera_progress[msg.className];
    if (msg["type"] == "data") {
      port.postMessage({"data": store ? store : []});
    } else {
      if (!store) {
        store = [];
        chrome.storage.sync.coursera_progress[msg.className] = store;
      }
      if (!store[msg.lessonId]) store[msg.lessonId] = {};
      store[msg.lessonId]["watchedStatus"] = msg["watchedStatus"];
    }
  });
});
