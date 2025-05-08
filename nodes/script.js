let count = 0;
function incrementCounter() {
  count += 1;
  document.getElementById('counter').innerText = 'Count ' + count;
}
document.addEventListener("DOMContentLoaded", function() {
  const imgElement = document.getElementById("logo");
  if (imgElement) {
   imgElement.src = 'https://www.jdoodle.com/assets/images/JDoodleLogo.png';
  }
});