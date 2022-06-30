// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.8.1/firebase-app.js";
import { getDatabase, ref, set, child, update, remove, onChildAdded, onValue } from "https://www.gstatic.com/firebasejs/9.8.1/firebase-database.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDgniABQHVceHDMps1ywFc45xOxtXJT2rM",
    authDomain: "realtime-view-counter-ee3f7.firebaseapp.com",
    projectId: "realtime-view-counter-ee3f7",
    storageBucket: "realtime-view-counter-ee3f7.appspot.com",
    messagingSenderId: "924791803978",
    appId: "1:924791803978:web:50449ecf81f3b4034e56b3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase();
const url = 'https://api.ipgeolocation.io/getip';
fetch(url)
    .then(res => res.json())
    .then(out => getip(out))
    .catch(err => console.log(err));

function getip(json) {
    const viewers_ip = json.ip;
    console.log(viewers_ip);
    //count view with ip
    count_view(viewers_ip);
}

function count_view(viewers_ip) {
    var views, keys = [];
    var ip_to_string = viewers_ip.toString();

    for (var i = 0; i < ip_to_string.length; i++) {
        ip_to_string = ip_to_string.replace(".", "-");
    }

    set(ref(db, "page_views/" + ip_to_string), {
        viewers_ip: viewers_ip,
    });

    onValue(ref(db, "page_views"), (snapshot) => {
        snapshot.forEach(item => {
            var itemVal = item.val();
            keys.push(itemVal.viewers_ip);
        })
        console.log(keys.length);
        views = keys.length;
        document.getElementById("view_count_text").innerHTML = views;
    })
}