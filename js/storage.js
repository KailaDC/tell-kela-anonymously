
import { db, auth } from "./firebase-config.js";

import {
    collection,
    onSnapshot,
    doc,
    updateDoc,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

const ADMIN_UID = "2zwgyC1WJTfvC7BMsesV6F8AvcQ2";

const grid = document.getElementById("envelopeGrid");
const search = document.getElementById("search");
const sort = document.getElementById("sort");
const total = document.getElementById("total");

const modal = document.getElementById("letterModal");
const backdrop = document.getElementById("modalBackdrop");
const closeModal = document.getElementById("closeModal");
const closeLetter = document.getElementById("closeLetter");
const letterContent = document.getElementById("letterContent");
const letterDate = document.getElementById("letterDate");
const deleteButton = document.getElementById("deleteMessage");
const logoutButton = document.getElementById("logoutButton");

let messages = [];
let unsubscribeMessages = null;
let selectedMessage = null;
let loggingOut = false;

// LOGOUT
logoutButton.addEventListener("click", async () => {
    if (loggingOut) return;

    const confirmed = confirm(
        "Are you sure you want to leave your archive?"
    );

    if (!confirmed) return;

    loggingOut = true;
    logoutButton.disabled = true;
    logoutButton.textContent = "Logging out...";

    try {
        await signOut(auth);

        window.location.replace("login.html");
    } catch (error) {
        console.error("Logout failed:", error);

        alert("Logout gagal. Silakan coba lagi.");

        loggingOut = false;
        logoutButton.disabled = false;
        logoutButton.textContent = "Log out ↗";
    }
});

function closeLetterModal() {
    modal.hidden = true;
    document.body.classList.remove("modal-open");
    selectedMessage = null;
}

function openLetter(message) {
    selectedMessage = message;

    document.getElementById("letterTitle").textContent =
        "A message for Kela";

    letterContent.textContent = message.text;

    letterDate.textContent = message.date.toLocaleString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });

    modal.hidden = false;
    document.body.classList.add("modal-open");
    closeModal.focus();

    if (!message.read) {
        updateDoc(doc(db, "confessions", message.id), {
            read: true
        }).catch(error => {
            console.error("Failed to update read status:", error);
        });
    }
}

function renderMessages() {
    const keyword = search.value.toLowerCase().trim();

    const filtered = messages.filter(message =>
        message.text.toLowerCase().includes(keyword)
    );

    if (sort.value === "newest") {
        filtered.sort((a, b) => b.date - a.date);
    } else if (sort.value === "oldest") {
        filtered.sort((a, b) => a.date - b.date);
    } else if (sort.value === "unread") {
        filtered.sort((a, b) => Number(a.read) - Number(b.read));
    }

    total.textContent = `${filtered.length} envelopes`;
    grid.replaceChildren();

    if (filtered.length === 0) {
        const empty = document.createElement("p");
        empty.className = "empty";
        empty.textContent = keyword
            ? "No letters found."
            : "Your archive is waiting for its letters.";

        grid.appendChild(empty);
        return;
    }

    filtered.forEach(message => {
        const button = document.createElement("button");
        button.className = "letter";
        button.type = "button";
        button.setAttribute("aria-label", "Open anonymous letter");

        const envelope = document.createElement("span");
        envelope.className = "envelope";

        if (!message.read) {
            const tag = document.createElement("span");
            tag.className = "new-tag";
            tag.textContent = "NEW";
            envelope.appendChild(tag);
        }

        const seal = document.createElement("span");
        seal.className = "seal";
        seal.textContent = "✦";
        envelope.appendChild(seal);

        const date = document.createElement("span");
        date.className = "letter-date";
        date.textContent = message.date.toLocaleString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });

        button.append(envelope, date);
        button.addEventListener("click", () => openLetter(message));

        grid.appendChild(button);
    });
}

search.addEventListener("input", renderMessages);
sort.addEventListener("change", renderMessages);

closeModal.addEventListener("click", closeLetterModal);
closeLetter.addEventListener("click", closeLetterModal);
backdrop.addEventListener("click", closeLetterModal);

document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !modal.hidden) {
        closeLetterModal();
    }
});

deleteButton.addEventListener("click", async () => {
    if (!selectedMessage) return;

    const confirmed = confirm(
        "Delete this letter permanently? This cannot be undone."
    );

    if (!confirmed) return;

    deleteButton.disabled = true;

    try {
        await deleteDoc(doc(db, "confessions", selectedMessage.id));
        closeLetterModal();
    } catch (error) {
        console.error("Delete failed:", error);
        alert("Pesan gagal dihapus. Periksa Firestore Rules.");
    } finally {
        deleteButton.disabled = false;
    }
});

onAuthStateChanged(auth, async user => {
    if (!user || user.uid !== ADMIN_UID) {
        if (unsubscribeMessages) {
            unsubscribeMessages();
            unsubscribeMessages = null;
        }

        messages = [];
        grid.replaceChildren();

        if (user) {
            await signOut(auth);
        }

        window.location.replace("login.html");
        return;
    }

    if (unsubscribeMessages) return;

    unsubscribeMessages = onSnapshot(
        collection(db, "confessions"),
        snapshot => {
            messages = snapshot.docs.map(item => {
                const data = item.data();

                return {
                    id: item.id,
                    text: data.message || "",
                    date: data.createdAt?.toDate() || new Date(),
                    read: data.read === true
                };
            });

            renderMessages();

            if (
                selectedMessage &&
                !messages.some(item => item.id === selectedMessage.id)
            ) {
                closeLetterModal();
            }
        },
        error => {
            console.error("Failed to load messages:", error);

            grid.replaceChildren();

            const notice = document.createElement("p");
            notice.className = "empty";
            notice.textContent =
                "Messages could not be loaded. Check your login and Firestore Rules.";

            grid.appendChild(notice);
        }
    );
});
