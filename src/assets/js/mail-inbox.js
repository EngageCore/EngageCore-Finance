(function () {
    "use strict";
  
    // mail//
    let mailInbox = document.querySelector(".main-inbox");
    let mailList = document.querySelectorAll(".mail-list");
    let mailView = document.querySelector(".mail-view");
    let mailBtn = document.querySelectorAll(".mail-btn");
  
    mailList.forEach((ele) => {
      ele.addEventListener("click", () => {
        mailInbox.classList.add("d-none")
        mailView.classList.remove("d-none")
      })
    })
    
    mailBtn.forEach((e) => {
      e.addEventListener("click", () => {
        mailInbox.classList.remove("d-none")
        mailView.classList.add("d-none")
      })
    })
  
  
    
  })();
  
  let changeTheInfo = (img,name,mail,subject,date) => {
    document.querySelector(".mail-img").src = `../assets/img/users/${img}.jpg`;
    document.querySelector(".mail-name").innerText = name;
    document.querySelector(".mail-email").innerText = mail;
    document.querySelector(".mail-subject").innerText = subject;
    document.querySelector(".mail-date").innerText = date;
  }