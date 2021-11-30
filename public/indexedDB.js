let db;
const request = indexedDB.open("budget", 1);

request.onupgradeneeded = function(){
    const db = request.result;
    db.createObjectStore("pending", { autoIncrement: true})
};

request.onerror = function(event){
    console.log("An error occured");
};

request.onsuccess = function (event){
    db = event.target.result.result;
    if(navigator.onLine){
        checkDatabase();
    }
};

function saveRecord(record) {
    const transaction = db.transaction(['pending'], 'readwrite');
    const store = transaction.objectStore('pending');
        store.add(record);
};

function checkDatabase(event) {
    const transaction = db.transaction(["pending"], "readwrite");
    const store = transaction.objectStore("pending");
    const getAll = store.getAll();

getAll.onsuccess = function (event) {
    if (getAll.result.length > 0) {
        fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json"
    }
})
    .then(response => response.json())
        .then(() => {
        const transaction = db.transaction(["pending"], "readwrite");
        const store = transaction.objectStore("pending");
        store.clear();
    });
}
};
}

window.addEventListener("online", checkDatabase);
