document.addEventListener("DOMContentLoaded", function () {
  // Use buttons to toggle between views
  document
    .querySelector("#inbox")
    .addEventListener("click", () => load_mailbox("inbox"));
  document
    .querySelector("#sent")
    .addEventListener("click", () => load_mailbox("sent"));
  document
    .querySelector("#archived")
    .addEventListener("click", () => load_mailbox("archive"));
  document.querySelector("#compose").addEventListener("click", compose_email);

  //submitting a mail
  document
    .querySelector("#compose-form")
    .addEventListener("submit", send_email);

  // By default, load the inbox
  load_mailbox("inbox");
});

function compose_email() {
  // Show compose view and hide other views
  document.querySelector("#emails-view").style.display = "none";
  document.querySelector("#compose-view").style.display = "block";

  // Clear out composition fields
  document.querySelector("#compose-recipients").value = "";
  document.querySelector("#compose-subject").value = "";
  document.querySelector("#compose-body").value = "";
}

function load_mailbox(mailbox) {
  // Show the mailbox and hide other views
  document.querySelector("#emails-view").style.display = "block";
  document.querySelector("#compose-view").style.display = "none";

  // Show the mailbox name
  document.querySelector("#emails-view").innerHTML = `<h3>${
    mailbox.charAt(0).toUpperCase() + mailbox.slice(1)
  }</h3>`;

  // show emails for mailbox
  fetch(`/emails/${mailbox}`)
    .then((response) => response.json())
    .then((emails) => {
      emails.forEach((email) => {
        //createing clickable layer
        const newEmail = document.createElement("a");
        newEmail.className = "single-email";
        newEmail.href = "#";
        //creating element that will contain the sender and the subject
        const senderSection = document.createElement("div");
        senderSection.className = "senderSection";
        //content of the row
        const sender = document.createElement("h4");
        const subject = document.createElement("p");
        const timestamp = document.createElement("p");
        //assigning the values to each row
        sender.innerHTML = `${email.sender}`;
        subject.innerHTML = `${email.subject}`;
        timestamp.innerHTML = `${email.timestamp}`;

        //appending divs within eachother
        senderSection.appendChild(sender);
        senderSection.appendChild(subject);
        newEmail.appendChild(senderSection);
        newEmail.appendChild(timestamp);

        newEmail.addEventListener("click", function () {
          console.log("This element has been clicked!");
        });

        document.querySelector("#emails-view").append(newEmail);
      });
    });
}

const send_email = (event) => {
  event.preventDefault();
  // getting data from the form
  const recipients = document.querySelector("#compose-recipients").value;
  const subject = document.querySelector("#compose-subject").value;
  const body = document.querySelector("#compose-body").value;

  //sending data to the API
  fetch("/emails", {
    method: "POST",
    body: JSON.stringify({
      recipients: recipients,
      subject: subject,
      body: body,
    }),
  })
    .then((response) => response.json())
    .then((result) => {
      console.log(result);
      load_mailbox("sent");
    });
};
