window.onpopstate = function (event) {
  if (event.state === null) {
    load_mailbox("inbox");
  } else if (event.state.section === "compose") {
    compose_email();
  } else {
    load_mailbox(event.state.section);
  }
};
document.addEventListener("DOMContentLoaded", function () {
  // Use buttons to toggle between views
  const inboxBtn = document.querySelector("#inbox");
  inboxBtn.addEventListener("click", () => {
    const section = inboxBtn.dataset.section;
    history.pushState({ section: section }, "", `${section}`);
    load_mailbox(section);
  });
  const sentBtn = document.querySelector("#sent");
  sentBtn.addEventListener("click", () => {
    const section = sentBtn.dataset.section;
    history.pushState({ section: section }, "", `${section}`);
    load_mailbox(section);
  });
  const archivedBtn = document.querySelector("#archived");
  archivedBtn.addEventListener("click", () => {
    const section = archivedBtn.dataset.section;
    history.pushState({ section: section }, "", `${section}`);
    load_mailbox(section);
  });
  document.querySelector("#compose").addEventListener("click", compose_email);

  //submitting a mail
  document
    .querySelector("#compose-form")
    .addEventListener("submit", send_email);

  // By default, load the inbox
  load_mailbox("inbox");
});

function compose_email() {
  const composeBtn = document.getElementById("compose");
  const section = composeBtn.dataset.section;
  history.pushState({ section: section }, "", `${section}`);
  document.querySelector("#emails-view").style.display = "none";
  document.querySelector("#compose-view").style.display = "block";
  document.querySelector("#single-email").style.display = "none";

  // Clear out composition fields
  document.querySelector("#compose-recipients").value = "";
  document.querySelector("#compose-subject").value = "";
  document.querySelector("#compose-body").value = "";
}

function load_mailbox(mailbox) {
  // Show the mailbox and hide other views
  document.querySelector("#emails-view").style.display = "block";
  document.querySelector("#compose-view").style.display = "none";
  document.querySelector("#single-email").style.display = "none";

  // Show the mailbox name
  document.querySelector("#emails-view").innerHTML = `<h3>${
    mailbox.charAt(0).toUpperCase() + mailbox.slice(1)
  }</h3>`;

  // show emails for mailbox
  fetch(`/emails/${mailbox}`)
    .then((response) => response.json())
    .then((emails) => {
      emails.forEach((email) => {
        //getting the email's id
        const singleId = email.id;
        const singleSubject = email.subject;
        const singleSender = email.sender;
        const singleTimestamp = email.timestamp;
        const singleBody = email.body;
        const singleRecipients = email.recipients;
        const singleRead = email.read;

        const archiveDiv = document.createElement("div");
        archiveDiv.className = "archiveDiv d-flex align-items-center";

        const archive = document.createElement("button");
        archive.className = email.archived
          ? "btn-sm btn-light ml-2"
          : "btn-sm btn-dark ml-2";
        archive.innerHTML = email.archived ? "Unarchive" : "Archive";
        archive.type = "submit";
        //createing clickable layer
        const newEmail = document.createElement("div");
        newEmail.className = "single-email mb-1";
        // newEmail.href = "#";
        //creating element that will contain the sender and the subject
        const senderSection = document.createElement("a");
        senderSection.className = "senderSection";
        senderSection.href = "#";
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
        archiveDiv.appendChild(timestamp);
        mailbox === "sent" ? "" : archiveDiv.appendChild(archive);
        newEmail.appendChild(archiveDiv);

        const defaultClass = newEmail.className;
        newEmail.className = email.read
          ? `${defaultClass} read`
          : `${defaultClass} unread`;

        senderSection.addEventListener("click", () =>
          singleEmail(
            singleId,
            singleSender,
            singleSubject,
            singleBody,
            singleTimestamp,
            singleRecipients,
            singleRead
          )
        );
        //archive and unarchive by clicking
        archive.addEventListener("click", () => {
          fetch(`/emails/${email.id}`, {
            method: "PUT",
            body: JSON.stringify({
              archived: email.archived ? false : true,
            }),
          });
          window.location.reload();
        });
        document.querySelector("#emails-view").append(newEmail);
      });
    });
}

const singleEmail = (
  singleId,
  singleSender,
  singleSubject,
  singleBody,
  singleTimestamp,
  singleRecipients,
  singleRead
) => {
  if (!singleRead) {
    fetch(`/emails/${singleId}`, {
      method: "PUT",
      body: JSON.stringify({
        read: true,
      }),
    });
  }
  document.querySelector("#emails-view").style.display = "none";
  document.querySelector("#compose-view").style.display = "none";
  document.querySelector("#single-email").style.display = "block";

  document.getElementById(
    "single-email-subject"
  ).innerHTML = `${singleSubject}`;
  document.getElementById(
    "single-email-sender"
  ).innerHTML = `From: ${singleSender}`;
  document.getElementById(
    "single-email-timestamp"
  ).innerHTML = `TimeStamp: ${singleTimestamp}`;
  document.getElementById("single-email-body").innerHTML = singleBody;
  document.getElementById(
    "single-email-recipients"
  ).innerHTML = `To: ${singleRecipients}`;

  //click reply button
  document.getElementById("reply").addEventListener("click", () => {
    compose_email();

    document.querySelector("#compose-recipients").value = singleSender;
    document.querySelector("#compose-subject").value = singleSubject.includes(
      "Re:"
    )
      ? singleSubject
      : `Re: '${singleSubject}'`;
    document.querySelector(
      "#compose-body"
    ).value = `${singleTimestamp} ${singleSender} wrote: ${singleBody}`;
  });
};

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
