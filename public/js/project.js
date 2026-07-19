/**
 * Projects Library — Interactive Logic
 * Handles accordion expansion and section group collapse.
 */

document.addEventListener('DOMContentLoaded', () => {

  /* ── Section group toggle ── */
  document.querySelectorAll('.section-header').forEach(header => {
    header.addEventListener('click', () => {
      const group = header.closest('.section-group');
      group.classList.toggle('open');
    });
  });

  /* ── Accordion item toggle ── */
  document.querySelectorAll('.accordion-header').forEach(header => {
    header.addEventListener('click', () => {
      const item = header.closest('.accordion-item');
      const isOpen = item.classList.contains('open');

      /* Close all siblings first */
      const siblings = item.closest('.section-body').querySelectorAll('.accordion-item');
      siblings.forEach(sib => sib.classList.remove('open'));

      /* Toggle the clicked one */
      if (!isOpen) item.classList.add('open');
    });
  });

  /* ── Open first item of each section by default ── */
  document.querySelectorAll('.section-body').forEach(body => {
    const first = body.querySelector('.accordion-item');
    if (first) first.classList.add('open');
  });

});

/* ===========================
   Back Page Transition
=========================== */

const backLink = document.querySelector(".nav-back");

if(backLink){

    backLink.addEventListener("click",function(e){

        e.preventDefault();

        document.body.classList.add("page-transition");

        setTimeout(() => {

    window.location.href = "index.html";

}, 500);

    });

}