const socket = io();

const messageFormButton = document.querySelector("button");
const messages = document.querySelector("#messages");
const messageTemplate = document.querySelector("#message-template").innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

const autoscroll = () => {
    const lastMessage = messages.lastElementChild;

    const lastMessageStyles = getComputedStyle(lastMessage);
    const lastMessageMargin = parseInt(lastMessageStyles.marginBottom);
    const lastMessageHeight = lastMessage.offsetHeight + lastMessageMargin;

    const visibleHeight = messages.offsetHeight;
    const contentHeight = messages.scrollHeight;
    const scrollOffset = messages.scrollTop + visibleHeight;

    if (contentHeight - lastMessageHeight <= scrollOffset) {
        messages.scrollTop = messages.scrollHeight;
    }
}

socket.on("message", (message) => {
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format("ddd, MMM D, YYYY @ h:mm:ss a")
    });
    messages.insertAdjacentHTML("beforeend", html);
    autoscroll();
});

socket.on("roomData", ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, { room, users });
    document.querySelector("#sidebar").innerHTML = html;
});

document.getElementById("message-form").addEventListener("submit", (event) => {
    event.preventDefault();

    const message = event.target.elements.message;
    if (!message.value) return

    messageFormButton.setAttribute("disabled", "disabled");

    socket.emit("sendMessage", message.value, () => {
        messageFormButton.removeAttribute("disabled");
        message.value = "";
        message.focus();
    });
});

socket.emit("join", { username, room }, (error) => {
    if (error) {
        alert(error);
        location.href = "/"
    }
});