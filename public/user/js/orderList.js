document.addEventListener("DOMContentLoaded", () => {
  const circles = document.querySelectorAll(".circle");
  const sticks = document.querySelectorAll(".stick");
  const statusInputs = document.querySelectorAll("#status");
console.log(statusInputs);
  statusInputs.forEach((input, index) => {
      const orderStatus = input.value
      updateOrderStatus(circles[index], sticks[index], orderStatus);
  });
});

function updateOrderStatus(circle, stick, orderStatus) {
  // Reset all circles and sticks
  circles.forEach(circle => {
      circle.classList.remove("active");
  });
  sticks.forEach(stick => {
      stick.style.backgroundColor = "#ccc";
  });

  // Update circles and sticks based on order status
  if (orderStatus === 'Placed') {
      circle.classList.add("active");
  } else if (orderStatus === 'Shipped'||orderStatus === 'Out for Delivery') {
      circle.classList.add("active");
      stick.style.backgroundColor = "#70e000";
  } else if (orderStatus === 'Delivered') {
      circle.classList.add("active");
      stick.style.backgroundColor = "#70e000";
  }
}
