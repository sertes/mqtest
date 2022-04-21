// script.js

// TODO: validate year_from less than year_to
// TODO: load year_from and year to from data

window.addEventListener("load", function () {
    console.log("page loaded");

    const DB_NAME = "store";

    fetch("./temperature.json")
        .then((response) => {
            return response.json();
        })
        .then((jsonData) => {
            // init DB
            let openRequest = indexedDB.open(DB_NAME, 1);

            openRequest.onupgradeneeded = (event) => {
                let db = event.target.result;
                console.log("onupgradeneeded. version: ", db.version);
                switch (db.version) {
                    case 0:
                        // init database struct
                        db.createObjectStore("temperature", { keyPath: "t" });
                        db.createObjectStore("precipitation", { keyPath: "t" });
                        console.log("database created");
                        break;
                    default:
                        break;
                }
            };

            openRequest.onerror = (event) => {
                console.error("Error", event.target.result.error);
            };

            openRequest.onsuccess = (event) => {
                const db = event.target.result;
                console.log("connection established", DB_NAME);

                console.log("json data type: ", typeof jsonData);
                console.log("json data length: ", jsonData.length);

                db.onerror = (event) => {
                    console.log("db error", db.error);
                };

                console.log("db object", db);
                const tx = db.transaction(DB_NAME, "readwrite");
                console.log("tx object", tx);
                tx.onabort = function () {
                    console.log("transaction error", tx.error);
                };

                var store = tx.objectStore(DB_NAME);

                store.onerror = function (event) {
                    console.log("store error: ", store.error);
                };

                // Add some data
                jsonData.forEach((element) => {
                    console.log("putting element");
                    store.put(element);
                });

                console.log("store filled");

                // Query the data
                const get1881 = store.getAll(
                    IDBKeyRange.bound("1881-01-01", "1881-12-31", true, true)
                );

                get1881.onsuccess = function () {
                    console.log(get1881.result); // 1881
                };

                // Close the db when the transaction is done
                // tx.oncomplete = function() {
                //     db.close();
                // };

                const deleteRequest = indexedDB.deleteDatabase("store");
                console.log("database deleting...");
                deleteRequest.onerror = function () {
                    console.error("Error", deleteRequest.error);
                };

                deleteRequest.onsuccess = function () {
                    console.log("database deleted");
                    console.log(deleteRequest);
                    console.log(window.indexedDB.databases());
                };
            };
        });
});
