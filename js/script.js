const message = document.getElementById("message");
const count = document.getElementById("count");

if (message && count) {
    message.addEventListener("input", () => {
        const words = message.value.trim()
            ? message.value.trim().split(/\s+/).length
            : 0;

        if (words > 500) {
            const limitedWords = message.value.trim()
                .split(/\s+/)
                .slice(0, 500);

            message.value = limitedWords.join(" ");
        }

        const finalWords = message.value.trim()
            ? message.value.trim().split(/\s+/).length
            : 0;

        count.textContent = finalWords;
    });
}

function sendMessage() {
    const text = message.value.trim();
    const words = text ? text.split(/\s+/).length : 0;

    if (!text) {
        alert("Pesannya belum diisi, ya!");
        return;
    }

    if (words > 500) {
        alert("Pesan maksimal 500 kata!");
        return;
    }

    sessionStorage.setItem("confession", text);
    window.location.href = "success.html";
}
