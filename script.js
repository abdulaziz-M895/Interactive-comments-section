// Selectors for various elements
const images = document.querySelectorAll(".text__user img");
const names = document.querySelectorAll(".text__name");
const date = document.querySelectorAll(".date");
const paragraph = document.querySelectorAll(".text__paragraph");
const scores = document.querySelectorAll(".score");
const replies = document.querySelectorAll(".text__reply");
const send = document.querySelector(".send");
const input = document.querySelector("textarea.add_comment_text");

// Fetch the data from the JSON file
fetch("data.json")
  .then((respons) => respons.json())
  .then((data) => {
    console.log(data);

    // Load initial comments and replies
    // top two comments
    const comments = data.comments;
    for (let i = 0; i < data.comments.length; i++) {
      images.item(i).src = comments[i].user.image.webp;
      names.item(i).textContent = comments[i].user.username;
      date.item(i).textContent = comments[i].createdAt;
      paragraph.item(i).textContent = comments[i].content;
      scores.item(i).textContent = comments[i].score;
    }
    // bottom two replies
    const repliesData = data.comments[1].replies;
    for (let i = 0; i < repliesData.length; i++) {
      images.item(i + 2).src = repliesData[i].user.image.webp;
      names.item(i + 2).textContent = repliesData[i].user.username;
      date.item(i + 2).textContent = repliesData[i].createdAt;
      paragraph.item(i + 2).innerHTML += repliesData[i].content;
      scores.item(i + 2).textContent = repliesData[i].score;
    }

    updateScore();

    deleteReply();

    editReply();

    // Add event listener for sending a new comment
    send.addEventListener("click", () => {
      const newComment = makeComment(
        data.currentUser.image.webp,
        data.currentUser.username,
        "maxblagun",
        input.value
      );

      document.querySelector(".replies").appendChild(newComment);

      newComment.scrollIntoView();

      setFunctions(newComment);
    });

    // Add event listeners for replying to comments
    let addComment;
    let currentDate = "now";
    replies.forEach((reply, index) => {
      reply.addEventListener("click", function () {
        addComment = document.createElement("div");
        addComment.className = "add-comment comment";
        addComment.innerHTML = `
        <img src="images/avatars/image-juliusomo.webp" alt="user" />
        <textarea
          name="add_comment_text"
          id="add_comment_text"
          class="add_comment_text"
          placeholder="Write your thoughts..."
        ></textarea>
        <button class="send-reply">Reply</button>
        `;

        if (index >= 1) {
          document.querySelector(".replies").appendChild(addComment);
        } else {
          reply.closest(".comment").after(addComment);
        }

        const textarea = addComment.querySelector("textarea");
        addComment.scrollIntoView();
        textarea.focus();
        stopBtns();

        addComment
          .querySelector("button")
          .addEventListener("click", function () {
            let comment = makeComment(
              data.currentUser.image.webp,
              data.currentUser.username,
              reply.previousElementSibling.querySelector("h2").textContent,
              textarea.value
            );

            addComment.className = comment.className;
            addComment.innerHTML = comment.innerHTML;

            setFunctions(addComment);

            startBtns();
          });
      });
    });

    // Add event listener for handling enter key
    document.body.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        if (document.querySelector(".send-reply")) {
          document.querySelector(".send-reply").click();
        }
        if (document.querySelector("button.update")) {
          document.querySelector("button.update").click();
        }
      }
    });
  });

/**
 * Set functions for updating score, deleting reply, and editing reply
 * @param {HTMLElement} comment - The comment element
 */
function setFunctions(comment) {
  const commentDate = new Date();

  setInterval(() => {
    currentDate = formatTimeAgo(commentDate);
    if (comment) {
      comment.querySelector(".date").innerHTML = currentDate;
    }
    console.log(currentDate);
  }, 60000); // get time every minute

  updateScore();
  deleteReply();
  editReply();
}

// stop buttons from working when a message is being writen
function stopBtns() {
  document
    .querySelectorAll(".btn")
    .forEach((btn) => btn.classList.add("disabled"));
}

// start buttons after the message has been writen
function startBtns() {
  document
    .querySelectorAll(".btn")
    .forEach((btn) => btn.classList.remove("disabled"));
}

/**
 * Create a new comment element
 * @param {string} imageUrl - URL of the user's image
 * @param {string} username - Username of the commenter
 * @param {string} mention - Username of the person being replied to
 * @param {string} commentParagraph - Text of the comment
 * @returns {HTMLElement} The new comment element
 */
function makeComment(imageUrl, username, mention, commentParagraph) {
  const comment = document.createElement("div");
  comment.className = "comment juliusomo";
  comment.innerHTML = `
      <div class="vote">
        <div class="image plus">
          <img src="images/icon-plus.svg" alt="plus" />
        </div>
        <span class="score">0</span>
        <div class="image minus">
          <img src="images/icon-minus.svg" alt="plus" />
        </div>
      </div>
      <div class="text">
        <div class="text__header">
          <div class="text__user">
            <img src="${imageUrl}" alt="user" />
            <h2 class="text__name">${username}</h2>
            <span class="you">you</span>
            <span class="date">now</span>
          </div>
          <div class="text__delete">
            <div class="delete btn">
              <img src="images/icon-delete.svg" alt="delete icon" />
              <span class="delete">Delete</span>
            </div>
            <div class="edit btn">
              <img src="images/icon-edit.svg" alt="edit icon" />
              <span class="edit">Edit</span>
            </div>
          </div>
        </div>
        <p class="text__paragraph">
          <span class="mention">@${mention}</span>
          ${commentParagraph}
        </p>
      </div> `;
  return comment;
}

/**
 * Format the time ago string for a given date
 * @param {Date} date - The date to format
 * @returns {string} The formatted time ago string
 */
function formatTimeAgo(date) {
  const DIVISIONS = [
    { amount: 60, name: "minutes" },
    { amount: 60, name: "hours" },
    { amount: 24, name: "days" },
    { amount: 7, name: "weeks" },
    { amount: 4.34524, name: "months" },
    { amount: 12, name: "years" },
    { amount: Number.POSITIVE_INFINITY, name: "years" },
  ];

  const formatter = new Intl.RelativeTimeFormat(undefined, {
    numeric: "auto",
  });

  let duration = (new Date() - date) / 1000; // Duration in seconds
  duration /= 60; // Convert duration to minutes

  for (let i = 0; i < DIVISIONS.length; i++) {
    const division = DIVISIONS[i];
    if (Math.abs(duration) < division.amount) {
      return formatter.format(-Math.round(duration), division.name); // Use negative duration for "ago"
    }
    duration /= division.amount;
  }
}

/**
 * Enable editing of replies
 */
function editReply() {
  const commentEditBtns = document.querySelectorAll("div.edit");
  commentEditBtns.forEach((commentEditBtn) => {
    commentEditBtn.addEventListener("click", () => {
      stopBtns();
      const comment = commentEditBtn.closest(".comment");
      const originalComment = comment.cloneNode(true);
      comment.className = "add-comment comment update";
      let originalParagraph = originalComment
        .querySelector(".text__paragraph")
        .textContent.trim();
      const actualParagraph = originalParagraph
        .slice(originalParagraph.lastIndexOf("  "))
        .trim();
      comment.innerHTML = `
      <img src="images/avatars/image-juliusomo.webp" alt="user" />
        <textarea
          name="add_comment_text"
          id="add_comment_text"
          class="add_comment_text"
        >${actualParagraph}</textarea>
        <button class="update">UPDATE</button>
      `;
      comment.querySelector(".update").addEventListener("click", () => {
        comment.innerHTML = makeComment(
          originalComment.querySelector(".text__user img").src,
          originalComment.querySelector(".text__user h2").innerHTML,
          originalComment.querySelector(".mention").innerHTML.slice(1),
          comment.querySelector("textarea").value
        ).innerHTML;
        comment.className = "comment juliusomo";

        setFunctions(comment);

        startBtns();
      });
    });
  });
}

/**
 * Enable deletion of replies
 */
function deleteReply() {
  const commentDeleteBtns = document.querySelectorAll(".delete");
  commentDeleteBtns.forEach((commentDeleteBtn) => {
    commentDeleteBtn.addEventListener("click", function () {
      // Remove any existing popup or overlay before creating new ones
      const existingPopup = document.querySelector(".delete-popup");
      const existingOverlay = document.querySelector(".delete__overlay");
      if (existingPopup) existingPopup.remove();
      if (existingOverlay) existingOverlay.remove();

      // Create the popup
      let popup = document.createElement("div");
      popup.className = "delete-popup";
      document.body.appendChild(popup);

      let heading = document.createElement("h3");
      heading.className = "delete__heading";
      heading.innerHTML = "Delete comment";
      popup.appendChild(heading);

      let paragraph = document.createElement("p");
      paragraph.className = "delete__paragraph";
      paragraph.innerHTML =
        "Are sure you want to delete this comment? This will remove the comment and can't be undone.";
      popup.appendChild(paragraph);

      let btns = document.createElement("div");
      btns.className = "delete__btns";
      popup.appendChild(btns);

      let cancelBtn = document.createElement("button");
      cancelBtn.className = "delete__cancel";
      cancelBtn.innerHTML = "NO, CANCEL";
      btns.appendChild(cancelBtn);

      let deleteBtn = document.createElement("button");
      deleteBtn.className = "delete__delete";
      deleteBtn.innerHTML = "YES, DELETE";
      btns.appendChild(deleteBtn);

      let overlay = document.createElement("div");
      overlay.className = "delete__overlay";
      document.body.appendChild(overlay);

      document.querySelector("html").style.overflow = "hidden";

      deleteBtn.addEventListener("click", function () {
        popup.remove();
        overlay.remove();
        commentDeleteBtn.closest(".comment").classList.add("delete-animation");
        setTimeout(() => {
          commentDeleteBtn.closest(".comment").remove();
        }, 700);
        document.querySelector("html").style.overflow = "auto";
      });

      cancelBtn.addEventListener("click", function () {
        popup.remove();
        overlay.remove();
        document.querySelector("html").style.overflow = "auto";
      });
    });
  });
}

/**
 * Update the score functionality for plus and minus buttons
 */
function updateScore() {
  const pluses = document.querySelectorAll(".vote .image.plus");
  const minuses = document.querySelectorAll(".vote .image.minus");

  pluses.forEach((plus) => {
    const newPlus = plus.cloneNode(true);
    plus.parentNode.replaceChild(newPlus, plus);

    newPlus.addEventListener("click", () => {
      const scoreElement = newPlus.nextElementSibling;
      const originalScore =
        +scoreElement.getAttribute("data-original-score") ||
        +scoreElement.textContent;
      let currentScore = +scoreElement.textContent;

      // Store the original score as a data attribute if not already set
      if (!scoreElement.getAttribute("data-original-score")) {
        scoreElement.setAttribute("data-original-score", originalScore);
      }

      if (currentScore < originalScore + 1) {
        scoreElement.textContent = ++currentScore;
      }
      if (currentScore >= originalScore + 1) {
        newPlus.classList.add("disabled");
      } else {
        newPlus.classList.remove("disabled");
      }
      newPlus.nextElementSibling.nextElementSibling.classList.remove(
        "disabled"
      );
    });
  });

  minuses.forEach((minus) => {
    const newMinus = minus.cloneNode(true);
    minus.parentNode.replaceChild(newMinus, minus);

    newMinus.addEventListener("click", () => {
      const scoreElement = newMinus.previousElementSibling;
      const originalScore =
        +scoreElement.getAttribute("data-original-score") ||
        +scoreElement.textContent;
      let currentScore = +scoreElement.textContent;

      // Store the original score as a data attribute if not already set
      if (!scoreElement.getAttribute("data-original-score")) {
        scoreElement.setAttribute("data-original-score", originalScore);
      }

      if (currentScore > originalScore - 1) {
        scoreElement.textContent = --currentScore;
      }
      if (currentScore <= originalScore - 1) {
        newMinus.classList.add("disabled");
      } else {
        newMinus.classList.remove("disabled");
      }
      newMinus.previousElementSibling.previousElementSibling.classList.remove(
        "disabled"
      );
    });
  });
}
