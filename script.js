const CLIENT_ID = "yrnV8gkqWQ3jfjJy";
var members = [];

function getName() {
  var input = prompt(
    "Please input a name between 2 and 12 characters long, or leave empty for a random name:"
  );

  if (input === "") {
    input = getRandomName();
  } else if ((input.length > 0 && input.length < 2) || input.length > 12) {
    alert(
      "Your input is not within specified parameters, please try again, or leave empty for a random name."
    );
    input = getName();
  } else {
    return input;
  }
  return input;
}

function getRandomName() {
  const names = [
    "CaptainAwesome",
    "Baron_Von_Awesome",
    "Mr.Magnificent",
    "Mr.Fabulous",
    "Mr.Wonderful",
    "Mr.Sir",
    "Joker",
    "DragonRider",
    "CltrAltDelicious",
    "BlackWidow",
    "AwkwardCookie",
    "AwesomeUsername",
  ];
  return names[Math.floor(Math.random() * names.length)];
}

function getRandomColor() {
  const colors = [
    "#9f5f80",
    "#ffba93",
    "#c24914",
    "#bedcfa",
    "#16697a",
    "#54e346",
    "#ec5858",
    "#d35d6e",
    "#fecd1a",
    "#393e46",
    "#ffd369",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

const drone = new ScaleDrone(CLIENT_ID, {
  data: {
    name: getName(),
    color: getRandomColor(),
  },
});

drone.on("open", (error) => {
  if (error) {
    return console.error(error);
  }
  console.log("Successfully connected to Scaledrone");

  const room = drone.subscribe("observable-room");
  room.on("open", (error) => {
    if (error) {
      return console.error(error);
    }
    console.log("Successfully joined room");
  });

  room.on("members", (m) => {
    members = m;
    me = members.find((m) => m.id === drone.clientId);
    updateMembers();
  });

  room.on("member_join", (member) => {
    members.push(member);
    updateMembers();
  });

  room.on("member_leave", ({ id }) => {
    const index = members.findIndex((member) => member.id === id);
    members.splice(index, 1);
    updateMembers();
  });

  room.on("data", (text, member) => {
    if (member) {
      addMessage(text, member);
    } else {
      console.log(text);
    }
  });
});

drone.on("close", (event) => {
  console.log("Connection was closed", event);
});

drone.on("error", (error) => {
  console.error(error);
});

const page = {
  user: document.querySelector(".user"),
  membersCount: document.querySelector(".members-count"),
  membersList: document.querySelector(".members-list"),
  messages: document.querySelector(".messages"),
  input: document.querySelector(".form-input"),
  form: document.querySelector(".message-form"),
  emojiButton: document.querySelector(".emoji-button"),
  tooltip: document.querySelector(".tooltip"),
};

page.form.addEventListener("submit", sendMessage);

function sendMessage() {
  const value = page.input.value;
  if (value === "") {
    return;
  }
  page.input.value = "";
  drone.publish({
    room: "observable-room",
    message: value,
  });
}

function newMember(member) {
  const { name, color } = member.clientData;
  const el = document.createElement("div");
  el.appendChild(document.createTextNode(name));
  el.className = "member";
  el.style.color = color;
  return el;
}

function newMessage(text, member) {
  const el = document.createElement("div");
  el.appendChild(newMember(member));
  el.appendChild(document.createTextNode(text));
  el.className = "message";
  return el;
}

function addMessage(text, member) {
  const el = page.messages;
  const top = el.scrollTop === el.scrollHeight - el.clientHeight;
  el.appendChild(newMessage(text, member));
  if (top) {
    el.scrollTop = el.scrollHeight - el.clientHeight;
  }
}

function updateMembers() {
  page.user.innerHTML = "";
  page.user.appendChild(newMember(me));
  page.membersList.innerHTML = "";
  members.forEach((member) => page.membersList.appendChild(newMember(member)));
  if (members.length > 1) {
    return (page.membersCount.innerText = `${members.length} users in room:`);
  } else {
    return (page.membersCount.innerText = `${members.length} user in room:`);
  }
}

function toggle() {
  page.tooltip.classList.toggle("shown");
}

document
  .querySelector("emoji-picker")
  .addEventListener("emoji-click", (event) => {
    document.querySelector(".form-input").value += event.detail.emoji.unicode;
    document.querySelector(".form-input").focus;
  });
